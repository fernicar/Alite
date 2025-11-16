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

export class TouchEvent {
    public static readonly TOUCH_DOWN = 0;
    public static readonly TOUCH_UP = 1;
    public static readonly TOUCH_DRAGGED = 2;
    public static readonly TOUCH_SCALE = 3;
    public static readonly TOUCH_SWEEP = 4;

    public type: number;
    public x: number;
    public y: number;
    public x2: number;
    public y2: number;
    public pointer: number;
    public zoomFactor: number;

    constructor() {
        this.type = 0;
        this.x = 0;
        this.y = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.pointer = 0;
        this.zoomFactor = 0;
    }

    public static fingerDown(fingerDown: number, pointer: number): number {
        return fingerDown | (1 << pointer);
    }

    public static fingerUp(fingerDown: number, pointer: number): number {
        return fingerDown & (~(1 << pointer));
    }

    public static isDown(fingerDown: number, pointer?: number): boolean {
        if (pointer !== undefined) {
            return (fingerDown & (1 << pointer)) !== 0;
        } else {
            return fingerDown > 0;
        }
    }
}

export interface Input {
    isTouchDown(pointer: number): boolean;
    getTouchCount(): number;
    getTouchX(pointer: number): number;
    getTouchY(pointer: number): number;
    setZoomFactor(zoom: number): void;
    getAccelX(): number;
    getAccelY(): number;
    getAccelZ(): number;
    getTouchEvents(): TouchEvent[];
    getAndRetainTouchEvents(): TouchEvent[];
    dispose(): void;
    isDisposed(): boolean;
    switchAccelerometerHandler(): void;
    isAlternativeAccelerometer(): boolean;
}
