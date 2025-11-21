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

import { GlScreen } from "../../framework/GlScreen";
import { Music } from "../../framework/Music";
import { Timer } from "../../framework/Timer";
import { TouchEvent } from "../../framework/Input";
import { GLES11 } from "../../framework/impl/gl/GLES11";
import { GlUtils } from "../../framework/impl/gl/GlUtils";
import { Sprite } from "../../framework/impl/gl/Sprite";
import { Alite } from "../Alite";
import { AliteConfig } from "../AliteConfig";
import { Assets } from "../Assets";
import { L } from "../L";
import { R } from "../R";
import { Settings } from "../Settings";
import { SoundManager } from "../SoundManager";
import { AliteColor } from "../colors/AliteColor";
import { ColorScheme } from "../colors/ColorScheme";
import { Medal } from "../model/Medal";
import { LoadingScreen } from "./canvas/LoadingScreen";
import { TextData } from "./canvas/TextData";
import { OptionsScreen } from "./canvas/options/OptionsScreen";

export class AboutScreen extends GlScreen {
    private static readonly WAIT_CYCLE_IN_50_MICROS = 60; // 3s
    private static readonly formatter = [
        "  03.0w", // 0 - MAIN_TITLE
        "3001.5d", // 1 - TITLE_1
        "2501.5d", // 2 - TITLE_2
        "2001.5d", // 3 - TITLE_3
        "1001.5d", // 4 - TITLE_4
        " 602.0p", // 5 - FIRST_ELEMENT
        " 902.0p", // 6 - FURTHER_ELEMENT
        " 902.0o", // 7 - ADDITIONAL_TEXT
        "2002.0p", // 8 - VIP_TEXT
        "2501.5p", // 9 - ELITE_TEXT
        " 601.5p", // 10 - ELITE_TEXT
        " 601.5d"  // 11 - BLUE_DANUBE_TEXT
    ];

    private background: Sprite;
    private aliteLogo: Sprite;
    private readonly timer = new Timer().setAutoReset();
    private endCreditsMusic: Music;
    private alpha = 0.0001;
    private globalAlpha = 1.0;
    private mode: number;
    private y = 1200;
    private returnToOptions = false;
    private musicVolume = Settings.volumes[1]; // SoundType.MUSIC
    private readonly game: Alite;

    private pendingMode = -1;
    private readonly texts: TextData[];

    constructor(pendingMode: number = -1, y?: number, alpha?: number) {
        super();
        this.game = Alite.get();
        this.background = new Sprite(0, 0, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT, 0, 0, 1, 1, "textures/star_map_title.png");
        this.aliteLogo = new Sprite(0, 0, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT, 0, 0, 1615 / 2048, AliteConfig.SCREEN_HEIGHT / 2048, "title_logo.png");
        this.aliteLogo.scale(0.96, 0, 0, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT);
        this.endCreditsMusic = this.game.getAudio().newMusic(`${LoadingScreen.DIRECTORY_MUSIC}end_credits.mp3`);

        this.texts = L.string(R.string.about, AliteConfig.GAME_NAME).split("\n").map(s => {
            const b = s.indexOf('[');
            const e = s.indexOf(']');
            return this.createLine(parseInt(s.substring(b + 1, e)), s.substring(e + 1));
        });

        if (pendingMode !== -1) {
            this.pendingMode = pendingMode;
            this.y = y;
            this.alpha = alpha;
        }
    }

    private createLine(formatIndex: number, text: string): TextData {
        const sequence = AboutScreen.formatter[formatIndex];
        const height = parseInt(sequence.substring(0, 3).trim(), 10);
        const scale = parseFloat(sequence.substring(3, 6));
        let color: number;
        switch (sequence.charAt(6)) {
            case 'd': color = ColorScheme.get(ColorScheme.COLOR_CREDITS_DESCRIPTION); break;
            case 'p': color = ColorScheme.get(ColorScheme.COLOR_CREDITS_PERSON); break;
            case 'o': color = ColorScheme.get(ColorScheme.COLOR_CREDITS_ADDITION); break;
            default: color = ColorScheme.get(ColorScheme.COLOR_MESSAGE);
        }
        const lastY = this.texts.length > 0 ? this.texts[this.texts.length - 1].y : 0;
        const td = new TextData(text, 960, lastY + height, color, null);
        td.scale = scale;
        return td;
    }


    public onActivation(): void {
        this.endCreditsMusic.setLooping(true);
        this.endCreditsMusic.play();
        this.initializeGl();
        this.mode = this.pendingMode === -1 ? 0 : this.pendingMode;
        this.pendingMode = -1;
    }

    // ... other methods like saveScreenState, initializeGl, performUpdate, performPresent

    public dispose(): void {
        super.dispose();
        if (this.aliteLogo) {
            this.aliteLogo.destroy();
            this.aliteLogo = null;
        }
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        this.disposeMusic();
    }

    private disposeMusic(): void {
        if (this.endCreditsMusic) {
            this.endCreditsMusic.stop();
            this.endCreditsMusic.dispose();
            this.endCreditsMusic = null;
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.ABOUT_SCREEN;
    }
}
