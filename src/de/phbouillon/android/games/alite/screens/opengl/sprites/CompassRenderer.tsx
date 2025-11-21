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

import { Sprite } from "../../../../../framework/impl/gl/Sprite";
import { Alite } from "../../../Alite";
import { AliteLog } from "../../../AliteLog";
import { AliteHud } from "./AliteHud";

export class CompassRenderer {
    private static readonly serialVersionUID = -4526005581209851369;
    private static readonly COMPASS_CENTER_X = 1348;
    private static readonly COMPASS_CENTER_Y = 704;

    private readonly compass: Sprite;
    private readonly compassDot: Sprite;
    private redDotActive = true;
    private planet: number[] = [0, 0, 0];

    constructor(hud: AliteHud) {
        this.compass = hud.genSprite("target", 1284, 640);
        this.compassDot = hud.genSprite("red", 1284 + 55, 640 + 55);
    }

    // Omitted readObject as it's Java-specific serialization

    setPlanet(x: number, y: number, z: number): void {
        this.planet[0] = x;
        this.planet[1] = y;
        this.planet[2] = z;
    }

    public render(): void {
        let l = Math.sqrt(this.planet[0] * this.planet[0] + this.planet[1] * this.planet[1] + this.planet[2] * this.planet[2]);
        if (Math.abs(l) < 0.001) {
            l = 1.0;
        }
        const x = Math.floor(CompassRenderer.COMPASS_CENTER_X + this.planet[0] * 64.0 / l);
        const y = Math.floor(CompassRenderer.COMPASS_CENTER_Y + this.planet[1] * -64.0 / l);

        if (this.planet[2] < 0 && !this.redDotActive) {
            this.compassDot.setTextureCoords(Alite.getInstance().getTextureManager().getSprite(AliteHud.TEXTURE_FILE, "red"));
            this.redDotActive = true;
        } else if (this.planet[2] > 0 && this.redDotActive) {
            this.compassDot.setTextureCoords(Alite.getInstance().getTextureManager().getSprite(AliteHud.TEXTURE_FILE, "green"));
            this.redDotActive = false;
        }

        this.compassDot.setPosition(x - 8, y - 8, x + 7, y + 7);

        this.compass.justRender();
        this.compassDot.simpleRender();
    }

    isTargetInCenter(): boolean {
        let l = Math.sqrt(this.planet[0] * this.planet[0] + this.planet[1] * this.planet[1] + this.planet[2] * this.planet[2]);
        if (Math.abs(l) < 0.001) {
            l = 1.0;
        }
        const x = Math.floor(CompassRenderer.COMPASS_CENTER_X + this.planet[0] * 64.0 / l);
        const y = Math.floor(CompassRenderer.COMPASS_CENTER_Y + this.planet[1] * -64.0 / l);

        return this.redDotActive && Math.abs(x - CompassRenderer.COMPASS_CENTER_X) < 4 && Math.abs(y - CompassRenderer.COMPASS_CENTER_Y) < 4;
    }
}
