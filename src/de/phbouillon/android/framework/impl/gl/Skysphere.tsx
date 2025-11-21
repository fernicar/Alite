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

import { Alite } from "../../../games/alite/Alite";
import { AliteLog } from "../../../games/alite/AliteLog";
import { Sphere } from "./Sphere";

export class Skysphere extends Sphere {
    private static readonly serialVersionUID = 4648170914967080291;

    constructor(radius: number, slices: number, stacks: number, textureFilename: string) {
        super(radius, slices, stacks, textureFilename, null, true);
    }

    // Custom serialization logic can be handled with libraries like `serialijse` if needed,
    // but for now, we'll omit the custom writeObject method.

    public render(): void {
        // All of the following are Android GLES11 calls and need to be replaced with WebGL.
        /*
        GLES11.glDisableClientState(GLES11.GL_NORMAL_ARRAY);
        GLES11.glEnableClientState(GLES11.GL_VERTEX_ARRAY);
        GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        GLES11.glDisable(GLES11.GL_CULL_FACE);

        GLES11.glVertexPointer(3, GLES11.GL_FLOAT, 0, vertexBuffer);
        GLES11.glTexCoordPointer(2, GLES11.GL_FLOAT, 0, texCoordBuffer);

        GLES11.glDisable(GLES11.GL_LIGHTING);
        GLES11.glColor4f(1.0, 1.0, 1.0, 1.0);
        Alite.getInstance().getTextureManager().setTexture(this.textureFilename);
        GLES11.glDrawArrays(this.glDrawMode, 0, this.numberOfVertices);
        GLES11.glEnable(GLES11.GL_LIGHTING);

        GLES11.glEnable(GLES11.GL_CULL_FACE);
        GLES11.glDisableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        GLES11.glDisableClientState(GLES11.GL_VERTEX_ARRAY);
        GLES11.glBindTexture(GLES11.GL_TEXTURE_2D, 0);
        */
        AliteLog.d("Skysphere", "WebGL rendering logic needed here.");
    }
}
