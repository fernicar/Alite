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
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { SoundManager } from "../../SoundManager";
import { ColorScheme } from "../../colors/ColorScheme";
import { AliteScreen } from "./AliteScreen";
import { CatalogScreen } from "./CatalogScreen";
import { LoadScreen } from "./LoadScreen";
import { SaveScreen } from "./SaveScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class DiskScreen extends AliteScreen {
    private static readonly SIZE = 450;
    private static readonly X_OFFSET = 150;
    private static readonly X_GAP = 50;
    private static readonly Y_OFFSET = 315;

    private static loadIcon: Pixmap;
    private static saveIcon: Pixmap;
    private static catalogIcon: Pixmap;

    private button: Button[] = new Array(3);
    private readonly text: string[] = [L.string("disk_menu_load"), L.string("disk_menu_save"), L.string("title_catalog")];

    public activate(): void {
        this.button[0] = Button.createPictureButton(DiskScreen.X_OFFSET, DiskScreen.Y_OFFSET, DiskScreen.SIZE, DiskScreen.SIZE, DiskScreen.loadIcon);
        this.button[1] = Button.createPictureButton(DiskScreen.X_OFFSET + DiskScreen.X_GAP + DiskScreen.SIZE, DiskScreen.Y_OFFSET, DiskScreen.SIZE, DiskScreen.SIZE, DiskScreen.saveIcon);
        this.button[2] = Button.createPictureButton(DiskScreen.X_OFFSET + DiskScreen.X_GAP * 2 + DiskScreen.SIZE * 2, DiskScreen.Y_OFFSET, DiskScreen.SIZE, DiskScreen.SIZE, DiskScreen.catalogIcon);
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string("title_disk_menu"));

        let index = 0;
        for (const b of this.button) {
            if (b != null) {
                b.render(g);
                const halfWidth = g.getTextWidth(this.text[index], Assets.regularFont) >> 1;
                g.drawText(this.text[index], b.getX() + (b.getWidth() >> 1) - halfWidth, b.getY() + b.getHeight() + 35,
                    ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
            }
            index++;
        }
    }

    protected processTouch(touch: TouchEvent): void {
        if (touch.type === TouchEvent.TOUCH_UP) {
            if (this.button[0].isTouched(touch.x, touch.y)) {
                SoundManager.play(Assets.click);
                this.newScreen = new LoadScreen(L.string("title_cmdr_load"));
            }
            if (this.button[1].isTouched(touch.x, touch.y)) {
                SoundManager.play(Assets.click);
                this.newScreen = new SaveScreen(L.string("title_cmdr_save"));
            }
            if (this.button[2].isTouched(touch.x, touch.y)) {
                SoundManager.play(Assets.click);
                this.newScreen = new CatalogScreen(L.string("title_catalog"));
            }
        }
    }

    public dispose(): void {
        super.dispose();
        if (DiskScreen.loadIcon != null) {
            DiskScreen.loadIcon.dispose();
            DiskScreen.loadIcon = null;
        }
        if (DiskScreen.saveIcon != null) {
            DiskScreen.saveIcon.dispose();
            DiskScreen.saveIcon = null;
        }
        if (DiskScreen.catalogIcon != null) {
            DiskScreen.catalogIcon.dispose();
            DiskScreen.catalogIcon = null;
        }
    }

    public loadAssets(): void {
        const g = this.game.getGraphics();
        if (DiskScreen.loadIcon == null) {
            DiskScreen.loadIcon = g.newPixmap("load_symbol.png");
        }
        if (DiskScreen.saveIcon == null) {
            DiskScreen.saveIcon = g.newPixmap("save_symbol.png");
        }
        if (DiskScreen.catalogIcon == null) {
            DiskScreen.catalogIcon = g.newPixmap("catalog_symbol.png");
        }
        super.loadAssets();
    }

    public getScreenCode(): number {
        return ScreenCodes.DISK_SCREEN;
    }
}
