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

export enum Rating {
    HARMLESS,
    MOSTLY_HARMLESS,
    POOR,
    AVERAGE,
    ABOVE_AVERAGE,
    COMPETENT,
    DANGEROUS,
    DEADLY,
    ELITE
}

export namespace Rating {
    const scoreThresholds = {
        [Rating.HARMLESS]: 2048,
        [Rating.MOSTLY_HARMLESS]: 4096,
        [Rating.POOR]: 8192,
        [Rating.AVERAGE]: 16384,
        [Rating.ABOVE_AVERAGE]: 32768,
        [Rating.COMPETENT]: 65536,
        [Rating.DANGEROUS]: 262144,
        [Rating.DEADLY]: 655360,
        [Rating.ELITE]: -1
    };

    export function getName(rating: Rating): string {
        switch (rating) {
            case Rating.HARMLESS: return L.string("rating_harmless");
            case Rating.MOSTLY_HARMLESS: return L.string("rating_mostly_harmless");
            case Rating.POOR: return L.string("rating_poor");
            case Rating.AVERAGE: return L.string("rating_average");
            case Rating.ABOVE_AVERAGE: return L.string("rating_above_average");
            case Rating.COMPETENT: return L.string("rating_competent");
            case Rating.DANGEROUS: return L.string("rating_dangerous");
            case Rating.DEADLY: return L.string("rating_deadly");
            case Rating.ELITE: return L.string("rating_elite");
        }
        return "";
    }

    export function getScoreThreshold(rating: Rating): number {
        return scoreThresholds[rating];
    }
}
