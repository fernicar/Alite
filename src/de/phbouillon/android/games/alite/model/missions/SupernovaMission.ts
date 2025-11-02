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

import { Assets } from "../../Assets";
import { L } from "../../L";
import { SoundManager } from "../../SoundManager";
import { AliteScreen } from "../../screens/canvas/AliteScreen";
import { TradeScreen } from "../../screens/canvas/TradeScreen";
import { SupernovaScreen } from "../../screens/canvas/missions/SupernovaScreen";
import { InGameManager } from "../../screens/opengl/ingame/InGameManager";
import { ObjectSpawnManager } from "../../screens/opengl/ingame/ObjectSpawnManager";
import { TimedEvent } from "../../screens/opengl/ingame/TimedEvent";
import { SphericalSpaceObject } from "../../screens/opengl/objects/SphericalSpaceObject";
import { Timer } from "../../framework/Timer";
import { Equipment } from "../Equipment";
import { Weight } from "../Weight";
import { TradeGood } from "../trading/TradeGood";
import { TradeGoodStore } from "../trading/TradeGoodStore";
import { Mission } from "./Mission";
import { MissionManager } from "./MissionManager";

export class SupernovaMission extends Mission {
    public static readonly ID = 3;

    private timer: Timer | null;

    public constructor() {
        super(SupernovaMission.ID);
    }

    public willStartOnDock(): boolean {
        return !this.started && !MissionManager.getInstance().get(SupernovaMission.ID).isCompleted() && this.checkStart(this.alite.getPlayer());
    }

    public getPreStartEvent(manager: InGameManager): TimedEvent {
        manager.setMessage(L.string("com_fuel_system_malfunction"));
        SoundManager.play(Assets.com_fuelSystemMalfunction);
        const preStartEvent = new TimedEvent(100000000);
        preStartEvent.addAlarmEvent((deltaTime: number) => {
            this.alite.getCobra().setFuel(this.alite.getCobra().getFuel() - 1);
            if (this.alite.getCobra().getFuel() <= 0) {
                preStartEvent.remove();
            }
        });
        return preStartEvent;
    }

    protected acceptMission(accept: boolean): void {
        if (this.state === 1) {
            this.alite.getCobra().clearInventory();
            this.alite.getCobra().setTradeGood(TradeGoodStore.get().getGoodById(TradeGoodStore.UNHAPPY_REFUGEES)!, this.alite.getCobra().getFreeCargo(), 0);
        }
    }

    public onMissionComplete(): void {
        this.alite.getCobra().removeItem(this.alite.getCobra().getInventoryItemByGood(
            TradeGoodStore.get().getGoodById(TradeGoodStore.UNHAPPY_REFUGEES)!));
        this.alite.getCobra().addTradeGood(TradeGoodStore.get().getGoodById(TradeGoodStore.GEM_STONES)!, Weight.kilograms(1), 0);
    }

    public getMissionScreen(): AliteScreen {
        return new SupernovaScreen(0);
    }

    public checkForUpdate(): AliteScreen | null {
        if (this.missionDidNotStart()) {
            return null;
        }
        if (this.state === 1 && !this.positionMatchesTarget()) {
            return new SupernovaScreen(3);
        }
        if (this.state === 2 && !this.positionMatchesTarget()) {
            this.finalizeMission();
        }
        return null;
    }

    public performTrade(tradeScreen: TradeScreen, equipment: Equipment): boolean {
        tradeScreen.showMessageDialog(L.string("mission_supernova_trade"));
        SoundManager.play(Assets.error);
        return true;
    }

    public performTradeWithGood(tradeScreen: TradeScreen, tradeGood: TradeGood): boolean {
        tradeScreen.showMessageDialog(L.string("mission_supernova_trade"));
        SoundManager.play(Assets.error);
        return true;
    }

    public getSpawnEvent(manager: ObjectSpawnManager): TimedEvent | null {
        if ((this.state !== 1 && this.state !== 2) || !this.positionMatchesTarget()) {
            return null;
        }
        const event = new TimedEvent(100000000);
        event.addAlarmEvent((deltaTime: number) => {
            const inGame = manager.getInGameManager();
            const sun = inGame.getSun() as SphericalSpaceObject;
            sun.setNewSize(sun.getRadius() * 1.01);
            const sunGlow = inGame.getSunGlow() as SphericalSpaceObject;
            sunGlow.setNewSize(sun.getRadius() + 400.0);
            if (!this.timer) {
                inGame.setMessage(L.string("mission_supernova_danger"));
                SoundManager.repeat(Assets.criticalCondition);
                this.timer = new Timer();
            } else if (this.timer.hasPassedSeconds(20)) {
                event.remove();
                this.timer = null;
                inGame.gameOver();
            }
        });
        return event;
    }

    public getObjective(): string {
        return L.string("mission_supernova_obj");
    }
}
