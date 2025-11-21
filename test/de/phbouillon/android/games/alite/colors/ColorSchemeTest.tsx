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

import { AliteColor } from "../../../../../../../src/de/phbouillon/android/games/alite/colors/AliteColor";
import { ColorScheme } from "../../../../../../../src/de/phbouillon/android/games/alite/colors/ColorScheme";
import { Settings } from "../../../../../../../src/de/phbouillon/android/games/alite/Settings";
import * as fs from 'fs';
import * as path from 'path';

// Assuming a testing framework like Jest or Vitest is in use
describe('ColorScheme', () => {
    const SAMPLE_SCHEME_FILE_NAME = "sample" + ColorScheme.ALITE_COLOR_SCHEME_EXTENSION;

    beforeAll(() => {
        Settings.suppressOnlineLog = true;
    });

    test('setColorScheme', () => {
        // File structure error (e.g. empty file)
        expect(ColorScheme.setColorScheme(null, "", "")).not.toBe("");

        // Different kind of erroneous lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": \"xx\"\n}\n}\n", "")).toBe("Unknown color (xx) for color item 'ConditionGreen'.");

        // Different kind of erroneous lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": {\n" +
            "\"startColor\": \"#00000000\"\n}\n}\n}\n", "")).toBe("JSONObject[\"endColor\"] not found.");

        // Different kind of erroneous lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": {\n" +
            "\"wrongName\": \"#00000000\"\n}\n}\n}\n", "")).toBe("JSONObject[\"startColor\"] not found.");

        // Different kind of correct lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": \"#00000000\"\n}\n}\n", "")).toBeNull();
        expect(ColorScheme.get(0)).toBe(0);

        // Different kind of correct lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": {\n" +
            "\"startColor\": \"#00000000\",\n\"endColor\": \"#00000000\"\n}\n}\n}\n", "")).toBeNull();
        expect(ColorScheme.get(0)).toBe(0);

        // Different kind of correct lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": {\n" +
            "\"startColor\": \"#ffff0000\",\n\"endColor\": \"RED\"\n}\n}\n}\n", "")).toBeNull();
        expect(ColorScheme.get(0, 1)).toBe(0xffff0000);
        expect(ColorScheme.get(0, 0)).toBe(AliteColor.RED);

        // Different kind of correct lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": {\n" +
            "\"startColor\": \"Red\",\n\"endColor\": \"#ffff0000\"\n}\n}\n}\n", "")).toBeNull();
        expect(ColorScheme.get(0, 1)).toBe(AliteColor.RED);
        expect(ColorScheme.get(0, 0)).toBe(0xffff0000);

        // Different kind of correct lines
        expect(ColorScheme.setColorScheme(null, "{\n\"colors\": {\n\"ConditionGreen\": \"red\"\n}\n}\n", "")).toBeNull();
        expect(ColorScheme.get(0)).toBe(AliteColor.RED);

        // Correct test file
        // const filePath = path.resolve(__dirname, SAMPLE_SCHEME_FILE_NAME); // Adjust path as needed
        // const fileContent = fs.readFileSync(filePath, 'utf-8');
        // expect(ColorScheme.setColorScheme(null, fileContent, "")).toBeNull();
        // expect(ColorScheme.get(ColorScheme.COLOR_ENERGY_BANK_WHOLE, 1)).toBe(0xff2f4858);
        // expect(ColorScheme.get(ColorScheme.COLOR_ENERGY_BANK_WHOLE, 0)).toBe(AliteColor.RED);
    });

    test('get', () => {
        ColorScheme.setColorScheme(null, null, ColorScheme.COLOR_SCHEME_CLASSIC);
        expect(ColorScheme.get(-1)).toBe(AliteColor.TRANSPARENT);
        expect(ColorScheme.get(1000)).toBe(AliteColor.TRANSPARENT);
        expect(ColorScheme.get(ColorScheme.COLOR_CONDITION_GREEN)).toBe(AliteColor.LIGHT_GREEN);
        expect(ColorScheme.get(ColorScheme.COLOR_CONDITION_GREEN, 0.5)).toBe(AliteColor.LIGHT_GREEN);
        expect(ColorScheme.get(ColorScheme.COLOR_ENERGY_BANK_X + 3, 1)).toBe(AliteColor.MAGENTA);
        expect(ColorScheme.get(ColorScheme.COLOR_ENERGY_BANK_X + 3, 0)).toBe(AliteColor.RED);
        expect(ColorScheme.get(ColorScheme.COLOR_ENERGY_BANK_X + 3, 0.5)).toBe(0xFFFF00BB);
    });
});
