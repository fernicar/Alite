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

import { Pool, PoolObjectFactory } from "../../../../../framework/impl/Pool";
import { GraphicObject } from "../../../../../framework/impl/gl/GraphicObject";
import { Vector3f } from "../../../../../framework/math/Vector3f";
import { WayPointFactory } from "./WayPointFactory";

export class WayPoint {
    private static readonly serialVersionUID = 1457361922469761843;

    public readonly upVector = new Vector3f(0, 0, 0);
    public readonly position = new Vector3f(0, 0, 0);
    public orientFirst = false;

    private static waypointFactory: PoolObjectFactory<WayPoint> = new WayPointFactory();
    private static pool: Pool<WayPoint> = new Pool<WayPoint>(WayPoint.waypointFactory, 100);

    constructor() {
    }

    public static newWayPoint(position?: Vector3f | number, up?: Vector3f | number, z?: number, ux?: number, uy?: number, uz?: number): WayPoint {
        if (position instanceof Vector3f && up instanceof Vector3f) {
            return this.newWayPoint(position.x, position.y, position.z, up.x, up.y, up.z);
        } else if (typeof position === 'number' && typeof up === 'number' && z !== undefined) {
            const result = this.pool.newObject();
            result.position.x = position;
            result.position.y = up;
            result.position.z = z;
            result.upVector.x = ux;
            result.upVector.y = uy;
            result.upVector.z = uz;
            result.orientFirst = false;
            return result;
        } else {
            return this.newWayPoint(0, 0, 0, 0, 0, 0);
        }
    }

    public reached(): void {
        WayPoint.pool.free(this);
    }

    public distanceSq(go: GraphicObject): number {
        return this.position.distanceSq(go.getPosition());
    }

    public toString(): string {
        return this.position.toString();
    }
}
