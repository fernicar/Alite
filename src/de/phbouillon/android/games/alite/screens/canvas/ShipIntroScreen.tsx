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

import { Music } from "../../framework/Music";
import { Timer } from "../../framework/Timer";
import { TouchEvent } from "../../framework/Input";
import { GLES11 } from "../../framework/impl/gl/GLES11";
import { GlUtils } from "../../framework/impl/gl/GlUtils";
import { Vector3f } from "../../framework/math/Vector3f";
import { Alite } from "../Alite";
import { AliteConfig } from "../AliteConfig";
import { AliteLog } from "../AliteLog";
import { Assets } from "../Assets";
import { Button } from "../Button";
import { L } from "../L";
import { R } from "../R";
import { ScreenCodes } from "../ScreenCodes";
import { ColorScheme } from "../colors/ColorScheme";
import { ObjectType } from "../opengl/ingame/ObjectType";
import { SkySphereSpaceObject } from "../opengl/objects/SkySphereSpaceObject";
import { MathHelper } from "../opengl/objects/space/MathHelper";
import { SpaceObject } from "../opengl/objects/space/SpaceObject";
import { SpaceObjectAI } from "../opengl/objects/space/SpaceObjectAI";
import { SpaceObjectFactory } from "../opengl/objects/space/SpaceObjectFactory";
import { AliteScreen } from "./AliteScreen";
import { LoadScreen } from "./LoadScreen";
import { StatusScreen } from "./StatusScreen";
import { LoadingScreen } from "./LoadingScreen";

enum DisplayMode {
    ZOOM_IN,
    DANCE,
    ZOOM_OUT
}

export class ShipIntroScreen extends AliteScreen {
    private static readonly DEBUG_EXHAUST = false;
    private static readonly ONLY_CHANGE_SHIPS_AFTER_SWEEP = false;
    private static readonly SHOW_DOCKING = false;
    private static readonly DANCE = true;

    private skysphere: SkySphereSpaceObject;
    private currentShip: SpaceObject;

    private readonly timer = new Timer().setAutoReset();
    private readonly danceTimer = new Timer().setAutoReset();
    private readonly currentDelta = new Vector3f(0, 0, 0);
    private readonly targetDelta = new Vector3f(0, 0, 0);

    private yesButton: Button;
    private noButton: Button;
    private tapToStartButton: Button;
    private selectionDirection = 1;
    private coriolis: SpaceObject;

    private displayMode = DisplayMode.ZOOM_IN;
    private theChase: Music;
    private readonly showLoadNewCommander: boolean;

    constructor(objectId?: string) {
        super();
        this.showLoadNewCommander = this.game.existsSavedCommander();
        this.theChase = this.game.getAudio().newMusic(`${LoadingScreen.DIRECTORY_MUSIC}the_chase.mp3`);
        if (objectId) {
            this.currentShip = SpaceObjectFactory.getInstance().getObjectById(objectId);
            this.selectionDirection = 0;
        }
    }

    public update(deltaTime: number): void {
        this.updateWithoutNavigation(deltaTime);
        if (ShipIntroScreen.DANCE) {
            MathHelper.updateAxes(this.currentDelta, this.targetDelta);
        }
        if (this.currentShip) {
            this.currentShip.applyDeltaRotation(this.currentDelta.x, this.currentDelta.y, this.currentDelta.z);
            this.currentShip.update(deltaTime);
        }
        switch (this.displayMode) {
            case DisplayMode.ZOOM_IN: this.zoomIn(); break;
            case DisplayMode.DANCE: this.dance(); break;
            case DisplayMode.ZOOM_OUT: this.zoomOut(); break;
        }
    }

    protected processTouch(touch: TouchEvent): void {
        if (touch.type === TouchEvent.TOUCH_SWEEP) {
            if (this.displayMode === DisplayMode.DANCE) {
                this.displayMode = DisplayMode.ZOOM_OUT;
            }
            this.selectionDirection = touch.x2 > 0 ? -1 : 1;
        }
        if (this.yesButton.isPressed(touch)) {
            this.newScreen = new LoadScreen(L.string(R.string.title_cmdr_load));
            this.game.getNavigationBar().setActiveIndex(Alite.NAVIGATION_BAR_DISK);
        }
        if (this.noButton.isPressed(touch)) {
            this.newScreen = new StatusScreen();
        }
        if (this.tapToStartButton.isPressed(touch)) {
            this.newScreen = new StatusScreen();
        }
        if (this.newScreen) {
            this.disposeMusic();
        }
    }

    public renderNavigationBar(): void {}

    private debugExhausts(): void {
        if (ShipIntroScreen.DEBUG_EXHAUST && this.currentShip) {
            const ok = this.currentShip.getNumberOfLasers() < 2 || this.currentShip.getLaserX(0) > this.currentShip.getLaserX(1);
            this.centerTextWide(ok ? "Ok!" : "NOT OK!", 150, Assets.titleFont,
                ColorScheme.get(ok ? ColorScheme.COLOR_CONDITION_GREEN : ColorScheme.COLOR_CONDITION_RED));
        }
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayShip();

        if (this.showLoadNewCommander) {
            g.drawText(L.string(R.string.cmdr_load_new_commander), 300, 1015, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        }
        this.centerTextWide(this.currentShip.getName(), 80, Assets.titleFont, ColorScheme.get(ColorScheme.COLOR_SHIP_TITLE));
        g.drawText(L.string(R.string.about_game_inspired_by, AliteConfig.GAME_NAME), 1350, 1020, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.smallFont);
        g.drawText(L.string(R.string.about_elite_copyright), 1350, 1050, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.smallFont);

        this.debugExhausts();
        this.game.getTextureManager().setTexture(null);
        this.yesButton.render(g);
        this.noButton.render(g);
        this.tapToStartButton.render(g);
    }

    private initDisplay(): void {
        GLES11.glEnable(GLES11.GL_TEXTURE_2D);
        GLES11.glEnable(GLES11.GL_CULL_FACE);
        GLES11.glMatrixMode(GLES11.GL_PROJECTION);
        GLES11.glLoadIdentity();
        GlUtils.gluPerspective(this.game, 45.0, 1.0, 900000.0);
        GLES11.glMatrixMode(GLES11.GL_MODELVIEW);
        GLES11.glLoadIdentity();

        GLES11.glColor4f(1.0, 1.0, 1.0, 1.0);
        GLES11.glEnableClientState(GLES11.GL_NORMAL_ARRAY);
        GLES11.glEnableClientState(GLES11.GL_VERTEX_ARRAY);
        GLES11.glEnableClientState(GLES11.GL_TEXTURE_COORD_ARRAY);
        GLES11.glPushMatrix();
        GLES11.glMultMatrixf(this.skysphere.getMatrix(), 0);
        this.skysphere.render();
        GLES11.glPopMatrix();

        GLES11.glColor4f(1.0, 1.0, 1.0, 1.0);
        GLES11.glEnable(GLES11.GL_DEPTH_TEST);
        GLES11.glDepthFunc(GLES11.GL_LESS);
        GLES11.glClear(GLES11.GL_DEPTH_BUFFER_BIT);
        GLES11.glDisable(GLES11.GL_BLEND);
    }

    private endDisplay(): void {
        GLES11.glDisable(GLES11.GL_DEPTH_TEST);
        GLES11.glDisable(GLES11.GL_TEXTURE_2D);
        this.setUpForDisplay();
    }

    private displayShip(): void {
        this.initDisplay();

        if (ShipIntroScreen.SHOW_DOCKING && this.coriolis) {
            GLES11.glPushMatrix();
            GLES11.glMultMatrixf(this.coriolis.getMatrix(), 0);
            this.coriolis.render();
            GLES11.glPopMatrix();
        }
        GLES11.glPushMatrix();
        GLES11.glMultMatrixf(this.currentShip.getMatrix(), 0);
        this.currentShip.render();
        GLES11.glPopMatrix();

        this.endDisplay();
    }

    public activate(): void {
        this.theChase.setLooping(true);
        this.theChase.play();
        this.initGl();
        this.skysphere = new SkySphereSpaceObject("skysphere", 8000.0, 16, 16, "textures/star_map.png");
        this.currentShip = SpaceObjectFactory.getInstance().getNextObject(this.currentShip, this.selectionDirection, ShipIntroScreen.DEBUG_EXHAUST);
        this.selectionDirection = 1;
        this.currentShip.setPosition(0.0, 0.0, -this.currentShip.getMaxExtentWithoutExhaust() * 2.0);

        if (ShipIntroScreen.SHOW_DOCKING) {
            this.coriolis = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.Coriolis);
            this.coriolis.applyDeltaRotation(0, 0, 90);
            this.coriolis.setPosition(0, 0, -1300);
        }

        MathHelper.getRandomRotationAngles(this.targetDelta);
        this.timer.reset();
        this.displayMode = DisplayMode.DANCE;
        this.currentShip.setAIState(SpaceObjectAI.AI_STATE_GLOBAL);
        this.currentShip.setSpeed(-this.currentShip.getMaxSpeed());

        this.yesButton = Button.createGradientPictureButton(1000, 950, 110, 110, Assets.yesIcon).setVisible(this.showLoadNewCommander);
        this.noButton = Button.createGradientPictureButton(1150, 950, 110, 110, Assets.noIcon).setVisible(this.showLoadNewCommander);
        this.tapToStartButton = Button.createGradientRegularButton(530, 980, 800, 80, L.string(R.string.intro_btn_tap_to_start)).setTextColor(ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT)).setVisible(!this.showLoadNewCommander);
    }

    public saveScreenState(dos: any): void {
        ScreenBuilder.writeString(dos, this.currentShip.getId());
    }

    public loadAssets(): void {}

    private disposeMusic(): void {
        if (this.theChase) {
            this.theChase.stop();
            this.theChase.dispose();
            this.theChase = null;
        }
    }

    public pause(): void {
        super.pause();
        this.disposeMusic();
    }

    public dispose(): void {
        super.dispose();
        this.disposeMusic();
    }

    public getScreenCode(): number {
        return ScreenCodes.SHIP_INTRO_SCREEN;
    }

    private zoomIn(): void {
        if (!this.currentShip) return;

        const step = 2.0 * this.currentShip.getMaxExtentWithoutExhaust();
        let newZ = this.currentShip.getPosition().z + step;
        if (newZ >= -step) {
            newZ = -step;
            this.displayMode = DisplayMode.DANCE;
            this.timer.reset();
        }
        this.currentShip.setPosition(0, 0, newZ);
    }

    private dance(): void {
        if (ShipIntroScreen.DANCE && this.danceTimer.hasPassedSeconds(4)) {
            MathHelper.getRandomRotationAngles(this.targetDelta);
        }
        if (this.timer.hasPassedSeconds(15) && !ShipIntroScreen.ONLY_CHANGE_SHIPS_AFTER_SWEEP) {
            this.displayMode = DisplayMode.ZOOM_OUT;
        }
    }

    private zoomOut(): void {
        if (!this.currentShip) return;

        const step = 2.0 * this.currentShip.getMaxExtentWithoutExhaust();
        let newZ = this.currentShip.getPosition().z - step;
        if (newZ <= -50 * step) {
            if (this.currentShip) this.currentShip.dispose();

            this.currentShip = this.getNextShip();
            newZ = -50 * this.currentShip.getMaxExtentWithoutExhaust();
            this.displayMode = DisplayMode.ZOOM_IN;
            this.timer.reset();
        }
        this.currentShip.setPosition(0, 0, newZ);
    }

    private getNextShip(): SpaceObject {
        const ao = SpaceObjectFactory.getInstance().getNextObject(this.currentShip, this.selectionDirection, ShipIntroScreen.DEBUG_EXHAUST);
        this.selectionDirection = 1;
        ao.setAIState(SpaceObjectAI.AI_STATE_GLOBAL);
        ao.setSpeed(-ao.getMaxSpeed());
        return ao;
    }
}
