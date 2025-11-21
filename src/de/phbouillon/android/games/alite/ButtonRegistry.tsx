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

import { TouchEvent } from "../framework/Input";
import { Screen } from "../framework/Screen";
import { Alite } from "./Alite";
import { Button } from "./Button";

export class ButtonRegistry {
    private static readonly instance = new ButtonRegistry();

    private readonly buttons: Map<Screen, Set<Button>> = new Map();
    private readonly messageButtons: Set<Button> = new Set();
    private messageButton: boolean;

    private constructor() {
    }

    public static get(): ButtonRegistry {
        return ButtonRegistry.instance;
    }

    public setNextAsMessageButton(): void {
        this.messageButton = true;
    }

    public clearMessageButtons(): void {
        this.messageButtons.clear();
    }

    public addButton(button: Button): void {
        if (this.messageButton) {
            this.messageButtons.add(button);
            this.messageButton = false;
            return;
        }
        let definedButtons = this.buttons.get(Alite.getInstance().getCurrentScreen());
        if (definedButtons == null) {
            definedButtons = new Set();
            this.buttons.set(Alite.getInstance().getCurrentScreen(), definedButtons);
        }
        definedButtons.add(button);
    }

    public removeButtons(definingScreen: Screen): void {
        this.buttons.delete(definingScreen);
    }

    public removeButton(definingScreen: Screen, button: Button): void {
        const definedButtons = this.buttons.get(definingScreen);
        if (definedButtons != null) {
            definedButtons.delete(button);
        }
    }

    public processTouch(touch: TouchEvent): number {
        let result = Number.MAX_VALUE;
        const set = this.messageButtons.size === 0 ? this.buttons.get(Alite.getInstance().getCurrentScreen()) : this.messageButtons;
        if (set == null) {
            return result;
        }

        if (this.messageButtons.size > 0) {
            const screenButtons = this.buttons.get(Alite.getInstance().getCurrentScreen());
            if (screenButtons != null) {
                for (const b of screenButtons) {
                    b.clearFingerDown();
                }
            }
        }

        if (touch.type === TouchEvent.TOUCH_DOWN) {
            for (const b of set) {
                if (b.isTouched(touch.x, touch.y)) {
                    b.fingerDown(touch.pointer);
                }
            }
            return result;
        }

        if (touch.type === TouchEvent.TOUCH_DRAGGED) {
            for (const b of set) {
                if (b.isTouched(touch.x, touch.y)) {
                    b.fingerDown(touch.pointer);
                } else {
                    b.fingerUp(touch.pointer);
                }
            }
            return result;
        }

        if (touch.type === TouchEvent.TOUCH_UP) {
            for (const b of set) {
                if (b.isTouched(touch.x, touch.y)) {
                    b.fingerUp(touch.pointer);
                    result = b.getCommand();
                }
            }
        }
        return result;
    }
}
