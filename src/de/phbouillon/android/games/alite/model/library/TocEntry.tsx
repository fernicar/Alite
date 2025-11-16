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

import { LibraryPage } from './LibraryPage';

export class TocEntry {
    private readonly level: number;
    private readonly fileName: string;
    private readonly name: string;
    private readonly linkedPage: LibraryPage;

    constructor(fileName: string, name: string, linkedPage: LibraryPage, level: number) {
        this.fileName = fileName;
        this.name = name;
        this.linkedPage = linkedPage;
        this.level = level;
    }

    public getName(): string {
        return this.name;
    }

    public getLinkedPage(): LibraryPage {
        return this.linkedPage;
    }

    public getLevel(): number {
        return this.level;
    }

    public getFileName(): string {
        return this.fileName;
    }
}
