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

import { Cylinder } from "../../../../../../../../framework/impl/gl/Cylinder";
import { AliteObject } from "./AliteObject";
import { AliteColor } from "../../../../colors/AliteColor";

export class CylinderSpaceObject extends AliteObject {
    private static readonly serialVersionUID = -6155477859420162646;

    private readonly cylinder: Cylinder;

    constructor(name: string, length: number, radius: number, segments: number, hasTop: boolean, hasBottom: boolean, texture: string) {
        super(name);
        this.cylinder = new Cylinder(length, radius, segments, hasTop, hasBottom, texture);
        this.boundingSphereRadius = length / 2.0;
        this.hudColor = AliteColor.WHITE;
    }

    public setColor(r: number, g: number, b: number, a: number): void {
        this.cylinder.setColor(r, g, b, a);
    }

    public render(): void {
        this.cylinder.render();
    }
}
