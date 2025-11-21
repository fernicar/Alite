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

import { IMethodHook } from "../../../../../framework/IMethodHook";
import { Timer } from "../../../../../framework/Timer";

export class TimedEvent {
    private static readonly serialVersionUID = -7887711369377615831;

    private readonly timer = new Timer().setAutoReset();
    delay: number;
    private method: IMethodHook;
    private pauseTime: number;
    private remove: boolean;
    protected locked: boolean;

    constructor(delayInNanos: number, lastExecutionTime = -1, pauseTime = -1) {
        this.delay = delayInNanos;
        if (lastExecutionTime !== -1) {
            this.timer.setTimer(lastExecutionTime);
        }
        this.pauseTime = pauseTime;
    }

    public addAlarmEvent(method: IMethodHook): TimedEvent {
        this.method = method;
        return this;
    }

    public remove(): void {
        this.remove = true;
    }

    mustBeRemoved(): boolean {
        return this.remove;
    }

    updateDelay(newDelay: number): void {
        this.delay = newDelay;
        this.timer.reset();
        this.pauseTime = -1;
    }

    timeToNextTrigger(): number {
        return this.delay - this.timer.getPassedNanos();
    }
    getLastExecutionTime(): number {
        return this.timer.getTimer();
    }

    perform(): void {
        if (this.pauseTime === -1 && !this.locked) {
            if (this.timer.hasPassedNanos(this.delay)) {
                if (this.method != null) this.method.execute(0);
            }
        }
    }

    public lock(): void {
        this.locked = true;
    }

    unlock(): void {
        if (this.locked) {
            this.timer.reset();
            this.locked = false;
        }
    }

    public pause(): number {
        if (this.pauseTime === -1) {
            this.pauseTime = this.timer.getPassedNanos();
        }
        return this.pauseTime;
    }

    public isPaused(): boolean {
        return this.pauseTime !== -1;
    }

    public resume(): void {
        if (this.pauseTime !== -1) {
            this.timer.setTimer(this.pauseTime);
            this.pauseTime = -1;
        }
    }
}
