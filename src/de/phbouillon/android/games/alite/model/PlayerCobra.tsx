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

import { Settings } from "../Settings";
import { Equipment } from "./Equipment";
import { EquipmentStore } from "./EquipmentStore";
import { InventoryItem } from "./InventoryItem";
import { Unit } from "./Unit";
import { Weight } from "./Weight";
import { TradeGood } from "./trading/TradeGood";
import { TradeGoodStore } from "./trading/TradeGoodStore";


export class PlayerCobra {
    public static readonly DIR_FRONT = 0;
    public static readonly DIR_RIGHT = 1;
    public static readonly DIR_REAR = 2;
    public static readonly DIR_LEFT = 3;

    public static readonly MAXIMUM_MISSILES = 4;
    public static readonly DEFAULT_MISSILES = 3;
    public static readonly SPEED_UP_FACTOR = 10;
    public static readonly MAX_SPEED = 367.4;
    public static readonly TORUS_SPEED = 33400.0;
    public static readonly TORUS_TEST_SPEED = 10000.0;
    public static readonly MAX_SHIELD = 24;
    public static readonly MAX_FUEL = 70;
    public static readonly MAX_CABIN_TEMPERATURE = 30;
    public static readonly MAX_LASER_TEMPERATURE = 210;
    public static readonly MAX_ALTITUDE = 30;
    public static readonly MAX_ENERGY_BANK = 24;
    public static readonly MAX_ENERGY = 96;

    private fuel = PlayerCobra.MAX_FUEL;
    private missiles = PlayerCobra.DEFAULT_MISSILES;
    private readonly lasers: Equipment[] = [EquipmentStore.get().getEquipmentById(EquipmentStore.PULSE_LASER), null, null, null];
    private readonly equipmentInstalled: Equipment[] = [];
    private maxCargoHold: Weight = Weight.tonnes(20);
    private readonly inventory: InventoryItem[] = [];
    private retroRocketsUseCount: number;
    private retroRocketsTotalCount: number;

    private frontShield = PlayerCobra.MAX_SHIELD;
    private rearShield = PlayerCobra.MAX_SHIELD;
    private readonly energyBank: number[] = [PlayerCobra.MAX_ENERGY_BANK, PlayerCobra.MAX_ENERGY_BANK, PlayerCobra.MAX_ENERGY_BANK, PlayerCobra.MAX_ENERGY_BANK];
    private laserTemperature: number;
    private cabinTemperature: number;
    private altitude = PlayerCobra.MAX_ALTITUDE;
    private pitch: number;
    private roll: number;
    private missileLocked = false;
    private missileTargeting = false;
    private laserOverheated: boolean;
    private travelledDistance: number;
    private collisionAmount: number;
    private hitByMissileCount: number;
    private hitBySpaceStationCount: number;
    private hitByLaserAmount: number;
    private scoopAmount: number;
    private scoopedTonnePlatlet: number;
    private scoopedTonneAlien: number;
    private scoopedTonneEscapeCapsule: number;
    private ejectedAmount: number;
    private wasLowEnergy: boolean;
    private lowEnergyCount: number;
    private maxEquipments: number;
    private scoopedFuel: number;

    public setLaser(where: number, laser: Equipment): void {
        this.lasers[where] = laser;
        this.setMaxEquipments();
    }

    public getLaser(where: number): Equipment {
        return this.lasers[where];
    }

    public addTradeGood(good: TradeGood, weight: Weight, price: number): InventoryItem {
        const item = this.getItem(good);
        item.add(weight, price);
        return item;
    }

    private getItem(good: TradeGood): InventoryItem {
        let item = this.getInventoryItemByGood(good);
        if (item === null) {
            item = new InventoryItem(good);
            this.inventory.push(item);
        }
        return item;
    }

    public setTradeGood(good: TradeGood, weight: Weight, price: number): InventoryItem {
        const item = this.getItem(good);
        item.set(weight, price);
        return item;
    }

    public removeItem(item: InventoryItem): void {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
        }
    }


    public addEquipment(equip: Equipment): void {
        if (equip === null || this.equipmentInstalled.includes(equip)) {
            return;
        }
        this.equipmentInstalled.push(equip);
        if (equip === EquipmentStore.get().getEquipmentById(EquipmentStore.LARGE_CARGO_BAY)) {
            this.maxCargoHold = Weight.tonnes(35);
        }
        this.setMaxEquipments();
    }

    private setMaxEquipments(): void {
        const count = this.getLaserCount(PlayerCobra.DIR_FRONT) + this.getLaserCount(PlayerCobra.DIR_RIGHT) +
            this.getLaserCount(PlayerCobra.DIR_REAR) + this.getLaserCount(PlayerCobra.DIR_LEFT) +
            this.equipmentInstalled.length;
        if (count > this.maxEquipments) {
            this.maxEquipments = count;
        }
    }

    private getLaserCount(where: number): number {
        return this.lasers[where] === null ? 0 : 1;
    }

    public removeEquipment(equip: Equipment): void {
        const index = this.equipmentInstalled.indexOf(equip);
        if (index > -1) {
            this.equipmentInstalled.splice(index, 1);
            if (equip === EquipmentStore.get().getEquipmentById(EquipmentStore.LARGE_CARGO_BAY)) {
                this.maxCargoHold = Weight.tonnes(20);
            }
        }
    }

    public clearEquipment(): void {
        this.equipmentInstalled.length = 0;
        this.maxCargoHold = Weight.tonnes(20);
        this.lasers[0] = EquipmentStore.get().getEquipmentById(EquipmentStore.PULSE_LASER);
        for (let i = 1; i < 4; i++) {
            this.lasers[i] = null;
        }
    }

    public isEquipmentInstalled(equip: Equipment): boolean {
        return this.equipmentInstalled.includes(equip);
    }

    public getInstalledEquipment(): Equipment[] {
        return this.equipmentInstalled;
    }

    public getInstalledLosableEquipment(): Equipment[] {
        return this.equipmentInstalled.filter(e => e.canBeLost());
    }

    public getFreeCargo(): Weight {
        let freeCargo = this.maxCargoHold;
        for (const i of this.inventory) {
            freeCargo = freeCargo.sub(i.getWeight());
        }
        return freeCargo;
    }

    public getInventory(): InventoryItem[] {
        return this.inventory;
    }

    public hasCargo(): boolean {
        return this.inventory.length > 0;
    }

    public getInventoryItemByGood(good: TradeGood): InventoryItem {
        for (const item of this.inventory) {
            if (item.getGood() === good) {
                return item;
            }
        }
        return null;
    }

    public clearInventory(): void {
        this.inventory.length = 0;
    }

    public getMissiles(): number {
        return this.missiles;
    }

    public setMissiles(newMissileCount: number): void {
        this.missiles = Math.min(PlayerCobra.MAXIMUM_MISSILES, newMissileCount);
    }

    public getFuel(): number {
        return this.fuel;
    }

    public getMaxFuel(): number {
        return PlayerCobra.MAX_FUEL;
    }

    public setFuel(newFuel: number): void {
        if (newFuel < 0) {
            newFuel = 0;
        }
        this.fuel = newFuel;
    }

    public consumeFuel(distance: number): void {
        this.travelledDistance += distance;
        this.setFuel(this.fuel - (distance === 0 ? 1 : distance));
    }

    public getTravelledDistance(): number {
        return this.travelledDistance / 10;
    }

    public addCollision(amount: number): void {
        this.collisionAmount += amount;
    }

    public getCollisionAmount(): number {
        return this.collisionAmount;
    }

    public increaseHitByMissile(): void {
        this.hitByMissileCount++;
    }

    public getHitByMissileCount(): number {
        return this.hitByMissileCount;
    }

    public addHitByLaser(amount: number): void {
        this.hitByLaserAmount += amount;
    }

    public getHitByLaserAmount(): number {
        return this.hitByLaserAmount;
    }

    public increaseHitBySpaceStation(): void {
        this.hitBySpaceStationCount++;
    }

    public getHitBySpaceStationCount(): number {
        return this.hitBySpaceStationCount;
    }

    public changeScoopEjectCount(goodId: number, totalAmount: number, realAmount: number, specWeight: number): void {
        this.scoopAmount += realAmount;
        switch (goodId) {
            case TradeGoodStore.ALLOYS:
                this.scoopedTonnePlatlet += specWeight;
                break;
            case TradeGoodStore.ALIEN_ITEMS:
                this.scoopedTonneAlien += specWeight;
                break;
            case TradeGoodStore.SLAVES:
                this.scoopedTonneEscapeCapsule += specWeight;
                break;
        }
        this.ejectedAmount += totalAmount + realAmount;
    }


    public getScoopAmount(): number {
        return this.scoopAmount / Unit.TONNE.getValue();
    }

    public getScoopedTonnePlatlet(): number {
        return this.scoopedTonnePlatlet;
    }

    public getScoopedTonneAlien(): number {
        return this.scoopedTonneAlien;
    }

    public getScoopedTonneEscapeCapsule(): number {
        return this.scoopedTonneEscapeCapsule;
    }

    public getEjectedAmount(): number {
        return this.ejectedAmount / Unit.TONNE.getValue();
    }

    public checkLowEnergy(): void {
        if (this.wasLowEnergy) {
            this.lowEnergyCount++;
            this.wasLowEnergy = false;
        }
    }

    public getRetroRocketsTotalCount(): number {
        return this.retroRocketsTotalCount;
    }

    public getLowEnergyCount(): number {
        return this.lowEnergyCount;
    }

    public getMaxEquipments(): number {
        return this.maxEquipments;
    }

    public addScoopedFuel(fuel: number): void {
        this.scoopedFuel += fuel;
    }

    public getScoopedFuel(): number {
        return this.scoopedFuel;
    }

    public resetEnergy(): void {
        this.frontShield = PlayerCobra.MAX_SHIELD;
        this.rearShield = PlayerCobra.MAX_SHIELD;
        this.energyBank[0] = PlayerCobra.MAX_ENERGY_BANK;
        this.energyBank[1] = PlayerCobra.MAX_ENERGY_BANK;
        this.energyBank[2] = PlayerCobra.MAX_ENERGY_BANK;
        this.energyBank[3] = PlayerCobra.MAX_ENERGY_BANK;
    }


    public getFrontShield(): number {
        return this.frontShield;
    }

    public getRearShield(): number {
        return this.rearShield;
    }

    public getEnergy(): number {
        if (this.energyBank[3] < PlayerCobra.MAX_ENERGY_BANK / 2) {
            this.wasLowEnergy = true;
        }
        return this.energyBank[0] + this.energyBank[1] + this.energyBank[2] + this.energyBank[3];
    }

    public getEnergyBank(idx: number): number {
        return this.energyBank[idx];
    }

    public setFrontShield(newVal: number): void {
        newVal = Math.max(0, Math.min(newVal, PlayerCobra.MAX_SHIELD + Settings.shieldPowerOverride));
        this.frontShield = newVal;
    }

    public setRearShield(newVal: number): void {
        newVal = Math.max(0, Math.min(newVal, PlayerCobra.MAX_SHIELD + Settings.shieldPowerOverride));
        this.rearShield = newVal;
    }


    public setEnergy(newVal: number): void {
        newVal = Math.max(0, Math.min(newVal, PlayerCobra.MAX_ENERGY));
        this.energyBank[0] = Math.max(newVal - 3 * PlayerCobra.MAX_ENERGY_BANK, 0);
        this.energyBank[1] = Math.max(newVal - this.energyBank[0] - 2 * PlayerCobra.MAX_ENERGY_BANK, 0);
        this.energyBank[2] = Math.max(newVal - this.energyBank[0] - this.energyBank[1] - PlayerCobra.MAX_ENERGY_BANK, 0);
        this.energyBank[3] = Math.max(newVal - this.energyBank[0] - this.energyBank[1] - this.energyBank[2], 0);
    }


    public setLaserTemperature(temp: number): void {
        this.laserTemperature = Math.max(0, Math.min(temp, PlayerCobra.MAX_LASER_TEMPERATURE));
        if (this.laserOverheated && !this.isLaserOverheated()) {
            this.laserOverheated = false;
        }
    }


    public getLaserTemperature(): number {
        return this.laserTemperature;
    }

    public isLaserJustOverheated(): boolean {
        if (!this.laserOverheated && this.isLaserOverheated()) {
            this.laserOverheated = true;
            return true;
        }
        return false;
    }

    private isLaserOverheated(): boolean {
        return this.laserTemperature >= PlayerCobra.MAX_LASER_TEMPERATURE * 0.85;
    }

    public getCabinTemperature(): number {
        return this.cabinTemperature;
    }

    public setCabinTemperature(temp: number): void {
        this.cabinTemperature = temp;
    }

    public getAltitude(): number {
        return this.altitude;
    }

    public setAltitude(altitude: number): void {
        this.altitude = altitude;
    }

    public getPitch(): number {
        return this.pitch;
    }

    public getRoll(): number {
        return this.roll;
    }

    public setRotation(pitch: number, roll: number): void {
        this.pitch = pitch;
        this.roll = roll;
    }

    public isMissileLocked(): boolean {
        return this.missileLocked;
    }

    public setMissileLocked(b: boolean): void {
        if (b) {
            this.missileTargeting = false;
        }
        this.missileLocked = b;
    }

    public isMissileTargetting(): boolean {
        return this.missileTargeting;
    }

    public setMissileTargetting(b: boolean): void {
        if (b) {
            this.missileLocked = false;
        }
        this.missileTargeting = b;
    }

    public useRetroRockets(): void {
        this.setRetroRocketsUseCount(this.retroRocketsUseCount - 1);
        this.retroRocketsTotalCount++;
    }

    public setRetroRocketsUseCount(newCount: number): void {
        this.retroRocketsUseCount = newCount;
        if (newCount === 0) {
            this.removeEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.RETRO_ROCKETS));
        }
    }

    public clearSpecialCargo(): void {
        for (let i = this.inventory.length - 1; i >= 0; i--) {
            if (this.inventory[i].getGood().isSpecialGood()) {
                this.inventory.splice(i, 1);
            }
        }
    }


    public getLaserValue(name: string): number {
        const laser = EquipmentStore.get().getEquipmentById(name);
        return (this.getLaser(PlayerCobra.DIR_FRONT) === laser ? 1 : 0) +
            (this.getLaser(PlayerCobra.DIR_RIGHT) === laser ? 2 : 0) +
            (this.getLaser(PlayerCobra.DIR_REAR) === laser ? 4 : 0) +
            (this.getLaser(PlayerCobra.DIR_LEFT) === laser ? 8 : 0);
    }

    public equipLaser(where: number, name: string): void {
        const laser = EquipmentStore.get().getEquipmentById(name);
        if ((where & 1) > 0) this.setLaser(PlayerCobra.DIR_FRONT, laser);
        if ((where & 2) > 0) this.setLaser(PlayerCobra.DIR_RIGHT, laser);
        if ((where & 4) > 0) this.setLaser(PlayerCobra.DIR_REAR, laser);
        if ((where & 8) > 0) this.setLaser(PlayerCobra.DIR_LEFT, laser);
    }

    private getLaserId(where: number): number | null {
        return this.lasers[where] ? this.lasers[where].getId() : null;
    }

    public toJson(): any {
        return {
            fuel: this.fuel,
            retroRocketsUseCount: this.retroRocketsUseCount,
            retroRocketsTotalCount: this.retroRocketsTotalCount,
            travelledDistance: this.travelledDistance,
            collisionAmount: this.collisionAmount,
            hitByMissileCount: this.hitByMissileCount,
            hitBySpaceStationCount: this.hitBySpaceStationCount,
            hitByLaserAmount: this.hitByLaserAmount,
            scoopAmount: this.scoopAmount,
            scoopedTonnePlatlet: this.scoopedTonnePlatlet,
            scoopedTonneAlien: this.scoopedTonneAlien,
            scoopedTonneEscapeCapsule: this.scoopedTonneEscapeCapsule,
            ejectedAmount: this.ejectedAmount,
            lowEnergyCount: this.lowEnergyCount,
            maxEquipments: this.maxEquipments,
            scoopedFuel: this.scoopedFuel,
            missiles: this.missiles,
            equipments: this.equipmentInstalled.map(e => ({ id: e.getId() })),
            frontLaser: this.getLaserId(PlayerCobra.DIR_FRONT),
            rightLaser: this.getLaserId(PlayerCobra.DIR_RIGHT),
            rearLaser: this.getLaserId(PlayerCobra.DIR_REAR),
            leftLaser: this.getLaserId(PlayerCobra.DIR_LEFT),
            inventories: this.inventory.map(i => i.toJson({ goodId: i.getGood().getId() })),
        };
    }

    public fromJson(cobra: any): void {
        this.clearInventory();
        this.clearEquipment();
        this.fuel = cobra.fuel;
        this.retroRocketsUseCount = cobra.retroRocketsUseCount;
        this.retroRocketsTotalCount = cobra.retroRocketsTotalCount || 0;
        this.travelledDistance = cobra.travelledDistance;
        this.collisionAmount = cobra.collisionAmount || 0;
        this.hitByMissileCount = cobra.hitByMissileCount || 0;
        this.hitBySpaceStationCount = cobra.hitBySpaceStationCount || 0;
        this.hitByLaserAmount = cobra.hitByLaserAmount || 0;
        this.scoopAmount = cobra.scoopAmount || 0;
        this.scoopedTonnePlatlet = cobra.scoopedTonnePlatlet || 0;
        this.scoopedTonneAlien = cobra.scoopedTonneAlien || 0;
        this.scoopedTonneEscapeCapsule = cobra.scoopedTonneEscapeCapsule || 0;
        this.ejectedAmount = cobra.ejectedAmount || 0;
        this.lowEnergyCount = cobra.lowEnergyCount || 0;
        this.maxEquipments = cobra.maxEquipments || 0;
        this.scoopedFuel = cobra.scoopedFuel || 0;
        this.missiles = cobra.missiles;

        for (const e of cobra.equipments) {
            this.addEquipment(EquipmentStore.get().getEquipmentByHash(e.id));
        }

        this.lasers[PlayerCobra.DIR_FRONT] = EquipmentStore.get().getEquipmentByHash(cobra.frontLaser || -1);
        this.lasers[PlayerCobra.DIR_RIGHT] = EquipmentStore.get().getEquipmentByHash(cobra.rightLaser || -1);
        this.lasers[PlayerCobra.DIR_REAR] = EquipmentStore.get().getEquipmentByHash(cobra.rearLaser || -1);
        this.lasers[PlayerCobra.DIR_LEFT] = EquipmentStore.get().getEquipmentByHash(cobra.leftLaser || -1);

        for (const inv of cobra.inventories) {
            const good = TradeGoodStore.get().getGoodById(inv.goodId);
            if (good) {
                this.getItem(good).fromJson(inv);
            }
        }
    }
}
