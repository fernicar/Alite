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
import { AliteConfig } from "../../../AliteConfig";
import { Assets } from "../../../Assets";
import { L } from "../../../L";
import { AliteColor } from "../../../colors/AliteColor";
import { ColorScheme } from "../../../colors/ColorScheme";

export class ScrollingText {
    private static readonly serialVersionUID = -9124382771601908756;

    private readonly textToDisplay: string;
    private x = AliteConfig.SCREEN_WIDTH;
    private width: number;

    constructor() {
        let diffInSeconds = Math.floor(Alite.getInstance().getGameTime() / 1_000_000_000);
        const diffInDays = Math.floor(diffInSeconds / 86400);
        diffInSeconds -= diffInDays * 86400;
        const diffInHours = Math.floor(diffInSeconds / 3600);
        diffInSeconds -= diffInHours * 3600;
        const diffInMinutes = Math.floor(diffInSeconds / 60);

        this.textToDisplay = L.string("msg_pause_game_scrolling_info", AliteConfig.GAME_NAME,
            AliteConfig.VERSION_STRING, L.plurals("game_time_days", diffInDays, diffInDays),
            L.plurals("game_time_hours", diffInHours, diffInHours),
            L.plurals("game_time_minutes", diffInMinutes, diffInMinutes),
            Alite.getInstance().getPlayer().getScore());
        this.width = Assets.regularFont.getWidth(this.textToDisplay, 1.5);
    }

    render(deltaTime: number): void {
        this.x -= deltaTime * 128.0;
        Alite.getInstance().getGraphics().drawText(this.textToDisplay, Math.floor(this.x), 400,
            AliteColor.colorAlpha(ColorScheme.get(ColorScheme.COLOR_SCROLLING_TEXT), 1.0),
            Assets.regularFont, 1.5);
        if (this.x + this.width < -20) {
            this.x = AliteConfig.SCREEN_WIDTH;
        }
    }
}
