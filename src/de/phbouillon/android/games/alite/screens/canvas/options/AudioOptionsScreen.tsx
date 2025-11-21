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

import { Graphics } from "../../../framework/Graphics";
import { TouchEvent } from "../../../framework/Input";
import { SoundType } from "../../../framework/Sound";
import { Component } from "../../Component";
import { L } from "../../L";
import { ScreenCodes } from "../../ScreenCodes";
import { Settings } from "../../Settings";
import { Slider } from "../../Slider";
import { ColorScheme } from "../../colors/ColorScheme";
import { OptionsScreen } from "./OptionsScreen";

// This screen never needs to be serialized, as it is not part of the InGame state.
export class AudioOptionsScreen extends OptionsScreen {
    private static readonly SLIDER_STEP = 0.01;
    private readonly controls: Component<any>[] = new Array(7);

    public activate(): void {
        this.controls[0] = this.createFloatSlider(0, 0, 1,
            L.string("options_audio_music_volume"), Settings.volumes[SoundType.MUSIC])
            .setEvent(s => this.changeVolume(SoundType.MUSIC, s));
        this.controls[1] = this.createFloatSlider(1, 0, 1,
            L.string("options_audio_sound_fx_volume"), Settings.volumes[SoundType.SOUND_FX])
            .setEvent(s => this.changeVolume(SoundType.SOUND_FX, s));
        this.controls[2] = this.createFloatSlider(2, 0, 1,
            L.string("options_audio_combat_fx_volume"), Settings.volumes[SoundType.COMBAT_FX])
            .setEvent(s => this.changeVolume(SoundType.COMBAT_FX, s));
        this.controls[3] = this.createFloatSlider(3, 0, 1,
            L.string("options_audio_voice_volume"), Settings.volumes[SoundType.VOICE])
            .setEvent(s => this.changeVolume(SoundType.VOICE, s));
        this.controls[4] = this.createFloatSlider(4, 0, 1,
            L.string("options_audio_vibrate_level_on_damage"), Settings.vibrateLevelOnDamage)
            .setEvent(s => {
                Settings.vibrateLevelOnDamage = s.getCurrentValue(AudioOptionsScreen.SLIDER_STEP);
                Settings.save(this.game.getFileIO());
            }
            );
        this.controls[5] = this.createFloatSlider(5, 0, 1,
            L.string("options_audio_vibrate_level_on_hit"), Settings.vibrateLevelOnHit)
            .setEvent(s => {
                Settings.vibrateLevelOnHit = s.getCurrentValue(AudioOptionsScreen.SLIDER_STEP);
                Settings.save(this.game.getFileIO());
            }
            );
        this.controls[6] = this.createButton(6, L.string("options_back"))
            .setEvent(b => this.newScreen = new OptionsScreen());
    }


    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));

        this.displayTitle(L.string("title_audio_options"));
        for (const c of this.controls) {
            c.render(g);
        }
    }

    private changeVolume(type: SoundType, slider: Slider): void {
        Settings.volumes[type] = slider.getCurrentValue(AudioOptionsScreen.SLIDER_STEP);
        Settings.save(this.game.getFileIO());
    }


    protected processTouch(touch: TouchEvent): void {
        for (const c of this.controls) {
            if (c.checkEvent(touch)) {
                c.onEvent();
                return;
            }
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.AUDIO_OPTIONS_SCREEN;
    }
}
