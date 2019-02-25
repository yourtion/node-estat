import units from "./units";

const TICK_INTERVAL = 5 * units.SECONDS;

export interface IEWMAOpt {
  timePeriod?: number;
  tickInterval?: number;
}

export default class ExponentiallyWeightedMovingAverage {
  private _timePeriod: number;
  private _tickInterval: number;
  private _alpha: number;
  private _count: number = 0;
  private _rate: number = 0;

  constructor(opt: IEWMAOpt = {}) {
    this._timePeriod = opt.timePeriod || 1 * units.MINUTES;
    this._tickInterval = opt.tickInterval || TICK_INTERVAL;
    this._alpha = 1 - Math.exp(-this._tickInterval / this._timePeriod);
  }

  update(n: number) {
    this._count += n;
  }

  tick() {
    const instantRate = this._count / this._tickInterval;
    this._count = 0;

    this._rate += this._alpha * (instantRate - this._rate);
  }

  rate(timeUnit: number) {
    return (this._rate || 0) * timeUnit;
  }
}
