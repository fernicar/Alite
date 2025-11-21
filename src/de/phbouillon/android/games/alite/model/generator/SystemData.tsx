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

import { AliteLog } from "../../AliteLog";
import { L } from "../../L";
import { R } from "../../R";
import { PlayerCobra } from "../PlayerCobra";
import { Economy } from "./enums/Economy";
import { Government } from "./enums/Government";
import { GalaxyGenerator } from "./GalaxyGenerator";
import { InhabitantComputation } from "./InhabitantComputation";
import { SeedType } from "./SeedType";
import { StringUtil } from "./StringUtil";


export class SystemData {
    public static readonly LAVE_SYSTEM_INDEX = 7;
    public static readonly ZAONCE_SYSTEM_INDEX = 129;
    public static readonly RAXXLA_SYSTEM_INDEX = GalaxyGenerator.PLANET_COUNT;
    public static readonly RAXXLA_GALAXY = 8;

    public static readonly INHABITANT_INDEX_RACE = 0;
    public static readonly INHABITANT_INDEX_DESCRIPTION = 1;
    public static readonly INHABITANT_INDEX_COLOR = 2;
    public static readonly INHABITANT_INDEX_APPEARANCE = 3;
    public static readonly INHABITANT_INDEX_TYPE = 4;

    public static readonly INHABITANT_RACE_HUMAN = '0';
    public static readonly INHABITANT_RACE_ALIEN = '1';
    public static readonly INHABITANT_RACE_TREEARD = '2';

    private static readonly DESCRIPTION_TEXT_LIST: string[][] = [
        [" fabled", " notable", " well known", " famous", " noted"],
        // ... (all the description text list entries)
        [" Fabulous", " Exotic", " Hoopy", " Unusual", " Exciting"],
        [" Leopard", " Cat", " Monkey", " Goat", " Fish"],
    ];

    private static planetNameSyllable: string[];
    private static descriptionMap: Map<string, string>;
    public static RAXXLA_SYSTEM: SystemData = SystemData.createRaxxlaSystem();

    private galaxy: number;
    private index: number;
    private x: number;
    private y: number;
    private govType: Government;
    private economy: Economy;
    private techLevel: number;
    private population: number;
    private productivity: number;
    private diameter: number;
    private fuelPrice: number;
    private goatSoupSeedA: number;
    private goatSoupSeedB: number;
    private name: string;
    private inhabitants: string;
    private inhabitantCode: string;
    private description: string;
    private descriptionCode: string;

    private planetTexture: number;
    private ringsTexture: number;
    private cloudsTexture: number;
    private starTexture: number;
    private dockingFee: number;

    private readonly reachableSystems: SystemData[] = [];

    public static initialize(): void {
        if (SystemData.planetNameSyllable) return;

        SystemData.planetNameSyllable = L.array(R.array.planet_name_syllable);
        const planetDescription = L.array(R.array.planet_description);
        SystemData.descriptionMap = new Map();
        for (const description of planetDescription) {
            const idIdx = description.indexOf(':');
            if (idIdx < 0) {
                AliteLog.e("Planet description initializer", `Missing id prefix in description line '${description}'`);
                continue;
            }
            SystemData.descriptionMap.set(description.substring(0, idIdx), description.substring(idIdx + 1));
        }
        SystemData.changeLocaleRaxxla(SystemData.RAXXLA_SYSTEM);
    }

    public static changeLocale(): void {
        SystemData.planetNameSyllable = null;
        SystemData.initialize();
    }


    private static createRaxxlaSystem(): SystemData {
        const result = new SystemData();
        result.galaxy = SystemData.RAXXLA_GALAXY;
        result.index = SystemData.RAXXLA_SYSTEM_INDEX;
        result.x = 12;
        result.y = 127;
        result.govType = Government.CORPORATE_STATE;
        result.economy = Economy.RICH_INDUSTRIAL;
        result.techLevel = 22;
        result.population = 4;
        result.productivity = 63568;
        result.diameter = 42000;
        result.inhabitantCode = SystemData.INHABITANT_RACE_TREEARD + "0000";
        SystemData.changeLocaleRaxxla(result);
        result.fuelPrice = 1;
        result.planetTexture = 1;
        result.ringsTexture = 16;
        result.cloudsTexture = 1;
        result.starTexture = 0;
        result.dockingFee = 0;
        return result;
    }

    private static changeLocaleRaxxla(result: SystemData): void {
        result.inhabitants = L.string(R.string.inhabitant_friendly_green_treeards);
        result.name = L.string(R.string.raxxla_name);
        result.description = L.string(R.string.raxxla_desc);
    }

    public static createSystem(galaxy: number, index: number, seed: SeedType): SystemData {
        const result = new SystemData();
        // ... (all compute methods)
        return result;
    }

    // ... (rest of the compute methods, generateRandomName, etc. converted to TypeScript)

    public changePlanetName(planetName: string): void {
        this.name = planetName;
        // this.computeDescriptionString();
    }
    public computeDistance(targetSystem: SystemData): number {
        return SystemData.computeDistance(this.x, this.y, targetSystem.x, targetSystem.y);
    }

    public static computeDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.floor(Math.sqrt(dx * dx + dy * dy)) << 2;
    }

    public getEconomy(): Economy { return this.economy; }
    public getGovernment(): Government { return this.govType; }
    public getId(): number { return (this.galaxy << 10) + this.index; }
    public static getGalaxyOf(id: number): number { return id >> 10; }
    public getIndex(): number { return this.index; }
    public getX(): number { return this.x; }
    public getY(): number { return this.y; }
    public getName(): string { return this.name; }
    public getInhabitants(): string { return this.inhabitants; }
    public getTechLevel(): number { return this.techLevel; }
    public getGnp(): string { return L.getOneDecimalFormatString(R.string.planet_gnp_value, this.productivity); }
    public getPopulation(): string { return L.getOneDecimalFormatString(R.string.planet_population_value, this.population); }
    public getDiameter(): string { return L.string(R.string.planet_diameter_value, this.diameter); }
    public getDescription(): string { return this.description; }
    public getReachableSystems(): SystemData[] { return [...this.reachableSystems]; }
    public getFuelPrice(): number { return this.fuelPrice; }
    public getPlanetTexture(): number { return this.planetTexture; }
    public getRingsTexture(): number { return this.ringsTexture; }
    public getCloudsTexture(): number { return this.cloudsTexture; }
    public getInhabitantCode(): string { return this.inhabitantCode; }
    public getStarTexture(): number { return this.starTexture; }
    public getStationHandsDockingFee(): number { return this.dockingFee; }

    public static generateRandomName(seed: SeedType): string {
        throw new Error("Method not implemented.");
    }
}
