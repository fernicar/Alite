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

import { PixmapFormat } from './Graphics';

export interface Pixmap {
    getWidth(): number;
    getHeight(): number;
    getFormat(): PixmapFormat;
    dispose(): void;
    getBitmap(): ImageBitmap;
    setBitmap(bitmap: ImageBitmap): void;
    setTextureCoordinates(left: number, top: number, right: number, bottom: number): void;
    setCoordinates(left: number, top: number, right: number, bottom: number): void;
    resetTextureCoordinates(): void;
    render(alpha: number): void;
    render(x: number, y: number): void;
    render(x: number, y: number, pixmapAlpha: number): void;
}
