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

import { Sound, SoundType } from "../Sound";
import { Timer } from "../Timer";
import { AliteLog } from "../../games/alite/AliteLog";

export class AndroidSound implements Sound {
    private readonly soundId: number;
    // private readonly soundPool: any; // SoundPool equivalent in Web Audio
    private currentStreamId = -1;
    private readonly soundType: SoundType;
    private delayToNextPlay = new Timer().setAutoResetWithImmediateAtFirstCall();

    constructor(soundPool: any, soundId: number, st: SoundType) {
        this.soundId = soundId;
        // this.soundPool = soundPool;
        this.soundType = st;
        AliteLog.d("AndroidSound", "Web Audio implementation needed for sound playback.");
    }

    public getType(): SoundType {
        return this.soundType;
    }

    public play(volume: number): void {
        // Web Audio API implementation needed
    }

    public playOnce(volume: number, delayInMs: number): void {
        if (this.delayToNextPlay.hasPassedMillis(delayInMs)) {
            this.play(volume);
        }
    }

    public repeat(volume: number): void {
        if (this.currentStreamId !== -1) {
            this.stop();
        }
        // Web Audio API implementation needed
    }

    public isPlaying(): boolean {
        return this.currentStreamId !== -1;
    }

    public stop(): void {
        if (this.currentStreamId !== -1) {
            // Web Audio API implementation needed
        }
        this.currentStreamId = -1;
    }

    public dispose(): void {
        // Web Audio API implementation needed
    }
}
