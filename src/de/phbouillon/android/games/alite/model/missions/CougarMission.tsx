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

import { IMethodHook } from "../../../framework/IMethodHook";
import { L } from "../../L";
import { EquipmentStore } from "../EquipmentStore";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { CougarScreen } from "../../screens/canvas/missions/CougarScreen";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { ObjectType } from "../../screens/opengl/ingame/ObjectType";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { SpaceObject } from "../../screens/opengl/objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../screens/opengl/objects/space/SpaceObjectFactory";
import { Mission } from "./Mission";

export class CougarMission extends Mission {
    private static readonly serialVersionUID = 5999402243478935543;

    public static readonly ID = 4;

    constructor() {
        super(CougarMission.ID);
    }

    protected acceptMission(accept: boolean): void {
        // The player can't decline this mission...
        this.state = 1;
    }

    public getMissionScreen(): AliteScreen {
        return new CougarScreen(0);
    }

    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent {
        if (this.state !== 1 || this.positionMatchesTarget()) {
            return null;
        }
        const event = new TimedEvent(4_000_000_000);
        return event.addAlarmEvent({
            execute: (deltaTime: number) => {
                manager.lockConditionRedEvent();
                event.remove();
                manager.conditionRed();
                const cougar = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Cougar);
                const asp1 = SpaceObjectFactory.getInstance().getObjectById("asp_mk_ii");
                const asp2 = SpaceObjectFactory.getInstance().getObjectById("asp_mk_ii");
                manager.spawnEnemyAndAttackPlayer(asp1, cougar, asp2);
                cougar.addDestructionCallback({
                    execute: (deltaTime: number) => {
                        const cargo = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.CargoPod);
                        cargo.setSpecialCargoContent(EquipmentStore.get().getEquipmentById(EquipmentStore.CLOAKING_DEVICE));
                        cargo.addDestructionCallback({
                            execute: (deltaTime: number) => {
                                if (this.alite.getCobra().isEquipmentInstalled(
                                    EquipmentStore.get().getEquipmentById(EquipmentStore.CLOAKING_DEVICE))) {
                                    this.missionCompleted();
                                }
                            }
                        });
                        manager.spawnTumbleObject(cargo, cougar.getPosition());
                        manager.unlockConditionRedEvent();
                    }
                });
            }
        });
    }

    public getObjective(): string {
        return L.string("mission_cougar_obj");
    }
}
