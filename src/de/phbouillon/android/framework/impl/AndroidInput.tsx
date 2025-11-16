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

import { Input, TouchEvent } from '../Input';
import { IAccelerometerHandler } from './IAccelerometerHandler';
import { TouchHandler } from './TouchHandler';
import { AndroidGame } from './AndroidGame';
import { Settings } from '../../games/alite/Settings';
import { ShipControl } from '../../games/alite/ShipControl';
import { AlternativeAccelHandler } from './AlternativeAccelHandler';
import { AccelerometerHandler } from './AccelerometerHandler';
import { MultiTouchHandler } from './MultiTouchHandler';

export class AndroidInput implements Input {
    private accelHandler: IAccelerometerHandler;
    private readonly touchHandler: TouchHandler;
    private readonly game: AndroidGame;
    private disposed: boolean = false;

    constructor(game: AndroidGame, view: HTMLElement, scaleX: number, scaleY: number, offsetX: number, offsetY: number) {
        this.game = game;
        // @ts-ignore
        AccelerometerHandler.needsCalibration = true;
        // @ts-ignore
        this.accelHandler = Settings.controlMode === ShipControl.ALTERNATIVE_ACCELEROMETER ?
            new AlternativeAccelHandler(game) :
            new AccelerometerHandler(game);
        this.touchHandler = new MultiTouchHandler(view, scaleX, scaleY, offsetX, offsetY);
    }

    public switchAccelerometerHandler(): void {
        if (this.accelHandler) {
            if (this.accelHandler instanceof AccelerometerHandler) {
                this.accelHandler.dispose();
                this.accelHandler = new AlternativeAccelHandler(this.game);
            } else if (this.accelHandler instanceof AlternativeAccelHandler) {
                this.accelHandler.dispose();
                // @ts-ignore
                AccelerometerHandler.needsCalibration = true;
                this.accelHandler = new AccelerometerHandler(this.game);
            }
        } else {
            // @ts-ignore
            AccelerometerHandler.needsCalibration = true;
            this.accelHandler = new AccelerometerHandler(this.game);
        }
    }

    public isAlternativeAccelerometer(): boolean {
        return this.accelHandler instanceof AlternativeAccelHandler;
    }

    public isTouchDown(pointer: number): boolean {
        return this.touchHandler.isTouchDown(pointer);
    }

    public getTouchX(pointer: number): number {
        return this.touchHandler.getTouchX(pointer);
    }

    public getTouchY(pointer: number): number {
        return this.touchHandler.getTouchY(pointer);
    }

    public getAccelX(): number {
        return this.accelHandler.getAccelX();
    }

    public getAccelY(): number {
        return this.accelHandler.getAccelY();
    }

    public getAccelZ(): number {
        return this.accelHandler.getAccelZ();
    }

    public getTouchEvents(): TouchEvent[] {
        return this.touchHandler.getTouchEvents();
    }

    public getAndRetainTouchEvents(): TouchEvent[] {
        return this.touchHandler.getAndRetainTouchEvents();
    }

    public getTouchCount(): number {
        return this.touchHandler.getTouchCount();
    }

    public setZoomFactor(factor: number): void {
        this.touchHandler.setZoomFactor(factor);
    }

    public dispose(): void {
        if (this.accelHandler) {
            this.accelHandler.dispose();
            this.accelHandler = null as any;
        }
        this.disposed = true;
    }

    public isDisposed(): boolean {
        return this.disposed;
    }
}
