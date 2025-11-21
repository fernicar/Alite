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

import { Audio } from "../Audio";
import { FileIO } from "../FileIO";
import { Music } from "../Music";
import { Sound, SoundType } from "../Sound";
import { AliteLog } from "../../games/alite/AliteLog";
import { L } from "../../games/alite/L";
import { AndroidMusic } from "./AndroidMusic";
import { AndroidSound } from "./AndroidSound";

export class AndroidAudio implements Audio {
    private static readonly MAXIMUM_NUMBER_OF_CONCURRENT_SAMPLES = 20;

    // private readonly soundPool: any; // Web Audio API AudioContext equivalent
    private readonly fileIO: FileIO;

    constructor(activity: any, fileIO: FileIO) {
        // activity.setVolumeControlStream(AudioManager.STREAM_MUSIC);
        this.fileIO = fileIO;
        // this.soundPool = new SoundPool(MAXIMUM_NUMBER_OF_CONCURRENT_SAMPLES, AudioManager.STREAM_MUSIC, 0);
        AliteLog.d("AndroidAudio", "Web Audio implementation needed for audio management.");
    }

    public async newMusic(fileName: string): Promise<Music> {
        try {
            const privatePath = await this.fileIO.getPrivatePath(fileName);
            return new AndroidMusic(privatePath, SoundType.MUSIC, fileName);
        } catch (ignored) {
            AliteLog.e("Cannot load music", `Music ${fileName} not found.`);
            return null;
        }
    }

    public newSound(fileName: string): Sound {
        return this.internalNewSound(fileName, SoundType.SOUND_FX);
    }

    public newCombatSound(fileName: string): Sound {
        return this.internalNewSound(fileName, SoundType.COMBAT_FX);
    }

    private internalNewSound(fileName: string, soundType: SoundType): Sound {
        try {
            AliteLog.d("Loading Sound", `Loading sound ${fileName}`);
            // const soundId = this.soundPool.load(this.fileIO.getPrivatePath(fileName), 0);
            // return new AndroidSound(this.soundPool, soundId, soundType);
            return new AndroidSound(null, 0, soundType); // Stubbed implementation
        } catch (ignored) {
            AliteLog.e("Cannot load sound", `Sound ${fileName} not found.`);
            return null;
        }
    }

    public newSoundAsset(fileName: string): Sound {
        try {
            AliteLog.d("Loading Sound Asset", `Loading sound asset ${fileName}`);
            // const soundId = this.soundPool.load(L.rawDescriptor(fileName), 0);
            // return new AndroidSound(this.soundPool, soundId, SoundType.VOICE);
            return new AndroidSound(null, 0, SoundType.VOICE); // Stubbed implementation
        } catch (ignored) {
            AliteLog.e("Cannot load sound asset", `Sound asset ${fileName} not found.`);
            return null;
        }
    }
}
