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
import { Settings } from "../../Settings";
import { Unit } from "../Unit";

export class TradeGood {
    public readonly id: number;
    public readonly basePrice: number;
    public readonly gradient: number;
    public readonly baseQuantity: number;
    public readonly maskByte: number;
    public readonly legalityType: number;
    public readonly unit: Unit;
    public readonly name: number;
    private readonly averagePrice: number[];
    public readonly iconName: string;
    public readonly specialGood: boolean;
    public traded: boolean;

    constructor(
        id: number,
        basePrice?: number,
        gradient?: number,
        baseQuantity?: number,
        maskByte?: number,
        legalityType: number = 0,
        unit?: Unit,
        name?: number,
        iconName?: string,
        specialGood: boolean = false,
        ...averagePrice: number[]
    ) {
        this.id = id;
        this.basePrice = basePrice ?? 0;
        this.gradient = gradient ?? 0;
        this.baseQuantity = baseQuantity ?? 0;
        this.maskByte = maskByte ?? 0;
        this.unit = unit ?? Unit.TONS;
        this.name = name ?? 0;
        this.legalityType = legalityType;
        this.iconName = iconName ?? "";
        this.specialGood = specialGood;
        this.averagePrice = averagePrice ?? [];
        this.traded = false;
    }

    public getId(): number {
        return this.id;
    }

    public getBasePrice(): number {
        return this.basePrice;
    }

    public getGradient(): number {
        return this.gradient;
    }

    public getBaseQuantity(): number {
        return this.baseQuantity;
    }

    public getMaskByte(): number {
        return this.maskByte;
    }

    public getUnit(): Unit {
        return this.unit;
    }

    public getName(): string {
        return L.string(String(this.name));
    }

    public getIconName(): string {
        return this.iconName;
    }

    public getLegalityType(): number {
        return this.legalityType;
    }

    public getAveragePrice(galaxyNumber: number): number {
        return galaxyNumber > 0 && galaxyNumber <= Settings.maxGalaxies ?
            this.averagePrice[(galaxyNumber - 1) % 8 + 1] : this.averagePrice[0];
    }

    public isSpecialGood(): boolean {
        return this.specialGood;
    }

    public isTraded(): boolean {
        return this.traded;
    }

    public setTraded(): void {
        this.traded = true;
    }

    public equals(o: any): boolean {
        if (this === o) return true;
        if (o == null || !(o instanceof TradeGood)) return false;
        return this.id === (o as TradeGood).id;
    }

    public hashCode(): number {
        return this.id;
    }
}
