export type IStatisticsType = "counter" | "samples" | "data";

export interface ITagItem {
  type: IStatisticsType;
  title: string;
  counter: number;
  min: number;
  max: number;
  avg: number;
  data: any;
}

export class Statistics {
  protected readonly tags: Map<string, ITagItem> = new Map();
  protected readonly pid: number = process.pid;
  protected readonly appInstance: number = Number(process.env.NODE_APP_INSTANCE || "0");
  public appName?: string;

  constructor(appName?: string) {
    this.appName = appName;
  }

  /**
   * 获取指定标签的数据
   * @param tag
   */
  public get(tag: string): ITagItem | undefined {
    return this.tags.get(tag);
  }

  /**
   * 初始化标签
   * @param type
   * @param tag
   * @param title
   */
  public init(type: IStatisticsType, tag: string, title?: string) {
    this.tags.set(tag, {
      type,
      title: title || tag,
      counter: 0,
      min: Number.MAX_SAFE_INTEGER,
      max: Number.MIN_SAFE_INTEGER,
      avg: 0,
      data: null,
    });
  }

  /**
   * 增加计数
   * @param tag
   * @param n
   */
  public incr(tag: string, n: number = 1) {
    const item = this.tags.get(tag);
    if (item) {
      item.counter += n;
    }
    return this;
  }

  /**
   * 减计数
   * @param tag
   * @param n
   */
  public decr(tag: string, n: number = 1) {
    return this.incr(tag, -n);
  }

  /**
   * 添加采样数据
   * @param tag
   * @param n
   */
  public add(tag: string, n: number) {
    const item = this.tags.get(tag);
    if (item) {
      if (n < item.min) {
        item.min = n;
      }
      if (n > item.max) {
        item.max = n;
      }
      item.avg = (n - item.avg) / (item.counter + 1) + item.avg;
      item.counter++;
    }
    return this;
  }

  /**
   * 设置数据
   * @param tag
   * @param data
   */
  public set(tag: string, data: any) {
    const item = this.tags.get(tag);
    if (item) {
      item.data = data;
    }
  }

  /**
   * 计时器方法
   * @param tag
   */
  public timer(tag: string) {
    const t = process.uptime();
    const self = this;
    return {
      end(type?: string) {
        const spent = Math.floor((process.uptime() - t) * 1000);
        const name = type ? `${tag}_${type}` : tag;
        self.add(name, spent);
      },
      ok() {
        this.end("success");
      },
      err() {
        this.end("error");
      },
    };
  }

  public jsonReport() {
    const list: any[] = [];
    this.tags.forEach((item, tag) => {
      if (item.type === "counter") {
        list.push({
          tag,
          type: item.type,
          counter: item.counter,
        });
      } else if (item.type === "samples") {
        if (item.counter === 0) {
          list.push({
            tag,
            type: item.type,
            counter: item.counter,
          });
        } else if (item.counter === 1) {
          list.push({
            tag,
            type: item.type,
            counter: item.counter,
            min: item.avg,
            max: item.avg,
            avg: item.avg,
          });
        } else {
          list.push({
            tag,
            type: item.type,
            counter: item.counter,
            min: item.min,
            max: item.max,
            avg: Number(item.avg.toFixed(4)),
          });
        }
      } else if (item.type === "data") {
        list.push({
          tag,
          type: item.type,
          data: item.data,
        });
      }
    });
    return {
      pid: this.pid,
      appInstance: this.appInstance,
      appName: this.appName,
      time: new Date(),
      list,
    };
  }

  public flush() {
    this.tags.forEach(item => {
      item.counter = 0;
      item.min = Number.MAX_SAFE_INTEGER;
      item.max = Number.MIN_SAFE_INTEGER;
      item.avg = 0;
      item.data = null;
    });
  }
}

const s = new Statistics();
