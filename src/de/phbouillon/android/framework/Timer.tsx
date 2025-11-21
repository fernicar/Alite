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

export class Timer {
    private static readonly serialVersionUID = -5442756109577136730;

    // Using performance.now() which is in milliseconds.
    private static readonly NANOS_IN_MILLI = 1_000_000;
    private static readonly MICROS_IN_MILLI = 1_000;
    private static readonly MILLIS = 1;
    private static readonly SECONDS = 1 / 1000;

    private startTime: number = performance.now();
    private currentTime: number = this.startTime;
    private autoReset: boolean;
    private skipFirstCall: boolean;

    public setAutoReset(): Timer {
        this.autoReset = true;
        return this;
    }

    public setAutoResetWithImmediateAtFirstCall(): Timer {
        this.startTime = 0;
        return this.setAutoReset();
    }

    public setAutoResetWithSkipFirstCall(): Timer {
        this.skipFirstCall = true;
        return this.setAutoReset();
    }

    public reset(): void {
        this.getPassedNanos();
        this.startTime = this.currentTime;
    }

    public getTimer(): number {
        return this.startTime;
    }

    public setTimer(startTime: number): void {
        this.startTime = startTime;
    }

    public getPassedNanos(): number {
        return this.getPassedTime(Timer.NANOS_IN_MILLI);
    }

    public getPassedMillis(): number {
        return this.getPassedTime(Timer.MILLIS);
    }

    public getPassedSeconds(): number {
        return this.getPassedTime(Timer.SECONDS);
    }

    private getPassedTime(unitConversion: number): number {
        this.currentTime = performance.now();
        if (this.skipFirstCall) {
            return 0;
        }
        return (this.currentTime - this.startTime) * unitConversion;
    }

    public hasPassedNanos(time: number): boolean {
        return this.hasPassed(time, Timer.NANOS_IN_MILLI);
    }

    public hasPassedMicros(time: number): boolean {
        return this.hasPassed(time, Timer.MICROS_IN_MILLI);
    }

    public hasPassedMillis(time: number): boolean {
        return this.hasPassed(time, Timer.MILLIS);
    }

    public hasPassedSeconds(time: number): boolean {
        return this.hasPassed(time, Timer.SECONDS);
    }

    private hasPassed(time: number, unitConversion: number): boolean {
        const passed = this.getPassedTime(unitConversion) > time;
        if (this.autoReset && (passed || this.skipFirstCall)) {
            this.startTime = this.currentTime;
        }
        if (this.skipFirstCall) {
            this.skipFirstCall = false;
            return false;
        }
        return passed;
    }
}
