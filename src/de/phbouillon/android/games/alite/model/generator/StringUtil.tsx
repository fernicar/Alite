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

export class StringUtil {

    private constructor() {
        // Prevent instantiation
    }

    public static addSpaceAndStringToBuilder(stringToAdd: string, builder: { length: number; charAt: (arg0: number) => string; append: (arg0: string) => void; }): void {
        if (stringToAdd != null && stringToAdd.length > 0) {
            if (builder.length > 0 && builder.charAt(builder.length - 1) !== ' ') {
                builder.append(" ");
            }
            builder.append(stringToAdd);
        }
    }

    public static capitalize(text: string): string {
        let i = -1;
        while (true) {
            i = text.indexOf(' ', i + 1);
            if (i < 0 || i === text.length - 1) {
                return this.toUpperFirstCase(text);
            }
            text = text.substring(0, i + 1) + this.toUpperFirstCase(text.substring(i + 1));
        }
    }

    public static toUpperFirstCase(s: string): string {
        if (s == null || s.length === 0) {
            return "";
        }
        if (s.length === 1) {
            return s;
        }
        // Assuming L.getInstance().getCurrentLocale() provides a locale string like 'en-US'
        return s.substring(0, 1).toLocaleUpperCase(/* L.getInstance().getCurrentLocale() */) + s.substring(1);
    }

    public static format(format: string, ...args: any[]): string {
        // This is a simple replacement and does not handle all Java String.format specifiers.
        // A more robust library might be needed for full compatibility.
        let i = 0;
        return format.replace(/%[sdif]/g, () => args[i++]);
    }

    public static async computeSHAString(text: string): Promise<string> {
        try {
            // Web Crypto API is the modern way to do this in browsers. It's async.
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("[ALITE] computeSHAString", "Error computing SHA-256 hash!", e);
            }
        }
        return "";
    }
}
