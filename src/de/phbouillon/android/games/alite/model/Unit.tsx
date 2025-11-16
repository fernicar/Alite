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

// TODO: Replace with actual import from L.tsx once it's converted
const L = {
    string: (key: string) => `[${key}]`
};

export enum Unit {
    TONNE = 1000000,
    KILOGRAM = 1000,
    GRAM = 1
}

export function toUnitString(unit: Unit): string {
    switch (unit) {
        case Unit.TONNE: return L.string('unit_tonne');
        case Unit.KILOGRAM: return L.string('unit_kilogram');
        case Unit.GRAM: return L.string('unit_gram');
    }
    return "";
}

export function getValue(unit: Unit): number {
    return unit;
}
