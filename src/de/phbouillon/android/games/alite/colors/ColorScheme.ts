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

import { AliteColor } from "./AliteColor";
import { L } from "../L";

export class ColorScheme {
    public static readonly COLOR_CONDITION_GREEN = 0;
    public static readonly COLOR_CONDITION_YELLOW = 1;
    public static readonly COLOR_CONDITION_RED = 2;
    public static readonly COLOR_BACKGROUND = 3;
    public static readonly COLOR_BASE_INFORMATION = 4;
    public static readonly COLOR_MAIN_TEXT = 5;
    public static readonly COLOR_INFORMATION_TEXT = 6;
    public static readonly COLOR_ADDITIONAL_TEXT = 7;
    public static readonly COLOR_MESSAGE = 8;
    public static readonly COLOR_WARNING_MESSAGE = 9;
    public static readonly COLOR_FUEL_CIRCLE = 10;
    public static readonly COLOR_DASHED_FUEL_CIRCLE = 11;
    public static readonly COLOR_INHABITANT_INFORMATION = 12;
    public static readonly COLOR_ARROW = 13;
    public static readonly COLOR_ECONOMY = 14;
    public static readonly COLOR_GOVERNMENT = 15;
    public static readonly COLOR_TECH_LEVEL = 16;
    public static readonly COLOR_POPULATION = 17;
    public static readonly COLOR_SHIP_DISTANCE = 18;
    public static readonly COLOR_DIAMETER = 19;
    public static readonly COLOR_GNP = 20;
    public static readonly COLOR_CURRENT_SYSTEM_NAME = 21;
    public static readonly COLOR_HYPERSPACE_SYSTEM_NAME = 22;
    public static readonly COLOR_LEGAL_STATUS = 23;
    public static readonly COLOR_REMAINING_FUEL = 24;
    public static readonly COLOR_BALANCE = 25;
    public static readonly COLOR_RATING = 26;
    public static readonly COLOR_MISSION_OBJECTIVE = 27;
    public static readonly COLOR_EQUIPMENT_DESCRIPTION = 28;
    public static readonly COLOR_RICH_INDUSTRIAL = 29;
    public static readonly COLOR_AVERAGE_INDUSTRIAL = 30;
    public static readonly COLOR_POOR_INDUSTRIAL = 31;
    public static readonly COLOR_MAIN_INDUSTRIAL = 32;
    public static readonly COLOR_MAIN_AGRICULTURAL = 33;
    public static readonly COLOR_RICH_AGRICULTURAL = 34;
    public static readonly COLOR_AVERAGE_AGRICULTURAL = 35;
    public static readonly COLOR_POOR_AGRICULTURAL = 36;
    public static readonly COLOR_BACKGROUND_LIGHT = 37;
    public static readonly COLOR_BACKGROUND_DARK = 38;
    public static readonly COLOR_FRAME_LIGHT = 39;
    public static readonly COLOR_FRAME_DARK = 40;
    public static readonly COLOR_SELECTED_COLORED_FRAME_LIGHT = 41;
    public static readonly COLOR_SELECTED_COLORED_FRAME_DARK = 42;
    public static readonly COLOR_PULSING_HIGHLIGHTER_DARK = 43;
    public static readonly COLOR_PULSING_HIGHLIGHTER_LIGHT = 44;
    public static readonly COLOR_TUTORIAL_BUBBLE_DARK = 45;
    public static readonly COLOR_TUTORIAL_BUBBLE_LIGHT = 46;
    public static readonly COLOR_SHIP_TITLE = 47;
    public static readonly COLOR_TEXT_AREA_BACKGROUND = 48;
    public static readonly COLOR_CURSOR = 49;
    public static readonly COLOR_PRICE = 50;
    public static readonly COLOR_SCROLLING_TEXT = 51;
    public static readonly COLOR_SELECTED_TEXT = 52;
    public static readonly COLOR_CREDITS_DESCRIPTION = 53;
    public static readonly COLOR_CREDITS_PERSON = 54;
    public static readonly COLOR_CREDITS_ADDITION = 55;
    public static readonly COLOR_FRONT_SHIELD = 56;
    public static readonly COLOR_AFT_SHIELD = 57;
    public static readonly COLOR_FUEL = 58;
    public static readonly COLOR_CABIN_TEMPERATURE = 59;
    public static readonly COLOR_LASER_TEMPERATURE = 60;
    public static readonly COLOR_ALTITUDE = 61;
    public static readonly COLOR_SPEED = 62;
    public static readonly COLOR_ENERGY_BANK_X = 63; // 0..3
    public static readonly COLOR_ENERGY_BANK_WHOLE = 67;
    public static readonly COLOR_INDICATOR_BAR = 68;
    public static readonly COLOR_HIGHLIGHT_COLOR = 69;
    public static readonly COLOR_HUD_MESSAGE = 70;

    private static readonly MAX_COLORS = 70;

    public static readonly COLOR_SCHEME_CLASSIC = "0";
    private static readonly COLOR_SCHEME_MODERN = "1";

    // ... (classic and modern color schemes are defined here)

    private static colors: number[][] = ColorScheme.classicColorSchemeColors;

    public static async setColorScheme(schemeName: string): Promise<string> {
        switch(schemeName) {
            case ColorScheme.COLOR_SCHEME_CLASSIC:
                ColorScheme.colors = ColorScheme.classicColorSchemeColors;
                break;
            case ColorScheme.COLOR_SCHEME_MODERN:
                ColorScheme.colors = ColorScheme.modernColorSchemeColors;
                break;
            default:
                try {
                    const response = await fetch(`color_schemes/${schemeName}`);
                    const schemeContent = await response.text();
                    return this.loadColorSchemeValues(schemeContent);
                } catch (e) {
                    return e.message;
                }
        }
        return "";
    }

    private static loadColorSchemeValues(schemeContent: string): string {
        // ... (implementation of loadColorSchemeValues)
        return "";
    }

    // ... (rest of the methods)
}
