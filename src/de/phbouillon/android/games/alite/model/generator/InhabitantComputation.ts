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
import { SeedType } from "./SeedType";
import { StringUtil } from "./StringUtil";
import { SystemData } from "./SystemData";

export class InhabitantComputation {

	private static getDescription(index: string): string {
		switch (index) {
			case '0': return L.string("inhabitant_desc_large");
			case '1': return L.string("inhabitant_desc_fierce");
			case '2': return L.string("inhabitant_desc_small");
		}
		return "";
	}

	private static getColor(index: string): string {
		switch (index) {
			case '0': return L.string("inhabitant_color_green");
			case '1': return L.string("inhabitant_color_red");
			case '2': return L.string("inhabitant_color_yellow");
			case '3': return L.string("inhabitant_color_blue");
			case '4': return L.string("inhabitant_color_white");
			case '5': return L.string("inhabitant_color_harmless");
		}
		return "";
	}

	private static getAppearance(index: string): string {
		switch (index) {
			case '0': return L.string("inhabitant_appearance_slimy");
			case '1': return L.string("inhabitant_appearance_bug_eyed");
			case '2': return L.string("inhabitant_appearance_horned");
			case '3': return L.string("inhabitant_appearance_bony");
			case '4': return L.string("inhabitant_appearance_fat");
			case '5': return L.string("inhabitant_appearance_furry");
			case '6': return L.string("inhabitant_appearance_mutant");
			case '7': return L.string("inhabitant_appearance_weird");
		}
		return "";
	}

	private static getType(index: string): string {
		switch (index) {
			case '0': return L.string("inhabitant_type_rodent");
			case '1': return L.string("inhabitant_type_frog");
			case '2': return L.string("inhabitant_type_lizard");
			case '3': return L.string("inhabitant_type_lobster");
			case '4': return L.string("inhabitant_type_bird");
			case '5': return L.string("inhabitant_type_humanoid");
			case '6': return L.string("inhabitant_type_feline");
			case '7': return L.string("inhabitant_type_insect");
		}
		return "";
	}

	private static computeHumanColonial(seed: SeedType): string {
		let inhabitantCode = (-seed.getWord(0) * 3 - seed.getWord(1) * 5 + seed.getWord(2) * 7).toString(2);
		if (inhabitantCode.length > 20) {
			inhabitantCode = inhabitantCode.substring(inhabitantCode.length - 20);
		}
		while (inhabitantCode.length < 20) {
			inhabitantCode = "0" + inhabitantCode;
		}
		inhabitantCode = "0000" + inhabitantCode + inhabitantCode.substring(11, 19).split('').reverse().join('');
		if (seed.getLoByte(2) < 4) {
			inhabitantCode = inhabitantCode.substring(0, 31) + "1";
		}
		return inhabitantCode;
	}

	public static computeInhabitantCode(seed: SeedType): string {
		if (seed.getLoByte(2) < 128) {
			return this.computeHumanColonial(seed);
		}

		let descriptionFlag = seed.getHiByte(2) >> 2;
		let colorFlag = descriptionFlag;
		descriptionFlag &= 7;
		let inhabitantCode = descriptionFlag.toString();

		colorFlag >>= 3;
		colorFlag &= 7;
		inhabitantCode += colorFlag.toString();

		const appearanceFlag = seed.getHiByte(0) ^ seed.getHiByte(1);
		let temp = appearanceFlag;
		temp &= 7;
		inhabitantCode += temp.toString();

		const typeFlag = ((seed.getHiByte(2) & 3) + appearanceFlag) & 7;
		inhabitantCode += typeFlag.toString();
		return "1" + inhabitantCode;
	}

	public static computeInhabitantString(inhabitantCode: string): string {
		if (inhabitantCode.charAt(SystemData.INHABITANT_INDEX_RACE) === SystemData.INHABITANT_RACE_HUMAN) {
			return L.string("inhabitant_human_colonial");
		}
        let inhabitantName = "";
		inhabitantName = StringUtil.addSpaceAndString(this.getDescription(inhabitantCode.charAt(SystemData.INHABITANT_INDEX_DESCRIPTION)), inhabitantName);
		inhabitantName = StringUtil.addSpaceAndString(this.getColor(inhabitantCode.charAt(SystemData.INHABITANT_INDEX_COLOR)), inhabitantName);
		inhabitantName = StringUtil.addSpaceAndString(this.getAppearance(inhabitantCode.charAt(SystemData.INHABITANT_INDEX_APPEARANCE)), inhabitantName);
		inhabitantName = StringUtil.addSpaceAndString(this.getType(inhabitantCode.charAt(SystemData.INHABITANT_INDEX_TYPE)), inhabitantName);

		return StringUtil.toUpperFirstCase(inhabitantName);
	}
}
