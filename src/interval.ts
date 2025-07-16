import { INF } from "./utils"

export default class Interval {
    min: number 
    max: number

    static empty: Interval = new Interval();
    static universe: Interval = new Interval(-INF, INF);

    constructor(max: number = INF, min: number = -INF) {
        this.max = max;
        this.min = min;
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