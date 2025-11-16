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

import { TouchHandler } from './TouchHandler';
import { TouchEvent } from '../Input';

export class MultiTouchHandler implements TouchHandler {
    private touchEventsBuffer: TouchEvent[] = [];

    constructor(view: HTMLElement, scaleX: number, scaleY: number, offsetX: number, offsetY: number) {
        view.addEventListener('mousedown', this.handleMouseDown);
        view.addEventListener('mouseup', this.handleMouseUp);
    }

    private handleMouseDown = (event: MouseEvent) => {
        const touchEvent = new TouchEvent();
        touchEvent.type = TouchEvent.TOUCH_DOWN;
        touchEvent.x = event.clientX;
        touchEvent.y = event.clientY;

        if (event.ctrlKey) {
            console.log('Ctrl+click');
            // TODO: Differentiate between Ctrl+click and regular click
        } else if (event.shiftKey) {
            console.log('Shift+click');
            // TODO: Differentiate between Shift+click and regular click
        } else {
            console.log('Regular click');
        }

        this.touchEventsBuffer.push(touchEvent);
    }

    private handleMouseUp = (event: MouseEvent) => {
        const touchEvent = new TouchEvent();
        touchEvent.type = TouchEvent.TOUCH_UP;
        touchEvent.x = event.clientX;
        touchEvent.y = event.clientY;
        this.touchEventsBuffer.push(touchEvent);
    }

    isTouchDown(pointer: number): boolean {
        return false;
    }

    getTouchCount(): number {
        return 0;
    }

    getTouchX(pointer: number): number {
        return 0;
    }

    getTouchY(pointer: number): number {
        return 0;
    }

    setZoomFactor(zoomFactor: number): void {
        // Stub
    }

    getTouchEvents(): TouchEvent[] {
        const events = this.touchEventsBuffer;
        this.touchEventsBuffer = [];
        return events;
    }

    getAndRetainTouchEvents(): TouchEvent[] {
        return [...this.touchEventsBuffer];
    }

    dispose(view: HTMLElement): void {
        view.removeEventListener('mousedown', this.handleMouseDown);
        view.removeEventListener('mouseup', this.handleMouseUp);
    }
}
