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
import { ConstrictorMission } from "../../model/missions/ConstrictorMission";
import { CougarMission } from "../../model/missions/CougarMission";
import { Mission } from "../../model/missions/Mission";
import { MissionManager } from "../../model/missions/MissionManager";
import { SupernovaMission } from "../../model/missions/SupernovaMission";
import { ThargoidDocumentsMission } from "../../model/missions/ThargoidDocumentsMission";
import { ThargoidStationMission } from "../../model/missions/ThargoidStationMission";
import { AliteScreen } from "./AliteScreen";
import { DebugSettingsScreen } from "./DebugSettingsScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class MoreDebugSettingsScreen extends AliteScreen {
    private readonly buttons: Button[] = new Array(7);

    public activate(): void {
        this.buttons[0] = Button.createGradientTitleButton(50, 130, 1620, 100,
            L.string("options_more_debug_start_constrictor_mission"))
            .setEvent(b => this.startMission(ConstrictorMission.ID));
        this.buttons[1] = Button.createGradientTitleButton(50, 250, 1620, 100,
            L.string("options_more_debug_start_thargoid_documents_mission"))
            .setEvent(b => this.startMission(ThargoidDocumentsMission.ID));
        this.buttons[2] = Button.createGradientTitleButton(50, 370, 1620, 100,
            L.string("options_more_debug_start_supernova_mission"))
            .setEvent(b => this.startMission(SupernovaMission.ID));
        this.buttons[3] = Button.createGradientTitleButton(50, 490, 1620, 100,
            L.string("options_more_debug_start_cougar_mission"))
            .setEvent(b => this.startMission(CougarMission.ID));
        this.buttons[4] = Button.createGradientTitleButton(50, 610, 1620, 100,
            L.string("options_more_debug_start_thargoid_base_mission"))
            .setEvent(b => this.startMission(ThargoidStationMission.ID));
        this.buttons[5] = Button.createGradientTitleButton(50, 730, 1620, 100,
            L.string("options_more_debug_clear_mission"))
            .setEvent(b => {
                MissionManager.getInstance().clearActiveMissions();
                let completedMissions = "";
                for (const m of MissionManager.getInstance().getMissions()) {
                    if (m.isCompleted()) {
                        completedMissions += `${m.constructor.name}; `;
                    }
                }
                this.showLargeMessageDialog(L.string("options_more_debug_completed_missions", completedMissions));
            });
        this.buttons[6] = Button.createGradientTitleButton(50, 970, 1620, 100, L.string("options_back"))
            .setEvent(b => this.newScreen = new DebugSettingsScreen());
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string("title_more_debug_options"));
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

    private startMission(id: number): void {
        this.game.getCobra().clearSpecialCargo();
        for (let i = 1; i < id; i++) {
            MissionManager.getInstance().get(i).done();
        }
        MissionManager.getInstance().get(id).resetStarted();
        if (id === ConstrictorMission.ID) {
            this.game.getPlayer().setIntergalacticJumpCounter(1);
            this.game.getPlayer().setJumpCounter(62);
        } else {
            this.game.getPlayer().resetIntergalacticJumpCounter();
            this.game.getPlayer().setJumpCounter(63);
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.MORE_DEBUG_OPTIONS_SCREEN;
    }
}
