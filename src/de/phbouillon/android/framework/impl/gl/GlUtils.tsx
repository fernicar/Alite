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

import { Game } from "../Game";
import { Rect } from "../Rect";
import { AliteLog } from "../../games/alite/AliteLog";

export class GlUtils {
    public static setViewport(game: Game): void {
        const r = game.getGraphics().getVisibleArea();
        // GLES11.glViewport(r.left, r.top, r.width(), r.height());
        AliteLog.d("GlUtils", "setViewport needs WebGL implementation.");
    }

    public static gluPerspective(game: Game, fovy: number, znear: number, zfar: number): void;
    public static gluPerspective(fovy: number, aspect: number, znear: number, zfar: number): void;
    public static gluPerspective(arg1: any, arg2: any, arg3: any, arg4?: any): void {
        if (arg1 instanceof Game) {
            const game = arg1 as Game;
            const r = game.getGraphics().getVisibleArea();
            this.gluPerspective(arg2, r.width() / r.height(), arg3, arg4);
        } else {
            const fovy = arg1 as number;
            const aspect = arg2 as number;
            const znear = arg3 as number;
            const zfar = arg4 as number;
            const ymax = znear * Math.tan(fovy * Math.PI / 360.0);
            const ymin = -ymax;
            const xmin = ymin * aspect;
            const xmax = ymax * aspect;
            // GLES11.glFrustumf(xmin, xmax, ymin, ymax, znear, zfar);
            AliteLog.d("GlUtils", "gluPerspective needs WebGL implementation.");
        }
    }

    public static ortho(game: Game): void {
        const r = game.getGraphics().getVisibleArea();
        // GLES11.glOrthof(r.left, r.right, r.bottom, r.top, 0.0, 1.0);
        AliteLog.d("GlUtils", "ortho needs WebGL implementation.");
    }

    public static allocateFloatBuffer(capacity: number): Float32Array {
        return new Float32Array(capacity);
    }

    public static toFloatBufferPositionZero(values: number[]): Float32Array {
        return new Float32Array(values);
    }

    public static toShortBufferPositionZero(values: number[]): Int16Array {
        return new Int16Array(values);
    }
}
