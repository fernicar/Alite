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

import { L } from "../../../../L";
import { ColorScheme } from "../../../../colors/ColorScheme";

export enum Economy {
    RICH_INDUSTRIAL,
    AVERAGE_INDUSTRIAL,
    POOR_INDUSTRIAL,
    MAINLY_INDUSTRIAL,
    MAINLY_AGRICULTURAL,
    RICH_AGRICULTURAL,
    AVERAGE_AGRICULTURAL,
    POOR_AGRICULTURAL
}

export namespace Economy {
    const colorIndices = {
        [Economy.RICH_INDUSTRIAL]: ColorScheme.COLOR_RICH_INDUSTRIAL,
        [Economy.AVERAGE_INDUSTRIAL]: ColorScheme.COLOR_AVERAGE_INDUSTRIAL,
        [Economy.POOR_INDUSTRIAL]: ColorScheme.COLOR_POOR_INDUSTRIAL,
        [Economy.MAINLY_INDUSTRIAL]: ColorScheme.COLOR_MAIN_INDUSTRIAL,
        [Economy.MAINLY_AGRICULTURAL]: ColorScheme.COLOR_MAIN_AGRICULTURAL,
        [Economy.RICH_AGRICULTURAL]: ColorScheme.COLOR_RICH_AGRICULTURAL,
        [Economy.AVERAGE_AGRICULTURAL]: ColorScheme.COLOR_AVERAGE_AGRICULTURAL,
        [Economy.POOR_AGRICULTURAL]: ColorScheme.COLOR_POOR_AGRICULTURAL
    };

    export function getDescription(economy: Economy): string {
        switch (economy) {
            case Economy.RICH_INDUSTRIAL: return L.string("economy_rich_industrial");
            case Economy.AVERAGE_INDUSTRIAL: return L.string("economy_average_industrial");
            case Economy.POOR_INDUSTRIAL: return L.string("economy_poor_industrial");
            case Economy.MAINLY_INDUSTRIAL: return L.string("economy_mainly_industrial");
            case Economy.MAINLY_AGRICULTURAL: return L.string("economy_mainly_agricultural");
            case Economy.RICH_AGRICULTURAL: return L.string("economy_rich_agricultural");
            case Economy.AVERAGE_AGRICULTURAL: return L.string("economy_average_agricultural");
            case Economy.POOR_AGRICULTURAL: return L.string("economy_poor_agricultural");
        }
        return "";
    }

    export function getColor(economy: Economy): number {
        return ColorScheme.get(colorIndices[economy]);
    }
}
