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
import { Button } from "../../Button";
import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { ColorScheme } from "../../colors/ColorScheme";
import { AliteScreen } from "./AliteScreen";
import { TutAdvancedFlying } from "./tutorial/TutAdvancedFlying";
import { TutBasicFlying } from "./tutorial/TutBasicFlying";
import { TutEquipment } from "./tutorial/TutEquipment";
import { TutHud } from "./tutorial/TutHud";
import { TutIntroduction } from "./tutorial/TutIntroduction";
import { TutNavigation } from "./tutorial/TutNavigation";
import { TutTrading } from "./tutorial/TutTrading";

//This screen never needs to be serialized, as it is not part of the InGame state.
export class TutorialSelectionScreen extends AliteScreen {
    private readonly buttons: Button[] = new Array(7);

    private createButton(row: number, text: string): Button {
        return Button.createGradientTitleButton(50, 130 * (row + 1), 1620, 100, text);
    }

    public activate(): void {
        this.game.updateMedals();
        this.buttons[0] = this.createButton(0, L.string("tutorial_selection_introduction"))
            .setEvent(b => this.newScreen = new TutIntroduction());
        this.buttons[1] = this.createButton(1, L.string("tutorial_selection_trading"))
            .setEvent(b => this.newScreen = new TutTrading());
        this.buttons[2] = this.createButton(2, L.string("tutorial_selection_equipment"))
            .setEvent(b => this.newScreen = new TutEquipment());
        this.buttons[3] = this.createButton(3, L.string("tutorial_selection_navigation"))
            .setEvent(b => this.newScreen = new TutNavigation());
        this.buttons[4] = this.createButton(4, L.string("tutorial_selection_hud"))
            .setEvent(b => this.newScreen = new TutHud(null));
        this.buttons[5] = this.createButton(5, L.string("tutorial_selection_basic_flying"))
            .setEvent(b => this.newScreen = new TutBasicFlying(null));
        this.buttons[6] = this.createButton(6, L.string("tutorial_selection_advanced_flying"))
            .setEvent(b => this.newScreen = new TutAdvancedFlying(0));
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));

        this.displayTitle(L.string("title_training_academy"));
        for (const b of this.buttons) {
            b.render(g);
        }
    }

    protected processTouch(touch: TouchEvent): void {
        for (const b of this.buttons) {
            if (b.isPressed(touch)) {
                b.onEvent();
                return;
            }
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.TUTORIAL_SELECTION_SCREEN;
    }

}
