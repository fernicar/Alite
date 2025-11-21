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

import { AliteGame } from "../AliteGame";
import { AliteLog } from "../AliteLog";
import { L } from "../L";
import { R } from "../R";
import { GalaxyGenerator } from "./generator/GalaxyGenerator";
import { Toc } from "./library/Toc";
import { MissionManager } from "./missions/MissionManager";
import { TradeGoodStore } from "./trading/TradeGoodStore";
import { TutorialScreen } from "../screens/canvas/tutorial/TutorialScreen";

export namespace Medal {
    export const MEDAL_ID_TIME = 40;
    export const MEDAL_ID_PLANETS = 130;
    // ... (all other MEDAL_ID constants)
    export const MEDAL_ID_INTERRUPTER = 735;

    export const gameLevelMedals: Map<number, Item> = new Map();

    export class Item {
        id: number;
        name: number;
        description: number;
        level: number = 0;
        unseen: boolean = false;
        calcFunc: Calculator;
        range: number[];
        gameLevel: boolean = false;

        constructor(id: number, name?: number, description?: number, calcFunc?: Calculator, range?: number[]) {
            this.id = id;
            if (name) this.name = name;
            if (description) this.description = description;
            if (calcFunc) this.calcFunc = calcFunc;
            if (range) this.range = range;
        }


        public getId(): number { return this.id; }
        public getName(): number { return this.name; }
        public getDescription(): number { return this.description; }
        public getLevel(): number { return this.level; }
        public isUnseen(): boolean { return this.unseen; }

        public reachedThreshold(): number {
            return this.level > 0 ? this.range[this.level - 1] : 0;
        }

        public nextThreshold(): number {
            return this.level < this.range.length ? this.range[this.level] : 0;
        }

        public highestLevelThreshold(): number {
            return this.level + 1 === this.range.length ? this.range[this.range.length - 1] : 0;
        }

        public viewed(): void {
            if (this.gameLevel) {
                getGameLevelMedal(this.id).unseen = false;
            }
            this.unseen = false;
        }

        public setGameLevel(): this {
            this.gameLevel = true;
            return this;
        }
    }

    export interface Calculator {
        get(): number;
    }

    let game: AliteGame;
    let medals: Item[];

    function getRangeOf(start: number, end: number): number[] {
        const range = new Array(end - start + 1);
        for (let i = start; i <= end; i++) {
            range[i - start] = i;
        }
        return range;
    }

    const pattern125 = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];

    function getSeriesOf125(start: number, end: number): number[] {
        if (start === end) return [start];

        let startIndex = 0;
        while (start >= pattern125[startIndex]) startIndex++;

        let endIndex = startIndex;
        while (end > pattern125[endIndex]) endIndex++;

        const range = new Array(endIndex - startIndex + 2);
        if (endIndex - startIndex > 0) {
            range.splice(1, endIndex - startIndex, ...pattern125.slice(startIndex, endIndex));
        }
        range[0] = start;
        range[endIndex - startIndex + 1] = end;
        return range;
    }

    export function initialize(g: AliteGame) {
        game = g;
        medals = [
            new Item(30, R.string.medal_career_man, R.string.medal_career_man_desc, () => game.getPlayer().getRank(), getRangeOf(1, 11)),
            // ... (all other medal initializations)
            new Item(MEDAL_ID_INTERRUPTER, R.string.medal_interrupter, R.string.medal_interrupter_desc, () => countBits(getGameLevelValue(MEDAL_ID_INTERRUPTER), 2), getRangeOf(1, 2)).setGameLevel(),
        ];
    }

    function countBits(number: number, checkCount: number): number {
        let count = 0;
        for (let i = 0; i < checkCount; i++) {
            if ((number & (1 << i)) !== 0) {
                count++;
            }
        }
        return count;
    }

    function getLibraryContentSize(): number {
        // This would require an async operation in web, returning a promise.
        // For simplicity, returning a static value for now.
        return 91;
    }

    export function getGameLevelMedal(id: number): Item {
        let medal = gameLevelMedals.get(id);
        if (!medal) {
            medal = new Item(id);
            gameLevelMedals.set(id, medal);
        }
        return medal;
    }

    function getGameLevelValue(id: number): number {
        return getGameLevelMedal(id).level;
    }

    export function changeGameLevelValue(id: number, value: number): boolean {
        const medal = getGameLevelMedal(id);
        if (medal.level !== value) {
            medal.level = value;
            medal.unseen = true;
            return true;
        }
        return false;
    }

    export function setGameLevelBitValue(id: number, value: number): void {
        changeGameLevelValue(id, getGameLevelMedal(id).level | value);
    }

    export function getGameLevelMedals(): string {
        let result = "";
        for (const [id, medal] of gameLevelMedals.entries()) {
            if (medal.level > 0) {
                result += `${id},${medal.level},${medal.unseen};`;
            }
        }
        return result;
    }


    export function setGameLevelMedals(values: string): void {
        if (!values) return;
        for (const item of values.split(';')) {
            if (!item) continue;
            const fields = item.split(',');
            const medal = getGameLevelMedal(parseInt(fields[0]));
            medal.level = parseInt(fields[1]);
            medal.unseen = fields[2] === 'true';
        }
    }


    export function initMedals(unseenMedals?: number[]): void {
        for (const m of medals) {
            m.level = 0;
            const achieve = m.calcFunc.get();
            for (const l of m.range) {
                if (achieve < l) {
                    break;
                }
                m.level++;
            }
        }
        for (const g of gameLevelMedals.values()) {
            if (!g.unseen) continue;
            for (const m of medals) {
                if (g.id === m.id) {
                    m.unseen = true;
                }
            }
        }
        if (unseenMedals) {
            for (const id of unseenMedals) {
                for (const m of medals) {
                    if (m.id === id) {
                        m.unseen = true;
                        break;
                    }
                }
            }
        }
    }


    export function updateMedals(): number {
        AliteLog.d("updateMedals", "Started...");
        let newMedalCount = 0;
        for (const m of medals) {
            if (m.level >= m.range.length) {
                if (m.unseen) newMedalCount++;
                continue;
            }
            const achieve = m.calcFunc.get();
            if (achieve < m.range[m.level]) {
                if (m.unseen) newMedalCount++;
                continue;
            }
            m.unseen = true;
            newMedalCount++;
            do {
                m.level++;
            } while (m.level < m.range.length && achieve >= m.range[m.level]);
            AliteLog.d("updateMedals", `Achievement #${m.id}: current = ${achieve}, highest level = ${m.level}`);
        }
        return newMedalCount;
    }


    export function getMedals(): Item[] {
        return medals;
    }

    export function toJson(): number[] {
        const unseen: number[] = [];
        for (const m of medals) {
            if (!m.gameLevel && m.unseen) {
                unseen.push(m.id);
            }
        }
        return unseen;
    }
}
