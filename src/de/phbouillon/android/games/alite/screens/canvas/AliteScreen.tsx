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

import { AliteGame } from "../../AliteGame";
import { AliteConfig } from "../../AliteConfig";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { ButtonRegistry } from "../../ButtonRegistry";
import { AliteColor } from "../../colors/AliteColor";
import { ColorScheme } from "../../colors/ColorScheme";
import { FlightScreen } from "../opengl/ingame/FlightScreen";
import { AliteObject } from "../opengl/objects/AliteObject";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Pixmap } from "../../../../framework/Pixmap";
import { Rect } from "../../../../framework/Rect";
import { Screen } from "../../../../framework/Screen";
import { GLText } from "../../../../framework/impl/gl/font/GLText";
import { TextData } from "../../../../framework/TextData";


export abstract class AliteScreen extends Screen {
    // ... (light property arrays)

    private popupWindow: boolean;
    private message: string;
    private maxLength: number;
    private dialogState: number;
    private ok: Button;
    private yes: Button;
    private no: Button;
    protected newScreen: Screen;
    protected messageResult: number;
    protected inputText: string;
    protected game: AliteGame;
    private editText: HTMLInputElement;
    protected readonly pics: Map<string, Pixmap> = new Map();

    private static readonly DIALOG_BUTTON_MASK = 7;
    // ... (DIALOG constants)
    protected static readonly RESULT_NO = -1;

    constructor() {
        super();
        this.game = AliteGame.get();
        this.setUpForDisplay();
    }

    // ... (showMessageDialog, showQuestionDialog, etc.)

    protected centerText(text: string, y: number, f: GLText, color: number): void {
        this.centerTextInBounds(text, 0, AliteConfig.DESKTOP_WIDTH, y, f, color);
    }

    private centerTextInBounds(text: string, minX: number, maxX: number, y: number, f: GLText, color: number): void {
        const center = (maxX + minX - this.game.getGraphics().getTextWidth(text, f)) >> 1;
        this.game.getGraphics().drawText(text, center, y, color, f);
    }


    protected displayTitle(title: string, width: number = AliteConfig.DESKTOP_WIDTH): void {
        const g = this.game.getGraphics();
        g.verticalGradientRect(0, 0, width - 1, 80,
            ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK), ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT));
        g.drawPixmap(Assets.aliteLogoSmall, 20, 5);
        g.drawPixmap(Assets.aliteLogoSmall, width - 120, 5);
        this.centerText(title, 60, Assets.titleFont, ColorScheme.get(ColorScheme.COLOR_MESSAGE));
    }


    private addInputLayout(x: number, y: number, width: number, height: number): void {
        this.editText = document.createElement("input");
        this.editText.type = "text";
        this.editText.style.position = "absolute";
        this.editText.style.left = `${x}px`;
        this.editText.style.top = `${y}px`;
        this.editText.style.width = `${width}px`;
        this.editText.style.height = `${height}px`;
        // ... (styling for editText)
        this.editText.value = this.inputText;
        if (this.maxLength >= 0) {
            this.editText.maxLength = this.maxLength;
        }
        document.body.appendChild(this.editText);
        this.editText.focus();
        this.editText.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.dialogEventsProcessed(null, AliteScreen.RESULT_YES);
            }
        });
    }

    private getDialogRect(): Rect {
        // ... (calculates dialog rect)
        return new Rect(0,0,0,0);
    }

    private renderMessage(): void {
        if (!this.isMessageDialogActive()) return;
        // ... (renders the message dialog box and buttons)
    }

    protected initGl(): void {
        // ... (WebGL initialization logic)
    }

    public update(deltaTime: number): void {
        this.updateWithNavigation(deltaTime, true);
    }

    private updateWithNavigation(deltaTime: number, withNavigation: boolean): void {
        this.newScreen = null;
        for (const event of this.game.getInput().getTouchEvents()) {
            if (withNavigation) {
                const screen = this.game.getNavigationBar().checkNavigationBar(event);
                if (screen) this.newScreen = screen;
            }
            this.processMessageDialogTouch(event);
            if (!this.isMessageDialogActive()) {
                this.processTouch(event);
            }
        }
        if (this.newScreen) {
            this.performScreenChange();
            this.postScreenChange();
        }
    }

    // ... (other methods converted to TypeScript)

    public isMessageDialogActive(): boolean {
        return !!this.message;
    }

    protected processTouch(touch: TouchEvent): void {
        this.processMessageDialogTouch(touch);
    }
}
