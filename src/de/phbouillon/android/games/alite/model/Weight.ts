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

import { L } from "../L";
import { StringUtil } from "./generator/StringUtil";
import { Unit } from "./Unit";

export class Weight {
    public static readonly ZERO_GRAMS = new Weight(0);

    private readonly grams: number;

    private constructor(grams: number) {
        this.grams = grams;
    }

    public static unit(u: Unit, amount: number): Weight {
        return this.getWeight((u || Unit.TONNE).getValue() * amount);
    }

    public static tonnes(t: number): Weight {
        return this.getWeight(t * Unit.TONNE.getValue());
    }

    public static kilograms(kg: number): Weight {
        return this.getWeight(kg * Unit.KILOGRAM.getValue());
    }

    public static grams(g: number): Weight {
        return this.getWeight(Math.max(g, 0));
    }

    private static getWeight(grams: number): Weight {
        return grams === 0 ? this.ZERO_GRAMS : new Weight(grams);
    }

    private getWeightInstance(grams: number): Weight {
        return this.grams === grams ? this : Weight.grams(grams);
    }

    public compareTo(another: Weight | null): number {
        if (!another) {
            return 1;
        }
        if (this.grams > another.grams) {
            return 1;
        }
        if (this.grams === another.grams) {
            return 0;
        }
        return -1;
    }

    public add(another: Weight): Weight {
        return this.getWeightInstance(this.grams + another.grams);
    }

    public sub(another: Weight): Weight {
        return this.getWeightInstance(this.grams - another.grams);
    }

    public getAppropriateUnit(): Unit {
        return this.grams < Unit.KILOGRAM.getValue() ? Unit.GRAM : this.grams < Unit.TONNE.getValue() ? Unit.KILOGRAM : Unit.TONNE;
    }

    public getQuantityInAppropriateUnit(): number {
        return Math.floor(this.grams / this.getAppropriateUnit().getValue());
    }

    public getWeightInGrams(): number {
        return this.grams;
    }

    public getStringWithoutUnit(): string {
        const unit = this.getAppropriateUnit();
        return unit === Unit.GRAM ? StringUtil.format("%d", this.grams) :
            L.getOneDecimalFormatString("cash_amount_only", 10 * this.grams / unit.getValue());
    }

    public getFormattedString(): string {
        return this.getStringWithoutUnit() + this.getAppropriateUnit().toUnitString();
    }

    public toString(): string {
        return this.getFormattedString();
    }
}
