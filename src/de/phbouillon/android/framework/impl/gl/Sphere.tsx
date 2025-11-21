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
import { SpriteData } from "../../SpriteData";


export class Sphere {
    protected normalBuffer: Float32Array;
    protected vertexBuffer: Float32Array;
    protected texCoordBuffer: Float32Array;

    protected readonly numberOfVertices: number;
    protected readonly glDrawMode: number;
    protected readonly textureFilename: string;

    protected readonly allNormals: Float32Array;
    protected radius: number;
    private readonly slices: number;
    private readonly stacks: number;
    private readonly inside: boolean;
    private readonly hasNormals: boolean;
    private readonly spriteData: SpriteData;
    private r: number; private g: number; private b: number; private a: number;

    constructor(radius: number, slices: number, stacks: number, textureFilename: string, spriteData: SpriteData, inside: boolean) {
        this.numberOfVertices = slices * stacks * 6;
        this.radius = radius;
        this.spriteData = spriteData;
        this.slices = slices;
        this.stacks = stacks;
        this.inside = inside;
        this.hasNormals = !inside;

        this.vertexBuffer = new Float32Array(3 * this.numberOfVertices);
        this.texCoordBuffer = textureFilename ? new Float32Array(2 * this.numberOfVertices) : null;
        if (this.hasNormals) {
            this.normalBuffer = new Float32Array(3 * this.numberOfVertices);
            this.allNormals = new Float32Array(3 * this.numberOfVertices);
        }

        this.plotSpherePoints(slices, stacks, radius, inside);
        this.textureFilename = textureFilename;
        if (textureFilename) {
            Alite.get().getTextureManager().addTexture(textureFilename);
        }
        this.glDrawMode = GLES11.GL_TRIANGLES;
        this.setColor(1,1,1,1);
    }

    public setNewSize(newRadius: number): void {
        this.radius = newRadius;
        if (this.hasNormals) {
            for (let i = 0; i < this.allNormals.length; i++) {
                this.vertexBuffer[i] = newRadius * this.allNormals[i];
            }
        }
    }

    public getRadius(): number { return this.radius; }

    private plotSpherePoints(slices: number, stacks: number, radius: number, inside: boolean): void {
        const phi_step = 2.0 * Math.PI / (slices - 1);
        const theta_step = Math.PI / (stacks - 1);
        const u_step = 1.0 / (slices - 1);
        const v_step = -1.0 / (stacks - 1);

        let vertOffset = 0;
        let normOffset = 0;
        let texOffset = 0;

        for (let phi = 0, u = 0; phi < 2.0 * Math.PI; phi += phi_step, u += u_step) {
            for (let theta = 0, v = 0; theta < Math.PI; theta += theta_step, v += v_step) {
                const sin_phi = Math.sin(phi);
                const cos_phi = Math.cos(phi);
                const sin_theta = Math.sin(theta);
                const cos_theta = Math.cos(theta);

                const sin_phi_step = Math.sin(phi + phi_step);
                const cos_phi_step = Math.cos(phi + phi_step);
                const sin_theta_step = Math.sin(theta + theta_step);
                const cos_theta_step = Math.cos(theta + theta_step);

                const x1 = sin_phi * sin_theta;
                const y1 = -cos_theta;
                const z1 = cos_phi * sin_theta;

                const x2 = sin_phi_step * sin_theta;
                const y2 = -cos_theta;
                const z2 = cos_phi_step * sin_theta;

                const x3 = sin_phi_step * sin_theta_step;
                const y3 = -cos_theta_step;
                const z3 = cos_phi_step * sin_theta_step;

                const x4 = sin_phi * sin_theta_step;
                const y4 = -cos_theta_step;
                const z4 = cos_phi * sin_theta_step;

                // Triangle 1
                this.vertexBuffer[vertOffset++] = radius * x1; this.vertexBuffer[vertOffset++] = radius * y1; this.vertexBuffer[vertOffset++] = radius * z1;
                this.vertexBuffer[vertOffset++] = radius * x2; this.vertexBuffer[vertOffset++] = radius * y2; this.vertexBuffer[vertOffset++] = radius * z2;
                this.vertexBuffer[vertOffset++] = radius * x3; this.vertexBuffer[vertOffset++] = radius * y3; this.vertexBuffer[vertOffset++] = radius * z3;

                // Triangle 2
                this.vertexBuffer[vertOffset++] = radius * x1; this.vertexBuffer[vertOffset++] = radius * y1; this.vertexBuffer[vertOffset++] = radius * z1;
                this.vertexBuffer[vertOffset++] = radius * x3; this.vertexBuffer[vertOffset++] = radius * y3; this.vertexBuffer[vertOffset++] = radius * z3;
                this.vertexBuffer[vertOffset++] = radius * x4; this.vertexBuffer[vertOffset++] = radius * y4; this.vertexBuffer[vertOffset++] = radius * z4;

                if (this.hasNormals) {
                     // Normals for triangle 1 & 2
                    [x1, y1, z1, x2, y2, z2, x3, y3, z3, x1, y1, z1, x3, y3, z3, x4, y4, z4].forEach(val => {
                        this.normalBuffer[normOffset] = val;
                        this.allNormals[normOffset] = val;
                        normOffset++;
                    });
                }

                if (this.texCoordBuffer) {
                    if (!this.spriteData) {
                        const u_val = inside ? -u : u;
                        const u_step_val = inside ? -(u + u_step) : u + u_step;
                        // Tex coords for triangle 1 & 2
                        this.texCoordBuffer[texOffset++] = u_val; this.texCoordBuffer[texOffset++] = v;
                        this.texCoordBuffer[texOffset++] = u_step_val; this.texCoordBuffer[texOffset++] = v;
                        this.texCoordBuffer[texOffset++] = u_step_val; this.texCoordBuffer[texOffset++] = v + v_step;
                        this.texCoordBuffer[texOffset++] = u_val; this.texCoordBuffer[texOffset++] = v;
                        this.texCoordBuffer[texOffset++] = u_step_val; this.texCoordBuffer[texOffset++] = v + v_step;
                        this.texCoordBuffer[texOffset++] = u_val; this.texCoordBuffer[texOffset++] = v + v_step;
                    } else {
                        const { x, y, x2, y2 } = this.spriteData;
                        const dx = x2 - x;
                        const dy = y2 - y;
                         this.texCoordBuffer[texOffset++] = x + u * dx; this.texCoordBuffer[texOffset++] = y + v * dy;
                         this.texCoordBuffer[texOffset++] = x + (u + u_step) * dx; this.texCoordBuffer[texOffset++] = y + v * dy;
                         this.texCoordBuffer[texOffset++] = x + (u + u_step) * dx; this.texCoordBuffer[texOffset++] = y + (v + v_step) * dy;
                         this.texCoordBuffer[texOffset++] = x + u * dx; this.texCoordBuffer[texOffset++] = y + v * dy;
                         this.texCoordBuffer[texOffset++] = x + (u + u_step) * dx; this.texCoordBuffer[texOffset++] = y + (v + v_step) * dy;
                         this.texCoordBuffer[texOffset++] = x + u * dx; this.texCoordBuffer[texOffset++] = y + (v + v_step) * dy;
                    }
                }
            }
        }
    }


    public render(): void {
        if (this.hasNormals) {
            GLES11.glEnableClientState(GLES11.GL_NORMAL_ARRAY);
            GLES11.glNormalPointer(GLES11.GL_FLOAT, 0, this.normalBuffer);
        } else {
            GLES11.glDisableClientState(GLES11.GL_NORMAL_ARRAY);
        }
        GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, this.vertexBuffer);

        if (this.textureFilename) {
            GLES11.glTexCoordPointer(2, GLES11.GL_FLOAT, 0, this.texCoordBuffer);
            Alite.get().getTextureManager().setTexture(this.textureFilename);
        } else {
            GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
            GLES11.glDisable(GLES11.GL_LIGHTING);
            GLES11.glColor4f(this.r, this.g, this.b, this.a);
        }

        GLES11.glDrawArrays(this.glDrawMode, 0, this.numberOfVertices);

        if (!this.hasNormals) GLES11.glEnableClientState(GLES11.GL_NORMAL_ARRAY);
        if (!this.textureFilename) {
            GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
            GLES11.glEnable(GLES11.GL_LIGHTING);
            GLES11.glColor4f(1.0, 1.0, 1.0, 1.0);
        }
    }


    public drawArrays(): void { GLES11.glDrawArrays(this.glDrawMode, 0, this.numberOfVertices); }
    public destroy(): void { if (this.textureFilename) Alite.get().getTextureManager().freeTexture(this.textureFilename); }
    public setColor(r: number, g: number, b: number, a: number): void { this.r = r; this.g = g; this.b = b; this.a = a; }
    public getR(): number { return this.r; }
    public getG(): number { return this.g; }
    public getB(): number { return this.b; }
    public getA(): number { return this.a; }
}
