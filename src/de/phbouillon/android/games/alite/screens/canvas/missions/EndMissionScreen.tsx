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

import { Graphics } from "../../../../framework/Graphics";
import { AliteLog } from "../../../AliteLog";
import { L } from "../../../L";
import { ScreenCodes } from "../../../ScreenCodes";
import { ColorScheme } from "../../../colors/ColorScheme";
import { EndMission } from "../../../model/missions/EndMission";
import { Mission } from "../../../model/missions/Mission";
import { MissionManager } from "../../../model/missions/MissionManager";
import { AliteScreen } from "../AliteScreen";
import { TextData } from "../TextData";
import { MissionLine } from "./MissionLine";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class EndMissionScreen extends AliteScreen {
    // private readonly mediaPlayer: any; // MediaPlayer equivalent

    private welcomeLine: MissionLine;
    private missionLine: MissionLine;
    private congratulationsLine: MissionLine;
    private welcomeText: TextData[];
    private missionText: TextData[];
    private congratulationsText: TextData[];
    private state = 0;

    constructor(state: number) {
        super();
        const mission = MissionManager.getInstance().get(EndMission.ID);
        // this.mediaPlayer = new MediaPlayer(); // Web Audio equivalent needed
        try {
            if (state === 0) {
                this.welcomeLine = new MissionLine(MissionManager.DIRECTORY_SOUND_MISSION + "01.mp3", L.string("mission_elite_welcome_commander"));
                this.missionLine = new MissionLine(null, L.string("mission_elite_mission_description"));
                this.congratulationsLine = new MissionLine(null, L.string("mission_elite_congratulations"));
                mission.missionCompleted();
            } else {
                AliteLog.e("Unknown State", `Invalid state variable has been passed to EndMissionScreen: ${state}`);
            }
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Error reading mission", "Could not read mission audio.", e);
            }
        }
        mission.setPlayerAccepts(true);
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.state === 0 && this.welcomeLine != null && !this.welcomeLine.isPlaying()) {
            // this.welcomeLine.play(this.mediaPlayer);
            this.state = 1;
        }
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string("title_mission_elite"));

        if (this.welcomeText != null) {
            this.displayText(g, this.welcomeText);
        }
        if (this.missionText != null) {
            this.displayText(g, this.missionText);
        }
        if (this.congratulationsText != null) {
            this.displayText(g, this.congratulationsText);
        }
    }

    public activate(): void {
        if (this.welcomeLine != null) {
            this.welcomeText = this.computeTextDisplay(this.game.getGraphics(), this.welcomeLine.getText(), 50, 200, 800, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT));
            this.missionText = this.computeTextDisplay(this.game.getGraphics(), this.missionLine.getText(), 50, 300, 800, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
            this.congratulationsText = this.computeTextDisplay(this.game.getGraphics(), this.congratulationsLine.getText(), 50, 800, 800, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT));
        }
    }

    public dispose(): void {
        super.dispose();
        // if (this.mediaPlayer != null) {
        //     this.mediaPlayer.reset();
        // }
    }

    public pause(): void {
        super.pause();
        // if (this.mediaPlayer != null) {
        //     this.mediaPlayer.reset();
        // }
    }

    public getScreenCode(): number {
        return ScreenCodes.END_MISSION_SCREEN;
    }
}
