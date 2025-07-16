export default class Interval {
    min: number 
    max: number

    static readonly empty: Interval = new Interval();
    static readonly universe: Interval = new Interval(Infinity, -Infinity);

    constructor(min: number = -Infinity, max: number = Infinity, ) {
        this.min = min;
        this.max = max;
    }

    size() {
        return this.max - this.min;
    }

    contains(x: number) {
        return this.min <= x && x <= this.max;
    }

    surrounds(x: number) {
        return this.min < x && x < this.max;
    }
}