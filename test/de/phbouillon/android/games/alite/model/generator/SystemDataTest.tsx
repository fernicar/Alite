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

import { GalaxyGenerator } from "../../../../../../../src/de/phbouillon/android/games/alite/model/generator/GalaxyGenerator";
import { SystemData } from "../../../../../../../src/de/phbouillon/android/games/alite/model/generator/SystemData";
import { AliteLog } from "../../../../../../../src/de/phbouillon/android/games/alite/AliteLog";
import { L } from "../../../../../../../src/de/phbouillon/android/games/alite/L";
import { Settings } from "../../../../../../../src/de/phbouillon/android/games/alite/Settings";
import { TestLogger } from "../../TestLogger";
import * as fs from 'fs';
import * as path from 'path';

// Assuming a testing framework like Jest or Vitest is in use
describe('SystemData', () => {
    const generator = new GalaxyGenerator();

    // The main method is for command-line execution, which would be a separate script in a TS project.
    // For now, we'll keep the logic here but note it's not a standard test.
    async function main(args: string[]): Promise<void> {
        if (args.length !== 3) {
            console.log("Usage:\n  SystemDataTest <path of desired non-US locale or empty> " +
                "<locale name (in form of lang_ctry)> <output file name with path>");
            return;
        }
        AliteLog.setInstance(new TestLogger());
        // L.getInstance().addDefaultResource(path.resolve("res/values"), fs.createReadStream, "");
        // const locale = L.getLocaleOf(args[1]);
        // if (locale !== 'en-US') { // Simplified locale check
        //     L.getInstance().addLocalizedResource(path.resolve(args[0]), fs.createReadStream, "");
        // }
        // L.getInstance().setLocale(locale);

        Settings.maxGalaxies = GalaxyGenerator.EXTENDED_GALAXY_COUNT;
        await buildGalaxies(args[2]);
    }

    async function buildGalaxies(outputFile: string): Promise<void> {
        let out = "Galaxy\tIndex\tName\tx\ty\tTech level\tEconomy\tGovernment\tInhabitants\tGnp\tDiameter" +
            "\tPopulation\tDescription code\tDescription\tRoutes\n";

        const time = Date.now();
        for (let g = 1; g <= Settings.maxGalaxies; g++) {
            generator.buildGalaxy(g);
            const systems = generator.getSystems();
            for (const system of systems) {
                system.computeReachableSystems(systems);
                out += `${g}\t${formatSystemInfo(system)}`;
            }
        }
        fs.writeFileSync(outputFile, out);
        console.log(`Total time of generation: ${Date.now() - time} ms`);
    }

    function formatSystemInfo(system: SystemData): string {
        return `${system.getIndex()}\t${system.getName()}\t${system.getX()}\t${system.getY()}\t` +
            `${system.getTechLevel()}\t${system.getEconomy().getDescription()}\t` +
            `${system.getGovernment().getDescription()}\t${system.getInhabitants()}\t` +
            `${system.getGnp()}\t${system.getDiameter()}\t${system.getPopulation()}\t` +
            `${system.descriptionCode}\t${system.getDescription()}\t` +
            `${system.getReachableSystems().length - 1}\n`;
    }

    test('findPlanetTest', () => {
        AliteLog.setInstance(new TestLogger());
        // L.getInstance().addDefaultResource(path.resolve("res/values"), fs.createReadStream, "");
        // L.getInstance().setLocale('en-US');

        Settings.maxGalaxies = GalaxyGenerator.EXTENDED_GALAXY_COUNT;
        generator.buildGalaxy(8);
        expect(generator.findGalaxyOfPlanet("Gearge")).toBe(6);
        expect(generator.findGalaxyOfPlanet("estia")).toBe(244);
        expect(generator.findGalaxyOfPlanet("ususaon")).toBe(245);
    });
});
