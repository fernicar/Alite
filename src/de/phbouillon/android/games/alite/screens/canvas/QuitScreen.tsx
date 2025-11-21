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
import { Screen } from "../../../framework/Screen";
import { AliteConfig } from "../../AliteConfig";
import { AliteLog } from "../../AliteLog";
import { L } from "../../L";
import { FlightScreen } from "../opengl/ingame/FlightScreen";
import { AliteScreen, RESULT_NONE, RESULT_YES, RESULT_NO } from "./AliteScreen";
import { StatusScreen } from "./StatusScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class QuitScreen extends AliteScreen {
    private callingScreen: Screen;
    private mockStatusScreen: Screen;

    // default public constructor is required for navigation bar
    constructor() {
        super();
        this.mockStatusScreen = new StatusScreen();
        this.mockStatusScreen.loadAssets();
        if (this.game.getCurrentScreen() instanceof FlightScreen) {
            this.callingScreen = this.game.getCurrentScreen();
        } else {
            this.callingScreen = this.mockStatusScreen;
        }
    }

    public activate(): void {
        this.mockStatusScreen.activate();
        this.setUpForDisplay();
        this.showModalQuestionDialog(L.string("quit_confirm", AliteConfig.GAME_NAME));
    }

    public processTouch(touch: TouchEvent): void {
        if (this.messageResult === RESULT_NONE) {
            return;
        }
        if (this.messageResult === RESULT_YES) {
            try {
                AliteLog.d("[ALITE]", "Performing autosave. [Quit]");
                this.game.autoSave();
            } catch (e) {
                if (e instanceof Error) {
                    AliteLog.e("[ALITE]", "Autosaving commander failed.", e);
                }
            }
            // game.finishAffinity(); // Not applicable in a web context.
            AliteLog.d("QuitScreen", "User confirmed quit. In a real web app, you might close the tab/window if allowed, or navigate away.");
        }
    }

    public present(deltaTime: number): void {
        if (this.messageResult === RESULT_NO) {
            this.messageResult = RESULT_NONE;
            this.newScreen = this.callingScreen;
            if (this.callingScreen !== this.mockStatusScreen) {
                (this.callingScreen as FlightScreen).setInformationScreen(null);
            }
            this.callingScreen.present(deltaTime);
        } else {
            this.mockStatusScreen.present(deltaTime);
        }
    }

    public dispose(): void {
        if (this.mockStatusScreen != null) {
            this.mockStatusScreen.dispose();
            this.mockStatusScreen = null;
        }
        super.dispose();
    }

    public loadAssets(): void {
        this.mockStatusScreen.loadAssets();
    }

    public getScreenCode(): number {
        return this.callingScreen.getScreenCode();
    }
}
