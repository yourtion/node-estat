import BinaryHeap from "./binary_heap";
import units from "./units";

const RESCALE_INTERVAL = 1 * units.HOURS;
const ALPHA = 0.015;
const SIZE = 1028;

interface IEDSElements {
  priority: number;
  value: number;
}

export interface IEDSOpt {
  rescaleInterval?: number;
  alpha?: number;
  size?: number;
  random?: () => number;
}

export default class ExponentiallyDecayingSample {
  private _elements: BinaryHeap<IEDSElements>;
  private _rescaleInterval: number;
  private _alpha: number;
  private _size: number;
  private _landmark: number;
  private _nextRescale: number;
  private _mean: number;
  private _random: () => number;

  constructor(options: IEDSOpt = {}) {
    options = options || {};

    this._elements = new BinaryHeap<IEDSElements>({
      score: function(element) {
        return -element.priority;
      },
    });

    this._rescaleInterval = options.rescaleInterval || RESCALE_INTERVAL;
    this._alpha = options.alpha || ALPHA;
    this._size = options.size || SIZE;
    this._random = options.random || Math.random;
    this._landmark = 0;
    this._nextRescale = 0;
    this._mean = 0;
  }

  update(value: number, timestamp?: number) {
    const now = Date.now();
    if (!this._landmark) {
      this._landmark = now;
      this._nextRescale = this._landmark + this._rescaleInterval;
    }

    timestamp = timestamp || now;

    const newSize = this._elements.size() + 1;

    const element = {
      priority: this._priority(timestamp - this._landmark),
      value: value,
    };

    if (newSize <= this._size) {
      this._elements.add(element);
    } else if (element.priority > this._elements.first().priority) {
      this._elements.removeFirst();
      this._elements.add(element);
    }

    if (now >= this._nextRescale) this._rescale(now);
  }

  toSortedArray() {
    return this._elements.toSortedArray().map(function(element) {
      return element.value;
    });
  }

  toArray() {
    return this._elements.toArray().map(function(element) {
      return element.value;
    });
  }

  _weight(age: number) {
    // We divide by 1000 to not run into huge numbers before reaching a rescale event.
    return Math.exp(this._alpha * (age / 1000));
  }

  _priority(age: number) {
    return this._weight(age) / this._random();
  }

  _rescale(now: number = Date.now()) {
    const self = this;
    const oldLandmark = this._landmark;
    this._landmark = now;
    this._nextRescale = now + this._rescaleInterval;

    const factor = self._priority(-(self._landmark - oldLandmark));

    this._elements.toArray().forEach(function(element) {
      element.priority *= factor;
    });
  }

  avg() {
    let sum = 0;
    this._elements.toArray().forEach(function(element) {
      sum += element.value;
    });
    return sum / this._elements.size();
  }
}
