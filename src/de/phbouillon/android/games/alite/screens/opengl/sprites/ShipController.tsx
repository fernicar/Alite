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

import { TouchEvent } from "../../../../../framework/Input";
import { Rect } from "../../../../../framework/Rect";
import { Sprite } from "../../../../../framework/impl/gl/Sprite";
import { Alite } from "../../../Alite";
import { AliteHud } from "./AliteHud";

export abstract class ShipController {
    private static readonly serialVersionUID = 1603088074583149n;
    private accelY: number = 0;
    private accelZ: number = 0;

    protected genSprite(name: string, r: Rect): Sprite {
        // Careful: Rect is used as (x, y) - (width, height) here... So right and bottom are really width and height!
        return new Sprite(r.left, r.top, r.right, r.bottom,
            Alite.getInstance().getTextureManager().getSprite(AliteHud.TEXTURE_FILE, name), AliteHud.TEXTURE_FILE);
    }

    public getZ(): number {
        return this.accelZ;
    }

    public getY(): number {
        return this.accelY;
    }

    public update(deltaTime: number): void {
        if (this.isLeft()) { // left
            this.accelY += deltaTime * (this.accelY < 0 ? 5 : 1.66);
            if (this.accelY > 2) {
                this.accelY = 2;
            }
        } else if (this.isRight()) { // right
            this.accelY -= deltaTime * (this.accelY > 0 ? 5 : 1.66);
            if (this.accelY < -2) {
                this.accelY = -2;
            }
        } else {
            if (this.accelY > 0) {
                this.accelY -= deltaTime * 3.33;
                if (this.accelY < 0) {
                    this.accelY = 0.0;
                }
            } else if (this.accelY < 0) {
                this.accelY += deltaTime * 3.33;
                if (this.accelY > 0) {
                    this.accelY = 0.0;
                }
            }
        }

        if (this.isUp()) { // up
            this.accelZ -= deltaTime * (this.accelZ > 0 ? 5 : 1.66);
            if (this.accelZ < -2) {
                this.accelZ = -2;
            }
        } else if (this.isDown()) { // down
            this.accelZ += deltaTime * (this.accelZ < 0 ? 5 : 1.66);
            if (this.accelZ > 2) {
                this.accelZ = 2;
            }
        } else {
            if (this.accelZ > 0) {
                this.accelZ -= deltaTime * 3.33;
                if (this.accelZ < 0) {
                    this.accelZ = 0.0;
                }
            } else if (this.accelZ < 0) {
                this.accelZ += deltaTime * 3.33;
                if (this.accelZ > 0) {
                    this.accelZ = 0.0;
                }
            }
        }
    }

    protected abstract isDown(): boolean;
    protected abstract isUp(): boolean;
    protected abstract isRight(): boolean;
    protected abstract isLeft(): boolean;

    abstract handleUI(event: TouchEvent): boolean;
    abstract setDirections(left: boolean, right: boolean, up: boolean, down: boolean): void;
    abstract render(): void;
}
