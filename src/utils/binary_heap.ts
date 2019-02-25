export interface IBinaryHeapOpt<T = any> {
  elements?: T[];
  score?: (element: T) => any;
}

function defaultScore(element: any) {
  return element.valueOf();
}

export default class BinaryHeap<T = any> {
  private _elements: T[];
  private _score: (element: T) => any;

  constructor(options: IBinaryHeapOpt = {}) {
    this._elements = options.elements || [];
    this._score = options.score || defaultScore;
  }

  add(...args: T[]) {
    for (const element of args) {
      this._elements.push(element);
      this._bubble(this._elements.length - 1);
    }
  }

  first() {
    return this._elements[0];
  }

  removeFirst() {
    const root = this._elements[0];
    const last = this._elements.pop();

    if (this._elements.length > 0 && last !== undefined) {
      this._elements[0] = last;
      this._sink(0);
    }

    return root;
  }

  clone() {
    return new BinaryHeap({
      elements: this.toArray(),
      score: this._score,
    });
  }

  toSortedArray() {
    const array: any[] = [];
    const clone = this.clone();

    while (true) {
      const element = clone.removeFirst();
      if (element === undefined) break;

      array.push(element);
    }

    return array;
  }

  toArray() {
    return [...this._elements];
  }

  size() {
    return this._elements.length;
  }

  _bubble(bubbleIndex: number) {
    const bubbleElement = this._elements[bubbleIndex];
    const bubbleScore = this._score(bubbleElement);

    while (bubbleIndex > 0) {
      const parentIndex = this._parentIndex(bubbleIndex);
      const parentElement = this._elements[parentIndex];
      const parentScore = this._score(parentElement);

      if (bubbleScore <= parentScore) break;

      this._elements[parentIndex] = bubbleElement;
      this._elements[bubbleIndex] = parentElement;
      bubbleIndex = parentIndex;
    }
  }

  _sink(sinkIndex: number) {
    const sinkElement = this._elements[sinkIndex];
    const sinkScore = this._score(sinkElement);
    const length = this._elements.length;

    while (true) {
      let swapIndex;
      let swapScore;
      let swapElement = null;
      const childIndexes = this._childIndexes(sinkIndex);

      for (let i = 0; i < childIndexes.length; i++) {
        const childIndex = childIndexes[i];

        if (childIndex >= length) break;

        const childElement = this._elements[childIndex];
        const childScore = this._score(childElement);

        if (childScore > sinkScore) {
          if (swapScore === undefined || swapScore < childScore) {
            swapIndex = childIndex;
            swapScore = childScore;
            swapElement = childElement;
          }
        }
      }

      if (swapIndex === undefined) break;

      this._elements[swapIndex] = sinkElement;
      this._elements[sinkIndex] = swapElement!;
      sinkIndex = swapIndex;
    }
  }

  _parentIndex(index: number) {
    return Math.floor((index - 1) / 2);
  }

  _childIndexes(index: number) {
    return [2 * index + 1, 2 * index + 2];
  }
}
