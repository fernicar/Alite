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

import { TouchEvent } from "../../../../../framework/Input";
import { Rect } from "../../../../../framework/Rect";
import { Sprite } from "../../../../../framework/impl/gl/Sprite";
import { Alite } from "../../../Alite";
import { Settings } from "../../../Settings";
import { AliteColor } from "../../../colors/AliteColor";
import { ShipController } from "./ShipController";

export class ControlPad extends ShipController {
    private static readonly serialVersionUID = -3050741925963060286;

    private readonly CPX = Settings.controlPosition === 0 ? Settings.flatButtonDisplay ? 50 : 150 : Settings.flatButtonDisplay ? 1524 : 1424;
    private readonly CPY = Settings.flatButtonDisplay ? 300 : 680;
    private readonly WIDTH = 350;
    private readonly HEIGHT = 350;

    private readonly controlPad: Sprite[] = new Array(9);

    private fingerDown: number = 0;
    private activeIndex: number = 0;

    constructor() {
        super();
        const r = new Rect(this.CPX, this.CPY, this.WIDTH, this.HEIGHT);
        this.controlPad[0] = this.genSprite("cpn", r);
        this.controlPad[1] = this.genSprite("cpu", r);
        this.controlPad[2] = this.genSprite("cpru", r);
        this.controlPad[3] = this.genSprite("cpr", r);
        this.controlPad[4] = this.genSprite("cprd", r);
        this.controlPad[5] = this.genSprite("cpd", r);
        this.controlPad[6] = this.genSprite("cpld", r);
        this.controlPad[7] = this.genSprite("cpl", r);
        this.controlPad[8] = this.genSprite("cplu", r);
    }

    private calculateActiveIndex(x: number, y: number): void {
        this.setDirections(x < 125, x > 225, y < 125, y > 225);
    }

    protected isDown(): boolean {
        return this.activeIndex === 4 || this.activeIndex === 5 || this.activeIndex === 6;
    }

    protected isUp(): boolean {
        return this.activeIndex === 1 || this.activeIndex === 2 || this.activeIndex === 8;
    }

    protected isRight(): boolean {
        return this.activeIndex > 1 && this.activeIndex < 5;
    }

    protected isLeft(): boolean {
        return this.activeIndex > 5;
    }

    handleUI(event: TouchEvent): boolean {
        let result = false;

        if (Rect.inside(event.x, event.y, this.CPX, this.CPY, this.CPX + this.WIDTH, this.CPY + this.HEIGHT)) {
            if (event.type === TouchEvent.TOUCH_DOWN) {
                this.fingerDown = TouchEvent.fingerDown(this.fingerDown, event.pointer);
                this.calculateActiveIndex(event.x - this.CPX, event.y - this.CPY);
            }
            if (event.type === TouchEvent.TOUCH_DRAGGED) {
                this.calculateActiveIndex(event.x - this.CPX, event.y - this.CPY);
            }
            result = true;
        }
        if (event.type === TouchEvent.TOUCH_UP) {
            const f = TouchEvent.fingerUp(this.fingerDown, event.pointer);
            if (f !== this.fingerDown) {
                this.fingerDown = f;
                result = true;
            }
        }
        if (!TouchEvent.isDown(this.fingerDown)) {
            this.activeIndex = 0;
        }

        return result;
    }

    setDirections(left: boolean, right: boolean, up: boolean, down: boolean): void {
        if (left) {
            if (up) {
                this.activeIndex = 8;
            } else if (down) {
                this.activeIndex = 6;
            } else {
                this.activeIndex = 7;
            }
        } else if (right) {
            if (up) {
                this.activeIndex = 2;
            } else if (down) {
                this.activeIndex = 4;
            } else {
                this.activeIndex = 3;
            }
        } else {
            if (up) {
                this.activeIndex = 1;
            } else if (down) {
                this.activeIndex = 5;
            } else {
                this.activeIndex = 0;
            }
        }
    }

    render(): void {
        const a = Settings.alpha * Settings.controlAlpha;
        Alite.getInstance().getGraphics().setColor(AliteColor.argb(a, a, a, a));
        this.controlPad[this.activeIndex].justRender();
        Alite.getInstance().getGraphics().setColor(AliteColor.argb(Settings.alpha, Settings.alpha, Settings.alpha, Settings.alpha));
    }
}
