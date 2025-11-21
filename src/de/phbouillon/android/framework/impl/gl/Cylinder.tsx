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

import { GLES11 } from "./GLES11";
import { GlUtils } from "./GlUtils";
import { Alite } from "../../../games/alite/Alite";

export class Cylinder {
    private static readonly sin = [
        0.000000, 0.195090, 0.382683, 0.555570, 0.707107, 0.831470, 0.923880, 0.980785, 1.000000,
        0.980785, 0.923880, 0.831470, 0.707107, 0.555570, 0.382683, 0.195090, 0.000000,
        -0.195090, -0.382683, -0.555570, -0.707107, -0.831470, -0.923880, -0.980785, -1.000000,
        -0.980785, -0.923880, -0.831470, -0.707107, -0.555570, -0.382683, -0.195090
    ];
    private static readonly cos = [
        1.000000, 0.980785, 0.923880, 0.831470, 0.707107, 0.555570, 0.382683, 0.195090, 0.000000,
        -0.195090, -0.382683, -0.555570, -0.707107, -0.831470, -0.923880, -0.980785, -1.000000,
        -0.980785, -0.923880, -0.831470, -0.707107, -0.555570, -0.382683, -0.195090, 0.000000,
        0.195090, 0.382683, 0.555570, 0.707107, 0.831470, 0.923880, 0.980785
    ];

    private diskBuffer1: Float32Array;
    private diskBuffer2: Float32Array;
    private cylinderBuffer: Float32Array;
    private normalBuffer: Float32Array[];
    private texCoordBuffer: Float32Array;
    private readonly textureFilename: string;
    private radius: number;
    private hasTop: boolean;
    private hasBottom: boolean;
    private length: number;
    private r = 1.0;
    private g = 1.0;
    private b = 1.0;
    private a = 1.0;
    private segments: number;

    constructor(length: number, radius: number, segments: number, hasTop: boolean, hasBottom: boolean, textureFilename: string) {
        const halfLength = length / 2.0;

        if (segments <= 8) this.segments = 8;
        else if (segments <= 16) this.segments = 16;
        else this.segments = 32;

        this.hasTop = hasTop;
        this.hasBottom = hasBottom;
        this.radius = radius;
        this.length = length;
        this.textureFilename = textureFilename;

        this.initBuffers();

        if (hasTop) this.plotDiskPoints(this.diskBuffer1, this.normalBuffer[0], radius, radius, 0, 0, -halfLength, false);
        this.plotCylinderPoints(radius, radius, radius, radius, length, 0, 0, -halfLength);
        if (hasBottom) this.plotDiskPoints(this.diskBuffer2, this.normalBuffer[2], radius, radius, 0, 0, halfLength, true);

        if (this.textureFilename) {
            Alite.get().getTextureManager().addTexture(this.textureFilename);
        }
    }

    private initBuffers() {
        this.diskBuffer1 = this.hasTop ? new Float32Array(3 * (this.segments + 2)) : null;
        this.cylinderBuffer = new Float32Array(3 * (this.segments * 2 + 2));
        this.diskBuffer2 = this.hasBottom ? new Float32Array(3 * (this.segments + 2)) : null;
        this.normalBuffer = [
            new Float32Array(3 * (this.segments + 2)),
            new Float32Array(3 * (this.segments * 2 + 2)),
            new Float32Array(3 * (this.segments + 2))
        ];
        this.texCoordBuffer = new Float32Array(2 * (this.segments * 2 + 2));
    }


    public setColor(r: number, g: number, b: number, a: number): void {
        this.r = r; this.g = g; this.b = b; this.a = a;
    }

    protected plotDiskPoints(diskBuffer: Float32Array, normalBuffer: Float32Array, rx: number, ry: number, x: number, y: number, z: number, back: boolean): void {
        let dbIdx = 0, nbIdx = 0;
        diskBuffer[dbIdx++] = x; diskBuffer[dbIdx++] = y; diskBuffer[dbIdx++] = z;
        normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 1;

        const step = 32 / this.segments;
        for (let i = 0; i < 32; i += step) {
            diskBuffer[dbIdx++] = x + Cylinder.sin[i] * rx;
            diskBuffer[dbIdx++] = y + Cylinder.cos[i] * ry;
            diskBuffer[dbIdx++] = z;
            normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 1;
        }

        diskBuffer[dbIdx++] = x; diskBuffer[dbIdx++] = y + ry; diskBuffer[dbIdx++] = z;
        normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 0; normalBuffer[nbIdx++] = 1;
    }

    protected plotCylinderPoints(r1x: number, r1y: number, r2x: number, r2y: number, len: number, x: number, y: number, z: number): void {
        let cbIdx = 0, nbIdx = 0, tbIdx = 0;
        const step = 32 / this.segments;

        for (let i = 0; i < 32; i += step) {
            this.cylinderBuffer[cbIdx++] = x + Cylinder.sin[i] * r1x;
            this.cylinderBuffer[cbIdx++] = y + Cylinder.cos[i] * r1y;
            this.cylinderBuffer[cbIdx++] = z;
            this.normalBuffer[1][nbIdx++] = Cylinder.sin[i];
            this.normalBuffer[1][nbIdx++] = Cylinder.cos[i];
            this.normalBuffer[1][nbIdx++] = 0;
            this.texCoordBuffer[tbIdx++] = i / 32;
            this.texCoordBuffer[tbIdx++] = 0;

            this.cylinderBuffer[cbIdx++] = x + Cylinder.sin[i] * r2x;
            this.cylinderBuffer[cbIdx++] = y + Cylinder.cos[i] * r2y;
            this.cylinderBuffer[cbIdx++] = z + len;
            this.normalBuffer[1][nbIdx++] = Cylinder.sin[i];
            this.normalBuffer[1][nbIdx++] = Cylinder.cos[i];
            this.normalBuffer[1][nbIdx++] = 0;
            this.texCoordBuffer[tbIdx++] = i / 32;
            this.texCoordBuffer[tbIdx++] = 1;
        }

        // Close the loop
        this.cylinderBuffer[cbIdx++] = x + Cylinder.sin[0] * r1x;
        this.cylinderBuffer[cbIdx++] = y + Cylinder.cos[0] * r1y;
        this.cylinderBuffer[cbIdx++] = z;
        this.normalBuffer[1][nbIdx++] = Cylinder.sin[0];
        this.normalBuffer[1][nbIdx++] = Cylinder.cos[0];
        this.normalBuffer[1][nbIdx++] = 0;
        this.texCoordBuffer[tbIdx++] = 1;
        this.texCoordBuffer[tbIdx++] = 0;

        this.cylinderBuffer[cbIdx++] = x + Cylinder.sin[0] * r2x;
        this.cylinderBuffer[cbIdx++] = y + Cylinder.cos[0] * r2y;
        this.cylinderBuffer[cbIdx++] = z + len;
        this.normalBuffer[1][nbIdx++] = Cylinder.sin[0];
        this.normalBuffer[1][nbIdx++] = Cylinder.cos[0];
        this.normalBuffer[1][nbIdx++] = 0;
        this.texCoordBuffer[tbIdx++] = 1;
        this.texCoordBuffer[tbIdx++] = 1;
    }


    public render(): void {
        GLES11.glDisable(GLES11.GL_CULL_FACE);

        if (this.hasTop) {
            GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
            GLES11.glEnableClientState(GLES11.GL_NORMAL_ARRAY);
            GLES11.glEnable(GLES11.GL_BLEND);
            GLES11.glBlendFunc(GLES11.GL_ONE, GLES11.GL_ONE);
            GLES11.glColor4f(this.r, this.g, this.b, this.a);
            GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, this.diskBuffer1);
            GLES11.glNormalPointer(GLES11.GL_FLOAT, 0, this.normalBuffer[0]);
            GLES11.glDrawArrays(GLES11.GL_TRIANGLE_FAN, 0, this.segments + 2);
        }

        GLES11.glNormalPointer(GLES11.GL_FLOAT, 0, this.normalBuffer[1]);
        GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, this.cylinderBuffer);
        if (this.textureFilename) {
            GLES11.glEnable(GLES11.GL_LIGHTING);
            GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
            GLES11.glTexCoordPointer(2, GLES11.GL_FLOAT, 0, this.texCoordBuffer);
            Alite.get().getTextureManager().setTexture(this.textureFilename);
        } else {
            GLES11.glDisable(GLES11.GL_LIGHTING);
            GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        }
        GLES11.glTexEnvf(GLES11.GL_TEXTURE_ENV, GLES11.GL_TEXTURE_ENV_MODE, GLES11.GL_MODULATE);
        GLES11.glBlendFunc(GLES11.GL_SRC_ALPHA, GLES11.GL_ONE_MINUS_SRC_ALPHA);
        GLES11.glDisable(GLES11.GL_BLEND);
        GLES11.glColor4f(this.r, this.g, this.b, this.a);
        GLES11.glDrawArrays(GLES11.GL_TRIANGLE_STRIP, 0, this.segments * 2 + 2);

        if (this.hasBottom) {
            GLES11.glDisable(GLES11.GL_LIGHTING);
            GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
            GLES11.glEnableClientState(GLES11.GL_NORMAL_ARRAY);
            GLES11.glEnable(GLES11.GL_BLEND);
            GLES11.glBlendFunc(GLES11.GL_ONE, GLES11.GL_ONE);
            GLES11.glColor4f(this.r, this.g, this.b, this.a);
            GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, this.diskBuffer2);
            GLES11.glNormalPointer(GLES11.GL_FLOAT, 0, this.normalBuffer[2]);
            GLES11.glDrawArrays(GLES11.GL_TRIANGLE_FAN, 0, this.segments + 2);
        }

        GLES11.glColor4f(1, 1, 1, 1);
        GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        GLES11.glEnable(GLES11.GL_LIGHTING);
    }
}
