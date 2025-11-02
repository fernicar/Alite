import { Pixmap } from "../../../framework/Pixmap";
import { GLText } from "../../../framework/impl/gl/font/GLText";
import { ColorScheme } from "./colors/ColorScheme";
import { AliteColor } from "./colors/AliteColor";
import { Graphics } from "../../../framework/Graphics";
import { TouchEvent } from "../../../framework/Input";
import { Rect } from "../../../framework/Rect";
import { SoundManager } from "./SoundManager";
import { Assets } from "./Assets";
import { TextData } from "./screens/canvas/TextData";
import { Point } from "../../../framework/math/Point";
import { Component } from "./Component";
import { ButtonRegistry } from "./ButtonRegistry";

export enum TextPosition {
    ABOVE, LEFT, RIGHT, BELOW, ONTOP
}

export class Button extends Component<Button> {

    public static readonly BORDER_SIZE = 5;
    private static readonly BUTTON_BORDER_DIFF_PERCENT = 0.1;

    private readonly BKG_COLOR_DARK = ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK);
    private readonly BKG_COLOR_LIGHT = ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT);
    private readonly BORDER_COLOR_DARK = AliteColor.lighten(this.BKG_COLOR_DARK, -Button.BUTTON_BORDER_DIFF_PERCENT);
    private readonly BORDER_COLOR_LIGHT = AliteColor.lighten(this.BKG_COLOR_LIGHT, Button.BUTTON_BORDER_DIFF_PERCENT);

    private x: number;
    private y: number;
    private readonly width: number;
    private readonly height: number;
    private text: string;
    private textData: TextData[];
    private pixmap: Pixmap;
    private pushedBackground: Pixmap;
    private animation: Pixmap[];
    private overlay: Pixmap[];
    private pixmapAlpha = 1;
    private font: GLText;
    private textPosition = TextPosition.ONTOP;
    private useBorder = true;
    private gradient: boolean;
    private selected = false;
    private xOffset: number;
    private yOffset: number;
    private buttonEnd: number;
    private textColor = ColorScheme.get(ColorScheme.COLOR_MESSAGE);

    private pixmapXOffset: number;
    private pixmapYOffset: number;
    private visible = true;
    private name: string;
    private touchedDown: boolean;
    private command: number;

    public static createRegularButton(x: number, y: number, width: number, height: number, text: string) {
        return new Button(x, y, width, height).setText(text).setFont(Assets.regularFont);
    }

    public static createTitleButton(x: number, y: number, width: number, height: number, text: string) {
        return new Button(x, y, width, height).setText(text).setFont(Assets.titleFont).setBorderOff();
    }

    public static createGradientRegularButton(x: number, y: number, width: number, height: number, text: string) {
        return new Button(x, y, width, height).setText(text).setFont(Assets.regularFont).setGradientOn();
    }

    public static createGradientTitleButton(x: number, y: number, width: number, height: number, text: string) {
        return new Button(x, y, width, height).setText(text).setFont(Assets.titleFont).setGradientOn();
    }

    public static createGradientSmallButton(x: number, y: number, width: number, height: number, text: string) {
        return new Button(x, y, width, height).setText(text).setFont(Assets.smallFont).setGradientOn();
    }

    public static createPictureButton(x: number, y: number, width: number, height: number, pixmap: Pixmap) {
        return new Button(x, y, width, height).setPixmap(pixmap).setBorderOff();
    }

    public static createPictureButtonWithAlpha(x: number, y: number, width: number, height: number, pixmap: Pixmap, pixmapAlpha: number) {
        return new Button(x, y, width, height).setPixmap(pixmap, pixmapAlpha).setBorderOff();
    }

    public static createGradientPictureButton(x: number, y: number, width: number, height: number, pixmap: Pixmap) {
        return new Button(x, y, width, height).setPixmap(pixmap).setGradientOn();
    }

    public static createOverlayButton(x: number, y: number, width: number, height: number, pixmap: Pixmap, overlay: Pixmap[]) {
        return new Button(x, y, width, height).setPixmap(pixmap).setOverlay(overlay).setBorderOff();
    }

    private constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        ButtonRegistry.get().addButton(this);
    }

    public move(newX: number, newY: number) {
        this.x = newX;
        this.y = newY;
        return this;
    }

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public getName() {
        return this.name;
    }

    public setPixmapOffset(x: number, y: number) {
        this.pixmapXOffset = x;
        this.pixmapYOffset = y;
        return this;
    }

    public setTextColor(textColor: number) {
        this.textColor = textColor;
        return this;
    }

    public setXOffset(x: number) {
        this.xOffset = x;
        return this;
    }

    public setYOffset(y: number) {
        this.yOffset = y;
        return this;
    }

    public setText(text: string) {
        this.text = text;
        return this;
    }

    public setTextData(textData: TextData[]) {
        this.textData = textData;
        return this;
    }

    public setFont(font: GLText) {
        this.font = font;
        return this;
    }

    public setTextPosition(position: TextPosition) {
        this.textPosition = position;
        return this;
    }

    private setBorderOff() {
        this.useBorder = false;
        return this;
    }

    private setGradientOn() {
        this.gradient = true;
        return this;
    }

    private setOverlay(overlay: Pixmap[]) {
        this.overlay = overlay;
        return this;
    }

    public setAnimation(animation: Pixmap[]) {
        this.animation = animation;
        return this;
    }

    public getFrameCount() {
        return this.animation == null ? 0 : this.animation.length;
    }

    public setPixmap(pixmap: Pixmap, pixmapAlpha?: number) {
        this.pixmap = pixmap;
        if(pixmapAlpha) {
            this.pixmapAlpha = pixmapAlpha;
        }
        return this;
    }

    public setPushedBackground(pushedBackground: Pixmap) {
        this.pushedBackground = pushedBackground;
        return this;
    }

    public getText() {
        return this.text;
    }

    public render(g: Graphics, frame?: number) {
        if (!this.visible) {
            return;
        }

        if(!frame) {
            frame = 0;
        }

        const interior = this.getInterior();

        if (this.gradient && this.useBorder) {
            g.diagonalGradientRect(interior.x, interior.y,
                this.width - 2 * Button.BORDER_SIZE, this.height - 2 * Button.BORDER_SIZE, this.BKG_COLOR_LIGHT, this.BKG_COLOR_DARK);
        }
        if (frame > 0 && this.animation != null && frame < this.animation.length && this.animation[frame] != null) {
            g.drawPixmap(this.animation[frame], interior.x, interior.y);
        } else {
            if (this.pixmap != null) {
                const shiftedInterior = new Point(interior.x, interior.y);
                if (this.isDown() && this.pushedBackground == null) {
                    shiftedInterior.offset(Button.BORDER_SIZE, Button.BORDER_SIZE);
                }
                if (this.buttonEnd == 0) {
                    g.drawPixmap(!this.isDown() || this.pushedBackground == null ? this.pixmap : this.pushedBackground,
                        shiftedInterior.x + this.pixmapXOffset, shiftedInterior.y + this.pixmapYOffset, this.pixmapAlpha);
                } else {
                    g.drawPixmapUnscaled(!this.isDown() || this.pushedBackground == null ? this.pixmap : this.pushedBackground,
                        shiftedInterior.x, shiftedInterior.y, 0, 0, this.width - this.buttonEnd + 1, this.height);
                    // Draw last portion of image
                    g.drawPixmapUnscaled(!this.isDown() || this.pushedBackground == null ? this.pixmap : this.pushedBackground,
                        shiftedInterior.x + this.width - this.buttonEnd, shiftedInterior.y,
                        this.pixmap.getWidth() - this.buttonEnd, 0, this.buttonEnd, this.height);
                }
            }
            if (frame > 0 && this.overlay != null && frame < this.overlay.length) {
                g.drawPixmap(this.overlay[frame], interior.x, interior.y);
            }
        }
        if (this.useBorder) {
            interior.offset(-Button.BORDER_SIZE, -Button.BORDER_SIZE);
            if (this.isDown()) {
                g.rec3d(interior.x, interior.y, this.width, this.height, Button.BORDER_SIZE, this.BORDER_COLOR_DARK, this.BORDER_COLOR_LIGHT);
            } else {
                g.rec3d(interior.x, interior.y, this.width, this.height, Button.BORDER_SIZE, this.BORDER_COLOR_LIGHT, this.BORDER_COLOR_DARK);
            }
            interior.offset(Button.BORDER_SIZE, Button.BORDER_SIZE);
        }
        if (this.text != null) {
            const p = this.calculateTextPosition(g);
            if (this.isDown()) {
                p.offset(Button.BORDER_SIZE, Button.BORDER_SIZE);
            }
            g.drawText(this.text, p.x, p.y, this.textColor, this.font);
        } else if (this.textData != null) {
            const offset = this.isDown() ? Button.BORDER_SIZE : 0;
            for (const td of this.textData) {
                g.drawText(td.text, interior.x + td.x + offset, interior.y + td.y + offset, td.color, td.font);
            }
        }
    }

    private calculateTextPosition(g: Graphics) {
        const halfWidth  = g.getTextWidth(this.text, this.font) >> 1;
        const halfHeight = g.getTextHeight(this.text, this.font) >> 1;
        const height = this.height - (this.useBorder ? 2 * Button.BORDER_SIZE : 0);
        const width = this.width - (this.useBorder ? 2 * Button.BORDER_SIZE : 0);

        let local = this.textPosition;
        if (this.pixmap == null && this.animation == null) {
            local = TextPosition.ONTOP;
        }
        const result = this.getInterior();

        if (local == TextPosition.ABOVE) {
            result.offset((width >> 1) - halfWidth, this.font.getSize());
            return result;
        }
        if (local == TextPosition.LEFT) {
            result.offset(0, ((height >> 1) - halfHeight + this.font.getSize()));
            return result;
        }
        if (local == TextPosition.RIGHT) {
            result.offset((width + this.pixmap.getWidth() >> 1) - halfWidth,
                ((height >> 1) - halfHeight + this.font.getSize()));
            return result;
        }
        if (local == TextPosition.BELOW) {
            result.offset((width >> 1) - halfWidth, height - (halfHeight << 1));
            return result;
        }
        if (local == TextPosition.ONTOP) {
            result.offset((width >> 1) - halfWidth,
                ((height >> 1) - halfHeight + this.font.getSize()));
            return result;
        }
        return result;
    }

    private getInterior() {
        let x = this.x + this.xOffset;
        let y = this.y + this.yOffset;
        if (this.useBorder) {
            x += Button.BORDER_SIZE;
            y += Button.BORDER_SIZE;
        }
        return new Point(x,y);
    }

    public setButtonEnd(pixel: number) {
        this.buttonEnd = pixel;
    }

    public isTouched(x: number, y: number) {
        if (!this.visible) {
            return false;
        }
        return x >= this.x + this.xOffset && x <= this.x + this.xOffset + this.width - 1 &&
               y >= this.y + this.yOffset && y <= this.y + this.yOffset + this.height - 1;
    }

    public checkEvent(e: TouchEvent) {
        return this.isPressed(e);
    }

    public isPressed(e: TouchEvent) {
        if (!this.visible) {
            return false;
        }
        if (!Rect.inside(e.x, e.y, this.x + this.xOffset, this.y + this.yOffset,
                this.x + this.xOffset + this.width - 1, this.y + this.yOffset + this.height - 1)) {
            return false;
        }
        if (e.type == TouchEvent.TOUCH_UP && this.touchedDown) {
            this.touchedDown = false;
            SoundManager.play(Assets.click);
            return true;
        }
        if (e.type == TouchEvent.TOUCH_DOWN) {
            this.touchedDown = true;
        }
        return false;
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }

    public getWidth() {
        return this.width;
    }

    public getHeight() {
        return this.height;
    }

    public setSelected(selected: boolean) {
        this.selected = selected;
    }

    public isSelected() {
        return this.selected;
    }

    public getPixmap() {
        return this.pixmap;
    }

    public isVisible() {
        return this.visible;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
        return this;
    }

    public setCommand(command: number) {
        this.command = command;
        return this;
    }

    public getCommand() {
        return this.command;
    }
}
