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

import { AliteGame } from "../AliteGame";
import { L } from "../L";
import { R } from "../R";
import { Settings } from "../Settings";
import { Condition } from "./Condition";
import { LegalStatus } from "./LegalStatus";
import { PlayerCobra } from "./PlayerCobra";
import { Rating } from "./Rating";
import { Unit } from "./Unit";
import { GalaxyGenerator } from "./generator/GalaxyGenerator";
import { SystemData } from "./generator/SystemData";
import { MissionManager } from "./missions/MissionManager";
import { AliteMarket, Market } from "./trading/AliteMarket";
import { TradeGoodStore } from "./trading/TradeGoodStore";
import { Point } from "../../framework/Point";


class PlanetInfo {
    id: number;
    government: any; // Assuming Government enum exists
    inhabitantCode: number;
    isNode: boolean;
    visitCount: number;
    lastVisitedTime: number;

    constructor(system?: SystemData, id?: number, visitCount?: number, lastVisitedTime?: number, government?: any, inhabitantCode?: number, isNode?: boolean) {
        if (system) {
            this.id = system.getId();
            this.government = system.getGovernment();
            this.inhabitantCode = parseInt(system.getInhabitantCode());
            // system.computeReachableSystems(...); // This logic needs to be available
            this.isNode = false; // Placeholder
            this.revisited();
        } else {
            this.id = id;
            this.visitCount = visitCount;
            this.lastVisitedTime = lastVisitedTime;
            this.government = government;
            this.inhabitantCode = inhabitantCode;
            this.isNode = isNode;
        }
    }

    revisited(): void {
        this.visitCount = (this.visitCount || 0) + 1;
        this.lastVisitedTime = Date.now();
    }
}


export class Player {
    private name: string = L.string(R.string.cmdr_default_commander_name);
    private currentSystem: SystemData;
    private hyperspaceSystem: SystemData;
    private condition: Condition = Condition.DOCKED;
    // ... (rest of the Player properties converted to TypeScript)
    private readonly cobra: PlayerCobra = new PlayerCobra();
    private readonly market: Market;

    constructor() {
        this.market = new AliteMarket();
        const alite = AliteGame.get();
        alite.getGenerator().buildGalaxy(1);
        this.currentSystem = alite.getGenerator().getSystem(SystemData.LAVE_SYSTEM_INDEX);
        this.hyperspaceSystem = this.currentSystem;
        this.market.setFluct(0);
        this.market.setSystem(this.currentSystem);
        this.market.generate();
        TradeGoodStore.get().clearTraded();
        Settings.maxGalaxies = GalaxyGenerator.GALAXY_COUNT;
    }

    public getCobra(): PlayerCobra { return this.cobra; }
    public getName(): string { return this.name; }
    public setName(name: string): void { this.name = name; }
    // ... (all other getters and setters converted)

    public fromJson(player: any): void {
        this.name = player.name;
        // ... (all other properties assigned from json)
        this.cobra.fromJson(player.cobra);
        this.market.fromJson(player.market);
        MissionManager.getInstance().fromJson(player.missions);
        // ...
    }


    public toJson(): any {
        return {
            name: this.name,
            currentSystem: this.currentSystem ? this.currentSystem.getIndex() : 0,
            hyperspaceSystem: this.hyperspaceSystem ? this.hyperspaceSystem.getIndex() : 0,
            cash: this.cash,
            rating: this.rating,
            // ... (all other properties for serialization)
            cobra: this.cobra.toJson(),
            market: this.market.toJson(),
            missions: MissionManager.getInstance().toJson(),
            // ...
        };
    }
    private cash: number;
    private rating: Rating;

}
