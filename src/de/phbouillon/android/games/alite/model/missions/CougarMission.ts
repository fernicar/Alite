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
import { CougarScreen } from "../../screens/canvas/missions/CougarScreen";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { ObjectType } from "../../screens/opengl/ingame/ObjectType";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { SpaceObjectFactory } from "../../screens/opengl/objects/space/SpaceObjectFactory";
import { EquipmentStore } from "../EquipmentStore";
import { Mission } from "./Mission";

export class CougarMission extends Mission {
    public static readonly ID = 4;

    public constructor() {
        super(CougarMission.ID);
    }

    protected acceptMission(accept: boolean): void {
        this.state = 1;
    }

    public getMissionScreen(): AliteScreen {
        return new CougarScreen(0);
    }

    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent | null {
        if (this.state !== 1 || this.positionMatchesTarget()) {
            return null;
        }
        const event = new TimedEvent(4000000000);
        event.addAlarmEvent((deltaTime: number) => {
            manager.lockConditionRedEvent();
            event.remove();
            manager.conditionRed();
            const cougar = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Cougar);
            const asp1 = SpaceObjectFactory.getInstance().getObjectById("asp_mk_ii");
            const asp2 = SpaceObjectFactory.getInstance().getObjectById("asp_mk_ii");
            manager.spawnEnemyAndAttackPlayer(asp1, cougar, asp2);
            cougar.addDestructionCallback((dt: number) => {
                const cargo = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.CargoPod);
                cargo.setSpecialCargoContent(EquipmentStore.get().getEquipmentById(EquipmentStore.CLOAKING_DEVICE)!);
                cargo.addDestructionCallback((d: number) => {
                    if (this.alite.getCobra().isEquipmentInstalled(
                        EquipmentStore.get().getEquipmentById(EquipmentStore.CLOAKING_DEVICE)!)) {
                        this.missionCompleted();
                    }
                });
                manager.spawnTumbleObject(cargo, cougar.getPosition());
                manager.unlockConditionRedEvent();
            });
        });
        return event;
    }

    public getObjective(): string {
        return L.string("mission_cougar_obj");
    }
}
