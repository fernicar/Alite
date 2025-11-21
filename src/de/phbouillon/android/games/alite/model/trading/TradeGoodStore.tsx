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

import { AliteTradeGoodStore } from "./AliteTradeGoodStore";
import { TradeGood } from "./TradeGood";

export abstract class TradeGoodStore {
    public static readonly FOOD = 0;
    public static readonly TEXTILES = 1;
    public static readonly RADIOACTIVES = 2;
    public static readonly SLAVES = 3;
    public static readonly LIQUOR_WINES = 4;
    public static readonly LUXURIES = 5;
    public static readonly NARCOTICS = 6;
    public static readonly COMPUTERS = 7;
    public static readonly MACHINERY = 8;
    public static readonly ALLOYS = 9;
    public static readonly FIREARMS = 10;
    public static readonly FURS = 11;
    public static readonly MINERALS = 12;
    public static readonly GOLD = 13;
    public static readonly PLATINUM = 14;
    public static readonly GEM_STONES = 15;
    public static readonly ALIEN_ITEMS = 16;
    public static readonly MEDICAL_SUPPLIES = 17;

    public static readonly THARGOID_DOCUMENTS = 100;
    public static readonly UNHAPPY_REFUGEES = 101;

    private static instance: TradeGoodStore = null;
    private readonly goods: TradeGood[] = [];

    protected constructor() {
        this.initialize();
    }

    public abstract initialize(): void;

    public static get(): TradeGoodStore {
        if (this.instance == null) {
            this.instance = new AliteTradeGoodStore();
        }
        return this.instance;
    }

    public goods(): TradeGood[] {
        return this.goods;
    }

    public addTradeGood(tradeGood: TradeGood): void {
        if (!this.goods.includes(tradeGood)) {
            this.goods.push(tradeGood);
        }
    }

    public getGoodById(id: number): TradeGood {
        for (const good of this.goods) {
            if (good.getId() === id) {
                return good;
            }
        }
        return null;
    }

    public getRandomTradeGoodForContainer(): TradeGood {
        let good: TradeGood;
        do {
            good = this.goods[Math.floor(Math.random() * this.goods.length)];
        } while (good.getId() === TradeGoodStore.ALIEN_ITEMS || good.isSpecialGood());
        return good;
    }

    public getGoodsCount(): number {
        return this.goods.filter(good => !good.isSpecialGood()).length;
    }

    public getTradedGoodsCount(): number {
        return this.goods.filter(good => !good.isSpecialGood() && good.isTraded()).length;
    }

    public clearTraded(): void {
        for (const good of this.goods) {
            good.traded = false;
        }
    }

    public hasTradedWithAllIllegalGoods(): number {
        for (const good of this.goods) {
            if (good.getLegalityType() > 0 && !good.isTraded()) {
                return 0;
            }
        }
        return 1;
    }
}
