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

import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { GalaxyScreen } from "./GalaxyScreen";

//This screen never needs to be serialized, as it is not part of the InGame state.
export class LocalScreen extends GalaxyScreen {

    // default public constructor is required for navigation bar
    constructor(zoomFactor?: number, centerX?: number, centerY?: number) {
        if (zoomFactor !== undefined && centerX !== undefined && centerY !== undefined) {
            super(zoomFactor, centerX, centerY);
        } else {
            super();
        }
    }

    public activate(): void {
        const player = this.game.getPlayer();
        const hyper = player.getHyperspaceSystem();
        this.initPosition(hyper == null ? player.getPosition().x : hyper.getX(),
            hyper == null ? player.getPosition().y : hyper.getY(), 4);
        this.activateScreen(L.string("title_local_nav_chart"));
    }

    public getScreenCode(): number {
        return ScreenCodes.LOCAL_SCREEN;
    }
}
