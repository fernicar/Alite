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
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { Slider } from "../../Slider";
import { ColorScheme } from "../../colors/ColorScheme";
import { EngineExhaust } from "../opengl/ingame/EngineExhaust";
import { SpaceObject } from "../opengl/objects/space/SpaceObject";
import { SpaceObjectAI } from "../opengl/objects/space/SpaceObjectAI";
import { SpaceObjectFactory } from "../opengl/objects/space/SpaceObjectFactory";
import { AliteScreen } from "../AliteScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Vector3f } from "../../../../framework/math/Vector3f";

class ExhaustParameters {
    xOffset: number;
    yOffset: number;
    zOffset: number;
    radiusX: number;
    radiusY: number;
    maxLength: number;
    r1: number;
    g1: number;
    b1: number;
    a1: number;

    public toString(): string {
        return "xOffset: " + this.xOffset + ", yOffset: " + this.yOffset + ", zOffset: " + this.zOffset + ", radiusX: " + this.radiusX + ", radiusY: " + this.radiusY + ", len: " + this.maxLength + ", (" + this.r1 + ", " + this.g1 + ", " + this.b1 + ", " + this.a1 + ")";
    }
}

//This screen never needs to be serialized, as it is not part of the InGame state.
export class ShipEditorScreen extends AliteScreen {

    private currentShip: SpaceObject;

    private increaseX: Button;
    private decreaseX: Button;
    private increaseY: Button;
    private decreaseY: Button;
    private increaseZ: Button;
    private decreaseZ: Button;
    private increaseRadiusX: Button;
    private decreaseRadiusX: Button;
    private increaseRadiusY: Button;
    private decreaseRadiusY: Button;
    private increaseLength: Button;
    private decreaseLength: Button;
    private decreaseSpeed: Button;
    private increaseSpeed: Button;
    private toggleExhaustCount: Button;
    private nextShip: Button;

    private r1: Slider;
    private g1: Slider;
    private b1: Slider;
    private a1: Slider;

    private lastZoom: number = -1.0;
    private numberOfExhausts: number = 2;
    private readonly temp: Vector3f = new Vector3f(0, 0, 0);
    private lastX: number = -1;
    private lastY: number = -1;
    private exp: ExhaustParameters = new ExhaustParameters();

    public constructor() {
        super();
        this.currentShip = SpaceObjectFactory.getInstance().getObjectById("cobra_mk_iii");
        let exhausts: EngineExhaust[] = this.currentShip.getExhausts();
        exhausts.length = 0; // .clear()
        this.exp.xOffset = 50;
        this.exp.yOffset = 0;
        this.exp.zOffset = 0;
        this.exp.radiusX = 13;
        this.exp.radiusY = 13;
        this.exp.maxLength = 300;
        this.exp.r1 = 0.7;
        this.exp.g1 = 0.8;
        this.exp.b1 = 0.8;
        this.exp.a1 = 0.7;

        exhausts.push(new EngineExhaust(13.0, 13.0, 300.0, -50.0, 0, 0));
        exhausts.push(new EngineExhaust(13.0, 13.0, 300.0, 50.0, 0, 0));
        this.currentShip.setPosition(0, 0, -700.0);
        this.currentShip.setAIState(SpaceObjectAI.AI_STATE_GLOBAL);
        this.currentShip.setSpeed(-this.currentShip.getMaxSpeed());
    }

    public update(deltaTime: number): void {
        this.updateWithoutNavigation(deltaTime);
        if (this.currentShip != null) {
            this.currentShip.update(deltaTime);
        }
    }

    private modifyExhaust(): void {
        for (let ex of this.currentShip.getExhausts()) {
            ex.getPosition().copy(this.temp);
            if (this.temp.x < 0) {
                ex.setPosition(-this.exp.xOffset, this.exp.yOffset, this.currentShip.getBoundingBox()[5] + this.exp.zOffset);
            } else {
                ex.setPosition(this.exp.xOffset, this.exp.yOffset, this.currentShip.getBoundingBox()[5] + this.exp.zOffset);
            }
            ex.setRadiusX(this.exp.radiusX);
            ex.setRadiusY(this.exp.radiusY);
            ex.setMaxLength(this.exp.maxLength);
            ex.setColor(this.exp.r1, this.exp.g1, this.exp.b1, this.exp.a1);
        }
    }

    protected processTouch(touch: TouchEvent): void {
        if (this.r1.checkEvent(touch)) {
            this.exp.r1 = this.r1.getCurrentValue();
            this.modifyExhaust();
            return;
        }
        if (this.g1.checkEvent(touch)) {
            this.exp.g1 = this.g1.getCurrentValue();
            this.modifyExhaust();
            return;
        }
        if (this.b1.checkEvent(touch)) {
            this.exp.b1 = this.b1.getCurrentValue();
            this.modifyExhaust();
            return;
        }
        if (this.a1.checkEvent(touch)) {
            this.exp.a1 = this.a1.getCurrentValue();
            this.modifyExhaust();
            return;
        }

        if (touch.type === TouchEvent.TOUCH_SCALE && this.game.getInput().getTouchCount() > 1) {
            if (this.lastZoom < 0) {
                this.lastZoom = touch.zoomFactor;
            } else {
                if (touch.zoomFactor > this.lastZoom) {
                    this.currentShip.setPosition(0, 0, this.currentShip.getPosition().z + 5);
                } else {
                    this.currentShip.setPosition(0, 0, this.currentShip.getPosition().z - 5);
                }
            }
            return;
        }
        if (this.game.getInput().getTouchCount() > 1) {
            return;
        }
        if (touch.type === TouchEvent.TOUCH_UP) {
            if (this.increaseX.isTouched(touch.x, touch.y)) {
                this.exp.xOffset += 5;
                this.modifyExhaust();
            }
            if (this.decreaseX.isTouched(touch.x, touch.y)) {
                this.exp.xOffset -= 5;
                this.modifyExhaust();
            }
            if (this.increaseY.isTouched(touch.x, touch.y)) {
                this.exp.yOffset += 5;
                this.modifyExhaust();
            }
            if (this.decreaseY.isTouched(touch.x, touch.y)) {
                this.exp.yOffset -= 5;
                this.modifyExhaust();
            }
            if (this.increaseZ.isTouched(touch.x, touch.y)) {
                this.exp.zOffset += 5;
                this.modifyExhaust();
            }
            if (this.decreaseZ.isTouched(touch.x, touch.y)) {
                this.exp.zOffset -= 5;
                this.modifyExhaust();
            }
            if (this.increaseRadiusX.isTouched(touch.x, touch.y)) {
                this.exp.radiusX += 1;
                this.modifyExhaust();
            }
            if (this.decreaseRadiusX.isTouched(touch.x, touch.y)) {
                this.exp.radiusX -= 1;
                this.modifyExhaust();
            }
            if (this.increaseRadiusY.isTouched(touch.x, touch.y)) {
                this.exp.radiusY += 1;
                this.modifyExhaust();
            }
            if (this.decreaseRadiusY.isTouched(touch.x, touch.y)) {
                this.exp.radiusY -= 1;
                this.modifyExhaust();
            }
            if (this.increaseLength.isTouched(touch.x, touch.y)) {
                this.exp.maxLength += 20;
                this.modifyExhaust();
            }
            if (this.decreaseLength.isTouched(touch.x, touch.y)) {
                this.exp.maxLength -= 20;
                this.modifyExhaust();
            }

            if (this.increaseSpeed.isTouched(touch.x, touch.y)) {
                let newSpeed: number = this.currentShip.getSpeed() - 10.0;
                if (-newSpeed > this.currentShip.getMaxSpeed()) {
                    newSpeed = -this.currentShip.getMaxSpeed();
                }
                this.currentShip.setSpeed(newSpeed);
            }
            if (this.decreaseSpeed.isTouched(touch.x, touch.y)) {
                let newSpeed: number = this.currentShip.getSpeed() + 10.0;
                if (newSpeed > 0) {
                    newSpeed = 0;
                }
                this.currentShip.setSpeed(newSpeed);
            }
            if (this.toggleExhaustCount.isTouched(touch.x, touch.y)) {
                this.numberOfExhausts = -this.numberOfExhausts + 3;
                this.currentShip.getExhausts().length = 0; // .clear()
                for (let i = 0; i < this.numberOfExhausts; i++) {
                    this.currentShip.getExhausts().push(new EngineExhaust(this.exp.radiusX, this.exp.radiusY, this.exp.maxLength, i === 0 ? -this.exp.xOffset : this.exp.xOffset, this.exp.yOffset, this.exp.zOffset));
                    this.currentShip.getExhausts()[i].setColor(this.exp.r1, this.exp.g1, this.exp.b1, this.exp.a1);
                }
            }
            if (this.nextShip.isTouched(touch.x, touch.y)) {
                AliteLog.d("Exhaust Configuration", this.currentShip.getId() + ": Number of exhausts: " + this.numberOfExhausts + " Params: " + this.exp);
                this.exp.xOffset = 50;
                this.exp.yOffset = 0;
                this.exp.zOffset = 0;
                this.exp.radiusX = 13;
                this.exp.radiusY = 13;
                this.exp.maxLength = 300;
                this.exp.r1 = 0.7;
                this.exp.g1 = 0.8;
                this.exp.b1 = 0.8;
                this.exp.a1 = 0.7;
                this.numberOfExhausts = 2;
                this.currentShip = SpaceObjectFactory.getInstance().getNextObject(this.currentShip, 1, true);
                this.currentShip.getExhausts().length = 0; // .clear()
                this.currentShip.setSpeed(-this.currentShip.getMaxSpeed());
                this.currentShip.setPosition(0, 0, -700.0);
                for (let i = 0; i < this.numberOfExhausts; i++) {
                    this.currentShip.getExhausts().push(new EngineExhaust(this.exp.radiusX, this.exp.radiusY, this.exp.maxLength, i === 0 ? -this.exp.xOffset : this.exp.xOffset, this.exp.yOffset, this.exp.zOffset));
                    this.currentShip.getExhausts()[i].setColor(this.exp.r1, this.exp.g1, this.exp.b1, this.exp.a1);
                }
            }
        }

        if (touch.y > 800 || touch.x > 800) {
            return;
        }

        if (touch.type === TouchEvent.TOUCH_DRAGGED) {
            if (this.lastX !== -1 && this.lastY !== -1) {
                let diffX: number = touch.x - this.lastX;
                let diffY: number = touch.y - this.lastY;
                let ady: number = Math.abs(diffY);
                let adx: number = Math.abs(diffX);
                if (adx > ady) {
                    this.currentShip.applyDeltaRotation(0, diffX, 0);
                } else {
                    this.currentShip.applyDeltaRotation(diffY, 0, 0);
                }
            }
            this.lastX = touch.x;
            this.lastY = touch.y;
        }
        if (touch.type === TouchEvent.TOUCH_DOWN) {
            this.lastX = touch.x;
            this.lastY = touch.y;
        }
    }

    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayWideTitle("Ship Configuration Screen");

        this.increaseX.render(g);
        this.decreaseX.render(g);
        this.increaseY.render(g);
        this.decreaseY.render(g);
        this.increaseZ.render(g);
        this.decreaseZ.render(g);
        this.increaseRadiusX.render(g);
        this.decreaseRadiusX.render(g);
        this.increaseRadiusY.render(g);
        this.decreaseRadiusY.render(g);
        this.increaseLength.render(g);
        this.decreaseLength.render(g);
        this.increaseSpeed.render(g);
        this.decreaseSpeed.render(g);
        this.toggleExhaustCount.render(g);
        this.nextShip.render(g);

        if (this.currentShip != null) {
            g.drawText(this.currentShip.getName(), 20, 150, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        }

        this.r1.render(g);
        this.g1.render(g);
        this.b1.render(g);
        this.a1.render(g);

        if (this.currentShip != null) {
            this.displayObject(this.currentShip, 1.0, 900000.0);
        }
    }

    public activate(): void {
        this.initGl();
        this.decreaseX = Button.createGradientSmallButton(0, 900, 150, 80, "X-");
        this.increaseX = Button.createGradientSmallButton(0, 1000, 150, 80, "X+");
        this.decreaseY = Button.createGradientSmallButton(200, 900, 150, 80, "Y-");
        this.increaseY = Button.createGradientSmallButton(200, 1000, 150, 80, "Y+");
        this.decreaseZ = Button.createGradientSmallButton(400, 900, 150, 80, "Z-");
        this.increaseZ = Button.createGradientSmallButton(400, 1000, 150, 80, "Z+");
        this.decreaseRadiusX = Button.createGradientSmallButton(600, 900, 150, 80, "Rx-");
        this.increaseRadiusX = Button.createGradientSmallButton(600, 1000, 150, 80, "Rx+");
        this.decreaseRadiusY = Button.createGradientSmallButton(800, 900, 150, 80, "Ry-");
        this.increaseRadiusY = Button.createGradientSmallButton(800, 1000, 150, 80, "Ry+");
        this.decreaseLength = Button.createGradientSmallButton(1000, 900, 150, 80, "L-");
        this.increaseLength = Button.createGradientSmallButton(1000, 1000, 150, 80, "L+");
        this.decreaseSpeed = Button.createGradientSmallButton(1200, 900, 150, 80, "S-");
        this.increaseSpeed = Button.createGradientSmallButton(1200, 1000, 150, 80, "S+");
        this.toggleExhaustCount = Button.createGradientSmallButton(1400, 900, 150, 80, "TC");
        this.nextShip = Button.createGradientSmallButton(1400, 1000, 150, 80, "Next");

        this.r1 = new Slider(1100, 150, 720, 100, 0.2, 1.0, 0.7, "r1", Assets.smallFont);
        this.g1 = new Slider(1100, 350, 720, 100, 0, 1, 0.8, "g1", Assets.smallFont);
        this.b1 = new Slider(1100, 550, 720, 100, 0, 0.8, 0.8, "b1", Assets.smallFont);
        this.a1 = new Slider(1100, 750, 720, 100, 0, 0.7, 0.7, "a1", Assets.smallFont);
    }

    public saveScreenState(dos: any): void {
        // empty
    }

    public loadAssets(): void {
        // empty
    }

    public getScreenCode(): number {
        return 0;
    }

    public renderNavigationBar(): void {
        // empty
    }
}
