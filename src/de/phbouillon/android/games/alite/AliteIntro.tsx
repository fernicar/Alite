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

import { AliteGame } from "./AliteGame";
import { L } from "./L";
import { R } from "./R";
import { AliteLog } from "./AliteLog";
import { AliteStartManager } from "./AliteStartManager";
import { Medal } from "./model/Medal";
import { Settings } from "./Settings";

// This class is a temporary placeholder to manage the intro video playback.
// In a web environment, this would be handled by the main application logic,
// likely showing a video element and then hiding it to reveal the main game canvas.
export class AliteIntro {
    private static readonly DIRECTORY_INTRO = "intro/";
    private static readonly INTRO_FILE_NAME = "alite_intro";
    private static readonly INTRO_SUBTITLE_FILE_NAME = AliteIntro.INTRO_FILE_NAME + ".vtt";

    private stopPosition: number = 0;
    private aliteStarted: boolean = false;
    private videoView: HTMLVideoElement;
    private subtitleOn: boolean = false;
    private subtitleStateChangedAfter3s: boolean = false;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public async start(): Promise<void> {
        // Initialize basic services like in the original onCreate
        // AliteLog.initialize(...); // Assuming initialized elsewhere
        // Settings.load(...); // Assuming loaded elsewhere
        L.getInstance().setLocale(Settings.locale);

        // Set up the uncaught exception handler for the browser
        const oldHandler = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            AliteLog.e("Uncaught Exception (AliteIntro)", `Message: ${error?.message}`, error);
            if (oldHandler) {
                return oldHandler(message, source, lineno, colno, error);
            }
            return false;
        };

        this.initializeVideoView();

        this.videoView.src = this.getIntroName();
        this.addSubtitle();

        this.videoView.load();
        this.videoView.play().catch(e => AliteLog.w("AliteIntro", "Video playback failed to start automatically.", e));

        AliteLog.d("AliteIntro.start", "Intro setup complete");
    }

    private getIntroName(): string {
        AliteLog.d("AliteIntro.Video Playback", "Using video resolution 1920x1080");
        // Path to the video file in the web assets
        return `${AliteIntro.DIRECTORY_INTRO}${AliteIntro.INTRO_FILE_NAME}_b1920.mp4`;
    }

    private addSubtitle(): void {
        const currentLocale = L.getInstance().getCurrentLocale();
        const subtitleSrc = `${AliteIntro.DIRECTORY_INTRO}${AliteIntro.INTRO_SUBTITLE_FILE_NAME}`; // Assuming one subtitle file for now

        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = currentLocale;
        track.srclang = currentLocale;
        track.src = subtitleSrc;
        track.default = true;

        this.videoView.appendChild(track);
        this.videoView.textTracks[0].mode = 'hidden'; // Initially off
        this.subtitleOn = false;
    }


    private initializeVideoView(): void {
        this.videoView = document.createElement('video');
        this.videoView.style.width = '100%';
        this.videoView.style.height = '100%';
        this.videoView.style.objectFit = 'cover';
        this.videoView.style.position = 'absolute';
        this.videoView.style.top = '0';
        this.videoView.style.left = '0';
        this.videoView.style.backgroundColor = 'black';
        this.videoView.setAttribute('playsinline', 'true'); // For iOS

        this.container.appendChild(this.videoView);

        this.videoView.addEventListener('click', () => {
            this.startAlite();
        });

        this.videoView.addEventListener('ended', () => {
            if (!this.subtitleStateChangedAfter3s) {
                Medal.setGameLevelBitValue(Medal.MEDAL_ID_INTRO, this.subtitleOn ? 2 : 1);
            }
            this.startAlite();
        });

        this.videoView.addEventListener('error', (e) => {
            const error = this.videoView.error;
            const cause = `Code ${error?.code}: ${error?.message}`;
            AliteLog.d("AliteIntro.Intro Playback Error", `Couldn't playback intro. ${cause}`);

            const errorText = document.createElement('div');
            errorText.style.position = 'absolute';
            errorText.style.color = 'white';
            errorText.style.textAlign = 'center';
            errorText.style.top = '50%';
            errorText.style.width = '100%';
            errorText.style.transform = 'translateY(-50%)';
            errorText.innerText = L.string(R.string.intro_error, cause, '');
            errorText.addEventListener('click', () => this.startAlite());
            this.container.appendChild(errorText);
        });

        this.videoView.addEventListener('canplay', () => {
            AliteLog.d("AliteIntro.VideoView", "VideoView is prepared. Playing video.");
            if (this.stopPosition > 0) {
                this.videoView.currentTime = this.stopPosition;
            }
            this.videoView.play();
        });

        this.createSubtitleButton();
        this.addVisibilityHandlers();
    }

    private createSubtitleButton(): void {
        const subtitleButton = document.createElement('button');
        subtitleButton.id = 'subtitle';
        subtitleButton.style.position = 'absolute';
        subtitleButton.style.bottom = '20px';
        subtitleButton.style.right = '20px';
        subtitleButton.style.zIndex = '10';
        subtitleButton.style.padding = '10px';
        subtitleButton.style.border = 'none';
        subtitleButton.style.cursor = 'pointer';
        // The background images would need to be handled via CSS classes
        subtitleButton.classList.add(this.subtitleOn ? 'subtitle_nat' : 'subtitle');

        subtitleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent video click
            if (this.videoView.textTracks.length > 0) {
                if (this.videoView.currentTime > 3) {
                    this.subtitleStateChangedAfter3s = true;
                }
                this.subtitleOn = !this.subtitleOn;
                this.videoView.textTracks[0].mode = this.subtitleOn ? 'showing' : 'hidden';
                subtitleButton.classList.toggle('subtitle_nat', this.subtitleOn);
                subtitleButton.classList.toggle('subtitle', !this.subtitleOn);
            }
        });

        this.container.appendChild(subtitleButton);
    }


    private addVisibilityHandlers(): void {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onPause();
            } else {
                this.onResume();
            }
        });
    }

    private onPause(): void {
        if (!this.videoView || this.aliteStarted) return;
        AliteLog.d("AliteIntro.onPause", "onPause begin");
        this.stopPosition = this.videoView.currentTime;
        this.videoView.pause();
        AliteLog.d("AliteIntro.onPause", "onPause end");
    }

    private onResume(): void {
        if (!this.videoView || this.aliteStarted) return;
        AliteLog.d("AliteIntro.onResume", "onResume begin");
        this.videoView.play();
        AliteLog.d("AliteIntro.onResume", "onResume end");
    }


    private startAlite(): void {
        AliteLog.d("AliteIntro.startAlite call", "startAlite begin");
        if (this.aliteStarted) {
            return;
        }
        this.aliteStarted = true;

        // Clean up video player
        this.videoView.pause();
        this.container.innerHTML = ''; // Remove video and buttons

        AliteLog.d("AliteIntro.startAlite", "Starting Alite game instance");

        // Instead of starting an intent, we create the main game object
        // and tell it to start.
        const game = new AliteGame(this.container);
        game.start();

        AliteLog.d("AliteIntro.startAlite", "Done");
    }
}
