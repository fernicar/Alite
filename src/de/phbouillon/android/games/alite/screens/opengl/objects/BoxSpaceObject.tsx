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

import { Box } from "../../../../../../../../framework/impl/gl/Box";
import { Vector3f } from "../../../../../../../../framework/math/Vector3f";
import { AliteColor } from "../../../../colors/AliteColor";
import { AliteObject } from "./AliteObject";

export class BoxSpaceObject extends AliteObject {
    private static readonly serialVersionUID = -290076973449626682L;

    private readonly box: Box;

    constructor(name: string, width: number, height: number, depth: number) {
        super(name);
        this.box = new Box(width, height, depth);
        this.boundingSphereRadius = width;
        this.hudColor = AliteColor.WHITE;
        this.setDepthTest(false);
    }

    public render(): void {
        this.box.render();
    }

    public setColor(r: number, g: number, b: number, a?: number): void {
        this.box.setColor(r, g, b, a === undefined ? 1.0 : a);
    }

    public setAlpha(a: number): void {
        this.box.setAlpha(a);
    }

    public setFarPlane(far: Vector3f): void {
        this.box.setFarPlane(far);
    }

    public intersect(origin: Vector3f, direction: Vector3f): boolean {
        const vertices = this.box.getVertices();
        const verts = new Array(vertices.length + 1);
        const matrix = this.getMatrix();
        for (let i = 0; i < vertices.length; i += 3) {
            this.calculateVertex(verts, i, matrix, vertices, i, 1);
        }
        return this.intersectInternal(vertices.length / 3, origin, direction, verts);
    }
}
