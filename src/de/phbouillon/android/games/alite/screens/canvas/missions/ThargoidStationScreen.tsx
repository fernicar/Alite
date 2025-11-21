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
import { Assets } from "../../../Assets";
import { L } from "../../../L";
import { ScreenCodes } from "../../../ScreenCodes";
import { ColorScheme } from "../../../colors/ColorScheme";
import { Mission } from "../../../model/missions/Mission";
import { MissionManager } from "../../../model/missions/MissionManager";
import { ThargoidStationMission } from "../../../model/missions/ThargoidStationMission";
import { AliteScreen } from "../AliteScreen";
import { TextData } from "../TextData";
import { MissionLine } from "./MissionLine";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class ThargoidStationScreen extends AliteScreen {
    // private readonly mediaPlayer: any; // MediaPlayer equivalent

    private attCommander: MissionLine;
    private missionLine: MissionLine;
    private lineIndex = 0;
    private missionText: TextData[];
    private readonly givenState: number;

    constructor(state: number) {
        super();
        this.givenState = state;
        const mission = MissionManager.getInstance().get(ThargoidStationMission.ID);
        // this.mediaPlayer = new MediaPlayer(); // Web Audio equivalent needed
        const path = MissionManager.DIRECTORY_SOUND_MISSION + "5/";
        try {
            this.attCommander = new MissionLine(path + "01.mp3", L.string("mission_attention_commander"));
            if (state === 0) {
                this.missionLine = new MissionLine(path + "02.mp3", L.string("mission_thargoid_station_mission_description"));
                mission.setPlayerAccepts(true);
                mission.setTargetPlanet(this.game.getPlayer().getCurrentSystem(), 1);
            } else if (state === 1) {
                this.missionLine = new MissionLine(path + "04.mp3", L.string("mission_thargoid_station_success"));
                mission.missionCompleted();
            } else {
                AliteLog.e("Unknown State", `Invalid state variable has been passed to ThargoidStationScreen: ${state}`);
            }
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Error reading mission", "Could not read mission audio.", e);
            }
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.lineIndex === 0 && !this.attCommander.isPlaying()) {
            // this.attCommander.play(this.mediaPlayer);
            this.lineIndex++;
        } else if (this.lineIndex === 1 && !this.attCommander.isPlaying() && !this.missionLine.isPlaying()) {
            // this.missionLine.play(this.mediaPlayer);
            this.lineIndex++;
        }
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string("title_mission_thargoid_station"));

        g.drawText(L.string("mission_attention_commander"), 50, 200,
            ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        if (this.missionText != null) {
            this.displayText(g, this.missionText);
        }
    }

    public activate(): void {
        this.missionText = this.computeTextDisplay(this.game.getGraphics(), this.missionLine.getText(), 50, 300, 800,
            ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
    }

    // saveScreenState omitted

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
        return ScreenCodes.THARGOID_STATION_SCREEN;
    }
}
