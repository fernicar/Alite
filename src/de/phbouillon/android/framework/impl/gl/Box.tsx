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

import { Vector3f } from "../../../math/Vector3f";
import { Alite } from "../../../games/alite/Alite";
import { GlUtils } from "./GlUtils";
import { AliteLog } from "../../../games/alite/AliteLog";

export class Box {
    protected vertexBuffer: Float32Array;
    protected texCoordBuffer: Float32Array;
    private readonly wh: number;
    private readonly hh: number;
    private readonly dh: number;
    private r = 1.0;
    private g = 1.0;
    private b = 1.0;
    private a = 1.0;
    private vertices: number[];

    constructor(width: number, height?: number, depth?: number) {
        if (height === undefined) { // Box(size) constructor
            const sh = width / 2;
            this.wh = sh;
            this.dh = sh;
            this.hh = sh;
        } else { // Box(width, height, depth) constructor
            this.wh = width / 2;
            this.hh = height / 2;
            this.dh = depth / 2;
        }
        this.initializeVertices();
    }

    private initializeVertices(): void {
        const vertexData = [
            -this.wh, -this.hh, -this.dh, this.wh, -this.hh, -this.dh, this.wh, this.hh, -this.dh, -this.wh, this.hh, -this.dh,
            -this.wh, -this.hh, this.dh, this.wh, -this.hh, this.dh, this.wh, this.hh, this.dh, -this.wh, this.hh, this.dh,
        ];

        this.createFaces(vertexData,
            2, 1, 0, 0, 3, 2, 0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5, 4, 5, 6, 6, 7, 4, 4, 7, 0, 7, 3, 0, 2, 3, 7, 7, 6, 2);
    }


    private createFaces(vertexData: number[], ...indices: number[]): Float32Array {
        this.vertices = new Array(indices.length * 3);

        let offset = 0;
        for (const i of indices) {
            this.vertices[offset] = vertexData[i * 3];
            this.vertices[offset + 1] = vertexData[i * 3 + 1];
            this.vertices[offset + 2] = -vertexData[i * 3 + 2];
            offset += 3;
        }

        this.vertexBuffer = GlUtils.toFloatBufferPositionZero(this.vertices);
        return this.vertexBuffer;
    }

    public getVertices(): number[] {
        return this.vertices;
    }

    public setColor(r: number, g: number, b: number, a: number): void {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public setAlpha(a: number): void {
        this.a = a;
    }

    public setFarPlane(far: Vector3f): void {
        const vertexData = [
            -this.wh, -this.hh, -this.dh, this.wh, -this.hh, -this.dh, this.wh, this.hh, -this.dh, -this.wh, this.hh, -this.dh,
            far.x - this.wh, far.y - this.hh, far.z, far.x + this.wh, far.y - this.hh, far.z, far.x + this.wh, far.y + this.hh, far.z, far.x - this.wh, far.y + this.hh, far.z
        ];

        this.createFaces(vertexData,
            2, 1, 0, 0, 3, 2, 0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5, 4, 5, 6, 6, 7, 4, 4, 7, 0, 7, 3, 0, 2, 3, 7, 7, 6, 2);
    }

    public render(): void {
        // All of the following are Android GLES11 calls and need to be replaced with WebGL.
        /*
        Alite.getInstance().getTextureManager().setTexture(null);
        GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        GLES11.glEnableClientState(GLES11.GL_VERTEX_ARRAY);
        GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, this.vertexBuffer);
        GLES11.glColor4f(this.r, this.g, this.b, this.a);
        GLES11.glDisable(GLES11.GL_LIGHTING);
        GLES11.glDrawArrays(GLES11.GL_TRIANGLES, 0, 36);
        GLES11.glColor4f(1.0, 1.0, 1.0, 1.0);
        GLES11.glEnable(GLES11.GL_LIGHTING);
        GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        */
        AliteLog.d("Box", "WebGL rendering logic needed here.");
    }
}
