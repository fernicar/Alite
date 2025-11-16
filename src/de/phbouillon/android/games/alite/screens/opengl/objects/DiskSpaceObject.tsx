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

import { Disk } from "../../../framework/impl/gl/Disk";
import { AliteObject } from "./AliteObject";


export class DiskSpaceObject extends AliteObject {

    private readonly disk: Disk;

    public constructor(name: string, innerRadius: number, outerRadius: number, beginAngle: number, endAngle: number, sections: number, texture: string) {
        super(name);
        this.disk = new Disk(innerRadius, outerRadius, beginAngle, endAngle, beginAngle, endAngle, sections, texture);
        this.boundingSphereRadius = outerRadius;
        this.hudColor = 0xFFFFFF; // Color.WHITE
    }

    public render() {
        this.disk.render();
    }

}
