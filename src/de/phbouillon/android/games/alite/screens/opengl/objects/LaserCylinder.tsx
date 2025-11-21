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

import { AliteGame } from "../../../AliteGame";
import { AliteLog } from "../../../AliteLog";
import { AliteColor } from "../../../colors/AliteColor";
import { Equipment } from "../../../model/Equipment";
import { AliteObject } from "./AliteObject";
import { MathHelper } from "./space/MathHelper";
import { SpaceObject } from "./space/SpaceObject";

export class LaserCylinder extends AliteObject {
    private static readonly sqrt1_2: number = Math.sqrt(0.5);
    private static readonly sin: number[] = [0, LaserCylinder.sqrt1_2, 1, LaserCylinder.sqrt1_2, 0, -LaserCylinder.sqrt1_2, -1, -LaserCylinder.sqrt1_2];
    private static readonly cos: number[] = [1, LaserCylinder.sqrt1_2, 0, -LaserCylinder.sqrt1_2, -1, -LaserCylinder.sqrt1_2, 0, LaserCylinder.sqrt1_2];
    private static readonly radius: number = 8.0;

    private laser: Equipment;
    private readonly twins: LaserCylinder[] = [];
    private aiming: boolean = false;
    private origin: SpaceObject;
    private diskBuffer1: WebGLBuffer;
    private diskBuffer2: WebGLBuffer;
    private cylinderBuffer: WebGLBuffer;
    private normalBuffer: WebGLBuffer[];
    private texCoordBuffer: WebGLBuffer[];
    private color: number;
    private visible: boolean = true;
    private readonly saveMatrix: Float32Array = new Float32Array(16);
    private removeInNFrames: number = -1;
    private textureFilename: string = null;

    private beamLength: number = 150;
    private halfLength: number = this.beamLength >> 1;

    public constructor() {
        super("Laser");
        this.initializeBuffers();
        this.boundingSphereRadius = this.halfLength;
        this.setSpeed(this.calcSpeed());
    }

    private initializeBuffers(): void {
        const gl = AliteGame.get().getGraphics().getGL();

        this.diskBuffer1 = gl.createBuffer();
        this.cylinderBuffer = gl.createBuffer();
        this.diskBuffer2 = gl.createBuffer();
        this.normalBuffer = [gl.createBuffer(), gl.createBuffer(), gl.createBuffer()];
        this.texCoordBuffer = [gl.createBuffer(), gl.createBuffer(), gl.createBuffer()];

        this.plotData();
    }


    private plotData(): void {
        const gl = AliteGame.get().getGraphics().getGL();
        const disk1 = { pos: [], norm: [], tex: [] };
        this.plotDiskPoints(disk1, LaserCylinder.radius, LaserCylinder.radius, 0, 0, -this.halfLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.diskBuffer1);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk1.pos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk1.norm), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk1.tex), gl.STATIC_DRAW);

        const cylinder = { pos: [], norm: [], tex: [] };
        this.plotCylinderPoints(cylinder, LaserCylinder.radius, LaserCylinder.radius, LaserCylinder.radius, LaserCylinder.radius, this.halfLength * 2.0, 0, 0, -this.halfLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cylinderBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.pos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.norm), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.tex), gl.STATIC_DRAW);

        const disk2 = { pos: [], norm: [], tex: [] };
        this.plotDiskPoints(disk2, LaserCylinder.radius, LaserCylinder.radius, 0, 0, this.halfLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.diskBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk2.pos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk2.norm), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer[2]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(disk2.tex), gl.STATIC_DRAW);
    }


    public render(): void {
        if (!this.visible) {
            return;
        }
        const gl = AliteGame.get().getGraphics().getGL();
        const shader = AliteGame.get().getGraphics().getShader(); // Assuming a shader program is available

        gl.depthFunc(gl.LEQUAL);
        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);

        if (this.textureFilename) {
            // Enable texture units and bind texture
        } else {
            // Disable texture units
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        AliteGame.get().getGraphics().setColor(this.color);

        for (let i = 0; i < 2; i++) {
            const matrix = this.getMatrix();
            // Pass matrix to shader
            // Draw disk 1
            // Draw cylinder
            // Draw disk 2
            MathHelper.copyMatrix(this.getMatrix(), this.saveMatrix);
            this.scale(0.7);
            AliteGame.get().getGraphics().setColor(AliteColor.lighten(this.color, 0.2));
        }

        this.setMatrix(this.saveMatrix);
        gl.enable(gl.CULL_FACE);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
    }

    public setBeam(beamLength: number): void {
        if (this.beamLength === beamLength) {
            return;
        }
        this.beamLength = beamLength;
        this.halfLength = beamLength >> 1;
        this.setSpeed(this.calcSpeed());
        this.plotData();
        this.boundingSphereRadius = this.halfLength;
    }

    private calcSpeed(): number {
        return (-1012.5 * Math.sqrt(this.beamLength));
    }

    public setVisible(b: boolean): void {
        this.visible = b;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setColor(color: number): void {
        this.color = color;
        this.textureFilename = this.getTextureColor(color);
        if (this.textureFilename) {
            this.textureFilename = `textures/laser_${this.textureFilename}.png`;
            AliteGame.get().getTextureManager().addTexture(this.textureFilename);
        }
    }

    private getTextureColor(color: number): string {
        if (this.isColor(color, AliteColor.YELLOW)) return "yellow";
        if (this.isColor(color, AliteColor.RED)) return "red";
        if (this.isColor(color, AliteColor.GREEN)) return "green";
        if (this.isColor(color, AliteColor.BLUE)) return "blue";
        if (this.isColor(color, AliteColor.MAGENTA)) return "purple";
        if (this.isColor(color, AliteColor.CYAN)) return "cyan";
        if (this.isColor(color, 0x00FFAA)) return "dark_cyan";
        if (this.isColor(color, AliteColor.ORANGE)) return "orange";
        return null;
    }

    private isColor(color: number, colorPattern: number): boolean {
        const r1 = (color >> 16) & 0xff, g1 = (color >> 8) & 0xff, b1 = color & 0xff;
        const r2 = (colorPattern >> 16) & 0xff, g2 = (colorPattern >> 8) & 0xff, b2 = colorPattern & 0xff;
        return r1 === r2 && g1 === g2 && b1 === b2;
    }

    private plotDiskPoints(data, rx, ry, x, y, z) {
        data.pos.push(x, y, z);
        data.norm.push(0, 0, 1);
        data.tex.push(0.5, 0.5);
        for (let i = 0; i < 8; i++) {
            data.pos.push(x + LaserCylinder.sin[i] * rx, y + LaserCylinder.cos[i] * ry, z);
            data.norm.push(0, 0, 1);
            data.tex.push(0.5, 0.5 + LaserCylinder.cos[i] * 0.125);
        }
        data.pos.push(x, y + ry, z);
        data.norm.push(0, 0, 1);
        data.tex.push(0.5, 0.625);
    }

    private plotCylinderPoints(data, r1x, r1y, r2x, r2y, len, x, y, z) {
        for (let i = 0; i < 8; i++) {
            data.pos.push(x + LaserCylinder.sin[i] * r1x, y + LaserCylinder.cos[i] * r1y, z);
            data.norm.push(LaserCylinder.sin[i], LaserCylinder.cos[i], 0);
            data.tex.push(0, 0.375 + i * 0.03125);
            data.pos.push(x + LaserCylinder.sin[i] * r2x, y + LaserCylinder.cos[i] * r2y, z + len);
            data.norm.push(LaserCylinder.sin[i], LaserCylinder.cos[i], 0);
            data.tex.push(1, 0.375 + i * 0.03125);
        }
        data.pos.push(x + LaserCylinder.sin[0] * r1x, y + LaserCylinder.cos[0] * r1y, z);
        data.norm.push(LaserCylinder.sin[0], LaserCylinder.cos[0], 0);
        data.tex.push(0, 0.625);
        data.pos.push(x + LaserCylinder.sin[0] * r2x, y + LaserCylinder.cos[0] * r2y, z + len);
        data.norm.push(LaserCylinder.sin[0], LaserCylinder.cos[0], 0);
        data.tex.push(1, 0.625);
    }


    public getLaser(): Equipment {
        return this.laser;
    }

    public setLaser(laser: Equipment): void {
        this.laser = laser;
    }

    public getTwins(): LaserCylinder[] {
        return this.twins;
    }

    public setTwins(twin1: LaserCylinder, twin2: LaserCylinder): void {
        this.twins.length = 0;
        this.twins.push(twin1, twin2);
    }

    public addTwin(twin: LaserCylinder): void {
        this.twins.push(twin);
    }

    public clearTwins(): void {
        this.twins.length = 0;
    }

    public isAiming(): boolean {
        return this.aiming;
    }

    public setAiming(aiming: boolean): void {
        this.aiming = aiming;
    }

    public setOrigin(origin: SpaceObject): void {
        this.origin = origin;
    }

    public getOrigin(): SpaceObject {
        return this.origin;
    }

    public removeInNFrames(n: number): void {
        this.removeInNFrames = n;
    }

    public reset(): void {
        this.removeInNFrames = -1;
        this.textureFilename = null;
    }

    public getRemoveInNFrames(): number {
        return this.removeInNFrames;
    }

    public postRender(): void {
        if (this.removeInNFrames >= 0) {
            this.removeInNFrames--;
            if (this.removeInNFrames === -1) {
                for (const lc of this.getTwins()) {
                    lc.setVisible(false);
                    lc.clearTwins();
                }
                this.setVisible(false);
                this.clearTwins();
            }
        }
    }
}
