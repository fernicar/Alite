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
import { Player } from "../Player";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { ConstrictorScreen } from "../../screens/canvas/missions/ConstrictorScreen";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { ObjectType } from "../../screens/opengl/ingame/ObjectType";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { SpaceObject } from "../../screens/opengl/objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../screens/opengl/objects/space/SpaceObjectFactory";
import { Mission } from "./Mission";

export class ConstrictorMission extends Mission {
    private static readonly serialVersionUID = -5769172780079332330;

    public static readonly ID = 1;

    constructor() {
        super(ConstrictorMission.ID);
    }

    protected checkStart(player: Player): boolean {
        return player.getIntergalacticJumpCounter() > 0 &&
            player.getIntergalacticJumpCounterSinceLastMission() + player.getJumpCounterSinceLastMission() >= 64;
    }

    protected acceptMission(accept: boolean): void {
        if (accept) {
            this.state = 1;
            this.resetTargetName();
        } else {
            this.finalizeMission();
        }
    }

    public onMissionComplete(): void {
        this.alite.getPlayer().setCash(this.alite.getPlayer().getCash() + 100000);
    }

    public getMissionScreen(): AliteScreen {
        return new ConstrictorScreen(0);
    }

    public checkForUpdate(): AliteScreen {
        if (this.missionDidNotStart() || !this.positionMatchesTarget()) {
            return null;
        }
        if (this.state === 1) {
            return new ConstrictorScreen(2);
        }
        if (this.state >= 2 && this.state <= 5) {
            return new ConstrictorScreen(3);
        }
        if (this.state === 6) {
            // Player arrived at target, but _did not destroy_ the Constrictor...
            // Try again...
            this.state--;
            return new ConstrictorScreen(3);
        }
        if (this.state === 7) {
            return new ConstrictorScreen(4);
        }
        return null;
    }

    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent {
        const result = this.positionMatchesTarget();
        if (this.state !== 6 || !result) {
            return null;
        }
        const event = new TimedEvent(0);
        return event.addAlarmEvent({
            execute: (deltaTime: number) => {
                event.remove();
                manager.conditionRed();
                const constrictor = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Constrictor);
                manager.spawnEnemyAndAttackPlayer(constrictor);
                manager.lockConditionRedEvent();
                constrictor.addDestructionCallback({
                    execute: (deltaTime: number) => {
                        this.state = 7;
                        manager.unlockConditionRedEvent();
                    }
                });
            }
        });
    }

    public getObjective(): string {
        if (this.state === 2) {
            return L.string("mission_constrictor_obj_jump");
        }
        if (this.state >= 1 && this.state <= 6) {
            return L.string("mission_constrictor_obj_fly", this.getTargetName());
        }
        return "";
    }
}
