// This is a dynamic font rendering system for WebGL. It loads font files,
// generates a font map (texture) from them using HTML5 Canvas, and allows
// rendering of text strings.
//
// NOTE: the rendering portions of this class use a sprite batcher to provide
// decent speed rendering. Also, rendering assumes a BOTTOM-LEFT origin,
// and the (x,y) positions are relative to that, as well as the bottom-left
// of the string to render.
// Original Android implementation from here: http://fractiousg.blogspot.de/2012/04/rendering-text-in-opengl-on-android.html

import { L } from "../../../games/alite/L";
import { R } from "../../../games/alite/R";
import { CharacterData } from "./CharacterData";
import { SpriteBatch } from "./SpriteBatch";

export class GLText {

    private static readonly CHAR_UNKNOWN = '\u00b0'; // Code of the Unknown Character
    private static readonly FONT_SIZE_MIN = 6;
    private static readonly FONT_SIZE_MAX = 180;
    private static readonly CHAR_BATCH_SIZE = 100;

    private readonly charCount: number;
    private givenFontSize: number;

    // --Members--//
    private batch: SpriteBatch;
    private typefaceName: string;
    private fontPadX: number;
    private fontPadY: number;

    private fontHeight: number;
    private fontAscent: number;
    private fontDescent: number;

    private textureId: WebGLTexture;
    private textureWidth: number;
    private textureHeight: number;

    private charWidthMax: number;
    private charHeight: number;
    private charWidths: number[];
    private charData: CharacterData[];
    private cellWidth: number;
    private cellHeight: number;
    private rowCnt: number;
    private colCnt: number;

    private spaceX: number;

    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.charCount = this.getCharCount();
        this.charWidths = new Array(this.charCount);
        this.charData = new Array(this.charCount);

        this.batch = new SpriteBatch(this.gl, GLText.CHAR_BATCH_SIZE);

        this.fontPadX = 0;
        this.fontPadY = 0;
        this.fontHeight = 0.0;
        this.fontAscent = 0.0;
        this.fontDescent = 0.0;
        this.textureId = null;
        this.textureWidth = 0;
        this.textureHeight = 0;
        this.charWidthMax = 0;
        this.charHeight = 0;
        this.cellWidth = 0;
        this.cellHeight = 0;
        this.rowCnt = 0;
        this.colCnt = 0;
        this.spaceX = 0.0;
    }

    public async load(fontName: string, size: number, givenSize: number, padX: number, padY: number): Promise<GLText> {
        this.typefaceName = fontName;
        this.fontPadX = padX;
        this.fontPadY = padY;
        this.givenFontSize = givenSize;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.font = `${size}px ${fontName}`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "alphabetic";

        // Simplified font metrics for web - not as precise as Android's
        // This is a common approximation.
        const metrics = ctx.measureText("M"); // Measure a capital letter for ascent/descent approximation
        this.fontAscent = metrics.actualBoundingBoxAscent;
        this.fontDescent = metrics.actualBoundingBoxDescent;
        this.fontHeight = this.fontAscent + this.fontDescent;


        this.charWidthMax = 0;
        this.charHeight = 0;
        let cnt = 0;
        for (const charRange of L.array(R.array.char_sets)) {
            for (let c = charRange.charCodeAt(0); c <= charRange.charCodeAt(3); c++) {
                const char = String.fromCharCode(c);
                const width = ctx.measureText(char).width;
                this.charWidths[cnt] = width;
                if (width > this.charWidthMax) {
                    this.charWidthMax = width;
                }
                cnt++;
            }
        }

        this.charHeight = this.fontHeight;
        this.cellWidth = Math.ceil(this.charWidthMax) + 2 * this.fontPadX;
        this.cellHeight = Math.ceil(this.charHeight) + 2 * this.fontPadY;
        const maxSize = Math.max(this.cellWidth, this.cellHeight);
        if (maxSize < GLText.FONT_SIZE_MIN || maxSize > GLText.FONT_SIZE_MAX) {
            console.error("Font size out of bounds");
            return this;
        }

        this.colCnt = Math.ceil(Math.sqrt(this.charCount * this.cellWidth * this.cellHeight) / this.cellWidth);
        this.rowCnt = Math.ceil(this.charCount / this.colCnt);

        this.textureWidth = this.colCnt * this.cellWidth;
        this.textureHeight = this.rowCnt * this.cellHeight;

        canvas.width = this.textureWidth;
        canvas.height = this.textureHeight;

        // Re-apply font settings after resize
        ctx.font = `${size}px ${fontName}`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = 'alphabetic';


        let x = 0;
        let y = 0;
        const yShift = this.cellHeight - this.fontPadY - this.fontDescent;

        cnt = 0;
        for (const charRange of L.array(R.array.char_sets)) {
            for (let c = charRange.charCodeAt(0); c <= charRange.charCodeAt(3); c++) {
                const char = String.fromCharCode(c);
                ctx.fillText(char, x + this.fontPadX, y + yShift);
                this.charData[cnt] = new CharacterData(this.charWidths[cnt], this.charHeight, this.textureWidth, this.textureHeight,
                    x, y, this.cellWidth - 1, this.cellHeight - 1);
                x += this.cellWidth;
                if (x + this.cellWidth > this.textureWidth) {
                    x = 0;
                    y += this.cellHeight;
                }
                cnt++;
            }
        }

        this.textureId = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureId);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return this;
    }

    public begin(): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureId);
        this.batch.beginBatch();
    }

    public end(): void {
        this.batch.endBatch();
    }

    public draw(text: string, x: number, y: number, scale: number): void {
        const chrHeight = this.cellHeight * scale;
        const chrWidth = this.cellWidth * scale;
        const len = text.length;
        x += chrWidth / 2.0 - this.fontPadX * scale;
        y += chrHeight / 2.0 - this.fontPadY * scale;
        for (let i = 0; i < len; i++) {
            const c = this.getCharIndex(text.charAt(i));
            this.batch.drawSprite(x, y, chrWidth, chrHeight, this.charData[c]);
            x += (this.charWidths[c] + this.spaceX) * scale;
        }
    }

    private getCharCount(): number {
        let count = 0;
        for (const charRange of L.array(R.array.char_sets)) {
            count += charRange.charCodeAt(3) - charRange.charCodeAt(0) + 1;
        }
        return count;
    }

    private getCharIndex(c: string): number {
        const charCode = c.charCodeAt(0);
        let index = 0;
        for (const charRange of L.array(R.array.char_sets)) {
            const start = charRange.charCodeAt(0);
            const end = charRange.charCodeAt(3);
            if (charCode >= start && charCode <= end) {
                return index + charCode - start;
            }
            index += end - start + 1;
        }
        return c === GLText.CHAR_UNKNOWN ? 0 : this.getCharIndex(GLText.CHAR_UNKNOWN);
    }

    public setSpace(space: number): void {
        this.spaceX = space;
    }

    public getSpace(): number {
        return this.spaceX;
    }

    public getWidth(text: string, scale: number): number {
        let len = 0.0;
        const strLen = text.length;
        for (let i = 0; i < strLen; i++) {
            if (text.charAt(i) === '\n') {
                break;
            }
            len += this.charWidths[this.getCharIndex(text.charAt(i))] * scale;
        }
        len += strLen > 1 ? (strLen - 1) * this.spaceX * scale : 0;
        return len;
    }


    public getCharWidth(chr: string): number {
        return this.charWidths[this.getCharIndex(chr)];
    }

    public getCharWidthMax(): number {
        return this.charWidthMax;
    }

    private getCharHeight(): number {
        return this.charHeight;
    }


    public getAscent(): number {
        return this.fontAscent;
    }

    public getDescent(): number {
        return this.fontDescent;
    }

    public getHeight(): number {
        return this.fontHeight;
    }

    public getSize(): number {
        return this.givenFontSize;
    }

    public getTypeface(): string {
        return this.typefaceName;
    }
}
