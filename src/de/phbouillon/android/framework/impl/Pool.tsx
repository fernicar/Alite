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

import { AliteLog } from "../../games/alite/AliteLog";

export interface PoolObjectFactory<T> {
    createObject(): T;
}

export class Pool<T> {
    private static readonly serialVersionUID = -5141492387845777888;

    private readonly freeObjects: T[];
    private readonly factory: PoolObjectFactory<T>;
    private readonly maxSize: number;

    constructor(factory: PoolObjectFactory<T>, maxSize: number) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.freeObjects = new Array(maxSize);
    }

    public newObject(): T {
        if (this.freeObjects.length === 0) {
            return this.factory.createObject();
        }
        return this.freeObjects.pop();
    }

    public free(object: T): void {
        if (this.freeObjects.length < this.maxSize) {
            this.freeObjects.push(object);
        }
    }

    public reset(): void {
        this.freeObjects.length = 0;
    }
}
