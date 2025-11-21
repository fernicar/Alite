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

export enum Government {
    ANARCHY,
    FEUDAL,
    MULTI_GOVERNMENT,
    DICTATORSHIP,
    COMMUNIST,
    CONFEDERACY,
    DEMOCRACY,
    CORPORATE_STATE
}

export namespace Government {
    export function getDescription(government: Government): string {
        switch (government) {
            case Government.ANARCHY: return L.string("government_anarchy");
            case Government.FEUDAL: return L.string("government_feudal");
            case Government.MULTI_GOVERNMENT: return L.string("government_multi_government");
            case Government.DICTATORSHIP: return L.string("government_dictatorship");
            case Government.COMMUNIST: return L.string("government_communist");
            case Government.CONFEDERACY: return L.string("government_confederacy");
            case Government.DEMOCRACY: return L.string("government_democracy");
            case Government.CORPORATE_STATE: return L.string("government_corporate_state");
        }
        return "";
    }
}
