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

export class CharacterData {
    public readonly width: number;
    public readonly height: number;
    public readonly uStart: number;
    public readonly uEnd: number;
    public readonly vStart: number;
    public readonly vEnd: number;

    public constructor(charWidth: number, charHeight: number, texWidth: number, texHeight: number,
        x: number, y: number, cellWidth: number, cellHeight: number) {
        this.width = charWidth;
        this.height = charHeight;
        this.uStart = x / texWidth;
        this.vStart = y / texHeight;
        this.uEnd = this.uStart + cellWidth / texWidth;
        this.vEnd = this.vStart + cellHeight / texHeight;
    }
}
