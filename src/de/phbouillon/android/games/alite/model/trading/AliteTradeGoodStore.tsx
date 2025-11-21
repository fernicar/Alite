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

import { Unit } from "../Unit";
import { TradeGood } from "./TradeGood";
import { TradeGoodStore } from "./TradeGoodStore";

export class AliteTradeGoodStore extends TradeGoodStore {
    public initialize(): void {
        this.addTradeGood(new TradeGood(TradeGoodStore.FOOD, 0x13, -0x02, 0x06, 0x01, 0,
            Unit.TONNE, "goods_food", "trade_icons/food.png", false, 48, 49, 47, 47, 48, 49, 49, 49, 48));
        this.addTradeGood(new TradeGood(TradeGoodStore.TEXTILES, 0x14, -0x01, 0x0a, 0x03, 0,
            Unit.TONNE, "goods_textiles", "trade_icons/textiles.png", false, 71, 71, 70, 71, 71, 72, 72, 72, 71));
        this.addTradeGood(new TradeGood(TradeGoodStore.RADIOACTIVES, 0x41, -0x03, 0x02, 0x07, 0,
            Unit.TONNE, "goods_radioactives", "trade_icons/radioactives.png", false, 228, 230, 228, 228, 229, 230, 231, 231, 229));
        this.addTradeGood(new TradeGood(TradeGoodStore.SLAVES, 0x28, -0x05, 0xe2, 0x1f,
            2.5, Unit.TONNE, "goods_slaves", "trade_icons/slaves.png", false, 147, 149, 144, 145, 147, 149, 149, 151, 146));
        this.addTradeGood(new TradeGood(TradeGoodStore.LIQUOR_WINES, 0x53, -0x05, 0xfb, 0x0f, 0,
            Unit.TONNE, "goods_liquor_wines", "trade_icons/liquor_wines.png", false, 286, 289, 285, 285, 287, 290, 290, 291, 286));
        this.addTradeGood(new TradeGood(TradeGoodStore.LUXURIES, 0xc4, 0x08, 0x36, 0x03, 0,
            Unit.TONNE, "goods_luxuries", "trade_icons/luxuries.png", false, 913, 908, 914, 913, 910, 906, 906, 904, 911));
        this.addTradeGood(new TradeGood(TradeGoodStore.NARCOTICS, 0xeb, 0x1d, 0x08, 0x78,
            2.5, Unit.TONNE, "goods_narcotics", "trade_icons/narcotics.png", false, 1611, 1606, 1630, 1626, 1615, 1601, 1600, 1593, 1619));
        this.addTradeGood(new TradeGood(TradeGoodStore.COMPUTERS, 0x9a, 0x0e, 0x38, 0x03, 0,
            Unit.TONNE, "goods_computers", "trade_icons/computers.png", false, 831, 828, 839, 837, 832, 825, 825, 822, 834));
        this.addTradeGood(new TradeGood(TradeGoodStore.MACHINERY, 0x75, 0x06, 0x28, 0x07, 0,
            Unit.TONNE, "goods_machinery", "trade_icons/machinery.png", false, 569, 570, 575, 574, 572, 569, 569, 567, 573));
        this.addTradeGood(new TradeGood(TradeGoodStore.ALLOYS, 0x4e, 0x01, 0x11, 0x1f, 0,
            Unit.TONNE, "goods_alloys", "trade_icons/alloys.png", false, 387, 389, 389, 389, 389, 389, 389, 388, 389));
        this.addTradeGood(new TradeGood(TradeGoodStore.FIREARMS, 0x9c, 0x0d, 0x1d, 0x07,
            1.3, Unit.TONNE, "goods_firearms", "trade_icons/firearms.png", false, 830, 829, 840, 838, 833, 827, 827, 823, 835));
        this.addTradeGood(new TradeGood(TradeGoodStore.FURS, 0xb0, -0x09, 0xdc, 0x3f, 0,
            Unit.TONNE, "goods_furs", "trade_icons/furs.png", false, 694, 698, 691, 692, 695, 700, 700, 702, 694));
        this.addTradeGood(new TradeGood(TradeGoodStore.MINERALS, 0x18, -0x01, 0x60, 0x03, 0,
            Unit.KILOGRAM, "goods_minerals", "trade_icons/minerals.png", false, 87, 87, 87, 87, 87, 88, 88, 88, 87));
        this.addTradeGood(new TradeGood(TradeGoodStore.GOLD, 0x61, -0x01, 0x42, 0x07, 0,
            Unit.KILOGRAM, "goods_gold", "trade_icons/gold.png", false, 385, 387, 386, 387, 387, 387, 387, 388, 387));
        this.addTradeGood(new TradeGood(TradeGoodStore.PLATINUM, 0xab, -0x02, 0x37, 0x1f, 0,
            Unit.KILOGRAM, "goods_platinum", "trade_icons/platinum.png", false, 714, 717, 715, 715, 716, 717, 717, 717, 716));
        this.addTradeGood(new TradeGood(TradeGoodStore.GEM_STONES, 0x2d, -0x01, 0xfa, 0x0f, 0,
            Unit.GRAM, "goods_gem_stones", "trade_icons/gem_stones.png", false, 194, 195, 195, 195, 195, 196, 196, 196, 195));
        this.addTradeGood(new TradeGood(TradeGoodStore.ALIEN_ITEMS, 0x35, 0x0f, 0xf8, 0x07, 0,
            Unit.TONNE, "goods_alien_items", "trade_icons/alien_items.png", false, 447, 446, 458, 457, 451, 443, 443, 440, 453));
        this.addTradeGood(new TradeGood(TradeGoodStore.MEDICAL_SUPPLIES, 0x7b, 0x10, 0x07, 0x78, 0,
            Unit.TONNE, "goods_medical_supplies", "trade_icons/medical_supplies.png", false, 965, 967, 980, 978, 972, 964, 964, 960, 974));

        this.addTradeGood(new TradeGood(TradeGoodStore.THARGOID_DOCUMENTS, Unit.GRAM, "goods_thargoid_documents", "trade_icons/thargoid_documents.png"));
        this.addTradeGood(new TradeGood(TradeGoodStore.UNHAPPY_REFUGEES, Unit.TONNE, "goods_unhappy_refugees", "trade_icons/unhappy_refugees.png"));
    }
}
