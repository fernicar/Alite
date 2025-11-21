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

import { Graphics } from "../Graphics";
import { Timer } from "../Timer";
import { Alite } from "../../games/alite/Alite";

export class PulsingHighlighter {
    private static readonly PULSE_UPDATE_FREQUENCY = 30; // ms

    private readonly x: number;
    private readonly y: number;
    private readonly width: number;
    private readonly height: number;
    private readonly delta: number;
    private readonly lightColor: number;
    private readonly darkColor: number;
    private currentDelta: number;
    private readonly timer = new Timer().setAutoResetWithImmediateAtFirstCall();
    private expansion = 1;

    constructor(x: number, y: number, width: number, height: number, delta: number, lightColor: number, darkColor: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.delta = delta;
        this.lightColor = lightColor;
        this.darkColor = darkColor;
        this.currentDelta = 0;
    }

    public display(deltaTime: number): void {
        const g = Alite.getInstance().getGraphics();
        g.diagonalGradientRect(this.x - this.currentDelta, this.y - this.currentDelta, this.width + 2 * this.currentDelta, this.height + 2 * this.currentDelta, this.lightColor, this.darkColor);
        g.rec3d(this.x - this.currentDelta, this.y - this.currentDelta, this.width + 2 * this.currentDelta, this.height + 2 * this.currentDelta, 3, this.darkColor, this.lightColor);
        if (this.timer.hasPassedMillis(PulsingHighlighter.PULSE_UPDATE_FREQUENCY)) {
            this.currentDelta += this.expansion;
            if (this.currentDelta < 0 || this.currentDelta > this.delta) {
                this.expansion = -this.expansion;
            }
        }
    }
}
