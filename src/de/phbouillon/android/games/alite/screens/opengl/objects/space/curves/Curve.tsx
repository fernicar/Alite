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
import { AliteObject } from "../AliteObject";
import { CurveParameter } from "./CurveParameter";

export abstract class Curve extends AliteObject {
    private static readonly serialVersionUID = 5294825793948465746;

    private px: CurveParameter;
    private py: CurveParameter;
    private pz: CurveParameter;
    private rx: CurveParameter;
    private ry: CurveParameter;
    private rz: CurveParameter;

    totalLength: number;

    private readonly position = new Vector3f(0, 0, 0);
    private readonly rotation = new Vector3f(0, 0, 0);
    private readonly cForward = new Vector3f(0, 0, 0);
    private readonly cRight = new Vector3f(0, 0, 0);
    private readonly cUp = new Vector3f(0, 0, 0);

    protected constructor(id: string) {
        super(id);
    }

    public reachedEnd(): boolean {
        return this.px.reachedEnd() || this.py.reachedEnd() || this.pz.reachedEnd();
    }

    protected initialize(px: CurveParameter, py: CurveParameter, pz: CurveParameter,
        rx: CurveParameter, ry: CurveParameter, rz: CurveParameter): void {
        this.px = px;
        this.py = py;
        this.pz = pz;
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.extractVectors();
        this.forwardVector.copy(this.cForward);
        this.rightVector.copy(this.cRight);
        this.cRight.negate();
        this.upVector.copy(this.cUp);
    }

    public compute(t: number, checkEnd?: boolean): void {
        if (checkEnd === undefined) {
            // R vector um rotation z rotieren und dann up berechnen....
            this.position.x = this.px.getValue(t);
            this.position.y = this.py.getValue(t);
            this.position.z = this.pz.getValue(t);
            this.rotation.x = this.rx.getValue(t);
            this.rotation.y = this.ry.getValue(t);
            this.rotation.z = this.rz.getValue(t);
            this.position.mulMat(this.getMatrix());
            const pxE = this.px.end;
            const pyE = this.py.end;
            const pzE = this.pz.end;
            this.cForward.x = this.px.getValue(t + 0.03);
            this.cForward.y = this.py.getValue(t + 0.03);
            this.cForward.z = this.pz.getValue(t + 0.03);
            this.cForward.mulMat(this.getMatrix());
            this.cForward.sub(this.position);
            this.cForward.negate();
            this.cForward.normalize();
            this.cForward.cross(this.cRight, this.cUp);
            this.cUp.normalize();
            this.px.end = pxE;
            this.py.end = pyE;
            this.pz.end = pzE;
        } else {
            const pxE = this.px.end;
            const pyE = this.py.end;
            const pzE = this.pz.end;
            this.compute(t);
            if (!checkEnd) {
                this.px.end = pxE;
                this.py.end = pyE;
                this.pz.end = pzE;
            }
        }
    }

    public getCurvePosition(): Vector3f {
        return this.position;
    }

    public getCurveRotation(): Vector3f {
        return this.rotation;
    }

    public getcForward(): Vector3f {
        return this.cForward;
    }

    public getcUp(): Vector3f {
        return this.cUp;
    }

    public getcRight(): Vector3f {
        return this.cRight;
    }
}
