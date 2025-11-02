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

import { Economy } from "../generator/enums/Economy";
import { Market } from "./Market";
import { TradeGood } from "./TradeGood";
import { TradeGoodStore } from "./TradeGoodStore";

export class AliteMarket extends Market {
    public constructor() {
        super(TradeGoodStore.get());
    }

    public generate(): void {
        for (const tradeGood of this.store.getGoods()) {
            if (tradeGood.isSpecialGood()) {
                continue;
            }
            const economyOrdinal = [Economy.RICH_INDUSTRIAL, Economy.AVERAGE_INDUSTRIAL, Economy.POOR_INDUSTRIAL, Economy.MAINLY_INDUSTRIAL, Economy.MAINLY_AGRICULTURAL, Economy.RICH_AGRICULTURAL, Economy.AVERAGE_AGRICULTURAL, Economy.POOR_AGRICULTURAL].indexOf(this.system.getEconomy());
            const product = economyOrdinal * tradeGood.getGradient();
            const changing = this.fluct & tradeGood.getMaskByte();
            let q = (tradeGood.getBaseQuantity() + changing - product) & 0x00FF;
            if ((q & 0x80) > 0) {
                q = 0;
            }
            let val = tradeGood.getId() === TradeGoodStore.ALIEN_ITEMS ? 0 : q & 0x3f;
            this.quantity.set(tradeGood, val);

            q = (tradeGood.getBasePrice() + changing + product);
            val = q * 4;
            this.price.set(tradeGood, val);
        }
    }
}
