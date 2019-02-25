import EDS from "../utils/eds";

export type Measurement =
  | "min"
  | "max"
  | "sum"
  | "count"
  | "variance"
  | "mean"
  | "ema"
  | "median"
  | "p75"
  | "p95"
  | "p99"
  | "p999";

export interface IHistogramOpt {
  measurement: Measurement;
}

type CallFun = () => number | null;

export default class Histogram {
  private _measurement: Measurement;
  private _callFn: number | CallFun;

  private _sample = new EDS();
  private _min = Number.MIN_SAFE_INTEGER;
  private _max = Number.MAX_SAFE_INTEGER;
  private _count: number = 0;
  private _sum: number = 0;

  // These are for the Welford algorithm for calculating running variance
  // without floating-point doom.
  private _varianceM: number = 0;
  private _varianceS: number = 0;
  private _ema: number = 0;

  private used: boolean = false;

  constructor(opts: IHistogramOpt) {
    this._measurement = opts.measurement || "";

    const methods: Record<string, number | CallFun> = {
      min: this.min,
      max: this.max,
      sum: this.sum,
      count: this.count,
      variance: this._calculateVariance,
      mean: this._calculateMean,
      ema: this.ema,
    };

    if (methods.hasOwnProperty(this._measurement)) {
      this._callFn = methods[this._measurement];
    } else {
      this._callFn = function() {
        const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);

        const medians: Record<string, any> = {
          median: percentiles[0.5],
          p75: percentiles[0.75],
          p95: percentiles[0.95],
          p99: percentiles[0.99],
          p999: percentiles[0.999],
        };

        return medians[this._measurement];
      };
    }
  }

  get val() {
    if (typeof this._callFn === "function") {
      return this._callFn();
    } else {
      return this._callFn;
    }
  }

  get isUsed() {
    return this.used;
  }

  get min() {
    return this._min;
  }

  get max() {
    return this._max;
  }

  get sum() {
    return this._sum;
  }

  get count() {
    return this._count;
  }

  get ema() {
    return this._ema;
  }

  update(value: number) {
    this.used = true;
    this._count++;
    this._sum += value;

    this._sample.update(value);
    this._updateMin(value);
    this._updateMax(value);
    this._updateVariance(value);
    this._updateEma(value);
  }

  percentiles(percentiles: number[]) {
    const values = this._sample.toArray().sort(function(a, b) {
      return a === b ? 0 : a - b;
    });

    const results: Record<number, number | null> = {};
    for (let i = 0; i < percentiles.length; i++) {
      const percentile = percentiles[i];
      if (!values.length) {
        results[percentile] = null;
        continue;
      }

      const pos = percentile * (values.length + 1);

      if (pos < 1) {
        results[percentile] = values[0];
      } else if (pos >= values.length) {
        results[percentile] = values[values.length - 1];
      } else {
        const lower = values[Math.floor(pos) - 1];
        const upper = values[Math.ceil(pos) - 1];

        results[percentile] = lower + (pos - Math.floor(pos)) * (upper - lower);
      }
    }

    return results;
  }

  fullResults() {
    const percentiles = this.percentiles([0.5, 0.75, 0.95, 0.99, 0.999]);

    return {
      min: this._min,
      max: this._max,
      sum: this._sum,
      variance: this._calculateVariance(),
      mean: this._calculateMean(),
      count: this._count,
      median: percentiles[0.5],
      p75: percentiles[0.75],
      p95: percentiles[0.95],
      p99: percentiles[0.99],
      p999: percentiles[0.999],
      ema: this._ema,
    };
  }

  private _updateMin(value: number) {
    if (this._min === undefined || value < this._min) {
      this._min = value;
    }
  }

  private _updateMax(value: number) {
    if (this._max === undefined || value > this._max) {
      this._max = value;
    }
  }

  private _updateVariance(value: number) {
    if (this._count === 1) return (this._varianceM = value);

    const oldM = this._varianceM;

    this._varianceM += (value - oldM) / this._count;
    this._varianceS += (value - oldM) * (value - this._varianceM);
  }

  private _updateEma(value: number) {
    if (this._count <= 1) return (this._ema = this._calculateMean());
    const alpha = 2 / (1 + this._count);
    this._ema = value * alpha + this._ema * (1 - alpha);
  }

  private _calculateMean() {
    return this._count === 0 ? 0 : this._sum / this._count;
  }

  private _calculateVariance() {
    return this._count <= 1 ? null : this._varianceS / (this._count - 1);
  }
}
