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
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { SoundManager } from "../../SoundManager";
import { CatalogScreen } from "./CatalogScreen";
import { StatusScreen } from "./StatusScreen";
import { RESULT_NONE, RESULT_YES } from "./AliteScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class SaveScreen extends CatalogScreen {
    private saveNewCommanderButton: Button;
    private confirmedSave = false;

    constructor(titleOrStream: string | any) {
        if (typeof titleOrStream === 'string') {
            super(titleOrStream);
        } else {
            // Deserialization constructor - omitting implementation for now
            super(L.string("title_cmdr_save"));
            // this.title = L.string("title_cmdr_save");
        }
    }

    public activate(): void {
        super.activate();
        this.saveNewCommanderButton = Button.createGradientRegularButton(50, 950, 500, 100, L.string("cmdr_btn_save"));
        this.deleteButton = null;
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.messageResult === RESULT_YES) {
            try {
                this.game.saveCommander(this.inputText);
                this.showMessageDialog(L.string("cmdr_save_succeeded", this.inputText));
                this.confirmedSave = true;
            } catch (e) {
                if (e instanceof Error) {
                    AliteLog.e("[ALITE] SaveCommander", "Error while saving commander.", e);
                }
            }
        }
        this.messageResult = RESULT_NONE;
    }

    protected processTouch(touch: TouchEvent): void {
        super.processTouch(touch);
        if (this.confirmedSave) {
            this.newScreen = new StatusScreen();
            this.confirmedSave = false;
        }
        if (touch.type === TouchEvent.TOUCH_UP) {
            if (this.saveNewCommanderButton.isTouched(touch.x, touch.y)) {
                SoundManager.play(Assets.click);
                this.popupTextInput(L.string("cmdr_get_name"), this.game.getPlayer().getName(), 16);
            }
        }
        if (this.selectedCommanderData.length !== 1) {
            return;
        }
        if (this.messageResult === RESULT_NONE) {
            this.showQuestionDialog(L.string("cmdr_save_overwrite", this.selectedCommanderData[0].getName()));
            this.confirmDelete = false;
            SoundManager.play(Assets.alert);
            return;
        }
        if (this.messageResult === RESULT_YES) {
            try {
                if (this.selectedCommanderData[0].isAutoSaved()) {
                    this.game.saveCommander(this.selectedCommanderData[0].getName());
                } else {
                    this.game.saveCommander(this.selectedCommanderData[0].getName(), this.selectedCommanderData[0].getFileName());
                }
                this.showMessageDialog(L.string("cmdr_save_succeeded", this.selectedCommanderData[0].getName()));
                SoundManager.play(Assets.alert);
                this.confirmedSave = true;
            } catch (e) {
                if (e instanceof Error) {
                    this.showMessageDialog(L.string("cmdr_save_failed", this.selectedCommanderData[0].getName(), e.message));
                }
            }
        }
        this.clearSelection();
        this.messageResult = RESULT_NONE;
    }

    public present(deltaTime: number): void {
        super.present(deltaTime);
        const g = this.game.getGraphics();
        this.saveNewCommanderButton.render(g);
    }

    public getScreenCode(): number {
        return ScreenCodes.SAVE_SCREEN;
    }
}
