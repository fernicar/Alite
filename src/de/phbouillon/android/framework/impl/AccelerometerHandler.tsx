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

import { IAccelerometerHandler } from "./IAccelerometerHandler";
import { AndroidGame } from "./AndroidGame";

export class AccelerometerHandler implements IAccelerometerHandler {
    public static needsCalibration: boolean = true;
    private accelX: number = 0;
    private accelY: number = 0;

    constructor(game: AndroidGame) {
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    private handleMouseMove = (event: MouseEvent) => {
        this.accelX = (event.clientX / window.innerWidth) * 2 - 1;
        this.accelY = (event.clientY / window.innerHeight) * 2 - 1;
    }

    getAccelX(): number {
        return this.accelX;
    }

    getAccelY(): number {
        return this.accelY;
    }

    getAccelZ(): number {
        return 0;
    }

    dispose(): void {
        window.removeEventListener('mousemove', this.handleMouseMove);
    }
}
