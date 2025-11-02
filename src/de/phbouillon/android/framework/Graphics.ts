import { Pixmap } from "../Pixmap";
import { GLText } from "./impl/gl/font/GLText";

export class Graphics {
    public diagonalGradientRect(x: number, y: number, width: number, height: number, color1: number, color2: number) {
        // TODO: Implement
    }

    public drawPixmap(pixmap: Pixmap, x: number, y: number, alpha?: number) {
        // TODO: Implement
    }

    public drawPixmapUnscaled(pixmap: Pixmap, x: number, y: number, srcX: number, srcY: number, srcWidth: number, srcHeight: number) {
        // TODO: Implement
    }

    public rec3d(x: number, y: number, width: number, height: number, borderSize: number, color1: number, color2: number) {
        // TODO: Implement
    }

    public drawText(text: string, x: number, y: number, color: number, font: GLText) {
        // TODO: Implement
    }

    public getTextWidth(text: string, font: GLText): number {
        return 0;
    }

    public getTextHeight(text: string, font: GLText): number {
        return 0;
    }
}
