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

import { ResourceStream } from "../../../../../../../../framework/ResourceStream";
import { Texture } from "../../../../../../../../framework/Texture";
import { SpriteData } from "../../../../../../../../framework/SpriteData";

export class TestTexture implements Texture {
    public addTexture(fileName: string): number {
        return 0;
    }

    public addTextureFromStream(fileName: string, textureInputStream: ResourceStream): number {
        return 0;
    }

    public checkTexture(fileName: string): boolean {
        return false;
    }

    public addTexture(name: string, bitmap: any): number { // Bitmap
        return 0;
    }

    public freeTexture(fileName: string): void {

    }

    public setTexture(fileName: string, textureInputStream?: ResourceStream): void {

    }

    public getSprite(fileName: string, spriteName: string): SpriteData {
        return new SpriteData("", 0, 0, 100, 100, 100, 100);
    }

    public freeAllTextures(): void {

    }

    public reloadAllTextures(): void {

    }

    public clear(): void {

    }
}
