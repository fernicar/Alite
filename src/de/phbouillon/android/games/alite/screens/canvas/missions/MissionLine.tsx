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

import { AliteLog } from "../../../AliteLog";
import { L } from "../../../L";

// Represents a line of dialogue in a mission, with associated text and an audio file.
export class MissionLine {
    private readonly text: string;
    private readonly speechObject: any; // AssetFileDescriptor equivalent
    private isPlaying = false;

    constructor(speechPath: string, text: string) {
        // L.rawDescriptor is Android-specific. This needs a web audio replacement.
        this.speechObject = speechPath == null ? null : null; // L.rawDescriptor(speechPath);
        this.text = text;
    }

    play(mp: any): void { // MediaPlayer equivalent
        if (this.isPlaying || this.speechObject == null) {
            return;
        }
        try {
            this.isPlaying = true;
            // The following is Android MediaPlayer logic and needs to be replaced with Web Audio API.
            // mp.reset();
            // mp.setDataSource(speechObject.getFileDescriptor(), speechObject.getStartOffset(), speechObject.getLength());
            // mp.setOnCompletionListener(this);
            // mp.prepare();
            // mp.start();
            AliteLog.d("MissionLine", `Simulating playback of: ${this.text}`);
            // For now, immediately call completion
            this.onCompletion(mp);
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Error playing speech file", "Error playing speech file", e);
            }
        }
    }

    isPlaying(): boolean {
        return this.isPlaying;
    }

    onCompletion(mp: any): void { // MediaPlayer
        this.isPlaying = false;
    }

    getText(): string {
        return this.text;
    }
}
