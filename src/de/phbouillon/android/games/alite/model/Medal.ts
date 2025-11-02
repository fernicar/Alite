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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { Alite } from "../Alite";
import { GalaxyGenerator } from "./generator/GalaxyGenerator";
import { Toc } from "./library/Toc";
import { MissionManager } from "./missions/MissionManager";
import { TradeGoodStore } from "./trading/TradeGoodStore";
import { TutorialScreen } from "../screens/canvas/tutorial/TutorialScreen";

export type Calculator = () => number;

export class MedalItem {
    public id: number;
    public name: number;
    public description: number;
    public level: number;
    public unseen: boolean;
    public calcFunc: Calculator;
    public range: number[];
    public gameLevel: boolean;

    constructor(id: number, name?: number, description?: number, calcFunc?: Calculator, range?: number[]) {
        this.id = id;
        this.name = name ?? 0;
        this.description = description ?? 0;
        this.calcFunc = calcFunc ?? (() => 0);
        this.range = range ?? [];
    }

    public getId(): number { return this.id; }
    public getName(): number { return this.name; }
    public getDescription(): number { return this.description; }
    public getLevel(): number { return this.level; }
    public isUnseen(): boolean { return this.unseen; }
    public reachedThreshold(): number { return this.level > 0 ? this.range[this.level - 1] : 0; }
    public nextThreshold(): number { return this.level < this.range.length ? this.range[this.level] : 0; }
    public highestLevelThreshold(): number { return this.level + 1 === this.range.length ? this.range[this.range.length - 1] : 0; }

    public viewed(): void {
        if (this.gameLevel) {
            Medal.getGameLevelMedal(this.id).unseen = false;
        }
        this.unseen = false;
    }

    public setGameLevel(): this {
        this.gameLevel = true;
        return this;
    }
}

export class Medal {
    public static readonly MEDAL_ID_TIME = 40;
    // ... (rest of the constants)

    public static gameLevelMedals: Map<number, MedalItem> = new Map();

    private game: Alite;
    private readonly medals: MedalItem[];

    constructor(game: Alite) {
        this.game = game;
        this.medals = [
            new MedalItem(30, 1, 2, () => this.game.getPlayer().getRank(), Medal.getRangeOf(1, 11)),
            // ... (all the other medal items will be initialized here)
        ];
    }

    private countBits(num: number, checkCount: number): number {
        let count = 0;
        for (let i = 0; i < checkCount; i++) {
            if ((num & (1 << i)) !== 0) {
                count++;
            }
        }
        return count;
    }

    private async getLibraryContentSize(): Promise<number> {
        try {
            const toc = await Toc.read();
            return toc.getEntries().length;
        } catch (ignored) {
            return 91;
        }
    }

    private static getRangeOf(start: number, end: number): number[] {
        const range = new Array(end - start + 1);
        for (let i = start; i <= end; i++) {
            range[i - start] = i;
        }
        return range;
    }

    private static readonly pattern125 = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];

    private getSeriesOf125(start: number, end: number): number[] {
        if (start === end) {
            return [start];
        }
        let startIndex = 0;
        while (start >= Medal.pattern125[startIndex]) {
            startIndex++;
        }
        let endIndex = startIndex;
        while (end > Medal.pattern125[endIndex]) {
            endIndex++;
        }
        const range = new Array(endIndex - startIndex + 2);
        if (endIndex - startIndex > 0) {
            range.splice(1, endIndex - startIndex, ...Medal.pattern125.slice(startIndex, endIndex));
        }
        range[0] = start;
        range[endIndex - startIndex + 1] = end;
        return range;
    }

    public static getGameLevelMedal(id: number): MedalItem {
        let medal = this.gameLevelMedals.get(id);
        if (!medal) {
            medal = new MedalItem(id);
            this.gameLevelMedals.set(id, medal);
        }
        return medal;
    }

    private getGameLevelValue(id: number): number {
        return Medal.getGameLevelMedal(id).level;
    }

    public static changeGameLevelValue(id: number, value: number): boolean {
        const medal = this.getGameLevelMedal(id);
        if (medal.level !== value) {
            medal.level = value;
            medal.unseen = true;
            return true;
        }
        return false;
    }

    public static setGameLevelBitValue(id: number, value: number): void {
        this.changeGameLevelValue(id, this.getGameLevelMedal(id).level | value);
    }

    public static getGameLevelMedals(): string {
        let result = "";
        for (const [id, medal] of this.gameLevelMedals.entries()) {
            if (medal.level > 0) {
                result += `${id},${medal.level},${medal.unseen};`;
            }
        }
        return result;
    }

    public static setGameLevelMedals(values: string): void {
        for (const item of values.split(';')) {
            const fields = item.split(',');
            if (fields.length < 3) continue;
            const medal = this.getGameLevelMedal(parseInt(fields[0], 10));
            medal.level = parseInt(fields[1], 10);
            medal.unseen = fields[2] === 'true';
        }
    }

    public initMedals(unseenMedals?: number[]): void {
        for (const m of this.medals) {
            m.level = 0;
            const achieve = m.calcFunc();
            for (const l of m.range) {
                if (achieve < l) {
                    break;
                }
                m.level++;
            }
        }

        for (const g of Medal.gameLevelMedals.values()) {
            if (!g.unseen) continue;
            for (const m of this.medals) {
                if (g.id === m.id) {
                    m.unseen = true;
                }
            }
        }

        if (unseenMedals) {
            for (const id of unseenMedals) {
                for (const m of this.medals) {
                    if (m.id === id) {
                        m.unseen = true;
                        break;
                    }
                }
            }
        }
    }

    public updateMedals(): number {
        let newMedalCount = 0;
        for (const m of this.medals) {
            if (m.level >= m.range.length) {
                if (m.unseen) {
                    newMedalCount++;
                }
                continue;
            }
            const achieve = m.calcFunc();
            if (achieve < m.range[m.level]) {
                if (m.unseen) {
                    newMedalCount++;
                }
                continue;
            }
            m.unseen = true;
            newMedalCount++;
            do {
                m.level++;
            } while (m.level < m.range.length && achieve >= m.range[m.level]);
        }
        return newMedalCount;
    }

    public getMedals(): MedalItem[] {
        return this.medals;
    }

    public toJson(): number[] {
        const unseen: number[] = [];
        for (const m of this.medals) {
            if (!m.gameLevel && m.unseen) {
                unseen.push(m.id);
            }
        }
        return unseen;
    }
}
