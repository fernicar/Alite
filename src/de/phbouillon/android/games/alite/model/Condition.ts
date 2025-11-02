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
import { ColorScheme } from "./colors/ColorScheme";

export class Condition {
    public static readonly DOCKED = new Condition(ColorScheme.COLOR_CONDITION_GREEN, "condition_docked");
    public static readonly GREEN = new Condition(ColorScheme.COLOR_CONDITION_GREEN, "condition_green");
    public static readonly YELLOW = new Condition(ColorScheme.COLOR_CONDITION_YELLOW, "condition_yellow");
    public static readonly RED = new Condition(ColorScheme.COLOR_CONDITION_RED, "condition_red");

    private constructor(private colorIndex: number, private nameKey: string) {}

    public getName(): string {
        return L.string(this.nameKey);
    }

    public getColor(): number {
        return ColorScheme.get(this.colorIndex);
    }
}
