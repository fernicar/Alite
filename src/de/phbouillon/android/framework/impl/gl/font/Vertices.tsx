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

export class Vertices {
    public static readonly POSITION_CNT_2D = 2;
    public static readonly POSITION_CNT_3D = 3;
    public static readonly COLOR_CNT = 4;
    public static readonly TEXCOORD_CNT = 2;
    public static readonly NORMAL_CNT = 3;
    public static readonly INDEX_SIZE = 2; // short

    public readonly hasColor: boolean;
    public readonly hasTexCoords: boolean;
    public readonly hasNormals: boolean;
    public readonly positionCnt: number;
    public readonly vertexStride: number;
    public readonly vertexSize: number;

    private vertices: Float32Array;
    private indices: Uint16Array;
    private vertexBuffer: WebGLBuffer;
    private indexBuffer: WebGLBuffer;

    public numVertices: number;
    public numIndices: number;

    private gl: WebGLRenderingContext;
    private dirty = true;

    constructor(gl: WebGLRenderingContext, maxVertices: number, maxIndices: number, hasColor: boolean, hasTexCoords: boolean, hasNormals: boolean, use3D: boolean = false) {
        this.gl = gl;
        this.hasColor = hasColor;
        this.hasTexCoords = hasTexCoords;
        this.hasNormals = hasNormals;
        this.positionCnt = use3D ? Vertices.POSITION_CNT_3D : Vertices.POSITION_CNT_2D;
        this.vertexStride = this.positionCnt + (hasColor ? Vertices.COLOR_CNT : 0) + (hasTexCoords ? Vertices.TEXCOORD_CNT : 0) + (hasNormals ? Vertices.NORMAL_CNT : 0);
        this.vertexSize = this.vertexStride * 4;

        this.vertices = new Float32Array(maxVertices * this.vertexStride);
        this.vertexBuffer = gl.createBuffer();

        if (maxIndices > 0) {
            this.indices = new Uint16Array(maxIndices);
            this.indexBuffer = gl.createBuffer();
        } else {
            this.indices = null;
            this.indexBuffer = null;
        }

        this.numVertices = 0;
        this.numIndices = 0;
    }

    public setVertices(vertices: number[], offset: number, length: number): void {
        this.vertices.set(vertices.slice(offset, offset + length), 0);
        this.numVertices = length / this.vertexStride;
        this.dirty = true;
    }

    public setIndices(indices: number[], offset: number, length: number): void {
        this.indices.set(indices.slice(offset, offset + length), 0);
        this.numIndices = length;
        this.dirty = true;
    }

    public bind(shaderProgram: WebGLProgram): void {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        if (this.dirty) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        }

        const posLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(posLocation);
        gl.vertexAttribPointer(posLocation, this.positionCnt, gl.FLOAT, false, this.vertexSize, 0);

        let offset = this.positionCnt * 4;
        if (this.hasColor) {
            const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");
            gl.enableVertexAttribArray(colorLocation);
            gl.vertexAttribPointer(colorLocation, Vertices.COLOR_CNT, gl.FLOAT, false, this.vertexSize, offset);
            offset += Vertices.COLOR_CNT * 4;
        }

        if (this.hasTexCoords) {
            const texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");
            gl.enableVertexAttribArray(texCoordLocation);
            gl.vertexAttribPointer(texCoordLocation, Vertices.TEXCOORD_CNT, gl.FLOAT, false, this.vertexSize, offset);
            offset += Vertices.TEXCOORD_CNT * 4;
        }

        if (this.hasNormals) {
            const normalLocation = gl.getAttribLocation(shaderProgram, "a_normal");
            gl.enableVertexAttribArray(normalLocation);
            gl.vertexAttribPointer(normalLocation, Vertices.NORMAL_CNT, gl.FLOAT, false, this.vertexSize, offset);
        }

        if (this.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            if (this.dirty) {
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
            }
        }

        this.dirty = false;
    }

    public draw(primitiveType: number, offset: number, numVertices: number): void {
        const gl = this.gl;
        if (this.indices) {
            gl.drawElements(primitiveType, numVertices, gl.UNSIGNED_SHORT, offset * Vertices.INDEX_SIZE);
        } else {
            gl.drawArrays(primitiveType, offset, numVertices);
        }
    }

    public unbind(shaderProgram: WebGLProgram): void {
        const gl = this.gl;

        const posLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.disableVertexAttribArray(posLocation);

        if (this.hasColor) {
            const colorLocation = gl.getAttribLocation(shaderProgram, "a_color");
            gl.disableVertexAttribArray(colorLocation);
        }

        if (this.hasTexCoords) {
            const texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");
            gl.disableVertexAttribArray(texCoordLocation);
        }

        if (this.hasNormals) {
            const normalLocation = gl.getAttribLocation(shaderProgram, "a_normal");
            gl.disableVertexAttribArray(normalLocation);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (this.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

    // -- Set Vertex Elements --
    public setVtxPosition(vtxIdx: number, x: number, y: number, z?: number): void {
        const index = vtxIdx * this.vertexStride;
        this.vertices[index] = x;
        this.vertices[index + 1] = y;
        if (z !== undefined) {
            this.vertices[index + 2] = z;
        }
        this.dirty = true;
    }


    public setVtxColor(vtxIdx: number, r: number, g: number, b: number, a?: number): void {
        const index = (vtxIdx * this.vertexStride) + this.positionCnt;
        this.vertices[index] = r;
        this.vertices[index + 1] = g;
        this.vertices[index + 2] = b;
        if (a !== undefined) {
            this.vertices[index + 3] = a;
        }
        this.dirty = true;
    }


    public setVtxTexCoords(vtxIdx: number, u: number, v: number): void {
        let index = (vtxIdx * this.vertexStride) + this.positionCnt;
        if (this.hasColor) index += Vertices.COLOR_CNT;
        this.vertices[index] = u;
        this.vertices[index + 1] = v;
        this.dirty = true;
    }

    public setVtxNormal(vtxIdx: number, x: number, y: number, z: number): void {
        let index = (vtxIdx * this.vertexStride) + this.positionCnt;
        if (this.hasColor) index += Vertices.COLOR_CNT;
        if (this.hasTexCoords) index += Vertices.TEXCOORD_CNT;
        this.vertices[index] = x;
        this.vertices[index + 1] = y;
        this.vertices[index + 2] = z;
        this.dirty = true;
    }
}
