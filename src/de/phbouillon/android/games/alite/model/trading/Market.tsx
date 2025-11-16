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

import { SystemData } from "../generator/SystemData";
import { TradeGood } from "./TradeGood";
import { TradeGoodStore } from "./TradeGoodStore";


export abstract class Market {
    protected system: SystemData;
    protected fluct: number;
    protected readonly quantity: Map<TradeGood, number>;
    protected readonly price: Map<TradeGood, number>;
    protected readonly store: TradeGoodStore;

    protected constructor(store: TradeGoodStore) {
        this.quantity = new Map<TradeGood, number>();
        this.price = new Map<TradeGood, number>();
        this.fluct = 0;
        this.store = store;
    }

    public setSystem(system: SystemData) {
        this.system = system;
    }

    public getFluct(): number {
        return this.fluct;
    }

    public setFluct(fluct: number) {
        this.fluct = fluct;
    }

    public abstract generate();

    public getPrice(good: TradeGood): number {
        const p = this.price.get(good);
        return p === undefined ? 0 : p;
    }

    public getQuantity(good: TradeGood): number {
        const q = this.quantity.get(good);
        return q === undefined ? 0 : q;
    }

    public setQuantity(good: TradeGood, newQuantity: number) {
        if (good !== null) {
            this.quantity.set(good, newQuantity);
        }
    }

    public toJson() {
        // stub
    }

    public fromJson(market) {
        // stub
    }
}
