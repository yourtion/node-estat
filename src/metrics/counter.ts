/** 计数器参数 */
export interface ICounterOpt {
  count?: number;
}

/** 计数器 */
export class Counter {
  private _count: number;
  private used: boolean = false;

  constructor(opts: ICounterOpt = {}) {
    this._count = opts.count || 0;
  }

  /** 获取值 */
  get val() {
    return this._count;
  }

  /** 是否已经使用 */
  get isUsed() {
    return this.used;
  }

  /** 递增 */
  inc(n = 1) {
    this.used = true;
    this._count += n;
  }

  /** 递减 */
  dec(n = 1) {
    this.used = true;
    this._count -= n;
  }

  /** 重置计数器 */
  reset(count = 0) {
    this._count = count || 0;
  }
}
