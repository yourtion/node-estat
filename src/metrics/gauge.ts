/** 度量指标计数器 */
export class Gauge {
  private value = 0;
  private used = false;

  /** 获取值 */
  get val() {
    return this.value;
  }

  /** 是否已经使用 */
  get isUsed() {
    return this.used;
  }

  /** 设置新的值 */
  set(value: number) {
    this.used = true;
    this.value = value;
  }
}
