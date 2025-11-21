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

import { AliteGame } from "../../../AliteGame";
import { AliteLog } from "../../../AliteLog";
import { ScreenCodes } from "../../../ScreenCodes";
import { Settings } from "../../../Settings";
import { Condition } from "../../../model/Condition";
import { Medal } from "../../../model/Medal";
import { ObjectType } from "../../../model/ObjectType";
import { PlayerCobra } from "../../../model/PlayerCobra";
import { SystemData } from "../../../model/generator/SystemData";
import { AliteObject } from "../objects/AliteObject";
import { PlanetSpaceObject } from "../objects/PlanetSpaceObject";
import { SphericalSpaceObject } from "../objects/SphericalSpaceObject";
import { SpaceObject } from "../objects/space/SpaceObject";
import { SpaceObjectAI } from "../objects/space/SpaceObjectAI";
import { SpaceObjectFactory } from "../objects/space/SpaceObjectFactory";
import { AliteHud } from "../sprites/AliteHud";
import { AliteButtons } from "../sprites/buttons/AliteButtons";
import { GlScreen } from "./GlScreen";
import { InGameManager } from "./InGameManager";
import { IMethodHook } from "../../../../framework/IMethodHook";
import { Screen } from "../../../../framework/Screen";
import { Timer } from "../../../../framework/Timer";
import { TouchEvent } from "../../../../framework/Input";
import { Vector3f } from "../../../../framework/math/Vector3f";


export class FlightScreen extends GlScreen {
    private static readonly PLANET_POSITION = new Vector3f(0.0, 0.0, 800000.0);
    public static SHIP_ENTRY_POSITION = new Vector3f(0.0, 0.0, 400000.0);
    private static readonly SUN_SIZE = 60000.0;

    private star: SphericalSpaceObject;
    private planet: PlanetSpaceObject;
    private inGame: InGameManager;
    private informationScreen: Screen;

    // ... (light properties)

    private readonly allObjects: AliteObject[] = [];
    private spaceStation: SpaceObject;
    private resetSpaceStation = true;
    private readonly fromStation: boolean;
    private witchSpace: boolean;
    private paused: boolean;
    private pausedMode: number;
    private readonly timer: Timer = new Timer().setAutoResetWithImmediateAtFirstCall();
    private handleUi = true;
    private needsActivation = true;
    private isSaving: boolean;
    private timeToExitTimer: Timer;
    private postDockingHook: IMethodHook;

    private readonly v0 = new Vector3f(0, 0, 0);
    private readonly v1 = new Vector3f(0, 0, 0);
    private readonly v2 = new Vector3f(0, 0, 0);

    constructor(fromStation: boolean = true) {
        super();
        this.fromStation = fromStation;
        FlightScreen.SHIP_ENTRY_POSITION.z = Settings.enterInSafeZone ? 685000.0 : 400000.0;

        // Reset overrides
        AliteButtons.OVERRIDE_HYPERSPACE = false;
        // ... (all other overrides)

        this.game.getPlayer().setCondition(Condition.GREEN);
    }


    public static createScreen(dis: any): FlightScreen {
        // Deserialization logic
        // This would require a more complex setup in TypeScript,
        // potentially using a library for serialization.
        // For now, we'll assume a simplified version.
        const screen = new FlightScreen(false /* Placeholder */);
        // ... (read properties from `dis`)
        return screen;
    }


    public enterWitchSpace(): void {
        this.witchSpace = true;
    }

    public togglePause(): void {
        if (this.inGame && this.timer.hasPassedSeconds(1)) {
            this.paused = !this.paused;
            this.inGame.setPaused(this.paused);
        }
    }

    // ... (rest of the FlightScreen methods converted to TypeScript)

    public getInGameManager(): InGameManager {
        return this.inGame;
    }

    public getScreenCode(): number {
        return ScreenCodes.FLIGHT_SCREEN;
    }

}
