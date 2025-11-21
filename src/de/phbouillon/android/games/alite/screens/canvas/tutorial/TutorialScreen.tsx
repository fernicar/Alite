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

import { Graphics } from "../../framework/Graphics";
import { TouchEvent } from "../../framework/Input";
import { Screen } from "../../framework/Screen";
import { PulsingHighlighter } from "../../framework/impl/PulsingHighlighter";
import { GLES11 } from "../../framework/impl/gl/GLES11";
import { Alite } from "../Alite";
import { AliteConfig } from "../AliteConfig";
import { AliteLog } from "../AliteLog";
import { Assets } from "../Assets";
import { Button } from "../Button";
import { L } from "../L";
import { R } from "../R";
import { Settings } from "../Settings";
import { ColorScheme } from "../colors/ColorScheme";
import { Condition } from "../model/Condition";
import { Medal } from "../model/Medal";
import { MissionManager } from "../model/missions/MissionManager";
import { AliteScreen } from "./AliteScreen";
import { TextData } from "./TextData";
import { TutorialLine } from "./TutorialLine";
import { TutorialSelectionScreen } from "./TutorialSelectionScreen";

export abstract class TutorialScreen extends AliteScreen {
    public static readonly MISSION_COUNT = 7;
    private static readonly DIRECTORY_SOUND_TUTORIAL = `${Assets.DIRECTORY_SOUND}tutorial/`;
    private static readonly PLAYER_STATE_BACKUP = "tut_player_state.dat";

    private readonly lines: TutorialLine[] = [];
    private currentLine: TutorialLine;
    protected currentLineIndex: number;
    private textData: TextData[];
    protected readonly mediaPlayer: any; // Stub
    private readonly id: number;
    private readonly isGl: boolean;
    protected hideCloseButton: boolean;

    private tutorialAborted: boolean;
    private gotoNext = Settings.continuousTutorialMode;
    private closeButton: Button;

    private currentX = -1;
    private currentY = -1;
    private currentWidth = -1;
    private currentHeight = -1;

    constructor(id: number, gl: boolean) {
        super();
        this.id = id;
        this.isGl = gl;
        this.currentLineIndex = -1;
        this.currentLine = null;
        this.mediaPlayer = { play: () => {}, reset: () => {} }; // Stub
        this.restorePlayerState();
        this.backupPlayerState();
        MissionManager.getInstance().clearActiveMissions();
    }

    private async restorePlayerState(): Promise<void> {
        // ... Web-based state restoration logic (e.g., from IndexedDB)
    }

    private async backupPlayerState(): Promise<void> {
        // ... Web-based state backup logic (e.g., to IndexedDB)
    }

    public activate(): void {
        this.closeButton = Button.createPictureButton(0, 970, 110, 110, Assets.noIcon);
        this.restorePlayerState();
        this.backupPlayerState();
        MissionManager.getInstance().clearActiveMissions();
    }

    protected makeHighlight(x: number, y: number, width: number, height: number): PulsingHighlighter {
        return new PulsingHighlighter(x, y, width, height, 20,
            ColorScheme.get(ColorScheme.COLOR_PULSING_HIGHLIGHTER_LIGHT),
            ColorScheme.get(ColorScheme.COLOR_PULSING_HIGHLIGHTER_DARK));
    }

    protected renderText(): void {
        // ... rendering logic ...
    }

    protected addLine(line: string, option: string = null): TutorialLine {
        // ... logic to add a tutorial line ...
        return new TutorialLine(null, ""); // Stub
    }

    protected addEmptyLine(): TutorialLine {
        const result = new TutorialLine(null, "").setHeight(0).setWidth(0);
        this.lines.push(result);
        return result;
    }

    protected updateNavBar(): Screen {
        for (const event of this.game.getInput().getTouchEvents()) {
            const screen = this.game.getNavigationBar().checkNavigationBar(event);
            if (screen) {
                this.game.getNavigationBar().resetPending();
                return screen;
            }
        }
        return null;
    }

    protected abstract doPresent(deltaTime: number): void;
    protected renderGlPart(deltaTime: number): void {}
    protected doUpdate(deltaTime: number): void {}

    public renderNavigationBar(): void {
        if (!this.isGl) super.renderNavigationBar();
    }

    public present(deltaTime: number): void {
        if (this.isGl) {
            this.renderGlPart(deltaTime);
            this.setUpForDisplay();
        }
        if (this.currentLine) this.currentLine.prePresent(deltaTime);
        this.doPresent(deltaTime);
        if (!this.hideCloseButton) this.closeButton.render(this.game.getGraphics());
        if (this.currentLine) this.currentLine.postPresent(deltaTime);
    }

    public postNavigationRender(deltaTime: number): void {
        if (this.currentLine) {
            this.currentLine.renderHighlights(deltaTime);
        }
    }

    private checkTutorialClose(touch: TouchEvent): void {
        if (this.closeButton.isPressed(touch)) {
            this.showQuestionDialog(L.string(R.string.tutorial_quit_confirm));
        }
    }

    public processTouch(event: TouchEvent): void {
        super.processTouch(event);
        if (this.messageResult === AliteScreen.RESULT_YES) {
            if (this.currentLine) this.mediaPlayer.reset();
            this.tutorialAborted = true;
            this.newScreen = new TutorialSelectionScreen();
            this.performScreenChange();
            this.postScreenChange();
        }
        this.messageResult = AliteScreen.RESULT_NONE;
    }

    public update(deltaTime: number): void {
        if (this.tutorialAborted) {
            this.game.getInput().getTouchEvents();
            return;
        }

        if (!this.hideCloseButton) {
            for (const event of this.game.getInput().getAndRetainTouchEvents()) {
                this.processTouch(event);
                if (this.tutorialAborted) return;
                this.checkTutorialClose(event);
            }
        }
        // ... rest of update logic ...
    }

    protected setFinished(line: TutorialLine): void {
        line.setFinished();
        this.gotoNext = true;
    }

    public dispose(): void {
        this.restorePlayerState();
        super.dispose();
        Settings.load(this.game.getFileIO());
        this.game.getPlayer().setCondition(Condition.DOCKED);
        this.game.getNavigationBar().setActiveIndex(Alite.NAVIGATION_BAR_ACADEMY);
        if (this.currentLineIndex + 1 >= this.lines.length && !this.tutorialAborted) {
            Medal.setGameLevelBitValue(Medal.MEDAL_ID_TUTORIAL, 1 << (this.id - 1));
            Settings.save(this.game.getFileIO());
        }
    }

    public pause(): void {
        super.pause();
        if (this.mediaPlayer) this.mediaPlayer.reset();
    }

    public saveScreenState(dos: any): void { // Stub for DataOutputStream
        this.game.saveCommander(dos);
        super.saveScreenState(dos);
    }

    protected loadScreenState(dis: any): void { // Stub for DataInputStream
        this.game.loadCommander(dis);
    }
}
