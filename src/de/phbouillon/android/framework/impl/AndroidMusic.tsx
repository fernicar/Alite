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

import { Music } from "../Music";
import { SoundType } from "../Sound";
import { AliteLog } from "../../games/alite/AliteLog";
import { Settings } from "../../games/alite/Settings";

export class AndroidMusic implements Music {
    // private readonly mediaPlayer: any; // HTMLAudioElement or Web Audio API equivalent
    private isPrepared = false;
    private readonly soundType: SoundType;
    private readonly musicInfo: string;
    private playWhenReady = false;

    constructor(fileName: any, soundType: SoundType, musicInfo: string) {
        // this.mediaPlayer = new Audio();
        this.musicInfo = musicInfo;

        AliteLog.d("Loading Music", `Loading Music ${musicInfo}, Type: ${soundType}`);
        try {
            // In a web context, you would set the src and handle events.
            // this.mediaPlayer.src = fileName; // Assuming fileName is a URL
            // this.mediaPlayer.addEventListener('canplaythrough', () => this.onPrepared(this.mediaPlayer));
            // this.mediaPlayer.addEventListener('ended', () => this.onCompletion(this.mediaPlayer));
            this.isPrepared = true; // Simulating preparedness for the stub
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e(`Loading Music ${musicInfo} caused an Error`, e.message, e);
                throw new Error(`Couldn't load music ${musicInfo}.`);
            }
        }
        this.soundType = soundType;
    }

    public onCompletion(mp: any): void {
        this.isPrepared = false;
    }

    public play(): void {
        // if (this.mediaPlayer.isPlaying()) {
        //     return;
        // }
        this.setVolume(Settings.volumes[this.soundType]);
        try {
            if (!this.isPrepared) {
                this.playWhenReady = true;
            } else {
                // this.mediaPlayer.play();
            }
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Music Playback", `Error occurred when trying to play back music ${this.musicInfo}.`, e);
            }
        }
    }

    public stop(): void {
        // this.mediaPlayer.pause();
        // this.mediaPlayer.currentTime = 0;
        this.isPrepared = false;
    }

    public pause(): void {
        // if (this.mediaPlayer.isPlaying()) {
        //     this.mediaPlayer.pause();
        // }
    }

    public setLooping(looping: boolean): void {
        // this.mediaPlayer.loop = looping;
    }

    public setVolume(volume: number): void {
        // this.mediaPlayer.volume = volume;
    }

    public isPlaying(): boolean {
        // return !this.mediaPlayer.paused;
        return false;
    }

    public isStopped(): boolean {
        return !this.isPrepared;
    }

    public isLooping(): boolean {
        // return this.mediaPlayer.loop;
        return false;
    }

    public dispose(): void {
        // No direct equivalent, but you can stop and release the source.
        this.stop();
    }

    public onPrepared(mp: any): void {
        this.isPrepared = true;
        if (this.playWhenReady) {
            // this.mediaPlayer.start();
        }
    }
}
