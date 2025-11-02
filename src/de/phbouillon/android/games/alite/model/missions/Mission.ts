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

import { Alite } from "../../Alite";
import { L } from "../../L";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { TradeScreen } from "../../screens/canvas/TradeScreen";
import { InGameManager } from "../../screens/opengl/ingame/InGameManager";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { Condition } from "../Condition";
import { Equipment } from "../Equipment";
import { Player } from "../Player";
import { GalaxyGenerator } from "../generator/GalaxyGenerator";
import { SystemData } from "../generator/SystemData";
import { TradeGood } from "../trading/TradeGood";
import { MissionManager } from "./MissionManager";

export enum MissionComplete {
    UNFINISHED, DONE, SKIPPED
}

export abstract class Mission {
    protected active = false;
    protected started = false;
    protected alite: Alite;
    private galaxy: number;
    private targetIndex: number;
    protected state: number;
    private readonly id: number;
    private targetName: string | null = null;
    private complete = MissionComplete.UNFINISHED;

    protected constructor(id: number) {
        this.alite = Alite.get();
        this.id = id;
    }

    protected checkStart(player: Player): boolean {
        return MissionManager.getInstance().get(this.id - 1).isCompleted() &&
            player.getIntergalacticJumpCounterSinceLastMission() + player.getJumpCounterSinceLastMission() >= 64;
    }

    protected abstract acceptMission(accept: boolean): void;

    public onMissionAccept(): void {}
    public onMissionDecline(): void {}

    public missionCompleted(): void {
        this.onMissionComplete();
        this.finalizeMission();
        this.complete = MissionComplete.DONE;
    }

    public finalizeMission(): void {
        this.active = false;
        this.complete = MissionComplete.SKIPPED;
        const player = Alite.get().getPlayer();
        player.resetIntergalacticJumpCounter();
        player.resetJumpCounter();
    }

    protected onMissionComplete(): void {}

    public isCompleted(): boolean {
        return this.complete !== MissionComplete.UNFINISHED;
    }

    public done(): void {
        this.active = false;
        this.complete = MissionComplete.DONE;
    }

    public isDone(): boolean {
        return this.complete === MissionComplete.DONE;
    }

    public onMissionUpdate(): void {}

    public abstract getMissionScreen(): AliteScreen;

    public willStartOnDock(): boolean {
        return false;
    }

    public getId(): number {
        return this.id;
    }

    public missionStarts(): boolean {
        const player = this.alite.getPlayer();
        if (!this.started && !this.active && !this.isCompleted() &&
            player.getCondition() === Condition.DOCKED && this.checkStart(player)) {
            this.active = true;
            this.started = true;
            return true;
        }
        return false;
    }

    protected missionDidNotStart(): boolean {
        return this.alite.getPlayer().getCondition() !== Condition.DOCKED || this.state < 1 || !this.started || !this.active;
    }

    public checkForUpdate(): AliteScreen | null {
        return null;
    }

    public setPlayerAccepts(playerAccepts: boolean): void {
        this.acceptMission(playerAccepts);
        this.active = playerAccepts;
    }

    public isActive(): boolean {
        return this.active;
    }

    public toJson(): any {
        return {
            galaxy: this.galaxy,
            targetIndex: this.targetIndex,
            state: this.state,
            active: this.active,
            started: this.started,
            complete: this.complete,
        };
    }

    public fromJson(m: any): void {
        this.galaxy = m.galaxy;
        this.targetIndex = m.targetIndex;
        this.state = m.state;
        this.targetName = null;
        this.active = m.active;
        this.started = m.started;
        this.complete = m.complete;
    }

    public findMostDistantSystem(): SystemData {
        let maxDist = -1;
        const current = this.alite.getPlayer().getCurrentSystem();
        let target: SystemData | null = null;
        for (const system of this.alite.getGenerator().getSystems()) {
            const dist = current.computeDistance(system);
            if (dist > maxDist) {
                maxDist = dist;
                target = system;
            }
        }
        return target!;
    }

    public findRandomSystemInRange(min: number, max: number): SystemData {
        const candidates: SystemData[] = [];
        const current = this.alite.getPlayer().getCurrentSystem();
        for (const system of this.alite.getGenerator().getSystems()) {
            const dist = current.computeDistance(system);
            if (dist >= min && dist <= max) {
                candidates.push(system);
            }
        }
        if (candidates.length === 0) {
            return this.alite.getGenerator().getSystem(current.getIndex() === 0 ? 1 : 0);
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    public positionMatchesTarget(): boolean {
        if (this.alite.getGenerator().getCurrentGalaxy() !== this.galaxy) {
            return false;
        }
        const currentSystem = this.alite.getPlayer().getCurrentSystem();
        return currentSystem !== null && (this.targetIndex === -1 || this.targetIndex === currentSystem.getIndex());
    }

    public getWitchSpaceSpawnEvent(manager: ObjectSpawnManager): TimedEvent | null { return null; }
    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent | null { return null; }
    public getConditionRedSpawnReplacementEvent(manager: ObjectSpawnManager): TimedEvent | null { return null; }
    public willEnterWitchSpace(): boolean { return false; }
    public getPreStartEvent(manager: InGameManager): TimedEvent | null { return null; }
    public performTrade(tradeScreen: TradeScreen, equipment: Equipment): boolean { return false; }
    public performTradeWithGood(tradeScreen: TradeScreen, tradeGood: TradeGood): boolean { return false; }
    public getViperSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null { return null; }
    public getShuttleSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null { return null; }
    public getAsteroidSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null { return null; }
    public getTraderSpawnReplacementEvent(objectSpawnManager: ObjectSpawnManager): TimedEvent | null { return null; }

    public abstract getObjective(): string;

    public resetStarted(): void {
        this.started = false;
        this.active = false;
        this.complete = MissionComplete.UNFINISHED;
    }

    public setTargetPlanet(target: SystemData, state: number): void {
        this.galaxy = this.alite.getGenerator().getCurrentGalaxy();
        this.targetIndex = target.getIndex();
        this.state = state;
        this.targetName = null;
    }

    public setTargetGalaxy(galaxy: number, state: number): void {
        this.galaxy = galaxy;
        this.targetIndex = -1;
        this.state = state;
        this.targetName = null;
    }

    public resetTargetName(): void {
        this.targetName = null;
    }

    public getTargetName(): string {
        if (this.targetName) {
            return this.targetName;
        }
        if (this.targetIndex !== -1) {
            if (this.alite.getGenerator().getCurrentGalaxy() !== this.galaxy) {
                const gen = new GalaxyGenerator();
                gen.buildGalaxy(this.galaxy);
                this.targetName = gen.getSystem(this.targetIndex).name;
                return this.targetName;
            }
            this.targetName = this.alite.getGenerator().getSystem(this.targetIndex).name;
        } else {
            this.targetName = L.string("mission_unknown_target");
        }
        return this.targetName;
    }

    public getState(): number {
        return this.state;
    }

    public setState(state: number): void {
        this.state = state;
    }
}
