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

import { Graphics } from "../../../framework/Graphics";
import { TouchEvent } from "../../../framework/Input";
import { Pixmap } from "../../../framework/Pixmap";
import { Rect } from "../../../framework/Rect";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { ColorScheme } from "../../colors/ColorScheme";
import { AliteScreen } from "./AliteScreen";
import { EquipmentScreen } from "./EquipmentScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class LaserPositionSelectionScreen extends AliteScreen {
    private readonly index: number;
    private readonly pads: Button[] = new Array(4);
    private readonly front: number;
    private readonly right: number;
    private readonly rear: number;
    private readonly left: number;
    private readonly equipmentScreen: EquipmentScreen;

    constructor(equipmentScreen: EquipmentScreen, front: number, right: number, rear: number, left: number, index: number) {
        super();
        this.index = index;
        this.front = front;
        this.right = right;
        this.rear = rear;
        this.left = left;
        this.equipmentScreen = equipmentScreen;
    }

    public activate(): void {
        this.initializeButtons();
    }

    private getIcon(currentEquip: number): Pixmap {
        return currentEquip === 0 ? Assets.yesIcon : currentEquip < 0 ? Assets.noIcon : this.pics.get("change_icon");
    }

    private initializeButtons(): void {
        this.pads[0] = Button.createGradientRegularButton(710, 210, 300, 100, L.string("laser_pos_front"))
            .setPixmap(this.getIcon(this.front))
            .setTextPosition(Button.TextPosition.RIGHT);
        this.pads[1] = Button.createGradientRegularButton(1340, 480, 200, 200, L.string("laser_pos_right"))
            .setPixmap(this.getIcon(this.right))
            .setPixmapOffset(50, 0)
            .setTextPosition(Button.TextPosition.BELOW);
        this.pads[2] = Button.createGradientRegularButton(710, 855, 300, 100, L.string("laser_pos_rear"))
            .setPixmap(this.getIcon(this.rear))
            .setTextPosition(Button.TextPosition.RIGHT);
        this.pads[3] = Button.createGradientRegularButton(180, 480, 200, 200, L.string("laser_pos_left"))
            .setPixmap(this.getIcon(this.left))
            .setPixmapOffset(50, 0)
            .setTextPosition(Button.TextPosition.BELOW);
        for (const b of this.pads) {
            b.setTextColor(ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
        }
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();

        this.equipmentScreen.present(deltaTime);
        g.verticalGradientRect(160, 160, 1400, 800,
            ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT), ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK));
        g.rec3d(160, 160, 1400, 800, 10,
            ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT), ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK));
        const halfWidth = g.getTextWidth(L.string("laser_pos_select"), Assets.regularFont) >> 1;
        g.drawText(L.string("laser_pos_select"), 860 - halfWidth, 195, ColorScheme.get(ColorScheme.COLOR_MESSAGE), Assets.regularFont);
        g.drawPixmap(this.pics.get("cobra_small"), 380, 310);

        for (const b of this.pads) {
            b.render(g);
        }
    }

    protected processTouch(touch: TouchEvent): void {
        for (let i = 0; i < this.pads.length; i++) {
            if (this.pads[i].isPressed(touch)) {
                this.equipmentScreen.setLaserPosition(i);
                this.newScreen = this.equipmentScreen;
                return;
            }
        }
        if (touch.type !== TouchEvent.TOUCH_UP) {
            return;
        }
        if (!Rect.inside(touch.x, touch.y, 160, 160, 1560, 960)) {
            this.equipmentScreen.setLaserPosition(-2);
            this.newScreen = this.equipmentScreen;
        }
    }

    protected performScreenChange(): void {
        this.dispose();
        this.game.setScreen(this.equipmentScreen);
        this.equipmentScreen.performTrade(this.index);
        this.game.getNavigationBar().performScreenChange();
    }

    public loadAssets(): void {
        this.addPictures("cobra_small", "change_icon");
        super.loadAssets();
    }

    public getScreenCode(): number {
        return -1;
    }
}
