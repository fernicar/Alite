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

import { AliteLog } from "../AliteLog";
import { L } from "../L";
import { R } from "../R";
import { AliteColor } from "./AliteColor";
import { FileIO } from "../../framework/FileIO";


export namespace ColorScheme {
    export const COLOR_CONDITION_GREEN = 0;
    // ... (all other color constants)
    export const COLOR_HUD_MESSAGE = 70;

    const MAX_COLORS = 70;

    export const COLOR_SCHEME_CLASSIC = "0";
    const COLOR_SCHEME_MODERN = "1";

    const classicColorSchemeColors: number[][] = [
        [AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_CONDITION_GREEN
        // ... (all classic color values)
    ];

    const modernColorSchemeColors: number[][] = [
        [AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CONDITION_GREEN
        // ... (all modern color values)
    ];

    const DIRECTORY_COLOR_SCHEMES = "color_schemes/";
    export const ALITE_COLOR_SCHEME_EXTENSION = ".acs";

    let colors: number[][] = classicColorSchemeColors;
    let colorSchemes: string[] = [];
    let nextColorSchemeIndex: number;


    export function setColorScheme(f: FileIO, schemeContent: string, schemeName: string): string {
        switch (schemeName) {
            case COLOR_SCHEME_CLASSIC: colors = classicColorSchemeColors; break;
            case COLOR_SCHEME_MODERN: colors = modernColorSchemeColors; break;
            default:
                AliteLog.d("Load color scheme file", `file name: ${DIRECTORY_COLOR_SCHEMES}${schemeName}`);
                try {
                    // In web, we'd fetch this. Assuming schemeContent is provided for now.
                    return loadColorSchemeValues(schemeContent);
                } catch (e) {
                    return e.message;
                }
        }
        return "";
    }


    function loadColorSchemeValues(schemeContent: string): string {
        colors = JSON.parse(JSON.stringify(classicColorSchemeColors)); // Deep copy
        let colorItem = "";
        let color = null;

        try {
            const colorNameMap: { [key: string]: number } = {};
            const scheme = JSON.parse(schemeContent);
            const colorDefinitions = scheme.colorDefinition;

            if (colorDefinitions) {
                for (const key in colorDefinitions) {
                    colorItem = key;
                    color = colorDefinitions[key];
                    colorNameMap[key.toLowerCase()] = AliteColor.parseColor(color);
                }
            }

            const colorItems = scheme.colors;
            for (const key in colorItems) {
                colorItem = key;
                const index = getColorItemIndex(key);
                if (index === -1) {
                    return `Unknown color item '${colorItem}'.`;
                }
                const value = colorItems[key];
                if (typeof value === 'string') {
                    color = value;
                    colors[index][0] = parseColor(color, colorNameMap);
                } else {
                    color = value.startColor;
                    colors[index][0] = parseColor(color, colorNameMap);
                    color = value.endColor;
                    colors[index][1] = parseColor(color, colorNameMap);
                }
            }
            return null;
        } catch (e) {
            return e.message;
        }
    }


    function parseColor(colorString: string, localColorNameMap: { [key: string]: number }): number {
        // Basic hex/rgb parsing. Doesn't support named colors like Android's Color.parseColor
        if (colorString.startsWith('#')) {
            const hex = colorString.substring(1);
            const alpha = hex.length === 8 ? parseInt(hex.substring(0, 2), 16) : 255;
            const start = hex.length === 8 ? 2 : 0;
            const r = parseInt(hex.substring(start, start + 2), 16);
            const g = parseInt(hex.substring(start + 2, start + 4), 16);
            const b = parseInt(hex.substring(start + 4, start + 6), 16);
            return (alpha << 24) | (r << 16) | (g << 8) | b;
        }
        const lowerCaseColor = colorString.toLowerCase();
        if (localColorNameMap[lowerCaseColor] !== undefined) {
            return localColorNameMap[lowerCaseColor];
        }
        throw new Error("Unknown color");
    }

    const schemeItemNameMap: string[] = [
        "conditiongreen", "conditionyellow", "conditionred", //... and so on
    ];

    function getColorItemIndex(name: string): number {
        return schemeItemNameMap.indexOf(name.toLowerCase());
    }

    export function get(index: number, value?: number): number {
        if (index < 0 || index > MAX_COLORS) {
            AliteLog.e("ColorScheme.get", `Required color ${index} is out of bounds (0 - ${MAX_COLORS})`);
            return 0; // Transparent
        }
        if (value === undefined || colors[index][0] === colors[index][1]) {
            return colors[index][0];
        }
        return getGradient(colors[index][1], colors[index][0], value);
    }

    // ... (rest of the color scheme logic, like getGradient, converted to TypeScript)
}
