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

import { SpaceObject } from "../SpaceObject";
import { ConstCurveParameter } from "./ConstCurveParameter";
import { Curve } from "./Curve";
import { CurveParameter } from "./CurveParameter";
import { CurveParameterKey } from "./CurveParameterKey";

export class BreakDown extends Curve {
    constructor(reference: SpaceObject) {
        super("BreakDown");

        this.setMatrix(reference.getMatrix());
        this.applyDeltaRotation(0, 180, 0);

        // 500m is the approximate distance between the first two curve points
        const keyTime = 500.0 / reference.getMaxSpeed();

        const key0tx = new CurveParameterKey(0, 0);
        const key0ty = new CurveParameterKey(0, 0);
        const key0tz = new CurveParameterKey(0, 0);
        const key0rx = new CurveParameterKey(0, 0);
        const key0ry = new CurveParameterKey(0, 0);
        const key0rz = new CurveParameterKey(0, 0);

        const key1tx = new CurveParameterKey(keyTime, 0);
        const key1ty = new CurveParameterKey(keyTime, 0);
        const key1tz = new CurveParameterKey(keyTime, 500);
        const key1rx = new CurveParameterKey(keyTime, 0);
        const key1ry = new CurveParameterKey(keyTime, 0);
        const key1rz = new CurveParameterKey(keyTime, 0);

        const key2tx = new CurveParameterKey(2 * keyTime, 0);
        const key2ty = new CurveParameterKey(2 * keyTime, -500);
        const key2tz = new CurveParameterKey(2 * keyTime, 500);
        const key2rx = new CurveParameterKey(2 * keyTime, 0);
        const key2ry = new CurveParameterKey(2 * keyTime, 0);
        const key2rz = new CurveParameterKey(2 * keyTime, -90);

        const curveTX = new CurveParameter(key0tx, key1tx, key2tx);
        const curveTY = new CurveParameter(key0ty, key1ty, key2ty);
        const curveTZ = new CurveParameter(key0tz, key1tz, key2tz);
        const curveRX = new ConstCurveParameter(key0rx, key1rx, key2rx);
        const curveRY = new ConstCurveParameter(key0ry, key1ry, key2ry);
        const curveRZ = new ConstCurveParameter(key0rz, key1rz, key2rz);

        this.totalLength = 2 * keyTime;
        this.initialize(curveTX, curveTY, curveTZ, curveRX, curveRY, curveRZ);
    }
}
