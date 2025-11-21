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
import { Game } from "../Game";
import { Graphics } from "../Graphics";
import { Input } from "../Input";
import { Screen } from "../Screen";
import { Texture } from "../Texture";
import { TimeFactorChangeListener } from "../TimeFactorChangeListener";
import { Timer } from "../Timer";
import { Rect } from "../Rect";
import { AliteLog } from "../../games/alite/AliteLog";
import { Settings } from "../../games/alite/Settings";
import { FatalExceptionScreen } from "../../games/alite/screens/canvas/FatalExceptionScreen";
import { TextureManager } from "../../games/alite/screens/opengl/TextureManager";
import { AndroidAudio } from "./AndroidAudio";
import { AndroidGraphics } from "./AndroidGraphics";
import { AndroidInput } from "./AndroidInput";
import { GlUtils } from "./gl/GlUtils";

enum GLGameState {
    Initialized,
    Running,
    Paused,
    Finished,
    Idle
}

export abstract class AndroidGame implements Game {
    public static resetting = false;
    public static fps: number;
    public static scaleFactor: number;

    private glView: HTMLCanvasElement;
    private graphics: Graphics;
    private audio: Audio;
    private input: Input;
    private fileIO: FileIO;
    private screen: Screen;
    private readonly targetHeight: number;
    private readonly targetWidth: number;
    private deviceHeight: number;
    private deviceWidth: number;
    private state = GLGameState.Initialized;
    private ticker: Timer;
    private scheduler: Timer;
    private frames = 0;
    private timeFactor = 1;
    private textureManager: Texture;
    private fatalException: FatalExceptionScreen = null;
    private timeFactorChangeListener: TimeFactorChangeListener = null;

    constructor(targetWidth: number, targetHeight: number) {
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this.textureManager = this.getTextureManager();

        // Basic setup for a web environment
        this.glView = document.createElement('canvas');
        document.body.appendChild(this.glView);
        this.getDisplaySize();
        this.glView.width = this.deviceWidth;
        this.glView.height = this.deviceHeight;

        this.audio = new AndroidAudio(this, this.getFileIO());
        this.createInputIfNecessary();

        // Start the game loop
        this.ticker = new Timer();
        this.scheduler = new Timer().setAutoReset();
        this.onSurfaceCreated();
        requestAnimationFrame(this.onDrawFrame.bind(this));
    }

    private getDisplaySize() {
        this.deviceWidth = window.innerWidth;
        this.deviceHeight = window.innerHeight;
    }

    protected createInputIfNecessary() {
        if (!this.input || this.input.isDisposed()) {
            const aspect = this.calculateTargetRect(new Rect(0, 0, this.deviceWidth, this.deviceHeight));
            this.input = new AndroidInput(this, this.glView, this.targetWidth / aspect.width(), this.targetHeight / aspect.height(), aspect.left, aspect.top);
        }
    }


    public onSurfaceCreated(): void {
        AliteLog.d("AndroidGame", `onSurfaceCreated is called on ${this.screen}`);
        this.getDisplaySize();
        // Initialize WebGL context here...

        this.screen = this.getStartScreen();
        this.screen.loadAssets();
        this.screen.activate();
        this.screen.resume();
    }

     public onDrawFrame(): void {
        requestAnimationFrame(this.onDrawFrame.bind(this));

        const now = performance.now();
        const deltaTime = this.ticker ? (now - this.ticker.getStartTime()) / 1000 : 0.016;
        if(this.ticker) this.ticker.reset(); else this.ticker = new Timer();

        if (this.state === GLGameState.Running) {
            this.screen.update(deltaTime);
            if (!this.screen.isDisposed()) {
                this.screen.present(deltaTime);
            }
            this.screen.postPresent(deltaTime);
            this.screen.renderNavigationBar();
            this.screen.postNavigationRender(deltaTime);

            this.frames++;
            if (Settings.displayFrameRate && this.scheduler.getPassedSeconds() >= 1) {
                AndroidGame.fps = this.frames;
                this.frames = 0;
            }
        }
        // ... handle other states ...
    }

    protected abstract getStartScreen(): Screen;
    protected abstract saveState(screen: Screen): void;

    public setTimeFactorChangeListener(tfl: TimeFactorChangeListener) { this.timeFactorChangeListener = tfl; }
    public getTextureManager(): Texture {
        if (!this.textureManager) this.textureManager = new TextureManager(this);
        return this.textureManager;
    }
    public getDeviceRatio(): number { return this.deviceWidth / this.deviceHeight; }
    public onResume(): void { /* Logic for resuming the game */ this.state = GLGameState.Running; }
    public onPause(): void { /* Logic for pausing the game */ this.state = GLGameState.Paused; }
    public getInput(): Input { return this.input; }
    public getFileIO(): FileIO {
        if (!this.fileIO) this.fileIO = {} as FileIO; // Stub: new AndroidFileIO(this)
        return this.fileIO;
    }

    public getGraphics(): Graphics {
        if (!this.graphics) {
            const aspect = this.calculateTargetRect(new Rect(0, 0, this.deviceWidth, this.deviceHeight));
            this.graphics = new AndroidGraphics(this.getFileIO(), AndroidGame.scaleFactor, aspect, this.textureManager);
        }
        return this.graphics;
    }

    public getAudio(): Audio { return this.audio; }

    public setScreen(screen: Screen): void {
        if (!screen) throw new Error("Screen must not be null");
        if (this.screen) this.screen.pause();
        this.textureManager.clear();

        this.screen = screen;
        screen.loadAssets();
        screen.activate();
        screen.resume();
        screen.update(0);
        if (this.graphics) this.graphics.setClip(-1, -1, -1, -1);
    }

    public getCurrentScreen(): Screen { return this.screen; }
    protected getCurrentView(): HTMLElement { return this.glView; }

    private calculateTargetRect(rect: Rect): Rect {
        const width = rect.width();
        const height = rect.height();
        const xFactor = this.targetWidth / width;
        const yFactor = this.targetHeight / height;

        let x1, y1, x2, y2, finalWidth, finalHeight;
        if (xFactor > yFactor) {
            finalWidth = width;
            finalHeight = Math.floor(this.targetHeight / xFactor);
            x1 = rect.left;
            y1 = rect.top + Math.floor((height - finalHeight) / 2);
            AndroidGame.scaleFactor = 1.0 / xFactor;
        } else {
            finalHeight = height;
            finalWidth = Math.floor(this.targetWidth / yFactor);
            x1 = rect.left + Math.floor((width - finalWidth) / 2);
            y1 = rect.top;
            AndroidGame.scaleFactor = 1.0 / yFactor;
        }
        x2 = x1 + finalWidth;
        y2 = y1 + finalHeight;

        return new Rect(x1, y1, x2, y2);
    }

    public getTimeFactor(): number { return this.timeFactor; }
    public setTimeFactor(tf: number): void {
        if (this.timeFactorChangeListener && this.timeFactor !== tf) {
            this.timeFactorChangeListener.timeFactorChanged(this.timeFactor, tf);
        }
        this.timeFactor = tf;
    }
}
