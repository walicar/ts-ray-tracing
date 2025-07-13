import Hittable, { HitRecord, type HitResult } from "./hittable";
import type ray from "./ray";

export default class HittableList extends Hittable {

    hittables: Hittable[];

    constructor(hittables: Hittable[] = []) {
        super();
        this.hittables = hittables;
    }

    add(hittable: Hittable) {
        this.hittables.push(hittable);
    }

    hit(r: ray, tmin: number, tmax: number): HitResult {
        let hitRecord = new HitRecord();
        let isRayHitting = false; // is ray hitting any hittable
        let closestHit = tmax // track closest hit to draw closest object

        for (const hittable of this.hittables) {
            const res = hittable.hit(r, tmin, closestHit);
            if (res.isRayHitting) {
                isRayHitting = true;
                closestHit = res.hitRecord.t;
                hitRecord = res.hitRecord;
            }
        }

        return {
            isRayHitting,
            hitRecord
        }
    }
}