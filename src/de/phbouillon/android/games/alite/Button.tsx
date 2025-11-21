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

import { Graphics } from "./framework/Graphics";
import { TouchEvent } from "./framework/Input";
import { Pixmap } from "./framework/Pixmap";
import { Rect } from "./framework/Rect";
import { GLText } from "./framework/impl/gl/font/GLText";
import { AliteColor } from "./colors/AliteColor";
import { ColorScheme } from "./colors/ColorScheme";
import { TextData } from "./screens/canvas/TextData";
import { Component } from "./Component";
import { Assets } from "./Assets";
import { SoundManager } from "./SoundManager";
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
    private xOffset: number = 0;
    private yOffset: number = 0;
    private buttonEnd: number = 0;
    private textColor = ColorScheme.get(ColorScheme.COLOR_MESSAGE);
    private pixmapXOffset: number = 0;
    private pixmapYOffset: number = 0;
    private visible = true;
    private name: string;
    private touchedDown: boolean;
    private command: number;

    private constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        ButtonRegistry.get().addButton(this);
    }

    // ... static factory methods like createRegularButton, etc.

    public setVisible(visible: boolean): this {
        this.visible = visible;
        return this;
    }

    // ... other setters for chaining

    public render(g: Graphics, frame: number = 0): void {
        if (!this.visible) return;

        // ... complex rendering logic from Java translated to TypeScript
        // This would involve calls to a canvas 2D context or a WebGL wrapper
        // that mimics the original `Graphics` API.
    }

    public isTouched(x: number, y: number): boolean {
        if (!this.visible) return false;
        return x >= this.x + this.xOffset && x <= this.x + this.xOffset + this.width - 1 &&
               y >= this.y + this.yOffset && y <= this.y + this.yOffset + this.height - 1;
    }

    public checkEvent(e: TouchEvent): boolean {
        return this.isPressed(e);
    }

    public isPressed(e: TouchEvent): boolean {
        if (!this.visible) return false;

        if (!Rect.inside(e.x, e.y, this.x + this.xOffset, this.y + this.yOffset,
            this.x + this.xOffset + this.width - 1, this.y + this.yOffset + this.height - 1)) {
            return false;
        }

        if (e.type === TouchEvent.TOUCH_UP && this.touchedDown) {
            this.touchedDown = false;
            SoundManager.play(Assets.click);
            return true;
        }
        if (e.type === TouchEvent.TOUCH_DOWN) {
            this.touchedDown = true;
        }
        return false;
    }

    // ... getters
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }
    public getWidth(): number { return this.width; }
    public getHeight(): number { return this.height; }
    public getText(): string { return this.text; }
    public getName(): string { return this.name; }
    public getCommand(): number { return this.command; }
}
