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

import { L } from "../L";
import { AliteColor } from "./colors/AliteColor";

export class Repository<T> {
    private readonly properties: Map<T, any> = new Map();
    private readonly localeDependentProperties: Map<T, any> = new Map();

    public setProperty(name: T, value: any, localized: boolean = false): void {
        try {
            if (typeof value === "string") {
                value = this.getResString(value);
            } else if (typeof value === "number" || typeof value === "boolean") {
                // No conversion needed for basic types
            }

            if (localized) {
                this.localeDependentProperties.set(name, value);
            } else {
                this.properties.set(name, value);
            }
        } catch (e) {
            console.error((localized ? "Localized " : "") + "Property setting error", "Unknown property '" + name + "'");
        }
    }

    private getResString(value: string): any {
        return value.indexOf('@') > 0 ? -this.hashCode(value) : value;
    }

    private hashCode(s: string): number {
        return s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    }

    public setUnsetProperty(name: T, value: any): void {
        if (!this.getProperty(name)) {
            this.setProperty(name, value);
        }
    }

    public checkMissingRequiredProperty(fileName: string, propertyList: T[]): void {
        for (const p of propertyList) {
            this.throwIfMissing(fileName, String(p), this.getProperty(p));
        }
    }

    public throwIfMissing<V>(fileName: string, name: string, value: V): V {
        if (value == null) {
            const message = `Missing required property '${name}' in file '${fileName}'.`;
            console.error("Property error", message);
            throw new Error(message);
        }
        return value;
    }

    public getProperty(name: T): any {
        const property = this.localeDependentProperties.get(name);
        return property != null ? property : this.properties.get(name);
    }

    public getStringProperty(name: T): string {
        return this.getProperty(name);
    }

    public getResStringProperty(name: T): string {
        const s = this.getProperty(name);
        return typeof s === "number" ? L.string(String(s)) : s;
    }

    public getNumericProperty(name: T): number {
        const value = this.getProperty(name);
        if (value == null) {
            return 0;
        }
        if (typeof value === "number") {
            return value;
        }
        if (typeof value === "boolean") {
            return value ? 1 : 0;
        }
        console.error("getNumericProperty error", `Cannot get value of '${name}' with type ${typeof value}`);
        return 0;
    }

    public getArrayProperty(name: T): string[] {
        return this.getProperty(name);
    }

    public getColorProperty(name: T): number {
        return Repository.getColor(this.getProperty(name));
    }

    public clearLocaleDependent(): void {
        this.localeDependentProperties.clear();
    }

    public copyToIfUndefined(dest: Repository<T>): void {
        dest.localeDependentProperties.clear();
        for (const [key, value] of this.properties.entries()) {
            if (!dest.properties.has(key)) {
                dest.properties.set(key, value);
            }
        }
    }

    public copyLocaleDependentTo(dest: Repository<T>): void {
        dest.localeDependentProperties.clear();
        for (const [key, value] of this.localeDependentProperties.entries()) {
            dest.localeDependentProperties.set(key, value);
        }
    }

    public copyTo(dest: Repository<T>): void {
        dest.properties.clear();
        for (const [key, value] of this.properties.entries()) {
            dest.properties.set(key, value);
        }
    }

    public static getColor(color: string): number {
        if (color.toLowerCase().endsWith("color")) {
            return AliteColor.parseColor(color.substring(0, color.length - 5));
        }
        if (color.charAt(0) === '#') {
            return AliteColor.parseColor(color);
        }
        const factors = color.split(" ").map(f => parseFloat(f));
        const divider = factors[0] <= 1 && factors[1] <= 1 && factors[2] <= 1 &&
            (factors.length < 4 || factors[3] <= 1) ? 1 : 255;
        return AliteColor.argb(factors.length === 4 ? factors[3] / divider : 1,
            factors[0] / divider, factors[1] / divider, factors[2] / divider);
    }
}
