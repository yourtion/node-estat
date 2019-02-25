import EWMA from "../utils/EWMA";
import units from "../utils/units";

export interface IMeterOpt {
  samples?: number;
  seconds?: number;
  timeframe?: number;
  tickInterval?: number;
}

export class Meter {
  private _tickInterval: number;
  private _samples: number;
  private _timeframe: number;
  private _rate: EWMA;
  private _interval: any;
  private used: boolean = false;

  constructor(opts: IMeterOpt = {}) {
    this._samples = opts.samples || opts.seconds || 1;
    this._timeframe = opts.timeframe || 60;
    this._tickInterval = opts.tickInterval || 5 * units.SECONDS;

    this._rate = new EWMA({ timePeriod: this._timeframe * units.SECONDS, tickInterval: this._tickInterval });

    this._interval = setInterval(() => {
      this._rate.tick();
    }, this._tickInterval);

    this._interval.unref();
  }

  get val() {
    return Math.round(this._rate.rate(this._samples * units.SECONDS) * 100) / 100;
  }

  get isUsed() {
    return this.used;
  }

  mark(n = 1) {
    this.used = true;
    this._rate.update(n);
  }
}
