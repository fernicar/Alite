/* Alite - Discover the Universe on your Favorite Android Device
 * Copyright (C) 2015 Philipp Bouillon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful and
 * fun, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { CurveParameterKey } from "./CurveParameterKey";

export class CurveParameter {
    private static readonly serialVersionUID = 7165604208567329342;

    private h: number[] = new Array(4);
    private keys: CurveParameterKey[];
    protected inConst: boolean;
    protected outConst: boolean;
    public end = false;

    constructor(...keys: CurveParameterKey[]) {
        const n = keys.length;
        this.keys = new Array(n);
        for (let i = 0; i < n; i++) {
            this.keys[i] = keys[i];
            if (i > 0) {
                this.keys[i].prev = this.keys[i - 1];
            }
            if (i < (n - 1)) {
                this.keys[i].next = keys[i + 1];
            }
            this.keys[i].index = i;
            this.inConst = false;
            this.outConst = false;
        }
    }

    private incoming(key0: CurveParameterKey, key1: CurveParameterKey): number {
        const d = key1.value - key0.value;

        if (key1.next != null) {
            const t = (key1.time - key0.time) / (key1.next.time - key0.time);
            return t * (key1.next.value - key1.value + d);
        }
        return d;
    }

    private outgoing(key0: CurveParameterKey, key1: CurveParameterKey): number {
        const d = key1.value - key0.value;

        if (key0.prev != null) {
            const t = (key1.time - key0.time) / (key1.time - key0.prev.time);
            return t * (key0.value - key0.prev.value + d);
        }
        return d;
    }

    private hermite(t: number): void {
        const t2 = t * t;
        const t3 = t2 * t;

        this.h[1] = 3.0 * t2 - t3 - t3;
        this.h[0] = 1.0 - this.h[1];
        this.h[3] = t3 - t2;
        this.h[2] = this.h[3] - t2 + t;
    }

    getValue(time: number): number {
        if (this.keys == null || this.keys.length === 0) {
            return 0.0;
        }
        const n = this.keys.length;
        if (n === 1) {
            return this.keys[0].value;
        }

        if (time < this.keys[0].time) {
            if (this.inConst) {
                return this.keys[0].value;
            }
            const out = this.outgoing(this.keys[0], this.keys[0].next) / (this.keys[0].next.time - this.keys[0].time);
            return out * (time - this.keys[0].time) + this.keys[0].value;
        }

        if (time > this.keys[n - 1].time) {
            this.end = true;
            if (this.outConst) {
                return this.keys[n - 1].value;
            }
            const inn = this.incoming(this.keys[n - 1].prev, this.keys[n - 1]) / (this.keys[n - 1].time - this.keys[n - 1].prev.time);
            return inn * (time - this.keys[n - 1].time) + this.keys[n - 1].value;
        }

        let key0 = this.keys[0];
        while (time > key0.next.time) {
            key0 = key0.next;
        }
        const key1 = key0.next;

        if (time === key0.time) {
            return key0.value;
        }
        if (time === key1.time) {
            return key1.value;
        }
        const t = (time - key0.time) / (key1.time - key0.time);

        const out = this.outgoing(key0, key1);
        const inn = this.incoming(key0, key1);
        this.hermite(t);
        return this.h[0] * key0.value + this.h[1] * key1.value + this.h[2] * out + this.h[3] * inn;
    }

    public reachedEnd(): boolean {
        return this.end;
    }

    resetEnd(): void {
        this.end = false;
    }
}
