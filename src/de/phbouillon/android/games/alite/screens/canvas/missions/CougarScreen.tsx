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
import { Timer } from "../../../../framework/Timer";
import { Vector3f } from "../../../../framework/math/Vector3f";
import { AliteLog } from "../../../AliteLog";
import { L } from "../../../L";
import { ScreenCodes } from "../../../ScreenCodes";
import { ColorScheme } from "../../../colors/ColorScheme";
import { CougarMission } from "../../../model/missions/CougarMission";
import { Mission } from "../../../model/missions/Mission";
import { MissionManager } from "../../../model/missions/MissionManager";
import { ObjectType } from "../../opengl/ingame/ObjectType";
import { MathHelper } from "../../opengl/objects/space/MathHelper";
import { SpaceObject } from "../../opengl/objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../opengl/objects/space/SpaceObjectFactory";
import { AliteScreen } from "../AliteScreen";
import { TextData } from "../TextData";
import { MissionLine } from "./MissionLine";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class CougarScreen extends AliteScreen {
    // private readonly mediaPlayer: any; // MediaPlayer equivalent

    private missionLine: MissionLine;
    private lineIndex = 0;
    private cougar: SpaceObject;
    private missionText: TextData[];
    private readonly timer = new Timer().setAutoReset();
    private currentDelta = new Vector3f(0, 0, 0);
    private targetDelta = new Vector3f(0, 0, 0);

    private readonly givenState: number;

    constructor(state: number) {
        super();
        this.givenState = state;
        const mission = MissionManager.getInstance().get(CougarMission.ID);
        // this.mediaPlayer = new MediaPlayer();
        const path = MissionManager.DIRECTORY_SOUND_MISSION + "4/";
        try {
            if (state === 0) {
                this.missionLine = new MissionLine(path + "01.mp3", L.string("mission_cougar_mission_description"));
                this.cougar = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Cougar);
                this.cougar.setPosition(200, 0, -700.0);
                mission.setPlayerAccepts(true);
                mission.setTargetPlanet(this.game.getPlayer().getCurrentSystem(), 1);
            } else {
                AliteLog.e("Unknown State", `Invalid state variable has been passed to CougarScreen: ${state}`);
            }
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Error reading mission", "Could not read mission audio.", e);
            }
        }
    }

    private dance(): void {
        if (this.timer.hasPassedSeconds(4)) {
            MathHelper.getRandomRotationAngles(this.targetDelta);
        }
        MathHelper.updateAxes(this.currentDelta, this.targetDelta);
        this.cougar.applyDeltaRotation(this.currentDelta.x, this.currentDelta.y, this.currentDelta.z);
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.lineIndex === 0 && !this.missionLine.isPlaying()) {
            // this.missionLine.play(this.mediaPlayer);
            this.lineIndex++;
        }
        if (this.cougar != null) {
            this.dance();
        }
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string("title_mission_cougar"));

        if (this.missionText != null) {
            this.displayText(g, this.missionText);
        }

        if (this.cougar != null) {
            this.displayObject(this.cougar, 1.0, 100000.0);
        } else {
            this.setUpForDisplay();
        }
    }

    public activate(): void {
        this.initGl();
        this.missionText = this.computeTextDisplay(this.game.getGraphics(), this.missionLine.getText(), 50, 200, 800, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
        MathHelper.getRandomRotationAngles(this.targetDelta);
    }

    // saveScreenState omitted

    public pause(): void {
        super.pause();
        // if (this.mediaPlayer != null) {
        //     this.mediaPlayer.reset();
        // }
    }

    public dispose(): void {
        super.dispose();
        // if (this.mediaPlayer != null) {
        //     this.mediaPlayer.reset();
        // }
        if (this.cougar != null) {
            this.cougar.dispose();
            this.cougar = null;
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.COUGAR_SCREEN;
    }
}
