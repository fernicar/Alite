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

export class Rect {
    public left: number;
    public top: number;
    public right: number;
    public bottom: number;

    constructor(left?: number | Rect, top?: number, right?: number, bottom?: number) {
        if (typeof left === 'number') {
            this.left = left;
            this.top = top || 0;
            this.right = right || 0;
            this.bottom = bottom || 0;
        } else if (left instanceof Rect) {
            this.left = left.left;
            this.top = left.top;
            this.right = left.right;
            this.bottom = left.bottom;
        } else {
            this.left = 0;
            this.top = 0;
            this.right = 0;
            this.bottom = 0;
        }
    }

    public static inside(x: number, y: number, left: number, top: number, right: number, bottom: number): boolean {
        return left < right && top < bottom && x >= left && y >= top && x <= right && y <= bottom;
    }
}
