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

export class SeedType {
    private word: number[] = new Array(3);

    constructor(w0: number, w1: number, w2: number) {
        this.word[0] = w0;
        this.word[1] = w1;
        this.word[2] = w2;
    }

    getLoByte(index: number): number {
        return this.word[index] & 255;
    }

    getHiByte(index: number): number {
        return this.word[index] >> 8;
    }

    shiftRight(index: number, amount: number): number {
        return this.word[index] >> amount;
    }

    public shiftLeft(index: number, amount: number): number {
        return this.word[index] << amount;
    }

    getWord(index: number): number {
        return this.word[index];
    }

    setWord(index: number, value: number): void {
        this.word[index] = value;
    }

    public toString(): string {
        return `${(this.word[0] >> 8).toString(16).padStart(2, '0')} ${(this.word[0] & 0xFF).toString(16).padStart(2, '0')} ` +
            `${(this.word[1] >> 8).toString(16).padStart(2, '0')} ${(this.word[1] & 0xFF).toString(16).padStart(2, '0')} ` +
            `${(this.word[2] >> 8).toString(16).padStart(2, '0')} ${(this.word[2] & 0xFF).toString(16).padStart(2, '0')}`;
    }
}
