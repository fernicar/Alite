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

import { Vector3f } from "../../../../../framework/math/Vector3f";

export class MathHelper {
    private static readonly v0 = new Vector3f(0, 0, 0);
    private static readonly v1 = new Vector3f(0, 0, 0);
    private static readonly v2 = new Vector3f(0, 0, 0);

    public static getRandomPosition(origin: Vector3f, direction: Vector3f, distance: number, radius: number): Vector3f {
        this.setRandomDirection(this.v1);
        this.v1.normalize();
        this.v1.scale(Math.random() * radius);
        direction.scale(distance, this.v0);
        this.v0.add(origin);
        this.v0.add(this.v1, this.v2);

        this.v2.sub(origin, this.v1);
        this.v1.normalize();
        this.v1.scale(distance);
        origin.add(this.v1, this.v2);

        return this.v2;
    }

    public static setRandomDirection(v: Vector3f): void {
        v.x = 0.7 - Math.random() * 1.4;
        v.y = 0.7 - Math.random() * 1.4;
        v.z = 0.7 - Math.random() * 1.4;
    }

    public static copyMatrix(src: number[], dest: number[]): void {
        for (let i = 0; i < 16; i++) {
            dest[i] = src[i];
        }
    }

    public static getRandomRotationAngles(targetDelta: Vector3f): void {
        targetDelta.x = this.getRandomRotationAngle();
        targetDelta.y = this.getRandomRotationAngle();
        targetDelta.z = this.getRandomRotationAngle();
    }

    private static getRandomRotationAngle(): number {
        return Math.random() < 0.5 ? Math.random() * 2.0 + 2.0 : -(Math.random() * 2.0) - 2.0;
    }

    public static updateAxes(currentDelta: Vector3f, targetDelta: Vector3f): void {
        if (Math.abs(currentDelta.x - targetDelta.x) > 0.0001) {
            currentDelta.x += (targetDelta.x - currentDelta.x) / 8.0;
        }
        if (Math.abs(currentDelta.y - targetDelta.y) > 0.0001) {
            currentDelta.y += (targetDelta.y - currentDelta.y) / 8.0;
        }
        if (Math.abs(currentDelta.z - targetDelta.z) > 0.0001) {
            currentDelta.z += (targetDelta.z - currentDelta.z) / 8.0;
        }
    }
}
