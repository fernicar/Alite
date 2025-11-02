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

export class Rating {
    public static readonly HARMLESS = new Rating(2048, "rating_harmless");
    public static readonly MOSTLY_HARMLESS = new Rating(4096, "rating_mostly_harmless");
    public static readonly POOR = new Rating(8192, "rating_poor");
    public static readonly AVERAGE = new Rating(16384, "rating_average");
    public static readonly ABOVE_AVERAGE = new Rating(32768, "rating_above_average");
    public static readonly COMPETENT = new Rating(65536, "rating_competent");
    public static readonly DANGEROUS = new Rating(262144, "rating_dangerous");
    public static readonly DEADLY = new Rating(655360, "rating_deadly");
    public static readonly ELITE = new Rating(-1, "rating_elite");

    private constructor(private upToScore: number, private nameKey: string) {}

    public getName(): string {
        return L.string(this.nameKey);
    }

    public getScoreThreshold(): number {
        return this.upToScore;
    }
}
