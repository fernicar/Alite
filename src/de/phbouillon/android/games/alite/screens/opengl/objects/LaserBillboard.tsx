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

import { Alite } from "../../../Alite";
import { Equipment } from "../../../model/Equipment";
import { SpaceObject } from "./space/SpaceObject";
import { Billboard } from "./Billboard";

export class LaserBillboard extends Billboard {
    private static readonly serialVersionUID = -6567821362381241916;
    private laser: Equipment;
    private readonly twins: LaserBillboard[] = [];
    private aiming = false;
    private origin: SpaceObject;

    constructor() {
        super("Laser", 0.0, 0.0, 0.0, 16.0, 16.0, "textures/lasers.png",
            Alite.getInstance().getTextureManager().getSprite("textures/lasers.png", "photon1"));
    }

    public setType(type: number): void {
        this.updateTextureCoordinates(Alite.getInstance().getTextureManager().getSprite("textures/lasers.png", "photon" + type));
    }

    public getLaser(): Equipment {
        return this.laser;
    }

    public setLaser(laser: Equipment): void {
        this.laser = laser;
    }

    public getTwins(): LaserBillboard[] {
        return this.twins;
    }

    public setTwins(twin1: LaserBillboard, twin2: LaserBillboard): void {
        this.twins.length = 0;
        this.twins.push(twin1, twin2);
    }

    public addTwin(twin: LaserBillboard): void {
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
}
