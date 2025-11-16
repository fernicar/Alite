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

export class SpriteData {
    public readonly name: string;
    public readonly x: number;
    public readonly y: number;
    public readonly x2: number;
    public readonly y2: number;
    public readonly origWidth: number;
    public readonly origHeight: number;

    constructor(name: string, x: number, y: number, x2: number, y2: number, origWidth: number, origHeight: number) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;
        this.origWidth = origWidth;
        this.origHeight = origHeight;
    }

    public toString(): string {
        return `${this.name} [${this.x.toFixed(2)}, ${this.y.toFixed(2)}] - [${this.x2.toFixed(2)}, ${this.y2.toFixed(2)}], W: ${this.origWidth.toFixed(2)}, H: ${this.origHeight.toFixed(2)}`;
    }
}
