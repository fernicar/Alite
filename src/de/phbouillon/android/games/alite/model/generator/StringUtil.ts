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

export class StringUtil {
	private constructor() {
		// Prevent instantiation
	}

	public static addSpaceAndString(stringToAdd: string, currentString: string): string {
        let builder = currentString;
		if (stringToAdd && stringToAdd.length > 0) {
			if (builder.length > 0 && builder.charAt(builder.length - 1) !== ' ') {
				builder += " ";
			}
			builder += stringToAdd;
		}
        return builder;
	}

	public static capitalize(text: string): string {
		return text.replace(/\b\w/g, char => char.toLocaleUpperCase(L.getInstance().getCurrentLocale()));
	}

	public static toUpperFirstCase(s: string): string {
		if (!s) {
			return "";
		}
		if (s.length === 1) {
			return s;
		}
		return s.substring(0,1).toLocaleUpperCase(L.getInstance().getCurrentLocale()) + s.substring(1);
	}

    // Formatting with locale is not directly supported in the same way.
    // This is a simplified version. For more complex cases, a library would be needed.
	public static format(format: string, ...args: any[]): string {
		let i = 0;
		return format.replace(/%[sdf]/g, () => String(args[i++]));
	}
}
