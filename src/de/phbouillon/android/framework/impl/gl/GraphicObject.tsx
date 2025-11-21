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
 * GNU General Public License for a copy of the GNU General Public License
 * along with this program.  If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { mat4, vec3 } from "gl-matrix";
import { AliteLog } from "../../../games/alite/AliteLog";
import { Vector3f } from "../../math/Vector3f";
import { IMethodHook } from "../../IMethodHook";


export class GraphicObject {
    private static readonly SPEED_CHANGE_PER_SECOND = 225.0;

    protected worldPosition: Vector3f;
    protected rightVector: Vector3f;
    protected upVector: Vector3f;
    protected forwardVector: Vector3f;
    private readonly initialDirection: Vector3f = new Vector3f(1.0, 1.0, 1.0);
    private readonly temp: Vector3f = new Vector3f(1.0, 1.0, 1.0);
    private speed: number;
    private targetSpeed: number;

    private id: string;

    private readonly currentMatrix: mat4 = mat4.create();
    private readonly tempMatrix: mat4 = mat4.create();
    private readonly tempMatrix2: mat4 = mat4.create();
    private cached: boolean = false;
    private updater: IMethodHook = null;

    constructor(idOrMatrix: string | mat4 = "Unknown", id?: string) {
        if (typeof idOrMatrix === 'string') {
            this.worldPosition = new Vector3f(0.0, 0.0, 0.0);
            this.rightVector = new Vector3f(1.0, 0.0, 0.0);
            this.upVector = new Vector3f(0.0, 1.0, 0.0);
            this.forwardVector = new Vector3f(0.0, 0.0, 1.0);
            this.speed = 0.0;
            this.targetSpeed = 0.0;
            this.id = idOrMatrix;
        } else {
            const matrix = idOrMatrix;
            this.worldPosition = new Vector3f(matrix[12], matrix[13], matrix[14]);
            this.rightVector = new Vector3f(matrix[0], matrix[1], matrix[2]);
            this.rightVector.normalize();
            this.upVector = new Vector3f(matrix[4], matrix[5], matrix[6]);
            this.upVector.normalize();
            this.forwardVector = new Vector3f(matrix[8], matrix[9], matrix[10]);
            this.forwardVector.normalize();
            this.speed = 0.0;
            this.targetSpeed = 0.0;
            this.id = id || "Unknown";
        }
    }

    private toDebugString(): string {
        return `GO:            ${this.id || "<null>"}
                \nworldPosition: ${this.worldPosition}
                \nforward:       ${this.forwardVector}
                \nup:            ${this.upVector}
                \nright:         ${this.rightVector}
                \ninitial:       ${this.initialDirection}
                \nspeed:         ${this.speed}
                \ntargetSpeed:   ${this.targetSpeed}
                \ncurrentMatrix: ${this.getMatrixString()}`;
    }

    public onUpdate(deltaTime: number): void {
        if (this.updater === null) {
            return;
        }
        this.updater.execute(deltaTime);
    }

    public setUpdater(updater: IMethodHook): void {
        this.updater = updater;
    }

    public getUpdater(): IMethodHook {
        return this.updater;
    }

    public assertOrthoNormal(): void {
        this.computeMatrix();
        const det = mat4.determinant(this.currentMatrix);

        if (Math.abs(det - 1.0) > 0.0001) {
            AliteLog.e("ALERT!", `Determinant of matrix != 1: ${det}`);
        }
    }

    public setPosition(position: Vector3f): void;
    public setPosition(x: number, y: number, z: number): void;
    public setPosition(xOrVec: number | Vector3f, y?: number, z?: number): void {
        if (xOrVec instanceof Vector3f) {
            this.worldPosition.x = xOrVec.x;
            this.worldPosition.y = xOrVec.y;
            this.worldPosition.z = xOrVec.z;
        } else {
            this.worldPosition.x = xOrVec;
            this.worldPosition.y = y;
            this.worldPosition.z = z;
        }
        this.cached = false;
    }


    public setRightVector(rightVector: Vector3f): void {
        this.rightVector.x = rightVector.x;
        this.rightVector.y = rightVector.y;
        this.rightVector.z = rightVector.z;
        this.rightVector.normalize();
        this.cached = false;
    }

    public setUpVector(upVector: Vector3f): void {
        this.upVector.x = upVector.x;
        this.upVector.y = upVector.y;
        this.upVector.z = upVector.z;
        this.upVector.normalize();
        this.cached = false;
    }

    public setForwardVector(forwardVector: Vector3f): void;
    public setForwardVector(x: number, y: number, z: number): void;
    public setForwardVector(xOrVec: number | Vector3f, y?: number, z?: number): void {
        if (xOrVec instanceof Vector3f) {
            this.forwardVector.x = xOrVec.x;
            this.forwardVector.y = xOrVec.y;
            this.forwardVector.z = xOrVec.z;
        } else {
            this.forwardVector.x = xOrVec;
            this.forwardVector.y = y;
            this.forwardVector.z = z;
        }
        this.forwardVector.normalize();
        this.cached = false;
    }


    public getPosition(): Vector3f {
        return this.worldPosition;
    }

    public getRightVector(): Vector3f {
        return this.rightVector;
    }

    public getUpVector(): Vector3f {
        return this.upVector;
    }

    public getForwardVector(): Vector3f {
        return this.forwardVector;
    }

    public getId(): string {
        return this.id;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public getName(): string {
        return this.id;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public setSpeed(speed: number): void {
        this.speed = speed;
        this.targetSpeed = speed;
    }

    public adjustSpeed(speed: number): void {
        this.targetSpeed = speed;
    }

    public updateSpeed(deltaTime: number): void {
        if (Math.abs(this.targetSpeed - this.speed) < 0.0001) {
            return;
        }
        if (this.speed < this.targetSpeed) {
            this.speed += deltaTime * GraphicObject.SPEED_CHANGE_PER_SECOND;
            if (this.speed > this.targetSpeed) {
                this.speed = this.targetSpeed;
            }
        } else {
            this.speed -= deltaTime * GraphicObject.SPEED_CHANGE_PER_SECOND;
            if (this.speed < this.targetSpeed) {
                this.speed = this.targetSpeed;
            }
        }
    }

    public getTargetSpeed(): number {
        return this.targetSpeed;
    }

    public final_computeMatrix(): void {
        if (this.cached) {
            return;
        }

        const rn = this.rightVector.normalize();
        const un = this.upVector.normalize();
        const fn = this.forwardVector.normalize();

        mat4.set(
            this.currentMatrix,
            rn.x, rn.y, rn.z, 0,
            un.x, un.y, un.z, 0,
            fn.x, fn.y, fn.z, 0,
            this.worldPosition.x, this.worldPosition.y, this.worldPosition.z, 1
        );

        this.cached = true;
    }

    public getMatrix(): mat4 {
        this.final_computeMatrix();
        return this.currentMatrix;
    }

    private getMatrixString(): string {
        this.final_computeMatrix();
        const m = this.currentMatrix;
        return `[${m[0].toFixed(2)}, ${m[4].toFixed(2)}, ${m[8].toFixed(2)}, ${m[12].toFixed(2)}
                 \n ${m[1].toFixed(2)}, ${m[5].toFixed(2)}, ${m[9].toFixed(2)}, ${m[13].toFixed(2)}
                 \n ${m[2].toFixed(2)}, ${m[6].toFixed(2)}, ${m[10].toFixed(2)}, ${m[14].toFixed(2)}
                 \n ${m[3].toFixed(2)}, ${m[7].toFixed(2)}, ${m[11].toFixed(2)}, ${m[15].toFixed(2)}]`;
    }

    public translateForward(deltaTime: number): void {
        if (Math.abs(this.speed) < 0.00001) {
            return;
        }
        this.final_computeMatrix();
        this.temp.x = this.forwardVector.x * this.speed * deltaTime;
        this.temp.y = this.forwardVector.y * this.speed * deltaTime;
        this.temp.z = this.forwardVector.z * this.speed * deltaTime;

        mat4.identity(this.tempMatrix);
        mat4.translate(this.tempMatrix, this.tempMatrix, this.temp.asVec());
        mat4.multiply(this.tempMatrix2, this.currentMatrix, this.tempMatrix);
        mat4.copy(this.currentMatrix, this.tempMatrix2);
        this.extractVectors();
    }

    public moveForward(deltaTime: number, dir?: Vector3f): void {
        if (Math.abs(this.speed) < 0.00001) {
            return;
        }
        const direction = dir || this.forwardVector;
        this.temp.x = direction.x * this.speed * deltaTime;
        this.temp.y = direction.y * this.speed * deltaTime;
        this.temp.z = direction.z * this.speed * deltaTime;
        this.worldPosition.add(this.temp);
        this.cached = false;
    }


    public setInitialDirection(x: number, y: number, z: number): void {
        this.initialDirection.x = x;
        this.initialDirection.y = y;
        this.initialDirection.z = z;
        this.initialDirection.normalize();
    }

    public getInitialDirection(): Vector3f {
        return this.initialDirection;
    }

    public getScaledMatrix(scale: number): mat4 {
        this.final_computeMatrix();
        mat4.scale(this.tempMatrix, this.currentMatrix, [scale, scale, scale]);
        return this.tempMatrix;
    }

    public scale(scale: number): void;
    public scale(scaleX: number, scaleY: number, scaleZ: number): void;
    public scale(scaleX: number, scaleY?: number, scaleZ?: number): void {
        this.final_computeMatrix();
        const y = scaleY === undefined ? scaleX : scaleY;
        const z = scaleZ === undefined ? scaleX : scaleZ;
        mat4.scale(this.currentMatrix, this.currentMatrix, [scaleX, y, z]);
        this.extractVectors();
    }

    public final_extractVectors(): void {
        const m = this.currentMatrix;
        this.rightVector.x = m[0];
        this.rightVector.y = m[1];
        this.rightVector.z = m[2];

        this.upVector.x = m[4];
        this.upVector.y = m[5];
        this.upVector.z = m[6];

        this.forwardVector.x = m[8];
        this.forwardVector.y = m[9];
        this.forwardVector.z = m[10];

        this.worldPosition.x = m[12];
        this.worldPosition.y = m[13];
        this.worldPosition.z = m[14];
    }

    public applyDeltaRotation(x: number, y: number, z: number): mat4 {
        this.final_computeMatrix();
        mat4.rotateZ(this.currentMatrix, this.currentMatrix, z);
        mat4.rotateX(this.currentMatrix, this.currentMatrix, x);
        mat4.rotateY(this.currentMatrix, this.currentMatrix, y);
        this.extractVectors();
        return this.currentMatrix;
    }

    public orthoNormalize(): void {
        this.final_computeMatrix();
        this.forwardVector.normalize();
        this.upVector.cross(this.forwardVector, this.temp);
        this.temp.normalize();
        this.forwardVector.cross(this.temp, this.upVector);
        this.cached = false;
    }

    private lookAt(x: number, y: number, z: number, ux: number, uy: number, uz: number): void {
        this.forwardVector.x = x - this.worldPosition.x;
        this.forwardVector.y = y - this.worldPosition.y;
        this.forwardVector.z = z - this.worldPosition.z;
        this.forwardVector.normalize();
        this.upVector.x = ux;
        this.upVector.y = uy;
        this.upVector.z = uz;
        this.upVector.normalize();
        this.forwardVector.cross(this.upVector, this.rightVector);
        this.cached = false;
        this.assertOrthoNormal();
        this.final_computeMatrix();
    }

    public setMatrix(matrix: mat4): void {
        mat4.copy(this.currentMatrix, matrix);
        this.cached = true;
        this.extractVectors();
    }

    protected calculateVertex(resultVector4: number[], resultVectorOffset: number, matrix4x4: mat4, vector3: number[], vectorOffset: number, scale: number): void {
        const tempVec4: [number, number, number, number] = [
            vector3[vectorOffset] * scale,
            vector3[vectorOffset + 1] * scale,
            vector3[vectorOffset + 2] * scale,
            1
        ];

        vec3.transformMat4(tempVec4 as any, tempVec4 as any, matrix4x4);

        resultVector4[resultVectorOffset] = tempVec4[0];
        resultVector4[resultVectorOffset + 1] = tempVec4[1];
        resultVector4[resultVectorOffset + 2] = tempVec4[2];
        resultVector4[resultVectorOffset + 3] = tempVec4[3];
    }


    public equals(o: any): boolean {
        if (this === o) return true;
        if (o == null || !(o instanceof GraphicObject)) return false;
        return this.id === (o as GraphicObject).id;
    }

    public hashCode(): number {
        // Simple hash function for string, can be improved
        let hash = 0;
        for (let i = 0; i < this.id.length; i++) {
            const char = this.id.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
}
