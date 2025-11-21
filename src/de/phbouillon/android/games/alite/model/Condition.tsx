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
import { ColorScheme } from "../colors/ColorScheme";

export enum Condition {
    DOCKED,
    GREEN,
    YELLOW,
    RED
}

export namespace Condition {
    export function getName(condition: Condition): string {
        switch (condition) {
            case Condition.DOCKED: return L.string("condition_docked");
            case Condition.GREEN: return L.string("condition_green");
            case Condition.YELLOW: return L.string("condition_yellow");
            case Condition.RED: return L.string("condition_red");
        }
        return "";
    }

    export function getColor(condition: Condition): number {
        switch (condition) {
            case Condition.DOCKED: return ColorScheme.get(ColorScheme.COLOR_CONDITION_GREEN);
            case Condition.GREEN: return ColorScheme.get(ColorScheme.COLOR_CONDITION_GREEN);
            case Condition.YELLOW: return ColorScheme.get(ColorScheme.COLOR_CONDITION_YELLOW);
            case Condition.RED: return ColorScheme.get(ColorScheme.COLOR_CONDITION_RED);
        }
        return 0;
    }
}
