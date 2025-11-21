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

import { IMethodHook } from "../../../framework/IMethodHook";
import { GraphicObject } from "../../../framework/impl/gl/GraphicObject";
import { Vector3f } from "../../../framework/math/Vector3f";

export enum ZPositioning {
    Front,
    Normal,
    Back
}

export class AliteObject extends GraphicObject {
    private static readonly serialVersionUID = -5229181033103145634;

    private visible = true;
    private remove = false;
    private positionMode: ZPositioning = ZPositioning.Normal;
    protected boundingSphereRadius: number;
    private readonly destructionCallbacks: Set<IMethodHook> = new Set();
    protected hudColor: number;
    private visibleOnHud = false;
    private saving = false;
    private readonly displayMatrix: number[] = new Array(16);
    distanceFromCenterToBorder: number;
    private depthTest = true;

    protected readonly v0 = new Vector3f(0, 0, 0);
    protected readonly v1 = new Vector3f(0, 0, 0);
    private readonly v2 = new Vector3f(0, 0, 0);
    private readonly edge1 = new Vector3f(0, 0, 0);
    private readonly edge2 = new Vector3f(0, 0, 0);
    private readonly pvec = new Vector3f(0, 0, 0);
    private readonly qvec = new Vector3f(0, 0, 0);
    private readonly tvec = new Vector3f(0, 0, 0);

    constructor(id: string) {
        super(id);
    }

    public setSaving(b: boolean): void {
        this.saving = b;
        if (this.saving) {
            this.destructionCallbacks.clear();
        }
    }

    public addDestructionCallback(callback: IMethodHook): void {
        if (this.saving) {
            return;
        }
        this.destructionCallbacks.add(callback);
    }

    public hasDestructionCallback(): boolean {
        return !this.saving && this.destructionCallbacks.size > 0;
    }

    public setDepthTest(depthTest: boolean): void {
        this.depthTest = depthTest;
    }

    public isDepthTest(): boolean {
        return this.depthTest;
    }

    public setVisible(visible: boolean): void {
        this.visible = visible;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setRemove(remove: boolean): void {
        this.remove = remove;
    }

    public mustBeRemoved(): boolean {
        return this.remove;
    }

    public getZPositioningMode(): ZPositioning {
        return this.positionMode;
    }

    public setZPositioningMode(posMode: ZPositioning): void {
        this.positionMode = posMode;
    }

    public getBoundingSphereRadius(): number {
        return this.boundingSphereRadius;
    }

    public executeDestructionCallbacks(): void {
        for (const dc of this.destructionCallbacks) {
            dc.execute(0);
        }
    }

    protected intersectInternal(numberOfVertices: number, origin: Vector3f, direction: Vector3f, verts: number[]): boolean {
        for (let i = 0; i < numberOfVertices * 3; i += 9) {
            this.v0.x = verts[i + 0];
            this.v0.y = verts[i + 1];
            this.v0.z = verts[i + 2];

            this.v1.x = verts[i + 3];
            this.v1.y = verts[i + 4];
            this.v1.z = verts[i + 5];

            this.v2.x = verts[i + 6];
            this.v2.y = verts[i + 7];
            this.v2.z = verts[i + 8];

            this.v1.sub(this.v0, this.edge1);
            this.v2.sub(this.v0, this.edge2);
            direction.cross(this.edge2, this.pvec);
            const det = this.edge1.dot(this.pvec);
            if (Math.abs(det) < 0.00001) {
                continue;
            }
            const invDet = 1.0 / det;
            origin.sub(this.v0, this.tvec);
            const u = this.tvec.dot(this.pvec) * invDet;
            if (u < 0.0 || u > 1.0) {
                continue;
            }
            this.tvec.cross(this.edge1, this.qvec);
            const v = direction.dot(this.qvec) * invDet;
            if (v < 0.0 || u + v > 1.0) {
                continue;
            }
            return true;
        }
        return false;
    }


    public isVisibleOnHud(): boolean {
        return this.visibleOnHud;
    }

    public setVisibleOnHud(visibleOnHud: boolean): void {
        this.visibleOnHud = visibleOnHud;
    }

    public getHudColor(): number {
        return this.hudColor;
    }

    public render(): void {
    }

    public getDistanceFromCenterToBorder(): number {
        return this.distanceFromCenterToBorder;
    }

    public setDisplayMatrix(matrix: number[]): void {
        for(let i=0; i<matrix.length; i++) {
            this.displayMatrix[i] = matrix[i];
        }
    }

    public getDisplayMatrix(): number[] {
        return this.displayMatrix;
    }
}
