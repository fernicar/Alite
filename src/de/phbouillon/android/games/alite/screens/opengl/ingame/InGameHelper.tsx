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

import { AliteGame } from "../../..//AliteGame";
import { AliteLog } from "../../..//AliteLog";
import { Assets } from "../../../Assets";
import { L } from "../../../L";
import { R } from "../../../R";
import { Settings } from "../../../Settings";
import { SoundManager } from "../../../SoundManager";
import { Condition } from "../../../model/Condition";
import { EquipmentStore } from "../../../model/EquipmentStore";
import { InventoryItem } from "../../../model/InventoryItem";
import { LegalStatus } from "../../../model/LegalStatus";
import { ObjectType } from "../../../model/ObjectType";
import { PlayerCobra } from "../../../model/PlayerCobra";
import { Weight } from "../../../model/Weight";
import { TradeGood } from "../../../model/trading/TradeGood";
import { TradeGoodStore } from "../../../model/trading/TradeGoodStore";
import { StatusScreen } from "../../canvas/StatusScreen";
import { AliteObject } from "../objects/AliteObject";
import { SpaceObject } from "../objects/space/SpaceObject";
import { SpaceObjectAI } from "../objects/space/SpaceObjectAI";
import { SpaceObjectFactory } from "../objects/space/SpaceObjectFactory";
import { AttackTraverser } from "./AttackTraverser";
import { InGameManager } from "./InGameManager";
import { LaserManager } from "./LaserManager";
import { ScoopCallback } from "./ScoopCallback";
import { Timer } from "../../../../framework/Timer";
import { Vector3f } from "../../../../framework/math/Vector3f";


export class InGameHelper {
    private static readonly STATION_PROXIMITY_DISTANCE_SQ = 4000000.0;
    public static readonly STATION_VESSEL_PROXIMITY_DISTANCE_SQ = 8000000.0;
    private static readonly PROXIMITY_WARNING_RADIUS_FACTOR = 18.0;

    private static readonly DAMAGE_CARGO_COLLISION = 10;
    private static readonly DAMAGE_STATION_COLLISION = 5;
    private static readonly DAMAGE_OBJECT_COLLISION = 20;
    private static readonly DAMAGE_MISSILE = 40;

    private readonly inGame: InGameManager;
    private readonly tempVector: Vector3f;
    private fuelScoopFuel: number;
    private fuelBeforeScoop: number;
    private readonly lastMissileWarning: Timer = new Timer().setAutoResetWithImmediateAtFirstCall();
    private readonly attackTraverser: AttackTraverser;
    private scoopCallback: ScoopCallback = null;
    private cabinTemperatureAlarm: boolean;

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
        this.tempVector = new Vector3f(0, 0, 0);
        this.attackTraverser = new AttackTraverser(inGame);
    }


    public setScoopCallback(callback: ScoopCallback): void {
        this.scoopCallback = callback;
    }

    public getScoopCallback(): ScoopCallback {
        return this.scoopCallback;
    }

    private ramCargo(rammedObject: SpaceObject): void {
        rammedObject.applyDamage(4000);
        this.inGame.getLaserManager().collisionWithPlayerShip(rammedObject, InGameHelper.DAMAGE_CARGO_COLLISION, true);
        if (this.scoopCallback) {
            this.scoopCallback.rammed(rammedObject);
        }
    }

    public checkShipStationProximity(): void {
        const ship = this.inGame.getShip();
        const station = this.inGame.getStation();
        if (!ship || !station) return;

        const distanceSq = ship.getPosition().distanceSq(station.getPosition());
        if (distanceSq <= InGameHelper.STATION_PROXIMITY_DISTANCE_SQ) {
            if (ship.getProximity() !== station) {
                ship.setProximity(station);
                AliteLog.d("Proximity", "Setting ship/station proximity");
            }
        } else {
            if (ship.getProximity() === station) {
                ship.setProximity(null);
            }
        }
    }

    // ... (the rest of the InGameHelper methods converted to TypeScript)
    public automaticDockingSequence(): void {
        if (this.isNotPlayerFlying()) {
            return;
        }
        const alite = AliteGame.get();
        alite.getPlayer().setCondition(Condition.DOCKED);
        SoundManager.stopAll();
        this.inGame.getMessage().clearRepetition();
        alite.getNavigationBar().setFlightMode(false);
        if (this.inGame.getPostDockingScreen() instanceof StatusScreen) {
            if (this.inGame.getDockingComputerAI().wasActiveSinceLastDock()) {
                alite.getPlayer().addVisitedPlanet();
            } else {
                alite.getPlayer().addVisitedPlanetWithManualDocking();
            }
            try {
                AliteLog.d("[ALITE]", "Performing autosave. [Docked]");
                alite.autoSave();
            } catch (e) {
                AliteLog.e("[ALITE]", "Autosaving commander failed.", e);
            }
        }
        this.inGame.setNewScreen(this.inGame.getPostDockingScreen());
    }

    private isNotPlayerFlying(): boolean {
        return !this.inGame.isPlayerAlive() || AliteGame.get().getPlayer().getCondition() === Condition.DOCKED;
    }

}
