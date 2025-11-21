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

import { ResourceStream } from "./ResourceStream";

export interface Language {
    addDefaultResource(path: string, stream: ResourceStream, resPrefix: string): Promise<void>;
    addDefaultResource(key: number, value: string | string[]): void;
    addLocalizedResource(path: string, stream: ResourceStream, resPrefix: string): Promise<void>;
    addLocalizedResource(key: number, value: string | string[]): void;

    getCurrentLocale(): any; // Locale equivalent
    setLocale(locale: any): void;

    /**
     * Executes all java scripts in the given statement param between <js></js> tags.
     */
    executeScript(statement: string): string;

    /**
     * Adds default locale and adds name of locale files from the given file list
     * by calling addLocaleFile.
     */
    loadLocaleList(localeFiles: any[]): void; // File[] equivalent

    /**
     * Returns the name of the next locale on the list read by method {@link #loadLocaleList}
     * Returns default locale (0. item) after the last locale name exceeded.
     */
    getNextLocale(): any; // Locale equivalent

    stringById(id: string | number, ...formatArgs: any[]): string;
    arrayById(id: string | number): string[];
    pluralsById(id: string | number, quantity: number, ...formatArgs: any[]): string;
    rawAssetsByFilename(fileName: string): Promise<any>; // InputStream
    rawByFilename(path: string, fileName: string): Promise<any>; // InputStream
    rawDescriptorByFilename(fileName: string): Promise<any>; // AssetFileDescriptor

    /**
     * Returns list of file and sub-directory names only in the given path (but not deeper)
     * within the currently selected locale file or null for default locale.
     */
    list(path: string): string[];
}
