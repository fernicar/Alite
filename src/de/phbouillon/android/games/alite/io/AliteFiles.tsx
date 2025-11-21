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

import { IMethodHook } from "../../../framework/IMethodHook";
import { AliteLog } from "../AliteLog";

export class AliteFiles {
    /**
     * In the original Android version, this method mounted the OBB expansion file.
     * For the PC port, we will assume the files are always available and immediately
     * call the success hook.
     * @param context Android Context (not used)
     * @param methodHook The callback to execute on successful "mount".
     * @param errorHook The callback to execute on failure (not used in this stub).
     */
    public static performMount(context: any, methodHook: IMethodHook, errorHook: IMethodHook): void {
        AliteLog.d("AliteFiles", "Simulating OBB mount. Assuming assets are available.");
        // Immediately execute the success callback.
        methodHook.execute(0);
    }

    /**
     * In the original Android version, this method unmounted the OBB expansion file.
     * For the PC port, this is a no-op.
     */
    public static performUnmount(): void {
        AliteLog.d("AliteFiles", "Simulating OBB unmount. No action taken.");
    }
}
