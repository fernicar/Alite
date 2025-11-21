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

import { TouchEvent } from "../../../../../../../../framework/Input";
import { Sprite } from "../../../../../../../../framework/impl/gl/Sprite";
import { ButtonGroup } from "./ButtonGroup";

export class ButtonData {
    private static readonly serialVersionUID = -7572278067214518431;

    sprite: Sprite;
    centerX: number;
    centerY: number;
    selected = false;
    active = true;
    parent: ButtonGroup;
    yellow = false;
    red = false;
    readonly name: string;

    constructor(s: Sprite, cx: number, cy: number, name: string) {
        this.sprite = s;
        this.centerX = cx;
        this.centerY = cy;
        this.name = name;
    }

    isTouched(x: number, y: number, touchEventType: number): boolean {
        // Remember that click events are in "virtual space", hence _always_ range from 0 through 1920 and 0 through 1080 respectively!
        const isTouched = (x - this.centerX) * (x - this.centerX) + (y - this.centerY) * (y - this.centerY) <= 10000.0;
        if (touchEventType === TouchEvent.TOUCH_DOWN && isTouched) {
            this.selected = true;
        }
        return isTouched;
    }

    public toString(): string {
        return `Sprite ${this.name} (${this.centerX}, ${this.centerY})`;
    }
}
