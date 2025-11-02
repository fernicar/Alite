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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { Alite } from "../Alite";
import { L } from "../L";
import { Point } from "../framework/math/Point";
import { GalaxyGenerator } from "./generator/GalaxyGenerator";
import { SystemData } from "./generator/SystemData";
import { Government } from "./generator/enums/Government";
import { MissionManager } from "./missions/MissionManager";
import { AliteMarket } from "./trading/AliteMarket";
import { Market } from "./trading/Market";
import { TradeGoodStore } from "./trading/TradeGoodStore";
import { Condition } from "./Condition";
import { LegalStatus } from "./LegalStatus";
import { PlayerCobra } from "./PlayerCobra";
import { Rating } from "./Rating";
import { Settings } from "../Settings";
import { InventoryItem } from "./InventoryItem";
import { SpaceObject } from "../screens/opengl/objects/space/SpaceObject";
import { EquipmentStore } from "./EquipmentStore";
import { ObjectType } from "../screens/opengl/ingame/ObjectType";
import { InGameManager } from "../screens/opengl/ingame/InGameManager";
import { Unit } from "./Unit";

class PlanetInfo {
    public id: number;
    public government: Government;
    public inhabitantCode: number;
    public isNode: boolean;
    public visitCount: number = 0;
    public lastVisitedTime: number = 0;

    constructor(currentSystem: SystemData);
    constructor(id: number, visitCount: number, lastVisitedTime: number, government: Government, inhabitantCode: number, isNode: boolean);
    constructor(idOrSystem: number | SystemData, visitCount?: number, lastVisitedTime?: number, government?: Government, inhabitantCode?: number, isNode?: boolean) {
        if (idOrSystem instanceof SystemData) {
            const currentSystem = idOrSystem;
            this.id = currentSystem.getId();
            this.government = currentSystem.getGovernment();
            this.inhabitantCode = currentSystem.getInhabitantCode().charAt(SystemData.INHABITANT_INDEX_RACE) === SystemData.INHABITANT_RACE_HUMAN ? 0 : parseInt(currentSystem.getInhabitantCode(), 10);
            currentSystem.computeReachableSystems(Alite.get().getGenerator().getSystems());
            this.isNode = currentSystem.getReachableSystems().length > 15;
            this.revisited();
        } else {
            this.id = idOrSystem;
            this.visitCount = visitCount!;
            this.lastVisitedTime = lastVisitedTime!;
            this.government = government!;
            this.inhabitantCode = inhabitantCode!;
            this.isNode = isNode!;
        }
    }

    public revisited(): void {
        if (this.lastVisitedTime !== 0 && this.lastVisitedTime < Alite.get().getPlayer().getMinLastVisitedTime()) {
            Alite.get().getPlayer().setMinLastVisitedTime(this.lastVisitedTime);
        }
        this.visitCount++;
        this.lastVisitedTime = Date.now();
        if (this.visitCount > Alite.get().getPlayer().getHighestVisitCount()) {
            Alite.get().getPlayer().setHighestVisitCount(this.visitCount);
        }
    }
}

export class Player {
    private static readonly LAVE_INDEX = 7;

    private name: string = L.string("cmdr_default_commander_name");
    private currentSystem: SystemData;
    private hyperspaceSystem: SystemData;
    private condition: Condition = Condition.DOCKED;
    private legalStatus: LegalStatus = LegalStatus.CLEAN;
    private rating: Rating = Rating.HARMLESS;
    private cash: number = 1000;
    private score: number = 0;
    private rank: number = 0;
    private killCount: number = 0;
    private readonly cobra: PlayerCobra = new PlayerCobra();
    private readonly market: Market;
    private legalValue: number = 0;
    private maxLegalValue: number = 0;
    private recidivismCount: number = 0;
    private readonly position: Point = new Point(-1, -1);
    private jumpCounter: number = 0;
    private jumpCounterSinceLastMission: number = 0;
    private intergalacticJumpCounter: number = 0;
    private intergalacticJumpCounterSinceLastMission: number = 0;
    private cheater: boolean = false;
    private readonly visitedPlanets: Map<number, PlanetInfo> = new Map();
    private lastVisitedPlanet: number;
    private highestVisitCount: number = 0;
    private minLastVisitedTime: number = Date.now();
    private manuallyDockedCount: number = 0;
    private tradedAmountInGram: number = 0;
    private maxCash: number = 0;
    private maxGain: number = 0;
    private maxLoss: number = 0;
    private killCountInWitchSpace: number = 0;
    private killCountPirate: number = 0;
    private killCountThargoid: number = 0;
    private killCountThargon: number = 0;
    private killCountAsteroid: number = 0;
    private killCountMissileByLaser: number = 0;
    private killCountMissileByEcm: number = 0;
    private killCountByMissile: number = 0;
    private killCountByMissileJammer: number = 0;
    private killCountByLuckyMissile: number = 0;
    private killCountTrader: number = 0;
    private killCountPolice: number = 0;
    private maxScoreOfEnergyBomb: number = 0;
    private hyperdriveRepairCount: number = 0;
    private cloakingUseCount: number = 0;
    private escapeCapsuleUseCount: number = 0;
    private pauseModes: number = 0;

    constructor() {
        this.market = new AliteMarket();
        const alite = Alite.get();
        alite.getGenerator().buildGalaxy(1);
        this.currentSystem = alite.getGenerator().getSystem(Player.LAVE_INDEX);
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
    public getCurrentSystem(): SystemData { return this.currentSystem; }
    public getHyperspaceSystem(): SystemData { return this.hyperspaceSystem; }
    public setHyperspaceSystem(hyperspaceSystem: SystemData): void { this.hyperspaceSystem = hyperspaceSystem; }

    public setCurrentSystem(currentSystem: SystemData | null): void {
        this.currentSystem = currentSystem!;
        if (currentSystem) {
            this.market.setFluct(Math.floor(Math.random() * 256));
            this.market.setSystem(currentSystem);
            this.market.generate();
        }
    }

    public getCondition(): Condition { return this.condition; }

    public setCondition(newCondition: Condition): void {
        if (this.condition === Condition.DOCKED && newCondition === Condition.RED) {
            return;
        }
        this.condition = newCondition;
        if (this.condition !== Condition.GREEN && this.condition !== Condition.YELLOW) {
            Alite.get().setTimeFactor(1);
        }
    }

    public increaseAlertLevel(): void {
        if (this.condition === Condition.GREEN) {
            this.condition = Condition.YELLOW;
        } else if (this.condition === Condition.YELLOW) {
            this.condition = Condition.RED;
        }
    }

    public decreaseAlertLevel(): void {
        if (this.condition === Condition.RED) {
            this.condition = Condition.YELLOW;
        } else if (this.condition === Condition.YELLOW) {
            this.condition = Condition.GREEN;
        }
    }

    public getLegalStatus(): LegalStatus { return this.legalStatus; }
    public setLegalStatus(legalStatus: LegalStatus): void { this.legalStatus = legalStatus; }
    public getRating(): Rating { return this.rating; }
    public setRating(rating: Rating): void { this.rating = rating; }
    public getCash(): number { return this.cash; }

    public setCash(newCash: number): void {
        this.cash = newCash;
        if (this.cash > this.maxCash) {
            this.maxCash = this.cash;
        }
    }

    public getRank(): number {
        const newRank = this.score === 0 ? 0 : Settings.maxGalaxies === GalaxyGenerator.EXTENDED_GALAXY_COUNT ? 11 :
            this.isPlanetVisited(SystemData.RAXXLA_SYSTEM.getId()) ? 10 : this.rating.ordinal() + 1;
        if (newRank > this.rank) {
            this.rank = newRank;
        }
        return this.rank;
    }

    public getTradedAmountInTonne(): number { return Math.floor(this.tradedAmountInGram / Unit.TONNE.getValue()); }
    public getMaxCash(): number { return this.maxCash / 10; }
    public getMaxGain(): number { return this.maxGain / 10; }
    public getMaxLoss(): number { return this.maxLoss / 10; }
    public getMarket(): Market { return this.market; }

    public trade(item: InventoryItem, price: number): void {
        item.getGood().setTraded();
        this.cobra.removeItem(item);
        this.setCash(this.cash + price);
        const gain = price - item.getPrice();
        if (gain >= 0) {
            this.maxGain = Math.max(this.maxGain, gain);
        } else {
            this.maxLoss = Math.max(this.maxLoss, -gain);
        }
        this.tradedAmountInGram += item.getWeight().getWeightInGrams();
    }

    public getScore(): number { return this.score; }
    public setScore(score: number): void { this.score = score; }

    public increaseKillCount(destroyedObject: SpaceObject, destroyedByEquipment: string, cloaked: boolean): void {
        if (destroyedObject.getScore() > 0) {
            this.killCount++;
        }

        if (destroyedObject.getType() === ObjectType.Missile) {
            if (EquipmentStore.PULSE_LASER === destroyedByEquipment) {
                this.killCountMissileByLaser++;
                return;
            }
            if (EquipmentStore.ECM_SYSTEM === destroyedByEquipment) {
                this.killCountMissileByEcm++;
            }
            return;
        }

        if (EquipmentStore.MISSILES === destroyedByEquipment || EquipmentStore.ECM_JAMMER === destroyedByEquipment) {
            this.killCountByMissile++;
            if (destroyedObject.hasEcm()) {
                if (EquipmentStore.ECM_JAMMER === destroyedByEquipment) {
                    this.killCountByMissileJammer++;
                } else {
                    this.killCountByLuckyMissile++;
                }
            }
        }

        switch (destroyedObject.getType()) {
            case ObjectType.Pirate:
                this.killCountPirate++;
                if (cloaked && EquipmentStore.PULSE_LASER === destroyedByEquipment) {
                    this.cloakingUseCount++;
                }
                break;
            case ObjectType.Thargoid:
                this.killCountThargoid++;
                if (cloaked && EquipmentStore.PULSE_LASER === destroyedByEquipment) {
                    this.cloakingUseCount++;
                }
                break;
            case ObjectType.Thargon:
                this.killCountThargon++;
                if (cloaked && EquipmentStore.PULSE_LASER === destroyedByEquipment) {
                    this.cloakingUseCount++;
                }
                break;
            case ObjectType.Asteroid:
                this.killCountAsteroid++;
                break;
            case ObjectType.Trader:
                this.killCountTrader++;
                break;
            case ObjectType.Police:
                this.killCountPolice++;
                break;
        }
    }

    public setKillCount(killCount: number): void { this.killCount = killCount; }
    public getKillCount(): number { return this.killCount; }

    public increaseKillCountInWitchSpace(amount: number): void {
        this.killCountInWitchSpace += amount;
        this.hyperdriveRepairCount++;
    }

    public getKillCountInWitchSpace(): number { return this.killCountInWitchSpace; }
    public getKillCountPirate(): number { return this.killCountPirate; }
    public getKillCountTrader(): number { return this.killCountTrader; }
    public getKillCountPolice(): number { return this.killCountPolice; }
    public getKillCountThargoid(): number { return this.killCountThargoid; }
    public getKillCountThargon(): number { return this.killCountThargon; }
    public getKillCountAsteroid(): number { return this.killCountAsteroid; }
    public getKillCountMissileByLaser(): number { return this.killCountMissileByLaser; }
    public getKillCountMissileByEcm(): number { return this.killCountMissileByEcm; }
    public getKillCountByMissile(): number { return this.killCountByMissile; }
    public getKillCountByMissileJammer(): number { return this.killCountByMissileJammer; }
    public getKillCountByLuckyMissile(): number { return this.killCountByLuckyMissile; }

    public setScoreOfEnergyBomb(scoreOfEnergyBomb: number): void {
        if (scoreOfEnergyBomb > this.maxScoreOfEnergyBomb) {
            this.maxScoreOfEnergyBomb = scoreOfEnergyBomb;
        }
    }

    public getMaxScoreOfEnergyBomb(): number { return this.maxScoreOfEnergyBomb; }
    public getHyperdriveRepairCount(): number { return this.hyperdriveRepairCount; }
    public getManuallyDockedCount(): number { return this.manuallyDockedCount; }
    public getCloakingUseCount(): number { return this.cloakingUseCount; }

    public increaseEscapeCapsuleUse(): void { this.escapeCapsuleUseCount++; }
    public getEscapeCapsuleUseCount(): number { return this.escapeCapsuleUseCount; }

    public setResumedFromPause(): void { this.pauseModes |= 1; }
    public setResumedFromAppSwitch(): void { this.pauseModes |= 2; }
    public getPauseModes(): number { return this.pauseModes; }

    public setLegalValueByContraband(legalityType: number, buyAmount: number): void {
        if (Math.random() * 100 < this.getLegalProblemLikelihoodInPercent()) {
            this.setLegalValue(this.legalValue + Math.floor(legalityType * buyAmount));
        }
    }

    public setLegalValue(legalValue: number): void {
        legalValue = legalValue < 0 ? 0 : Math.min(legalValue, 255);
        if (legalValue === 0) {
            if (this.legalValue > 0 && this.recidivismCount % 2 === 1) {
                this.recidivismCount++;
            }
            this.setLegalStatus(LegalStatus.CLEAN);
        } else if (legalValue < 32) {
            this.setLegalStatus(LegalStatus.OFFENDER);
        } else {
            if (this.legalValue < 32 && this.recidivismCount % 2 === 0) {
                this.recidivismCount++;
            }
            this.setLegalStatus(LegalStatus.FUGITIVE);
        }
        if (legalValue > this.maxLegalValue) {
            this.maxLegalValue = legalValue;
        }
        this.legalValue = legalValue;
    }

    public getLegalValue(): number { return this.legalValue; }
    public getMaxLegalValue(): number { return this.maxLegalValue; }
    public getRecidivismCount(): number { return this.recidivismCount / 2; }

    public setPosition(px: number, py: number): void {
        this.position.x = px;
        this.position.y = py;
    }

    public getPosition(): Point { return this.position; }

    public computeDistance(): number {
        return this.currentSystem ? this.hyperspaceSystem.computeDistance(this.currentSystem) :
            SystemData.computeDistance(this.position.x, this.position.y, this.hyperspaceSystem.getX(), this.hyperspaceSystem.getY());
    }

    public increaseJumpCounter(): void {
        this.jumpCounter++;
        this.jumpCounterSinceLastMission++;
    }

    public resetJumpCounter(): void { this.jumpCounterSinceLastMission = 0; }
    public getJumpCounterSinceLastMission(): number { return this.jumpCounterSinceLastMission; }
    public getJumpCounter(): number { return this.jumpCounter; }
    public setJumpCounter(counter: number): void { this.jumpCounterSinceLastMission = counter; }

    public increaseIntergalacticJumpCounter(): void {
        this.intergalacticJumpCounter++;
        this.intergalacticJumpCounterSinceLastMission++;
    }

    public resetIntergalacticJumpCounter(): void { this.intergalacticJumpCounterSinceLastMission = 0; }
    public setIntergalacticJumpCounter(counter: number): void {
        this.intergalacticJumpCounter = counter;
        this.intergalacticJumpCounterSinceLastMission = counter;
    }

    public getIntergalacticJumpCounter(): number { return this.intergalacticJumpCounter; }
    public setIntergalacticJumpCounterSinceLastMission(counter: number): void { this.intergalacticJumpCounterSinceLastMission = counter; }
    public getIntergalacticJumpCounterSinceLastMission(): number { return this.intergalacticJumpCounterSinceLastMission; }
    public setCheater(b: boolean): void { this.cheater = b; }

    public getLegalProblemLikelihoodInPercent(): number {
        if (!this.currentSystem) {
            return 0;
        }
        switch (this.currentSystem.getGovernment()) {
            case Government.ANARCHY: return 0;
            case Government.FEUDAL: return 10;
            case Government.MULTI_GOVERNMENT: return 20;
            case Government.DICTATORSHIP: return 40;
            case Government.COMMUNIST: return 60;
            case Government.CONFEDERACY: return 80;
            case Government.DEMOCRACY: return 100;
            case Government.CORPORATE_STATE: return 100;
        }
        return 0;
    }

    // ... (rest of the methods would be converted similarly)
}
