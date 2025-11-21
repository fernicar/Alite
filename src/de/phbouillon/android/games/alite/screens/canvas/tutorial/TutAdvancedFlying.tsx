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
import { R } from "../../../R";
import { ScreenCodes } from "../../../ScreenCodes";
import { Settings } from "../../../Settings";
import { SoundManager } from "../../../SoundManager";
import { Condition } from "../../../model/Condition";
import { EquipmentStore } from "../../../model/EquipmentStore";
import { PlayerCobra } from "../../../model/PlayerCobra";
import { SystemData } from "../../../model/generator/SystemData";
import { HyperspaceScreen } from "../../opengl/HyperspaceScreen";
import { FlightScreen } from "../../opengl/ingame/FlightScreen";
import { ObjectSpawnManager } from "../../opengl/ingame/ObjectSpawnManager";
import { ScoopCallback } from "../../opengl/ingame/ScoopCallback";
import { SpaceObject } from "../../opengl/objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../opengl/objects/space/SpaceObjectFactory";
import { AliteButtons } from "../../opengl/sprites/buttons/AliteButtons";
import { TutorialLine } from "./TutorialLine";
import { TutorialScreen } from "./TutorialScreen";
import { TutorialSelectionScreen } from "./TutorialSelectionScreen";
import { Timer } from "../../../../../framework/Timer";


export class TutAdvancedFlying extends TutorialScreen {
    private flight: FlightScreen;
    private hyperspace: HyperspaceScreen;
    private switchScreen: TutAdvancedFlying = null;
    private readonly timer: Timer = new Timer().setAutoResetWithSkipFirstCall();
    private adder: SpaceObject = null;
    private scooped: boolean;

    constructor(lineIndexOrDis?: number | any) {
        super(7, true);

        if (typeof lineIndexOrDis === 'number') {
            this.currentLineIndex = lineIndexOrDis - 1;
            this.flight = new FlightScreen(this.currentLineIndex === -1);
            AliteLog.d("TutAdvancedFlying", `Starting Advanced Flying: ${lineIndexOrDis}`);
        } else if (lineIndexOrDis) { // Deserialization from stream object
            const dis = lineIndexOrDis;
            const isFlight = dis.readBoolean();
            const isHyper = dis.readBoolean();
            this.flight = isFlight ? FlightScreen.createScreen(dis) : null;
            this.hyperspace = isHyper ? new HyperspaceScreen(dis) : null;
            const lineIndex = dis.readInt();
            AliteLog.d("TutAdvancedFlying", `Starting Advanced Flying: ${lineIndex}`);
            this.currentLineIndex = lineIndex - 1;
            this.timer.setTimer(dis.readLong());
            if (this.flight) {
                this.adder = this.flight.findObjectById("adder") as SpaceObject;
                if (this.adder) {
                    this.adder.setSaving(false);
                }
            }
            this.loadScreenState(dis);
        } else {
            // Default constructor
        }

        if (!lineIndexOrDis || typeof lineIndexOrDis === 'number') {
            this.initDefaultState();
            this.initLines();
        }
    }


    private initDefaultState(): void {
        this.game.getCobra().clearEquipment();
        this.game.getGenerator().buildGalaxy(1);
        this.game.getGenerator().setCurrentGalaxy(1);
        this.game.getPlayer().setCurrentSystem(this.game.getGenerator().getSystem(SystemData.LAVE_SYSTEM_INDEX));
        this.game.getPlayer().setHyperspaceSystem(this.game.getGenerator().getSystem(SystemData.ZAONCE_SYSTEM_INDEX));
        this.game.getCobra().setFuel(this.game.getCobra().getMaxFuel());
        this.game.getPlayer().setLegalValue(0);
        this.game.getPlayer().setCondition(Condition.GREEN);
        Settings.resetButtonPosition();
    }


    private addTopLine(text: string): TutorialLine {
        return this.addLine(text).setX(250).setWidth(1420).setY(20).setHeight(140);
    }

    private initLines(): void {
        // Line 00
        this.addTopLine(L.string(R.string.tutorial_advanced_flying_00)).setUpdateMethod(() => {
            this.flight.getInGameManager().getShip().setSpeed(0);
            this.flight.getInGameManager().setPlayerControl(false);
        });

        // ... Add all 26 lines, converting Java lambda syntax to TypeScript arrow functions
        // Example for a complex line:
        // Line 02
        const line02 = this.addTopLine(L.string(R.string.tutorial_advanced_flying_02))
            .setMustRetainEvents()
            .addHighlight(this.makeHighlight(1710, 300, 200, 200))
            .setUnskippable();

        line02.setHeight(180).setUpdateMethod(() => {
            AliteButtons.OVERRIDE_HYPERSPACE = false;
            // ... other overrides
            this.setPlayerControlOn();

            if (this.flight && !this.flight.getInGameManager().getHyperspaceHook()) {
                this.flight.getInGameManager().setHyperspaceHook(() => {
                    this.hyperspace = new HyperspaceScreen(0);
                    // ...
                });
            }
            if (this.hyperspace && !this.hyperspace.getFinishHook()) {
                // ...
                this.hyperspace.setFinishHook(() => {
                    this.switchScreen = new TutAdvancedFlying(3);
                    this.setFinished(line02);
                });
            }
        });

        // ... Continue for all lines ...
    }

    private setPlayerControlOff(): void {
        this.flight.getInGameManager().setPlayerControl(false);
        this.flight.getInGameManager().getShip().adjustSpeed(0);
        this.flight.getInGameManager().setNeedsSpeedAdjustment(true);
        this.flight.setHandleUI(false);
        this.overrideControlButtons(false);
    }

    private setPlayerControlOn(): void {
        if (this.flight && !this.flight.getInGameManager().isPlayerControl()) {
            this.flight.getInGameManager().calibrate();
            this.flight.getInGameManager().setPlayerControl(true);
            this.flight.setHandleUI(true);
        }
    }

    private overrideControlButtons(override: boolean): void {
        AliteButtons.OVERRIDE_HYPERSPACE = override;
        AliteButtons.OVERRIDE_INFORMATION = override;
        AliteButtons.OVERRIDE_MISSILE = override;
        AliteButtons.OVERRIDE_LASER = override;
        AliteButtons.OVERRIDE_TORUS = override;
    }

    private setScoopNotifier(line: TutorialLine): void {
        if (this.flight.getInGameManager().getScoopCallback()) return;

        this.flight.getInGameManager().setScoopCallback({
            scooped: (scoopedObject: SpaceObject) => {
                this.scooped = true;
                this.setFinished(line);
            },
            rammed: (rammedObject: SpaceObject) => {
                this.setFinished(line);
            }
        });
    }

    public activate(): void {
        super.activate();
        Settings.resetButtonPosition();
        this.game.getCobra().clearEquipment();
        this.game.getCobra().addEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.FUEL_SCOOP));
        // ... (rest of the setup)

        if (this.flight) {
            this.flight.loadAssets();
            this.flight.activate();
            this.flight.getInGameManager().setPlayerControl(false);
            this.flight.getInGameManager().getShip().setSpeed(0);
            this.flight.setPause(false);
        }
        if (this.hyperspace) {
            this.hyperspace.loadAssets();
            this.hyperspace.activate();
        }

        // Disable spawns
        ObjectSpawnManager.SHUTTLES_ENABLED = false;
        // ... (all other spawn flags)
    }

    public saveScreenState(dos: any): void {
        if (this.adder) this.adder.setSaving(true);
        dos.writeBoolean(!!this.flight);
        dos.writeBoolean(!!this.hyperspace);
        if (this.flight) this.flight.saveScreenState(dos);
        if (this.hyperspace) this.hyperspace.saveScreenState(dos);
        dos.writeInt(this.currentLineIndex);
        dos.writeLong(this.timer.getTimer());
        super.saveScreenState(dos);
    }

    public loadAssets(): void {
        super.loadAssets();
        if (this.flight) this.flight.loadAssets();
    }

    public renderGlPart(deltaTime: number): void {
        if (this.hyperspace) {
            this.hyperspace.initializeGl();
            this.hyperspace.present(deltaTime);
            if (this.flight) {
                this.flight.dispose();
                this.flight = null;
            }
        }
        if (this.flight) {
            this.flight.initializeGl();
            this.flight.present(deltaTime);
        }
    }


    public doPresent(deltaTime: number): void {
        this.renderText();
    }

    public doUpdate(deltaTime: number): void {
        if (this.hyperspace) {
            this.hyperspace.update(deltaTime);
            if (this.flight) {
                this.flight.dispose();
                this.flight = null;
            }
        }
        if (this.flight) {
            if (!this.flight.getInGameManager().isDockingComputerActive()) {
                this.game.getCobra().setRotation(0, 0);
            }
            this.flight.update(deltaTime);
        }
        if (this.switchScreen) {
            this.newScreen = this.switchScreen;
            this.performScreenChange();
            this.postScreenChange();
        }
    }


    public dispose(): void {
        if (this.hyperspace) {
            this.hyperspace.dispose();
            this.hyperspace = null;
        }
        if (this.flight) {
            if (!this.flight.isDisposed()) {
                this.flight.dispose();
            }
            this.flight = null;
        }
        ObjectSpawnManager.SHUTTLES_ENABLED = true;
        // ... (reset all spawn flags)
        super.dispose();
    }

    public getScreenCode(): number {
        return ScreenCodes.TUT_ADVANCED_FLYING_SCREEN;
    }
}
