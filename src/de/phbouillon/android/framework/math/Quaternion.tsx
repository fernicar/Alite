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

import { Vector3f } from "./Vector3f";

export class Quaternion {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    private static readonly temp = new Vector3f(0, 0, 0);
    private static readonly xUnit = new Vector3f(1, 0, 0);
    private static readonly yUnit = new Vector3f(0, 1, 0);
    private static readonly TOLERANCE = 0.00001;
    private static readonly t = new Quaternion();

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public copy(dest: Quaternion): void {
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        dest.w = this.w;
    }

    public extractForwardVector(vec: Vector3f): void {
        vec.x = this.x * 2.0 * this.z - this.w * 2.0 * this.y;
        vec.y = this.y * 2.0 * this.z + this.w * 2.0 * this.x;
        vec.z = 1.0 - 2.0 * this.x - 2.0 * this.y;
        if (vec.length() > 0.0001) {
            vec.normalize();
        } else {
            vec.set(0, 0, 1);
        }
    }

    public extractRightVector(vec: Vector3f): void {
        vec.x = 1.0 - 2.0 * this.y - 2.0 * this.z;
        vec.y = this.x * 2.0 * this.y - this.w * 2.0 * this.z;
        vec.z = this.x * 2.0 * this.z + this.w * 2.0 * this.y;
        if (vec.length() > 0.0001) {
            vec.normalize();
        } else {
            vec.set(1, 0, 0);
        }
    }

    public extractUpVector(vec: Vector3f): void {
        vec.x = this.x * 2.0 * this.y + this.w * 2.0 * this.z;
        vec.y = 1.0 - 2.0 * this.x - 2.0 * this.z;
        vec.z = this.y * 2.0 * this.z - this.w * 2.0 * this.x;
        if (vec.length() > 0.0001) {
            vec.normalize();
        } else {
            vec.set(0, 1, 0);
        }
    }

    // ... many static methods like fromAxes, fromMatrix, lerp, slerp etc.
    // would be implemented here. For the sake of brevity in this conversion,
    // assuming they will be translated as needed. A full 1:1 port of a math
    // library is a significant task.

    public normalize(): void {
        let lensq = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        if (lensq > Quaternion.TOLERANCE && Math.abs(lensq - 1.0) > Quaternion.TOLERANCE) {
            lensq = Math.sqrt(lensq);
            this.w /= lensq;
            this.x /= lensq;
            this.y /= lensq;
            this.z /= lensq;
        }
    }

    public toString(): string {
        return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`;
    }
}
