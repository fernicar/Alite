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

import { TouchEvent } from "../../../framework/Input";
import { Assets } from "../../Assets";
import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { SoundManager } from "../../SoundManager";
import { CommanderData } from "../../model/CommanderData";
import { AliteScreen, RESULT_NONE, RESULT_YES } from "./AliteScreen";
import { CatalogScreen } from "./CatalogScreen";
import { StatusScreen } from "./StatusScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class LoadScreen extends CatalogScreen {
    private confirmedLoad = false;
    private pendingShowMessage: boolean;

    constructor(titleOrStream: string | any) {
        if (typeof titleOrStream === 'string') {
            super(titleOrStream);
        } else {
            // Deserialization constructor - omitting implementation for now
            super(L.string("title_cmdr_load"));
            // title = L.string("title_cmdr_load");
        }
    }

    public activate(): void {
        super.activate();
        this.deleteButton = null;
        if (this.pendingShowMessage) {
            this.showQuestionDialog(L.string("cmdr_load_confirm", this.selectedCommanderData[0].getName()));
            this.confirmDelete = false;
            this.pendingShowMessage = false;
        }
    }

    // saveScreenState omitted as it's Java-specific serialization

    protected processTouch(touch: TouchEvent): void {
        super.processTouch(touch);
        if (this.confirmedLoad) {
            this.newScreen = new StatusScreen();
            this.confirmedLoad = false;
        }
        if (this.selectedCommanderData.length === 1) {
            if (this.messageResult === RESULT_NONE) {
                this.showQuestionDialog(L.string("cmdr_load_confirm", this.selectedCommanderData[0].getName()));
                this.pendingShowMessage = true;
                this.confirmDelete = false;
                SoundManager.play(Assets.alert);
                return;
            }
            this.pendingShowMessage = false;
            if (this.messageResult === RESULT_YES) {
                try {
                    this.game.loadCommander(this.selectedCommanderData[0].getFileName());
                    this.showMessageDialog(L.string("cmdr_load_succeeded", this.selectedCommanderData[0].getDockedSystem()));
                    SoundManager.play(Assets.alert);
                    this.confirmedLoad = true;
                } catch (e) {
                    if (e instanceof Error) {
                        this.showMessageDialog(L.string("cmdr_load_failed", this.selectedCommanderData[0].getName(), e.message));
                    }
                }
            }
            this.clearSelection();
            this.messageResult = RESULT_NONE;
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.LOAD_SCREEN;
    }
}
