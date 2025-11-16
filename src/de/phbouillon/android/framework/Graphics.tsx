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

import { Rect } from './Rect';
import { Pixmap } from './Pixmap';

// Stub for GLText, to be replaced with the actual class once converted
export interface GLText {}

// Using 'any' for ColorFilter as it's a complex Android-specific class
type ColorFilter = any;

export enum PixmapFormat {
    ARGB8888,
    ARGB4444,
    RGB565
}

export enum ArrowDirection {
    LEFT,
    UP,
    RIGHT,
    DOWN
}

export interface Graphics {
    getVisibleArea(): Rect;
    existsAssetsFile(fileName: string): boolean;

    clear(color: number): void;
    setClip(x1: number, y1: number, x2: number, y2: number): void;

    setColor(color: number, alpha: number): void;
    setColor(color: number): void;

    transX(x: number): number;
    transY(y: number): number;

    drawLine(x: number, y: number, x2: number, y2: number, color: number): void;
    drawRect(x: number, y: number, width: number, height: number, color: number): void;
    fillRect(x: number, y: number, width: number, height: number, color: number): void;
    rec3d(x: number, y: number, width: number, height: number, borderSize: number, lightColor: number, darkColor: number): void;
    verticalGradientRect(x: number, y: number, width: number, height: number, color1: number, color2: number): void;
    diagonalGradientRect(x: number, y: number, width: number, height: number, color1: number, color2: number): void;
    drawArc(cx: number, cy: number, r: number, color: number, degree: number): void;
    drawCircle(cx: number, cy: number, r: number, color: number): void;
    fillCircle(cx: number, cy: number, r: number, color: number): void;
    drawDashedCircle(cx: number, cy: number, r: number, color: number): void;
    drawArrow(x1: number, y1: number, x2: number, y2: number, color: number, arrowHead: ArrowDirection): void;

    drawText(text: string, x: number, y: number, color: number, font: GLText): void;
    drawUnderlinedText(text: string, x: number, y: number, color: number, font: GLText): void;
    drawText(text: string, x: number, y: number, color: number, font: GLText, scale: number): void;
    drawCenteredText(text: string, x: number, y: number, color: number, font: GLText, scale: number): void;

    getTextWidth(text: string, font: GLText): number;
    getTextHeight(text: string, font: GLText): number;

    newPixmap(fileName: string): Pixmap;
    newPixmap(fileName: string, width: number, height: number): Pixmap;
    newPixmap(fileName: string, is: Blob, width: number, height: number): Pixmap; // Replaced InputStream with Blob
    newPixmap(bitmap: ImageBitmap, fileName: string): Pixmap;
    newPixmap(bitmap: ImageBitmap, fileName: string, width: number, height: number): Pixmap;

    drawPixmap(pixmap: Pixmap, x: number, y: number): void;
    drawPixmap(pixmap: Pixmap, x: number, y: number, pixmapAlpha: number): void;
    applyFilterToPixmap(pixmap: Pixmap, filter: ColorFilter): void;
    drawPixmapUnscaled(pixmap: Pixmap, x: number, y: number, srcX: number, srcY: number, srcWidth: number, srcHeight: number): void;

    getNotificationNumber(font: GLText, number: number): Pixmap;
}
