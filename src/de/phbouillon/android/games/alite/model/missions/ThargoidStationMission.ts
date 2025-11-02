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

import { L } from "../../L";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { ThargoidStationScreen } from "../../screens/canvas/missions/ThargoidStationScreen";
import { InGameManager } from "../../screens/opengl/ingame/InGameManager";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { ObjectType } from "../../screens/opengl/ingame/ObjectType";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { AiStateCallbackHandler } from "../../screens/opengl/objects/space/AiStateCallbackHandler";
import { SpaceObject } from "../../screens/opengl/objects/space/SpaceObject";
import { SpaceObjectAI } from "../../screens/opengl/objects/space/SpaceObjectAI";
import { SpaceObjectFactory } from "../../screens/opengl/objects/space/SpaceObjectFactory";
import { EquipmentStore } from "../EquipmentStore";
import { Mission } from "./Mission";

class LaunchThargoidFromStationEvent extends TimedEvent {
    constructor(spawnManager: ObjectSpawnManager, delayInNanoSeconds: number, numberOfThargoidsToSpawn: number) {
        super(delayInNanoSeconds);
        this.addAlarmEvent((deltaTime: number) => {
            if (numberOfThargoidsToSpawn === 0 || this.mission.state !== 2) {
                return;
            }
            const thargoid = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Thargoid);
            spawnManager.launchFromBay(thargoid, (so: SpaceObject) => {
                thargoid.setUpdater(null);
                thargoid.setInBay(false);
                thargoid.setIgnoreSafeZone();
                thargoid.setAIState(SpaceObjectAI.AI_STATE_ATTACK);
            });
        });
    }
}

export class ThargoidStationMission extends Mission {
    public static readonly ID = 5;
    public static readonly ALIEN_SPACE_STATION = "Alien Space Station";

    private conditionRedEvent: TimedEvent;

    public constructor() {
        super(ThargoidStationMission.ID);
    }

    protected acceptMission(accept: boolean): void {
        this.state = 1;
    }

    public onMissionComplete(): void {
        this.alite.getCobra().addEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.ECM_JAMMER));
    }

    public getMissionScreen(): AliteScreen {
        return new ThargoidStationScreen(0);
    }

    public checkForUpdate(): AliteScreen | null {
        return this.missionDidNotStart() || this.state !== 3 ? null : new ThargoidStationScreen(1);
    }

    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent | null {
        const result = this.positionMatchesTarget();
        if (this.state === 1 && !result) {
            this.state = 2;
            return null;
        }
        if (this.state !== 2 || !result) {
            return null;
        }
        const event = new TimedEvent(10000000000);
        event.addAlarmEvent((deltaTime: number) => {
            const station = manager.getInGameManager().getStation();
            station.setId(ThargoidStationMission.ALIEN_SPACE_STATION);
            station.setName("thargoid_station_name");
            station.setHullStrength(1024);
            station.denyAccess();
            station.addDestructionCallback((dt: number) => {
                manager.getInGameManager().setStation(null);
                this.state = 3;
            });
            event.remove();
        });
        return event;
    }

    private spawnThargoids(manager: ObjectSpawnManager): void {
        if (manager.isInTorus()) {
            manager.leaveTorus();
        }
        manager.conditionRed();
        this.conditionRedEvent.pause();
        manager.spawnThargoids(this.alite.getPlayer().getRating().ordinal() < 3 ? 1 : Math.random() < 0.5 ? 2 : 3);
    }

    public getConditionRedSpawnReplacementEvent(manager: ObjectSpawnManager): TimedEvent | null {
        if (this.state !== 2) {
            return null;
        }
        this.conditionRedEvent = new TimedEvent((2 << 9) / 16.7 * 1000000000);
        this.conditionRedEvent.addAlarmEvent((deltaTime: number) => {
            this.spawnThargoids(manager);
        });
        return this.conditionRedEvent;
    }

    public getViperSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null {
        return this.state === 2 && InGameManager.playerInSafeZone && this.positionMatchesTarget() ?
            new LaunchThargoidFromStationEvent(objectSpawnManager,
                objectSpawnManager.getDelayToViperEncounter(), 0) : null;
    }

    public getShuttleSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null {
        return this.state === 2 && InGameManager.playerInSafeZone && this.positionMatchesTarget() ?
            new LaunchThargoidFromStationEvent(objectSpawnManager,
                objectSpawnManager.getDelayToShuttleEncounter(), 0) : null;
    }

    public getTraderSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null {
        return this.state === 2 && this.positionMatchesTarget() ? new LaunchThargoidFromStationEvent(objectSpawnManager,
            objectSpawnManager.getDelayToViperEncounter(), 1) : null;
    }

    public getObjective(): string {
        return L.string("mission_thargoid_station_obj", this.getTargetName());
    }
}
