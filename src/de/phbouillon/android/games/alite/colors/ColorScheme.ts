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

    private static classicColorSchemeColors: number[][] = [
        [AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_CONDITION_GREEN
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_CONDITION_YELLOW
        [AliteColor.RED, AliteColor.RED], // COLOR_CONDITION_RED
        [AliteColor.BLACK, AliteColor.BLACK], // COLOR_BACKGROUND
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_BASE_INFORMATION
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_MAIN_TEXT
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_INFORMATION_TEXT
        [AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_ADDITIONAL_TEXT
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_MESSAGE
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_WARNING_MESSAGE
        [AliteColor.RED, AliteColor.RED], // COLOR_FUEL_CIRCLE
        [AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_DASHED_FUEL_CIRCLE
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_INHABITANT_INFORMATION
        [AliteColor.GRAY, AliteColor.GRAY], // COLOR_ARROW
        [AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_ECONOMY
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_GOVERNMENT
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_TECH_LEVEL
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_POPULATION
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_SHIP_DISTANCE
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_DIAMETER
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_GNP
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_CURRENT_SYSTEM_NAME
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_HYPERSPACE_SYSTEM_NAME
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_LEGAL_STATUS
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_REMAINING_FUEL
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_BALANCE
        [AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_RATING
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_MISSION_OBJECTIVE
        [AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_EQUIPMENT_DESCRIPTION
        [AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_RICH_INDUSTRIAL
        [AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_AVERAGE_INDUSTRIAL
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_POOR_INDUSTRIAL
        [AliteColor.RED, AliteColor.RED], // COLOR_MAIN_INDUSTRIAL
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_MAIN_AGRICULTURAL
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_RICH_AGRICULTURAL
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_AVERAGE_AGRICULTURAL
        [AliteColor.GRAY, AliteColor.GRAY], // COLOR_POOR_AGRICULTURAL
        [AliteColor.LIGHT_BLUE, AliteColor.LIGHT_BLUE], // COLOR_BACKGROUND_LIGHT
        [AliteColor.DARK_BLUE, AliteColor.DARK_BLUE], // COLOR_BACKGROUND_DARK
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_FRAME_LIGHT
        [AliteColor.GRAY, AliteColor.GRAY], // COLOR_FRAME_DARK
        [AliteColor.PINK, AliteColor.PINK], // COLOR_SELECTED_COLORED_FRAME_LIGHT
        [AliteColor.DARK_PINK, AliteColor.DARK_PINK], // COLOR_SELECTED_COLORED_FRAME_DARK
        [AliteColor.DARK_RED_LOW_ALPHA, AliteColor.DARK_RED_LOW_ALPHA], // COLOR_PULSING_HIGHLIGHTER_DARK
        [AliteColor.LIGHT_RED_LOW_ALPHA, AliteColor.LIGHT_RED_LOW_ALPHA], // COLOR_PULSING_HIGHLIGHTER_LIGHT
        [AliteColor.DKGRAY_MED_ALPHA, AliteColor.DKGRAY_MED_ALPHA], // COLOR_TUTORIAL_BUBBLE_DARK
        [AliteColor.GRAY_MED_ALPHA, AliteColor.GRAY_MED_ALPHA], // COLOR_TUTORIAL_BUBBLE_LIGHT
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_SHIP_TITLE
        [AliteColor.GRAY, AliteColor.GRAY], // COLOR_TEXT_AREA_BACKGROUND
        [AliteColor.LIGHT_BLUE, AliteColor.LIGHT_BLUE], // COLOR_CURSOR
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_PRICE
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_SCROLLING_TEXT
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_SELECTED_TEXT
        [AliteColor.WHITE, AliteColor.WHITE], // COLOR_CREDITS_DESCRIPTION
        [AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_CREDITS_PERSON
        [AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_CREDITS_ADDITION
        [AliteColor.MAGENTA, AliteColor.RED], // COLOR_FRONT_SHIELD
        [AliteColor.MAGENTA, AliteColor.RED], // COLOR_AFT_SHIELD
        [AliteColor.GREEN, AliteColor.RED], // COLOR_FUEL
        [AliteColor.GREEN, AliteColor.RED], // COLOR_CABIN_TEMPERATURE
        [AliteColor.GREEN, AliteColor.RED], // COLOR_LASER_TEMPERATURE
        [AliteColor.GREEN, AliteColor.RED], // COLOR_ALTITUDE
        [AliteColor.RED, AliteColor.GREEN], // COLOR_SPEED
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_ENERGY_BANK_1
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_ENERGY_BANK_2
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_ENERGY_BANK_3
        [AliteColor.MAGENTA, AliteColor.RED], // COLOR_ENERGY_BANK_4
        [AliteColor.TRANSPARENT, AliteColor.TRANSPARENT], // COLOR_ENERGY_BANK_WHOLE
        [AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_INDICATOR_BAR
        [AliteColor.DARK_RED_LOW_ALPHA, AliteColor.DARK_RED_LOW_ALPHA], // COLOR_HIGHLIGHT_COLOR
        [0x99F0F000, 0x99F0F000] // COLOR_HUD_MESSAGE - MedAlphaDarkYellow
    ];

    private static modernColorSchemeColors: number[][] = [
        [AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CONDITION_GREEN
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CONDITION_YELLOW
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CONDITION_RED
		[AliteColor.BLACK, AliteColor.BLACK], // COLOR_BACKGROUND
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_BASE_INFORMATION
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_MAIN_TEXT
		[AliteColor.DARK_ELECTRIC_BLUE, AliteColor.DARK_ELECTRIC_BLUE], // COLOR_INFORMATION_TEXT
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_ADDITIONAL_TEXT
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_MESSAGE
		[AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_WARNING_MESSAGE
		[AliteColor.RED, AliteColor.RED], // COLOR_FUEL_CIRCLE
		[AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_DASHED_FUEL_CIRCLE
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_INHABITANT_INFORMATION
		[AliteColor.GRAY, AliteColor.GRAY], // COLOR_ARROW
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_ECONOMY
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_GOVERNMENT
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_TECH_LEVEL
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_POPULATION
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_SHIP_DISTANCE
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_DIAMETER
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_GNP
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CURRENT_SYSTEM_NAME
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_HYPERSPACE_SYSTEM_NAME
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_LEGAL_STATUS
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_REMAINING_FUEL
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_BALANCE
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_RATING
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_MISSION_OBJECTIVE
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_EQUIPMENT_DESCRIPTION
		[AliteColor.GRAYISH_BLUE, AliteColor.GRAYISH_BLUE], // COLOR_RICH_INDUSTRIAL
		[AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_AVERAGE_INDUSTRIAL
		[AliteColor.MAGENTA, AliteColor.MAGENTA], // COLOR_POOR_INDUSTRIAL
		[AliteColor.RED, AliteColor.RED], // COLOR_MAIN_INDUSTRIAL
		[AliteColor.YELLOW, AliteColor.YELLOW], // COLOR_MAIN_AGRICULTURAL
		[AliteColor.WHITE, AliteColor.WHITE], // COLOR_RICH_AGRICULTURAL
		[AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_AVERAGE_AGRICULTURAL
		[AliteColor.GRAY, AliteColor.GRAY], // COLOR_POOR_AGRICULTURAL
		[AliteColor.LTGRAY, AliteColor.LTGRAY], // COLOR_BACKGROUND_LIGHT
		[AliteColor.DKGRAY, AliteColor.DKGRAY], // COLOR_BACKGROUND_DARK
		[AliteColor.WHITE, AliteColor.WHITE], // COLOR_FRAME_LIGHT
		[AliteColor.GRAY, AliteColor.GRAY], // COLOR_FRAME_DARK
		[AliteColor.PINK, AliteColor.PINK], // COLOR_SELECTED_COLORED_FRAME_LIGHT
		[AliteColor.DARK_PINK, AliteColor.DARK_PINK], // COLOR_SELECTED_COLORED_FRAME_DARK
		[AliteColor.DARK_GREEN_LOW_ALPHA, AliteColor.DARK_GREEN_LOW_ALPHA], // COLOR_PULSING_HIGHLIGHTER_DARK
		[AliteColor.LIGHT_GREEN_LOW_ALPHA, AliteColor.LIGHT_GREEN_LOW_ALPHA], // COLOR_PULSING_HIGHLIGHTER_LIGHT
		[AliteColor.DKGRAY_MED_ALPHA, AliteColor.DKGRAY_MED_ALPHA], // COLOR_TUTORIAL_BUBBLE_DARK
		[AliteColor.GRAY_MED_ALPHA, AliteColor.GRAY_MED_ALPHA], // COLOR_TUTORIAL_BUBBLE_LIGHT
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_SHIP_TITLE
		[AliteColor.GRAY, AliteColor.GRAY], // COLOR_TEXT_AREA_BACKGROUND
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CURSOR
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_PRICE
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_SCROLLING_TEXT
		[AliteColor.ORANGE, AliteColor.ORANGE], // COLOR_SELECTED_TEXT
		[AliteColor.DARK_ELECTRIC_BLUE, AliteColor.DARK_ELECTRIC_BLUE], // COLOR_CREDITS_DESCRIPTION
		[AliteColor.ELECTRIC_BLUE, AliteColor.ELECTRIC_BLUE], // COLOR_CREDITS_PERSON
		[AliteColor.DARK_PINK, AliteColor.DARK_PINK], // COLOR_CREDITS_ADDITION
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_FRONT_SHIELD
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_AFT_SHIELD
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_FUEL
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_CABIN_TEMPERATURE
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_LASER_TEMPERATURE
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_ALTITUDE
		[AliteColor.RED, AliteColor.LIGHT_GREEN], // COLOR_SPEED
		[AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_ENERGY_BANK_1
		[AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_ENERGY_BANK_2
		[AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_ENERGY_BANK_3
		[AliteColor.LIGHT_GREEN, AliteColor.RED], // COLOR_ENERGY_BANK_4
		[AliteColor.TRANSPARENT, AliteColor.TRANSPARENT], // COLOR_ENERGY_BANK_WHOLE
		[AliteColor.LIGHT_GREEN, AliteColor.LIGHT_GREEN], // COLOR_INDICATOR_BAR
		[AliteColor.DARK_GREEN_LOW_ALPHA, AliteColor.DARK_GREEN_LOW_ALPHA], // COLOR_HIGHLIGHT_COLOR
		[0x99F0F000, 0x99F0F000] // COLOR_HUD_MESSAGE - MedAlphaDarkYellow
    ];

    private static colors: number[][] = ColorScheme.classicColorSchemeColors;

    public static setColorScheme(schemeName: string) {
        switch(schemeName) {
            case ColorScheme.COLOR_SCHEME_CLASSIC:
                ColorScheme.colors = ColorScheme.classicColorSchemeColors;
                break;
            case ColorScheme.COLOR_SCHEME_MODERN:
                ColorScheme.colors = ColorScheme.modernColorSchemeColors;
                break;
            default:
                // Stub for custom color schemes
                console.warn(`Custom color scheme '${schemeName}' not implemented.`);
                ColorScheme.colors = ColorScheme.classicColorSchemeColors;
                break;
        }
    }

    public static getSchemeDisplayName(schemeName: string): string {
        if (ColorScheme.COLOR_SCHEME_CLASSIC === schemeName) return L.string("color_scheme_classic");
        if (ColorScheme.COLOR_SCHEME_MODERN === schemeName) return L.string("color_scheme_modern");
        // Simplified for now, removing file extension logic
        return schemeName;
    }

    public static get(index: number, value?: number): number {
        if (index < 0 || index > ColorScheme.MAX_COLORS) {
            console.error(`Required color ${index} is out of bounds (0 - ${ColorScheme.MAX_COLORS})`);
            return AliteColor.TRANSPARENT;
        }
        if (value === undefined || ColorScheme.colors[index][0] === ColorScheme.colors[index][1]) {
            return ColorScheme.colors[index][0];
        }

		return ColorScheme.getGradient(ColorScheme.colors[index][1], ColorScheme.colors[index][0], value);
    }

    private static getGradient(startColor: number, endColor: number, mixRatio: number): number {
        if (mixRatio <= 0) {
			return startColor;
		}
		if (mixRatio >= 1) {
			return endColor;
		}

        const s = ColorScheme.convertEntireColorLinearSRGBtoRGB(startColor);
        const e = ColorScheme.convertEntireColorLinearSRGBtoRGB(endColor);

        const r = ColorScheme.convertLinearRGBtoSRGB(ColorScheme.interpolate(mixRatio, (s >> 16) & 0xff, (e >> 16) & 0xff));
        const g = ColorScheme.convertLinearRGBtoSRGB(ColorScheme.interpolate(mixRatio, (s >> 8) & 0xff, (e >> 8) & 0xff));
        const b = ColorScheme.convertLinearRGBtoSRGB(ColorScheme.interpolate(mixRatio, s & 0xff, e & 0xff));

        return 0xff000000 | (r << 16) | (g << 8) | b;
    }

    private static convertEntireColorLinearSRGBtoRGB(c: number): number {
        const r = ColorScheme.convertSRGBtoLinearRGB((c >> 16) & 0xff);
        const g = ColorScheme.convertSRGBtoLinearRGB((c >> 8) & 0xff);
        const b = ColorScheme.convertSRGBtoLinearRGB(c & 0xff);
        return 0xff000000 | (r << 16) | (g << 8) | b;
    }

    private static convertSRGBtoLinearRGB(color: number): number {
        return Math.round(color <= 10 ? color / 12.92 : 255.0 * Math.pow((color / 255.0 + 0.055) / 1.055, 2.4));
    }

    private static interpolate(mixRatio: number, start: number, end: number): number {
        return (start * (1 - mixRatio) + end * mixRatio);
    }

    private static convertLinearRGBtoSRGB(c: number): number {
        return c > 0 ? Math.round(255.0 * (1.055 * Math.pow(c / 255.0, 1.0 / 2.4) - 0.055)) : 0;
    }
}
