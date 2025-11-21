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

import { Input, TouchEvent } from "../../../../../../src/de/phbouillon/android/framework/Input";

export class TestInput implements Input {
    public isTouchDown(pointer: number): boolean {
        return false;
    }

    public getTouchCount(): number {
        return 0;
    }

    public getTouchX(pointer: number): number {
        return 0;
    }

    public getTouchY(pointer: number): number {
        return 0;
    }

    public setZoomFactor(zoom: number): void {

    }

    public getAccelX(): number {
        return 0;
    }

    public getAccelY(): number {
        return 0;
    }

    public getAccelZ(): number {
        return 0;
    }

    public getTouchEvents(): TouchEvent[] {
        return [];
    }

    public getAndRetainTouchEvents(): TouchEvent[] {
        return null;
    }

    public dispose(): void {

    }

    public isDisposed(): boolean {
        return false;
    }

    public switchAccelerometerHandler(): void {

    }

    public isAlternativeAccelerometer(): boolean {
        return false;
    }
}
