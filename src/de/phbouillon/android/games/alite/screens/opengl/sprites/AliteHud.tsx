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

import { TouchEvent } from "../../../framework/Input";
import { IntFunction } from "../../../framework/IntFunction";
import { Timer } from "../../../framework/Timer";
import { Sprite } from "../../../framework/impl/gl/Sprite";
import { GLES11 } from "../../../framework/impl/gl/GLES11";
import { Alite } from "../../Alite";
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { L } from "../../L";
import { R } from "../../R";
import { Settings } from "../../Settings";
import { ShipControl } from "../../ShipControl";
import { AliteColor } from "../../colors/AliteColor";
import { Equipment } from "../../model/Equipment";
import { InGameManager } from "../ingame/InGameManager";
import { CompassRenderer } from "./CompassRenderer";
import { ControlPad } from "./ControlPad";
import { CursorKeys } from "./CursorKeys";
import { InfoGaugeRenderer } from "./InfoGaugeRenderer";
import { ShipController } from "./ShipController";

export class AliteHud extends Sprite {
    private static readonly ENEMY_VISIBLE_PHASE = 660; // ms
    private static readonly ENEMY_INVISIBLE_PHASE = 340; // ms

    public static readonly MAX_DISTANCE = 44000;
    public static readonly MAX_DISTANCE_SQ = AliteHud.MAX_DISTANCE * AliteHud.MAX_DISTANCE;
    public static readonly MAXIMUM_OBJECTS = 128;
    public static readonly RADAR_X1 = 558;
    public static readonly RADAR_Y1 = 700;
    public static readonly RADAR_X2 = AliteHud.RADAR_X1 + 803;
    public static readonly RADAR_Y2 = AliteHud.RADAR_Y1 + 303;

    public static readonly ALITE_TEXT_X1 = 832;
    public static readonly ALITE_TEXT_Y1 = 1020;
    public static readonly ALITE_TEXT_X2 = AliteHud.ALITE_TEXT_X1 + 256;
    public static readonly ALITE_TEXT_Y2 = AliteHud.ALITE_TEXT_Y1 + 60;

    private lollipop: Sprite;
    private readonly objects: number[][] = Array.from({ length: AliteHud.MAXIMUM_OBJECTS }, () => [0, 0, 0]);
    private readonly objectColors = new Int32Array(AliteHud.MAXIMUM_OBJECTS);
    private readonly enemy = new Array(AliteHud.MAXIMUM_OBJECTS).fill(false);
    private readonly enabled = new Array(AliteHud.MAXIMUM_OBJECTS).fill(false);
    private readonly laser: Sprite;
    private readonly aliteText: Sprite;
    private readonly safeIcon: Sprite;
    private readonly ecmIcon: Sprite;
    private readonly viewport: Sprite[] = new Array(4);
    private enemiesVisible = true;

    private viewDirection = 0;
    private currentLaserIndex: string[];

    static readonly TEXTURE_FILE = "textures/radar_final.png";

    private readonly infoGauges: InfoGaugeRenderer;
    private readonly compass: CompassRenderer;
    private zoomFactor = 1.0;
    private ecmActive: Timer;
    private witchSpace = false;
    private shipController: ShipController;
    private readonly timer = new Timer().setAutoResetWithSkipFirstCall();
    private readonly getSpeed: IntFunction<number>;

    constructor(getSpeed: IntFunction<number>) {
        super(AliteHud.RADAR_X1, AliteHud.RADAR_Y1, AliteHud.RADAR_X2, AliteHud.RADAR_Y2,
            0, 0, 1, 1, AliteHud.TEXTURE_FILE);
        this.getSpeed = getSpeed;
        this.setTextureCoords(Alite.get().getTextureManager().getSprite(AliteHud.TEXTURE_FILE, "radar"));

        this.laser = this.genSprite("pulse_laser", 896, 476);
        this.aliteText = this.genSprite("alite", 864, 1030);
        this.safeIcon = this.genSprite("s", 1284, AliteHud.RADAR_Y2 - 68);
        this.ecmIcon = this.genSprite("e", AliteHud.RADAR_X1 - 40, AliteHud.RADAR_Y2 - 68);
        this.viewport[0] = this.genSprite("front", (AliteHud.RADAR_X2 + AliteHud.RADAR_X1) / 2 - 133, AliteHud.RADAR_Y1);
        this.viewport[1] = this.genSprite("right", (AliteHud.RADAR_X2 + AliteHud.RADAR_X1) / 2, (AliteHud.RADAR_Y2 + AliteHud.RADAR_Y1) / 2 - 73);
        this.viewport[2] = this.genSprite("rear", (AliteHud.RADAR_X2 + AliteHud.RADAR_X1) / 2 - 133, (AliteHud.RADAR_Y2 + AliteHud.RADAR_Y1) / 2);
        this.viewport[3] = this.genSprite("left", AliteHud.RADAR_X1, (AliteHud.RADAR_Y2 + AliteHud.RADAR_Y1) / 2 - 73);

        this.infoGauges = new InfoGaugeRenderer(this);
        this.compass = new CompassRenderer(this);

        if (Settings.controlMode === ShipControl.CONTROL_PAD) this.shipController = new ControlPad();
        else if (Settings.controlMode === ShipControl.CURSOR_BLOCK) this.shipController = new CursorKeys(false);
        else if (Settings.controlMode === ShipControl.CURSOR_SPLIT_BLOCK) this.shipController = new CursorKeys(true);
    }

    public getSpeedFunction(): IntFunction<number> {
        return this.getSpeed;
    }

    private initLollipop() {
        if(!this.lollipop) {
             this.lollipop = new Sprite(0, 0, 0, 0, 0, 0, 1, 1, "");
        }
    }

    public genSprite(name: string, x: number, y: number): Sprite {
        return new Sprite(x, y, Alite.get().getTextureManager().getSprite(AliteHud.TEXTURE_FILE, name), AliteHud.TEXTURE_FILE);
    }

    // ... Methods like computeLaser, setObject, zoomIn, zoomOut, etc.
    // ... These methods would be converted similarly, managing state and calling child components.

    public update(deltaTime: number): void {
        if (this.enemiesVisible && this.timer.hasPassedMillis(AliteHud.ENEMY_VISIBLE_PHASE)) {
            this.enemiesVisible = false;
        } else if (!this.enemiesVisible && this.timer.hasPassedMillis(AliteHud.ENEMY_INVISIBLE_PHASE)) {
            this.enemiesVisible = true;
        }
        if (this.shipController) {
            this.shipController.update(deltaTime);
        }
    }

    public handleUI(event: TouchEvent): boolean {
        return this.shipController ? this.shipController.handleUI(event) : false;
    }

    public mapDirections(left: boolean, right: boolean, up: boolean, down: boolean): void {
        if(this.shipController) {
            this.shipController.setDirections(left, right, Settings.reversePitch ? down : up, Settings.reversePitch ? up : down);
        }
    }

    public render(): void {
        this.initLollipop();
        this.setUp();
        GLES11.glColor4f(Settings.alpha, Settings.alpha, Settings.alpha, Settings.alpha);
        this.drawArrays(); // from Sprite base class

        // ... Render child components like laser, compass, infoGauges ...

        this.cleanUp();
    }
}
