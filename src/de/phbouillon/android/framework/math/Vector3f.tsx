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

import { AliteLog } from "../../games/alite/AliteLog";

export class Vector3f {
    private static readonly serialVersionUID = -540022331413138350;

    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public get(i: number): number {
        return i === 0 ? this.x : i === 1 ? this.y : this.z;
    }

    public add(b: Vector3f, r?: Vector3f | number): void {
        if (r instanceof Vector3f) {
            r.x = this.x + b.x;
            r.y = this.y + b.y;
            r.z = this.z + b.z;
        } else if (typeof r === 'number') {
            this.x += b.x * r;
            this.y += b.y * r;
            this.z += b.z * r;
        } else {
            this.x += b.x;
            this.y += b.y;
            this.z += b.z;
        }
    }

    public sub(b: Vector3f, r?: Vector3f): void {
        if (r) {
            r.x = this.x - b.x;
            r.y = this.y - b.y;
            r.z = this.z - b.z;
        } else {
            this.x -= b.x;
            this.y -= b.y;
            this.z -= b.z;
        }
    }

    public scale(s: number, r?: Vector3f): void {
        if (r) {
            r.x = this.x * s;
            r.y = this.y * s;
            r.z = this.z * s;
        } else {
            this.x *= s;
            this.y *= s;
            this.z *= s;
        }
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public lengthSq(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public distance(v: Vector3f): number {
        return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y) + (this.z - v.z) * (this.z - v.z));
    }

    public distanceSq(v: Vector3f): number {
        return (this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y) + (this.z - v.z) * (this.z - v.z);
    }

    public normalize(result?: Vector3f): void {
        const root = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        const t = root < 0.00001 ? 1.0 : 1.0 / root;
        if (result) {
            result.x = this.x * t;
            result.y = this.y * t;
            result.z = this.z * t;
        } else {
            this.x *= t;
            this.y *= t;
            this.z *= t;
        }
    }

    public isZeroVector(): boolean {
        return Math.abs(this.x) < 0.0001 && Math.abs(this.y) < 0.0001 && Math.abs(this.z) < 0.0001;
    }

    public negate(): void {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
    }

    public cross(b: Vector3f, r?: Vector3f): void {
        if (r) {
            r.x = this.y * b.z - b.y * this.z;
            r.y = this.z * b.x - b.z * this.x;
            r.z = this.x * b.y - b.x * this.y;
        } else {
            const tx = this.y * b.z - b.y * this.z;
            const ty = this.z * b.x - b.z * this.x;
            const tz = this.x * b.y - b.x * this.y;
            this.x = tx;
            this.y = ty;
            this.z = tz;
        }
    }

    public dot(b: Vector3f): number {
        return this.x * b.x + this.y * b.y + this.z * b.z;
    }

    public toString(): string {
        return `[${this.x.toFixed(2)} ${this.y.toFixed(2)} ${this.z.toFixed(2)}]`;
    }

    public copy(dest: Vector3f): void {
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
    }

    public mulMat(mat: number[], r?: Vector3f): void {
        if (r) {
            r.x = mat[0] * this.x + mat[4] * this.y + mat[8] * this.z + mat[12];
            r.y = mat[1] * this.x + mat[5] * this.y + mat[9] * this.z + mat[13];
            r.z = mat[2] * this.x + mat[6] * this.y + mat[10] * this.z + mat[14];
            const td = mat[3] * this.x + mat[7] * this.y + mat[11] * this.z + mat[15];
            if (Math.abs(td) > 0.0001) {
                r.x /= td;
                r.y /= td;
                r.z /= td;
            }
        } else {
            const tx = mat[0] * this.x + mat[4] * this.y + mat[8] * this.z + mat[12];
            const ty = mat[1] * this.x + mat[5] * this.y + mat[9] * this.z + mat[13];
            const tz = mat[2] * this.x + mat[6] * this.y + mat[10] * this.z + mat[14];
            const td = mat[3] * this.x + mat[7] * this.y + mat[11] * this.z + mat[15];
            if (Math.abs(td) > 0.0001) {
                this.x = tx / td;
                this.y = ty / td;
                this.z = tz / td;
            } else {
                this.x = tx;
                this.y = ty;
                this.z = tz;
            }
        }
    }

    // Assumption: Both vectors are normalized!
    public angleInDegrees(o: Vector3f): number {
        let dot = this.dot(o);
        if (dot < -1) {
            dot = -1;
        }
        if (dot > 1) {
            dot = 1;
        }
        return Math.toDegrees(Math.acos(dot));
    }

    public project(onto: Vector3f, result: Vector3f): void {
        onto.normalize(result);
        result.scale(this.dot(result));
    }
}
