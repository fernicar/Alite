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

import { Graphics } from '../../framework/Graphics';
import { TouchEvent } from '../../framework/Input';

export type OnEvent<E> = (self: E) => void;

export abstract class Component<E> {
    protected onEvent?: OnEvent<E>;
    private fingerDown = 0;

    public setEvent(onEvent: OnEvent<E>): E {
        this.onEvent = onEvent;
        return this as unknown as E;
    }

    public onEvent(): void {
        if (this.onEvent) {
            this.onEvent(this as unknown as E);
        }
    }

    public abstract checkEvent(e: TouchEvent): boolean;
    public abstract render(g: Graphics): void;

    clearFingerDown(): void {
        this.fingerDown = 0;
    }

    fingerDown(pointer: number): void {
        // Assuming TouchEvent will have these static methods
        this.fingerDown = TouchEvent.fingerDown(this.fingerDown, pointer);
    }

    fingerUp(pointer: number): void {
        // Assuming TouchEvent will have these static methods
        this.fingerDown = TouchEvent.fingerUp(this.fingerDown, pointer);
    }

    isDown(pointer?: number): boolean {
        // Assuming TouchEvent will have an overloaded static isDown method
        if (pointer !== undefined) {
            return TouchEvent.isDown(this.fingerDown, pointer);
        } else {
            return TouchEvent.isDown(this.fingerDown);
        }
    }
}
