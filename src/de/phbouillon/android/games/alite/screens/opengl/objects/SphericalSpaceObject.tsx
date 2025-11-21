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

import { Sphere } from "../../../../../../../../framework/impl/gl/Sphere";
import { AliteObject } from "./AliteObject";

export class SphericalSpaceObject extends AliteObject {
    private static readonly serialVersionUID = 5293882896307129631;

    private readonly sphere: Sphere;

    constructor(name: string, radius: number, texture: string) {
        super(name);
        this.sphere = new Sphere(radius, 32, 32, texture, null, false);
        this.boundingSphereRadius = radius;
        this.distanceFromCenterToBorder = radius;
        this.setVisibleOnHud(true);
    }

    public getRadius(): number {
        return this.sphere.getRadius();
    }

    public setNewSize(radius: number): void {
        this.sphere.setNewSize(radius);
        this.boundingSphereRadius = radius;
        this.distanceFromCenterToBorder = radius;
    }

    protected glSetUp(): void {
    }

    protected glTearDown(): void {
    }

    public render(): void {
        this.glSetUp();
        this.sphere.render();
        this.glTearDown();
    }

    public setColor(r: number, g: number, b: number, a: number): void {
        this.sphere.setColor(r, g, b, a);
    }

}
