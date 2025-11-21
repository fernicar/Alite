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

import { Alite } from "../../../Alite";
import { Billboard, ZPositioning } from "./Billboard";
import { Explosion } from "./Explosion";

export class ExplosionBillboard extends Billboard {
    private static readonly serialVersionUID = -7178776348821798250;

    private static readonly EXPLOSION_FRAMES = 48;

    private currentFrame: number;
    private explosion: Explosion;

    constructor(ex: Explosion, frame: number) {
        super("Explosion", 0.0, 0.0, 0.0, 130.0, 130.0, "textures/explosion2.png",
            Alite.getInstance().getTextureManager().getSprite("textures/explosion2.png", "frame" + frame));
        this.explosion = ex;
        this.currentFrame = frame;
        this.setZPositioningMode(ZPositioning.Front);
        this.boundingSphereRadius = 150.0;
    }

    setFrame(frame: number): void {
        this.currentFrame = frame;
        if (this.currentFrame >= ExplosionBillboard.EXPLOSION_FRAMES || this.currentFrame < 0) {
            this.setRemove(true);
            return;
        }
        this.updateTextureCoordinates(Alite.getInstance().getTextureManager().getSprite("textures/explosion2.png", "frame" + frame));
    }

    public resize(newWidth: number, newHeight: number): void {
        super.resize(newWidth, newHeight);
        this.boundingSphereRadius = (newWidth + newHeight) / 2.0;
    }

    getFrame(): number {
        return this.currentFrame;
    }

    public getExplosion(): Explosion {
        return this.explosion;
    }
}
