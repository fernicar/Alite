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

import { L } from "../../L";
import { PlayerCobra } from "../PlayerCobra";
import { Economy } from "./enums/Economy";
import { Government } from "./enums/Government";
import { GalaxyGenerator } from "./GalaxyGenerator";
import { InhabitantComputation } from "./InhabitantComputation";
import { SeedType } from "./SeedType";
import { StringUtil } from "./StringUtil";

export class SystemData {
    public static RAXXLA_SYSTEM: SystemData;
	public static readonly LAVE_SYSTEM_INDEX = 7;
	public static readonly ZAONCE_SYSTEM_INDEX = 129;
	public static readonly RAXXLA_SYSTEM_INDEX = 256; // Mock GalaxyGenerator.PLANET_COUNT
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
		/* 0x80 */	[" fabled", " notable", " well known", " famous", " noted"],
		/* 0x81 */	[" very", " mildly", " most", " reasonably", ""],
		/* 0x82 */	[" ancient", "%97%", " great", " vast", " pink"],
		/* 0x83 */	["%9C%%9B% plantations", " mountains", "%9A%", "%a5% forests", " oceans"],
		/* 0x84 */	["%A6%", " mountain", " edible", " tree", " spotted"],
		/* 0x85 */	["%9D%", "%9E%", "%86%oid", "%A4%", "%A3%"],
		/* 0x86 */	[" walking%8D%", " crab", " bat", " lobst", " %RANDOM_NAME%"],
		/* 0x87 */	[" ancient", " exceptional", " eccentric", " ingrained", "%97%"],
		/* 0x88 */	[" shyness", " silliness", " mating traditions", " loathing of%89%", " love for%89%"],
		/* 0x89 */	[" food blenders", " tourists", " poetry", " discos", "%91%"],
		/* 0x8A */	[" its%82%%83%", " the %PLANET_NAME_IAN%%84%%85%", " its inhabitants'%87%%88%", "%9F%", " its%90%%91%"],
		/* 0x8B */	[" beset", " plagued", " ravaged", " cursed", " scourged"],
		/* 0x8C */	["%96% civil war", "%8D%%84%%85%s", "%98% disease", "%96% earthquakes", "%96% solar activity"],
		/* 0x8D */	[" killer", " deadly", " evil", " lethal", " vicious"],
		/* 0x8E */	[" Juice", " Brandy", " Water", " Brew", " Gargle Blasters"],
		/* 0x8F */	[" %RANDOM_NAME%", " %PLANET_NAME_IAN%%85%", " %PLANET_NAME_IAN% %RANDOM_NAME%", " %PLANET_NAME_IAN%%99%", "%99% %RANDOM_NAME%"],
		/* 0x90 */	[" fabulous", " exotic", " hoopy", " unusual", " exciting"],
		/* 0x91 */	[" cuisine", " night life", " casinos", " sitcoms", "%9F%"],
		/* 0x92 */	["%PLANET_NAME%", "The planet %PLANET_NAME%", "The world %PLANET_NAME%", "This planet", "This world"],
		/* 0x93 */	["%81%%80% for%8A%", "%81%%80% for%8A% and%8A%", "%8B% by%8C%", "%81%%80% for%8A% but is%8B% by%8C%", "%94%%95%"],
		/* 0x94 */	[" an unremarkable", " a boring", " a dull", " a tedious", " a revolting"],
		/* 0x95 */	[" planet", " world", " place", " little planet", " dump"],
		/* 0x96 */	[" frequent", " occasional", " unpredictable", " dreadful", " deadly"],
		/* 0x97 */	[" funny", " weird", " unusual", " strange", " peculiar"],
		/* 0x98 */	[" a killer", " a deadly", " an evil", " a lethal", " a vicious"],
		/* 0x99 */	[" Killer", " Deadly", " Evil", " Lethal", " Vicious"],
		/* 0x9A */	[" parking meters", " dust clouds", " icebergs", " rock formations", " volcanoes"],
		/* 0x9B */	[" Plant", " Tulip", " Banana", " Corn", " Weed"],
		/* 0x9C */	[" %RANDOM_NAME%", " %PLANET_NAME_IAN% %RANDOM_NAME%", " %PLANET_NAME_IAN%%99%", " Inhabitant", " %PLANET_NAME_IAN% %RANDOM_NAME%"],
		/* 0x9D */	[" shrew", " beast", " bison", " snake", " wolf"],
		/* 0x9E */	[" leopard", " cat", " monkey", " goat", " fish"],
		/* 0x9F */	["%8F%%8E%", " %PLANET_NAME_IAN%%A7%%A0%", " its%A8%%A9%%A0%", "%A1%%A2%", "%8F%%8E%"],
		/* 0xA0 */	[" Meat", " Cutlet", " Steak", " Burgers", " Soup"],
		/* 0xA1 */	[" ice", " mud", " zero-G", " vacuum", " %PLANET_NAME_IAN% ultra"],
		/* 0xA2 */	[" hockey", " cricket", " karate", " polo", " tennis"],
		/* 0xA3 */	[" wasp", " moth", " grub", " ant", " %RANDOM_NAME%"],
		/* 0xA4 */	[" poet", " arts graduate", " yak", " snail", " slug"],
		/* 0xA5 */	[" dense", " lush", " rain", " bamboo", " deciduous"],
		/* 0xA6 */	[" green", " black", " yellow stripey", " pinky grey", " white"],
		/* 0xA7 */	[" Shrew", " Beast", " Bison", " Snake", " Wolf"],
		/* 0xA8 */	[" Fabulous", " Exotic", " Hoopy", " Unusual", " Exciting"],
		/* 0xA9 */	[" Leopard", " Cat", " Monkey", " Goat", " Fish"],
	];

    private static planetNameSyllable: string[];
    private static descriptionMap: Map<string, string>;

    public galaxy: number;
    public index: number;
    public x: number;
    public y: number;
    public govType: Government;
    public economy: Economy;
    public techLevel: number;
    public population: number;
    public productivity: number;
    public diameter: number;
    public fuelPrice: number;
    private goatSoupSeedA: number;
    private goatSoupSeedB: number;
    public name: string;
    public inhabitants: string;
    public inhabitantCode: string;
    public description: string;
    public descriptionCode: string;
    public planetTexture: number;
    public ringsTexture: number;
    public cloudsTexture: number;
    public starTexture: number;
    public dockingFee: number;

    private readonly reachableSystems: SystemData[] = [];

    public static initialize(): void {
        if (this.planetNameSyllable) {
            return;
        }
        // Mock L.array for now
        this.planetNameSyllable = ["syst", "temp", "planet", "ar", "en", "es"];
        const planetDescription: string[] = [];
        this.descriptionMap = new Map();
        for (const description of planetDescription) {
            const idIdx = description.indexOf(':');
            if (idIdx < 0) {
                console.error("Planet description initializer", "Missing id prefix in description line '" + description + "'");
                continue;
            }
            this.descriptionMap.set(description.substring(0, idIdx), description.substring(idIdx + 1));
        }
        this.RAXXLA_SYSTEM = this.createRaxxlaSystem();
    }

    private static createRaxxlaSystem(): SystemData {
        const result = new SystemData();
        result.galaxy = this.RAXXLA_GALAXY;
        result.index = this.RAXXLA_SYSTEM_INDEX;
        result.x = 12;
        result.y = 127;
        result.govType = Government.CORPORATE_STATE;
        result.economy = Economy.RICH_INDUSTRIAL;
        result.techLevel = 22;
        result.population = 4;
        result.productivity = 63568;
        result.diameter = 42000;
        result.inhabitantCode = this.INHABITANT_RACE_TREEARD + "0000";
        result.inhabitants = L.string("inhabitant_friendly_green_treeards");
        result.name = L.string("raxxla_name");
        result.description = L.string("raxxla_desc");
        result.fuelPrice = 1;
        result.planetTexture = 1;
        result.ringsTexture = 16;
        result.cloudsTexture = 1;
        result.starTexture = 0;
        result.dockingFee = 0;
        return result;
    }

    public static createSystem(galaxy: number, index: number, seed: SeedType): SystemData {
        const result = new SystemData();
        result.galaxy = galaxy;
        result.index = index;
        result.computePosition(seed);
        result.computeGovernment(seed);
        result.computeEconomy(seed);
        result.computeTechLevel(seed);
        result.computePopulation(seed);
        result.computeProductivity(seed);
        result.computeDiameter(seed);

        result.goatSoupSeedA = seed.getWord(0) ^ seed.getWord(1);
        result.goatSoupSeedB = result.goatSoupSeedA ^ seed.getWord(2);

        result.inhabitantCode = InhabitantComputation.computeInhabitantCode(seed);
        result.inhabitants = InhabitantComputation.computeInhabitantString(result.inhabitantCode);
        result.name = this.generateRandomName(seed);
        result.computeDescriptionString();

        result.computeFuelPrice(seed);
        result.computeTextures(seed);
        result.computeDockingFee();

        return result;
    }

    private computePosition(seed: SeedType): void {
        this.x = seed.getHiByte(1);
        this.y = Math.floor(seed.getHiByte(0) * 0x007F / 0x00FF);
    }

    private computeGovernment(seed: SeedType): void {
        const governments = [Government.ANARCHY, Government.FEUDAL, Government.MULTI_GOVERNMENT, Government.DICTATORSHIP, Government.COMMUNIST, Government.CONFEDERACY, Government.DEMOCRACY, Government.CORPORATE_STATE];
        this.govType = governments[seed.shiftRight(1, 3) & 7];
    }

    private computeEconomy(seed: SeedType): void {
        let economyValue = seed.shiftRight(0, 8) & 7;
        // Simplified ordinal access
        if ([Government.ANARCHY, Government.FEUDAL].includes(this.govType)) {
            economyValue |= 2;
        }
        const economies = [Economy.RICH_INDUSTRIAL, Economy.AVERAGE_INDUSTRIAL, Economy.POOR_INDUSTRIAL, Economy.MAINLY_INDUSTRIAL, Economy.MAINLY_AGRICULTURAL, Economy.RICH_AGRICULTURAL, Economy.AVERAGE_AGRICULTURAL, Economy.POOR_AGRICULTURAL];
        this.economy = economies[economyValue];
    }

    private computeTechLevel(seed: SeedType): void {
        // Simplified ordinal access
        const economyOrdinal = [Economy.RICH_INDUSTRIAL, Economy.AVERAGE_INDUSTRIAL, Economy.POOR_INDUSTRIAL, Economy.MAINLY_INDUSTRIAL, Economy.MAINLY_AGRICULTURAL, Economy.RICH_AGRICULTURAL, Economy.AVERAGE_AGRICULTURAL, Economy.POOR_AGRICULTURAL].indexOf(this.economy);
        const govOrdinal = [Government.ANARCHY, Government.FEUDAL, Government.MULTI_GOVERNMENT, Government.DICTATORSHIP, Government.COMMUNIST, Government.CONFEDERACY, Government.DEMOCRACY, Government.CORPORATE_STATE].indexOf(this.govType);

        this.techLevel = (seed.shiftRight(1, 8) & 3) + (economyOrdinal ^ 7);
        this.techLevel += (govOrdinal >> 1) + 1;
        if ((govOrdinal & 1) === 1) {
            this.techLevel++;
        }
    }

    private computePopulation(seed: SeedType): void {
        this.population = (seed.getLoByte(0) & 0x3f) + 1;
    }

    private computeProductivity(seed: SeedType): void {
        this.productivity = (seed.getLoByte(0) & 0x3f) + 1;
        this.productivity *= 0x1b;
        this.productivity /= 5;
    }

    private computeDiameter(seed: SeedType): void {
        this.diameter = (seed.getWord(0) & 0x7fff) + 0x3a98;
    }

    private computeFuelPrice(seed: SeedType): void {
        this.fuelPrice = (0x001F & seed.getLoByte(0)) + 1;
    }

    private computeTextures(seed: SeedType): void {
        this.planetTexture = (seed.getLoByte(0) + seed.getHiByte(1)) % 64;
        this.ringsTexture = seed.getLoByte(1) < 128 ? seed.getLoByte(1) % 15 + 1 : 0;
        this.cloudsTexture = seed.getHiByte(2) % 9;
        this.starTexture = (seed.getLoByte(2) + seed.getHiByte(1)) % 21 +
            (seed.getHiByte(0) > 240 ? 2 : seed.getHiByte(0) > 220 ? 1 : 0);
    }

    private computeDockingFee(): void {
        const govOrdinal = [Government.ANARCHY, Government.FEUDAL, Government.MULTI_GOVERNMENT, Government.DICTATORSHIP, Government.COMMUNIST, Government.CONFEDERACY, Government.DEMOCRACY, Government.CORPORATE_STATE].indexOf(this.govType);
        this.dockingFee = (8 - govOrdinal) * 50;
    }

    private computeDescriptionString(): void {
        this.descriptionCode = "";
        this.description = this.computeGoatSoup("%92% is%93%.", true);
        if (SystemData.descriptionMap.size > 0) {
            const localizedDescription = SystemData.descriptionMap.get(this.descriptionCode);
            if (localizedDescription === undefined) {
                console.error("Planet description error", "Missing description for code " + this.descriptionCode + ": " + this.description);
                return;
            }
            // L.getInstance().executeScript is not implemented
            this.description = this.computeGoatSoup(localizedDescription, false);
        }
    }

    private generateRandomNumber(): number {
        let d0 = this.goatSoupSeedB;
        let d1 = this.goatSoupSeedA;
        this.goatSoupSeedA = d0;
        d0 += d1;
        this.goatSoupSeedB = d0;
        d0 &= 0xFF;
        return d0;
    }

    private static tweakSeed(seed: SeedType): void {
        let temp = seed.getWord(0) + seed.getWord(1) + seed.getWord(2);
        seed.setWord(0, seed.getWord(1));
        seed.setWord(1, seed.getWord(2));
        seed.setWord(2, temp);
    }

    private static generateRandomName(nameSeed: SeedType): string {
        let planetName = "";
        let pair: number[] = new Array(4);
        while (planetName.length === 0) {
            let longNameFlag = nameSeed.getWord(0) & 64;
            for (let i = 0; i < 4; i++) {
                pair[i] = nameSeed.shiftRight(2, 8) & 31;
                this.tweakSeed(nameSeed);
            }
            let resultStringBuilder = "";
            for (let i = 0; i < (longNameFlag > 0 ? 4 : 3); i++) {
                resultStringBuilder += this.planetNameSyllable[pair[i]];
            }
            planetName = resultStringBuilder.replace(/\./g, "");
        }
        return StringUtil.capitalize(planetName);
    }

    public changePlanetName(planetName: string): void {
        this.name = planetName;
        this.computeDescriptionString();
    }

    private replaceCommand(id: string, genCode: boolean): string {
        switch (id.toLowerCase()) {
            case "planet_name":
                return StringUtil.capitalize(this.name);
            case "planet_name_ian":
                if (genCode) {
                    const lastChar = this.name.charAt(this.name.length - 1);
                    const baseName = "aeiou".includes(lastChar) ? this.name.substring(0, this.name.length - 1) : this.name;
                    return StringUtil.capitalize(baseName + "ian");
                }
                return id;
            case "random_name":
                const localSeed = new SeedType(this.goatSoupSeedA, this.goatSoupSeedB, this.goatSoupSeedA ^ this.goatSoupSeedB);
                return SystemData.generateRandomName(localSeed);
            default:
                if (genCode) {
                    const rnd = Math.floor(this.generateRandomNumber() / 52);
                    this.descriptionCode += rnd;
                    return this.computeGoatSoup(SystemData.DESCRIPTION_TEXT_LIST[parseInt(id, 16) - 0x80][rnd], true);
                }
                return id;
        }
    }

    private computeGoatSoup(source: string, genCode: boolean): string {
        if (!source) {
            return "";
        }
        return source.replace(/%([^%]+)%/g, (match, id) => this.replaceCommand(id, genCode));
    }

    public computeReachableSystems(allSystems: SystemData[]): void {
        if (this.reachableSystems.length > 0) {
            return;
        }
        for (const data of allSystems) {
            if (this.computeDistance(data) <= PlayerCobra.MAX_FUEL) {
                this.reachableSystems.push(data);
            }
        }
    }

    public computeDistance(targetSystem: SystemData): number {
        return SystemData.computeDistance(this.x, this.y, targetSystem.x, targetSystem.y);
    }

    public static computeDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.floor(Math.sqrt(dx * dx + dy * dy)) << 2;
    }

    public toString(): string {
        // ... implementation ...
        return "";
    }
}

SystemData.initialize();
