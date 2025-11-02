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
        this.quantity = new Map();
        this.price = new Map();
        this.fluct = 0;
        this.store = store;
    }

    public setSystem(system: SystemData): void {
        this.system = system;
    }

    public getFluct(): number {
        return this.fluct;
    }

    public setFluct(fluct: number): void {
        this.fluct = fluct;
    }

    public abstract generate(): void;

    public getPrice(good: TradeGood): number {
        return this.price.get(good) || 0;
    }

    public getQuantity(good: TradeGood): number {
        return this.quantity.get(good) || 0;
    }

    public setQuantity(good: TradeGood, newQuantity: number): void {
        if (good) {
            this.quantity.set(good, newQuantity);
        }
    }

    public toJson(): any {
        const goods = this.store.getGoods().map(good => ({
            id: good.getId(),
            quantity: this.getQuantity(good),
            traded: good.isTraded(),
        }));

        return {
            fluct: this.fluct,
            goods,
        };
    }

    public fromJson(market: any): void {
        this.fluct = market.fluct;
        const goods = market.goods;
        for (const g of goods) {
            const good = TradeGoodStore.get().getGoodById(g.id);
            if (good) {
                this.setQuantity(good, g.quantity);
                if (g.traded) {
                    good.setTraded();
                }
            }
        }
    }
}
