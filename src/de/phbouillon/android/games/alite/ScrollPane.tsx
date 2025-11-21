/* Alite - Discover the Universe on your Favorite Android Device
 * Copyright (C) 2015 Philipp Bouillon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License, a particular purpose and NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { TouchEvent } from "../framework/Input";
import { Rect } from "../framework/Rect";

interface Point {
    x: number;
    y: number;
}

export interface SizeFunction {
    getSize(): Point;
}

export class ScrollPane {
    public readonly area: Rect;
    public readonly position: Point = { x: 0, y: 0 };

    private touchDownPoint: Point;
    private readonly size: SizeFunction;
    private lastPoint: Point;
    private readonly delta: Point = { x: 0, y: 0 };

    constructor(left: number, top: number, right: number, bottom: number, size: SizeFunction) {
        this.area = new Rect(left, top, right, bottom);
        this.size = size;
    }

    public handleEvent(event: TouchEvent): void {
        const inBounds = this.area.contains(event.x, event.y);
        if (event.type === TouchEvent.TOUCH_DOWN && event.pointer === 0) {
            this.touchDownPoint = inBounds ? { x: event.x, y: event.y } : null;
            this.lastPoint = this.touchDownPoint;
            this.delta.x = 0;
            this.delta.y = 0;
        }

        if (event.type === TouchEvent.TOUCH_DRAGGED && event.pointer === 0 && this.touchDownPoint != null && inBounds) {
            this.changePosition(this.lastPoint.x, this.lastPoint.y, event.x, event.y);
            this.lastPoint = { x: event.x, y: event.y };
            this.delta.x = 0;
            this.delta.y = 0;
        }

        if ((event.type as any) === TouchEvent.TOUCH_SWEEP && inBounds) {
            this.delta.x = (event as any).x2;
            this.delta.y = (event as any).y2;
        }
    }

    public changePosition(fromX: number, fromY: number, toX: number, toY: number): void {
        const oversizeX = this.getOversizeX();
        const oversizeY = this.getOversizeY();
        let diff = fromX - toX;
        if (toX < fromX) {
            this.position.x = Math.min(this.position.x + diff, oversizeX);
        } else {
            this.position.x = Math.max(this.position.x + diff, 0);
        }
        diff = fromY - toY;
        if (toY < fromY) {
            this.position.y = Math.min(this.position.y + diff, oversizeY);
        } else {
            this.position.y = Math.max(this.position.y + diff, 0);
        }
    }

    private getOversizeX(): number {
        return Math.max(this.size.getSize().x - (this.area.right - this.area.left), 0);
    }

    private getOversizeY(): number {
        return Math.max(this.size.getSize().y - (this.area.bottom - this.area.top), 0);
    }

    public moveToTop(): void {
        this.position.y = 0;
        this.delta.x = 0;
        this.delta.y = 0;
    }

    public isAtBottom(): boolean {
        return this.position.y >= this.getOversizeY();
    }

    public isSweepingGesture(event: TouchEvent): boolean {
        return this.touchDownPoint == null || Math.abs(this.touchDownPoint.x - event.x) >= 20 ||
            Math.abs(this.touchDownPoint.y - event.y) >= 20;
    }

    public scrollingFree(): void {
        if (this.delta.x !== 0) {
            this.delta.x += this.delta.x > 0 ? -1 : 1;
            this.position.x -= this.delta.x;
            if (this.position.x < 0) {
                this.position.x = 0;
            }
            const oversize = this.getOversizeX();
            if (this.position.x > oversize) {
                this.position.x = oversize;
            }
        }
        if (this.delta.y !== 0) {
            this.delta.y += this.delta.y > 0 ? -1 : 1;
            this.position.y -= this.delta.y;
            if (this.position.y < 0) {
                this.position.y = 0;
            }
            const oversize = this.getOversizeY();
            if (this.position.y > oversize) {
                this.position.y = oversize;
            }
        }
    }

    public setScrollingTarget(deltaX: number, deltaY: number): void {
        this.delta.x = deltaX;
        this.delta.y = deltaY;
    }
}
