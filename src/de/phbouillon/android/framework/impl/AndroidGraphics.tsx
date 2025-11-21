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

import { FileIO } from "../FileIO";
import { Graphics, PixmapFormat } from "../Graphics";
import { Pixmap } from "../Pixmap";
import { Rect } from "../Rect";
import { Texture } from "../Texture";
import { Settings } from "../../games/alite/Settings";
import { StringUtil } from "../../games/alite/model/generator/StringUtil";
import { GLText } from "./gl/font/GLText";
import { WebGLPixmap } from "./WebGLPixmap";

export class WebGLGraphics implements Graphics {
    private readonly scaleFactor: number;
    private readonly visibleArea: Rect;
    private readonly textureManager: Texture;
    private readonly fileIO: FileIO;
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, fileIO: FileIO, scaleFactor: number, visibleArea: Rect, textureManager: Texture) {
        this.gl = gl;
        this.fileIO = fileIO;
        this.scaleFactor = scaleFactor;
        this.visibleArea = visibleArea;
        this.textureManager = textureManager;
    }

    public getVisibleArea(): Rect {
        return this.visibleArea;
    }

    public transX(x: number): number {
        return this.scaleFactor * x + this.visibleArea.left;
    }

    public transY(y: number): number {
        return this.scaleFactor * y + this.visibleArea.top;
    }

    public async existsAssetsFile(fileName: string): Promise<boolean> {
        return this.fileIO.existsPrivateFile(fileName);
    }

    public async newPixmap(fileName: string, format?: PixmapFormat, width?: number, height?: number): Promise<Pixmap> {
        const image = await this.loadImage(fileName);
        return this.createPixmapFromImage(fileName, image, width, height);
    }

    private async loadImage(fileName: string): Promise<HTMLImageElement> {
        const stream = await this.fileIO.readPrivateFile(fileName);
        const blob = new Blob([stream]);
        const url = URL.createObjectURL(blob);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(`Couldn't load bitmap from asset '${fileName}': ${err}`);
            };
            img.src = url;
        });
    }

    private createPixmapFromImage(fileName: string, image: HTMLImageElement, newWidth: number = -1, newHeight: number = -1): Pixmap {
        if (newWidth === -1) newWidth = image.width;
        if (newHeight === -1) newHeight = image.height;

        newWidth *= Settings.textureLevel * this.scaleFactor;
        newHeight *= Settings.textureLevel * this.scaleFactor;

        const textureWidth = this.determineTextureSize(newWidth);
        const textureHeight = this.determineTextureSize(newHeight);

        const canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, newWidth, newHeight);

        const tx2 = newWidth / textureWidth;
        const ty2 = newHeight / textureHeight;

        // Simplified format - WebGL typically uses RGBA8888
        const format = PixmapFormat.ARGB8888;
        return new WebGLPixmap(this.gl, canvas, format, fileName, this.textureManager as any, newWidth, newHeight, tx2, ty2);
    }


    private determineTextureSize(size: number): number {
        let tSize = 64;
        while (tSize < size && tSize < 4096) {
            tSize <<= 1;
        }
        return tSize;
    }

    public clear(color: number): void {
        const r = ((color >> 16) & 0xff) / 255;
        const g = ((color >> 8) & 0xff) / 255;
        const b = (color & 0xff) / 255;
        const a = ((color >> 24) & 0xff) / 255;
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    public drawLine(x: number, y: number, x2: number, y2: number, color: number): void {
        // WebGL doesn't have a simple line drawing function. This would require
        // a shader and a buffer with two vertices. This is a placeholder.
        console.warn("drawLine is not implemented for WebGL");
    }

    public drawRect(x: number, y: number, width: number, height: number, color: number): void {
        // Similar to drawLine, this requires a shader and vertices.
        console.warn("drawRect is not implemented for WebGL");
    }

    public rec3d(x: number, y: number, width: number, height: number, borderSize: number, lightColor: number, darkColor: number): void {
        // This would be complex to implement with WebGL.
        console.warn("rec3d is not implemented for WebGL");
    }

    public fillRect(x: number, y: number, width: number, height: number, color: number): void {
        // Requires a shader and vertices.
        console.warn("fillRect is not implemented for WebGL");
    }

    public verticalGradientRect(x: number, y: number, width: number, height: number, color1: number, color2: number): void {
        console.warn("verticalGradientRect is not implemented for WebGL");
    }

    public diagonalGradientRect(x: number, y: number, width: number, height: number, color1: number, color2: number): void {
        console.warn("diagonalGradientRect is not implemented for WebGL");
    }

    public fillCircle(cx: number, cy: number, r: number, color: number): void {
        console.warn("fillCircle is not implemented for WebGL");
    }

    public drawArc(cx: number, cy: number, r: number, color: number, angle: number): void {
        console.warn("drawArc is not implemented for WebGL");
    }

    public drawCircle(cx: number, cy: number, r: number, color: number): void {
        console.warn("drawCircle is not implemented for WebGL");
    }

    public drawDashedCircle(cx: number, cy: number, r: number, color: number): void {
        console.warn("drawDashedCircle is not implemented for WebGL");
    }

    public drawPixmap(pixmap: Pixmap, x: number, y: number, pixmapAlpha?: number): void {
        (pixmap as WebGLPixmap).render(this.transX(x), this.transY(y), pixmapAlpha);
    }

    public applyFilterToPixmap(pixmap: Pixmap, filter: any): void {
        // ColorFilter is an Android class. A similar effect would require a custom shader in WebGL.
        console.warn("applyFilterToPixmap is not implemented for WebGL");
    }

    public drawText(text: string, x: number, y: number, color: number, font: GLText, scale?: number | boolean): void {
        if (typeof scale !== 'number') scale = 1.0;
        if (!font) return;

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); // Common blend for text
        this.setColor(color);
        font.begin();
        font.draw(text, this.transX(x), this.transY(y - font.getSize()), scale as number);
        font.end();
        this.gl.disable(this.gl.BLEND);
        // this.textureManager.setTexture(null); // Assuming texture manager handles this
    }

    public drawUnderlinedText(text: string, x: number, y: number, color: number, font: GLText): void {
        this.drawText(text, x, y, color, font);
        const linePos = y + font.getDescent();
        this.drawLine(x, linePos, x + this.getTextWidth(text, font), linePos, color);
    }


    public drawCenteredText(text: string, x: number, y: number, color: number, font: GLText, scale: number): void {
        this.drawText(text, x - (font.getWidth(text, scale) / this.scaleFactor >> 1), y, color, font, scale);
    }


    public getTextWidth(text: string, font: GLText): number {
        if (!font) return 0;
        return font.getWidth(text, 1) / this.scaleFactor;
    }

    public getTextHeight(text: string, font: GLText): number {
        if (!font) return 0;
        return font.getHeight() / this.scaleFactor;
    }

    public setClip(x1: number, y1: number, x2: number, y2: number): void {
        if (x1 === -1 && y1 === -1 && x2 === -1 && y2 === -1) {
            this.gl.disable(this.gl.SCISSOR_TEST);
            return;
        }

        const x = x1 === -1 ? Math.max(this.visibleArea.left - 1, 0) : this.transX(x1);
        const y = y1 === -1 ? Math.max(this.visibleArea.top - 1, 0) : this.transY(y1);
        const width = (x2 === -1 ? Math.min(this.visibleArea.right + 1, this.visibleArea.width()) : this.transX(x2)) - x + 1;
        const height = (y2 === -1 ? Math.min(this.visibleArea.bottom + 1, this.visibleArea.height()) : this.transY(y2)) - y + 1;

        this.gl.enable(this.gl.SCISSOR_TEST);
        this.gl.scissor(x, this.gl.drawingBufferHeight - (y + height), width, height); // y is from bottom in WebGL
    }

    public setColor(color: number, alpha?: number): void {
        const r = ((color >> 16) & 0xff) / 255.0;
        const g = ((color >> 8) & 0xff) / 255.0;
        const b = (color & 0xff) / 255.0;
        const a = alpha !== undefined ? alpha : ((color >> 24) & 0xff) / 255.0;
        // This is a simplification. The color would typically be passed to a shader as a uniform.
        // For now, let's just log it.
        // console.log(`Setting color to: rgba(${r*255}, ${g*255}, ${b*255}, ${a})`);
    }

    public drawArrow(x1: number, y1: number, x2: number, y2: number, color: number, arrowHead: any): void {
        console.warn("drawArrow is not implemented for WebGL");
    }

    public getNotificationNumber(font: GLText, number: number): Pixmap {
        // This is a complex operation involving canvas rendering.
        // Returning null for now.
        return null;
    }
}
