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

import { Skysphere } from "../../../../../../../../framework/impl/gl/Skysphere";
import { AliteObject } from "./AliteObject";

export class SkySphereSpaceObject extends AliteObject {
    private static readonly serialVersionUID = -3204273124041313493;
    private readonly sphere: Skysphere;

    constructor(name: string, radius: number, slices: number, stacks: number, texture: string) {
        super(name);
        this.sphere = new Skysphere(radius, slices, stacks, texture);
        this.distanceFromCenterToBorder = radius;
        this.boundingSphereRadius = 0.0;
    }

    public render(): void {
        // GLES11.glDisable(GLES11.GL_DEPTH_TEST);
        this.sphere.render();
        // GLES11.glEnable(GLES11.GL_DEPTH_TEST);
    }

    public destroy(): void {
        if (this.sphere != null) {
            this.sphere.destroy();
        }
    }
}
