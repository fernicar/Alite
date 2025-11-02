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

import { TradeGood } from "./trading/TradeGood";
import { Weight } from "./Weight";

export class InventoryItem {
    private readonly good: TradeGood;
    private weight: Weight = Weight.ZERO_GRAMS;
    private unpunished: Weight = Weight.ZERO_GRAMS;
    private nonCargo: number;
    private totalBuyPrice: number;

    constructor(good: TradeGood) {
        this.good = good;
    }

    public add(w: Weight, price: number): void {
        this.totalBuyPrice += price;
        this.weight = this.weight.add(w);
    }

    public set(w: Weight, price: number): void {
        this.totalBuyPrice = price;
        this.weight = w;
    }

    public addUnpunished(weight: Weight, nonCargoInTonne: number): void {
        this.unpunished = this.unpunished.add(weight);
        this.nonCargo += nonCargoInTonne;
    }

    public subUnpunished(weight: Weight): void {
        this.unpunished = this.unpunished.sub(weight);
        this.nonCargo = Math.max(this.nonCargo - weight.getQuantityInAppropriateUnit(), 0);
    }

    public resetUnpunished(): void {
        this.unpunished = Weight.ZERO_GRAMS;
        this.nonCargo = 0;
    }

    public getUnpunished(): Weight {
        return this.unpunished;
    }

    public getNonCargo(): number {
        return this.nonCargo;
    }

    public getPrice(): number {
        return this.totalBuyPrice;
    }

    public getWeight(): Weight {
        return this.weight;
    }

    public getGood(): TradeGood {
        return this.good;
    }

    public toJson(): any {
        return {
            weight: this.weight.getWeightInGrams(),
            price: this.totalBuyPrice,
            unpunishedWeight: this.unpunished.getWeightInGrams(),
            nonCargoWeight: this.nonCargo,
        };
    }

    public fromJson(inventory: any): void {
        this.set(Weight.grams(inventory.weight), inventory.price);
        this.addUnpunished(Weight.grams(inventory.unpunishedWeight), inventory.nonCargoWeight || 0);
    }
}
