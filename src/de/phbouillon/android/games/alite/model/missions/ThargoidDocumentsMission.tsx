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
import { Weight } from "../Weight";
import { TradeGoodStore } from "../trading/TradeGoodStore";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { ThargoidDocumentsScreen } from "../../screens/canvas/missions/ThargoidDocumentsScreen";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { Mission } from "./Mission";

export class ThargoidDocumentsMission extends Mission {
    private static readonly serialVersionUID = 7271967050611429726;

    public static readonly ID = 2;

    private conditionRedEvent: TimedEvent;

    constructor() {
        super(ThargoidDocumentsMission.ID);
    }

    protected acceptMission(accept: boolean): void {
        if (accept) {
            this.alite.getCobra().setMissiles(4);
            this.alite.getCobra().setFuel(this.alite.getCobra().getMaxFuel());
            this.alite.getCobra().setTradeGood(TradeGoodStore.get().getGoodById(TradeGoodStore.THARGOID_DOCUMENTS), Weight.grams(482), 0);
            this.state = 1;
            this.resetTargetName();
        } else {
            this.finalizeMission();
        }
    }

    public onMissionComplete(): void {
        this.alite.getCobra().removeItem(this.alite.getCobra().getInventoryItemByGood(
            TradeGoodStore.get().getGoodById(TradeGoodStore.THARGOID_DOCUMENTS)));
        this.alite.getCobra().removeEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.EXTRA_ENERGY_UNIT));
        this.alite.getCobra().addEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.NAVAL_ENERGY_UNIT));
    }

    public getMissionScreen(): AliteScreen {
        return new ThargoidDocumentsScreen(0);
    }

    public checkForUpdate(): AliteScreen {
        return this.missionDidNotStart() || this.state !== 1 || !this.positionMatchesTarget() ? null :
            new ThargoidDocumentsScreen(2);
    }

    private spawnThargoids(manager: ObjectSpawnManager): void {
        if (manager.isInTorus()) {
            if (Math.floor(Math.random() * 256) < 32) {
                return;
            }
            manager.leaveTorus();
        }
        manager.conditionRed();
        this.conditionRedEvent.pause();
        manager.spawnThargoids(this.alite.getPlayer().getRating() < 3 ? 1 : Math.random() < 0.5 ? 1 : 2);
    }

    public getConditionRedSpawnReplacementEvent(manager: ObjectSpawnManager): TimedEvent {
        this.conditionRedEvent = new TimedEvent((2 << 9) / 16.7 * 1_000_000_000);
        return this.conditionRedEvent.addAlarmEvent({
            execute: (deltaTime: number) => {
                this.spawnThargoids(manager);
            }
        });
    }

    public willEnterWitchSpace(): boolean {
        return Math.random() <= 0.15;
    }

    public getObjective(): string {
        return L.string("mission_thargoid_documents_obj", this.getTargetName());
    }
}
