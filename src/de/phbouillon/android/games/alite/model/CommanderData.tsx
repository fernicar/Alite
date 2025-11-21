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

import { Rating } from "./Rating";

export class CommanderData {
    private readonly name: string;
    private readonly dockedSystem: string;
    private readonly gameTime: number;
    private readonly points: number;
    private readonly rating: Rating;
    private readonly fileName: string;
    private readonly autoSaved: boolean;

    public static readonly AUTO_SAVED_COMMANDER_FILENAME = "__autosave";
    public static readonly DIRECTORY_COMMANDER = "commanders/";

    constructor(name: string, dockedSystem: string, gameTime: number, points: number, rating: Rating, fileName: string) {
        this.name = name;
        this.dockedSystem = dockedSystem;
        this.gameTime = gameTime;
        this.points = points;
        this.rating = rating;
        this.fileName = fileName;
        this.autoSaved = fileName.includes(CommanderData.DIRECTORY_COMMANDER + CommanderData.AUTO_SAVED_COMMANDER_FILENAME);
    }

    public getName(): string {
        return this.name;
    }

    public getDockedSystem(): string {
        return this.dockedSystem;
    }

    public getGameTime(): number {
        return this.gameTime;
    }

    public getPoints(): number {
        return this.points;
    }

    public getRating(): Rating {
        return this.rating;
    }

    public getFileName(): string {
        return this.fileName;
    }

    public isAutoSaved(): boolean {
        return this.autoSaved;
    }
}
