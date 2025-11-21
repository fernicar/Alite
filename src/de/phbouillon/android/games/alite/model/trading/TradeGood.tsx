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
    private static readonly serialVersionUID = 5358106266043560822;

    private readonly id: number;
    private readonly basePrice: number;
    private readonly gradient: number;
    private readonly baseQuantity: number;
    private readonly maskByte: number;
    private readonly legalityType: number;
    private readonly unit: Unit;
    private readonly name: number; // String resource ID
    private readonly averagePrice: number[];
    private readonly iconName: string;
    private readonly specialGood: boolean;
    public traded: boolean;

    constructor(id: number, basePriceOrUnit: number | Unit, gradientOrName: number | string, baseQuantityOrIconName: number | string,
        maskByte?: number, legalityType?: number, unit?: Unit, name?: number, iconName?: string, specialGood?: boolean, ...averagePrice: number[]) {

        this.id = id;

        if (typeof basePriceOrUnit === 'number' && typeof gradientOrName === 'number') {
            // Full constructor logic
            this.basePrice = basePriceOrUnit;
            this.gradient = gradientOrName;
            this.baseQuantity = baseQuantityOrIconName as number;
            this.maskByte = maskByte;
            this.legalityType = legalityType !== undefined ? legalityType : 0;
            this.unit = unit;
            this.name = name;
            this.iconName = iconName;
            this.specialGood = specialGood !== undefined ? specialGood : false;
            this.averagePrice = averagePrice;
        } else {
            // Special good constructor
            this.unit = basePriceOrUnit as Unit;
            this.name = gradientOrName as number;
            this.iconName = baseQuantityOrIconName as string;
            this.specialGood = true;
            // Initialize other properties to default values
            this.basePrice = 0;
            this.gradient = 0;
            this.baseQuantity = 0;
            this.maskByte = 0;
            this.legalityType = 0;
            this.averagePrice = null;
        }
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
        return L.string(this.name);
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

    public traded(): void {
        this.traded = true;
    }

    public equals(o: any): boolean {
        if (this === o) return true;
        if (o == null || !(o instanceof TradeGood)) return false;
        return this.id === (o as TradeGood).id;
    }

    public hashCode(): number {
        // A simple hash implementation for demonstration
        return this.id;
    }
}
