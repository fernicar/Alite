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

import { IMethodHook } from "../../../../../../../../framework/IMethodHook";
import { TouchEvent } from "../../../../../../../../framework/Input";
import { IntFunction } from "../../../../../../../../framework/IntFunction";
import { Rect } from "../../../../../../../../framework/Rect";
import { Screen } from "../../../../../../../../framework/Screen";
import { AccelerometerHandler } from "../../../../../../../../framework/impl/AccelerometerHandler";
import { AndroidGame } from "../../../../../../../../framework/impl/AndroidGame";
import { Vector3f } from "../../../../../../../../framework/math/Vector3f";
import { Alite } from "../../../../Alite";
import { AliteConfig } from "../../../../AliteConfig";
import { AliteLog } from "../../../../AliteLog";
import { Assets } from "../../../../Assets";
import { L } from "../../../../L";
import { Settings } from "../../../../Settings";
import { SoundManager } from "../../../../SoundManager";
import { AliteColor } from "../../../../colors/AliteColor";
import { Condition } from "../../../../model/Condition";
import { EquipmentStore } from "../../../../model/EquipmentStore";
import { LegalStatus } from "../../../../model/LegalStatus";
import { PlayerCobra } from "../../../../model/PlayerCobra";
import { Rating } from "../../../../model/Rating";
import { SystemData } from "../../../../model/generator/SystemData";
import { Government } from "../../../../model/generator/enums/Government";
import { Mission } from "../../../../model/missions/Mission";
import { MissionManager } from "../../../../model/missions/MissionManager";
import { AliteScreen } from "../../../canvas/AliteScreen";
import { ShipIntroScreen } from "../../../canvas/ShipIntroScreen";
import { StatusScreen } from "../../../canvas/StatusScreen";
import { HyperspaceScreen } from "../../HyperspaceScreen";
import { AliteObject } from "../../objects/AliteObject";
import { Billboard } from "../../objects/Billboard";
import { ExplosionBillboard } from "../../objects/ExplosionBillboard";
import { LaserCylinder } from "../../objects/LaserCylinder";
import { SkySphereSpaceObject } from "../../objects/SkySphereSpaceObject";
import { SpaceObject } from "../../objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../objects/space/SpaceObjectFactory";
import { AliteHud } from "../../sprites/AliteHud";
import { AliteButtons } from "../../sprites/buttons/AliteButtons";
import { CloakingEvent } from "./CloakingEvent";
import { DepthBucket } from "./DepthBucket";
import { DockingComputerAI } from "./DockingComputerAI";
import { GameOverUpdater } from "./GameOverUpdater";
import { HyperspaceTimer } from "./HyperspaceTimer";
import { InGameHelper } from "./InGameHelper";
import { JammingEvent } from "./JammingEvent";
import { LaserManager } from "./LaserManager";
import { ObjectPicker } from "./ObjectPicker";
import { ObjectSpawnManager } from "./ObjectSpawnManager";
import { ObjectType } from "./ObjectType";
import { OnScreenMessage } from "./OnScreenMessage";
import { ScoopCallback } from "./ScoopCallback";
import { ScrollingText } from "./ScrollingText";
import { SpaceObjectTraverser } from "./SpaceObjectTraverser";
import { StarDust } from "./StarDust";
import { TimedEvent } from "./TimedEvent";
import { ViewingTransformationHelper } from "./ViewingTransformationHelper";
import { WitchSpaceRender } from "./WitchSpaceRender";
import { MathHelper } from "../../../../../../../../framework/MathHelper";

export class InGameManager {
    private static readonly serialVersionUID = -7222644863845482563;
    private static readonly DEBUG_OBJECT_DRAW_ORDER = false;

    private static readonly RADAR_CENTER_X = AliteHud.RADAR_X1 + ((AliteHud.RADAR_X2 - AliteHud.RADAR_X1) >> 1);
    private static readonly RADAR_CENTER_Y = AliteHud.RADAR_Y1 + ((AliteHud.RADAR_Y2 - AliteHud.RADAR_Y1) >> 1);
    private static readonly RADAR_RADIUS_X = AliteHud.RADAR_X2 - InGameManager.RADAR_CENTER_X;
    private static readonly RADAR_RADIUS_Y = AliteHud.RADAR_Y2 - InGameManager.RADAR_CENTER_Y;

    private static readonly SAFE_ZONE_RADIUS_SQ = 19752615936; // 140544m
    private static readonly EXT_SAFE_ZONE_RADIUS_SQ = 21025000000; // 145000m

    public static OVERRIDE_SPEED: boolean;
    public static playerInSafeZone: boolean;
    extendedSafeZone: boolean;
    public static safeZoneViolated: boolean;

    private postDockingScreen: AliteScreen;
    private hyperspaceHook: IMethodHook;
    private feeText: string;
    private alite: Alite;

    private readonly deltaYawRollPitch = new Vector3f(0, 0, 0);
    private readonly tempVector = new Vector3f(0, 0, -1);
    private readonly systemStationPosition = new Vector3f(0, 0, 0);
    private readonly zero = new Vector3f(0, 0, 0);
    private readonly deltaOrientation = new Vector3f(0, 0, 0);

    private readonly tempMatrix: number[][] = [[], [], []];
    private readonly viewMatrix: number[] = [];
    private readonly lightPosition: number[];
    private readonly aspectRatio: number;

    private readonly buttons: AliteButtons;
    private readonly dockingComputerAI: DockingComputerAI;
    private readonly objectPicker: ObjectPicker;
    private readonly skysphere: SkySphereSpaceObject;

    private readonly objectsToBeAdded: AliteObject[] = [];
    private readonly sortedObjectsToDraw: DepthBucket[] = [];
    private readonly timedEvents: TimedEvent[] = [];
    private readonly removedTimedEvents: TimedEvent[] = [];

    private helper: InGameHelper;
    private hud: AliteHud;
    private initialHyperspaceSystem: SystemData;
    private laserManager: LaserManager;
    private message: OnScreenMessage = new OnScreenMessage();
    private oldMessage: OnScreenMessage;
    private missileLock: SpaceObject;
    private newScreen: Screen;
    private scrollingText: ScrollingText;
    private readonly spawnManager: ObjectSpawnManager;
    private starDust: StarDust;
    private viewingTransformationHelper: ViewingTransformationHelper = new ViewingTransformationHelper();
    private witchSpace: WitchSpaceRender;

    private readonly ship: SpaceObject;
    private planet: AliteObject;
    private sun: AliteObject;
    private sunGlow: AliteObject;
    private station: SpaceObject;

    public hyperspaceTimer: HyperspaceTimer;
    private cloakingEvent: TimedEvent;
    private jammingEvent: TimedEvent;

    private calibrated: boolean;
    private changingSpeed: boolean;
    private destroyed: boolean;
    private needsSpeedAdjustment: boolean;
    private paused: boolean;
    private planetWasSet: boolean;
    private playerControl = true;
    private targetMissile: boolean;
    private viewDirectionChanged: boolean;
    private vipersWillEngage: boolean;

    private viewDirection = PlayerCobra.DIR_FRONT;
    private lastX = -1;
    private lastY = -1;
    private hudIndex: number;

    constructor(hud: AliteHud, skyMap: string, lightPosition: number[], fromStation: boolean, initStarDust: boolean) {
        this.alite = Alite.getInstance();
        this.alite.setInGame(this);
        this.helper = new InGameHelper(this);
        this.hud = hud;
        this.lightPosition = lightPosition;
        this.spawnManager = new ObjectSpawnManager(this);
        this.dockingComputerAI = new DockingComputerAI(this);
        this.alite.getCobra().resetEnergy();

        this.skysphere = new SkySphereSpaceObject("skysphere", 8000.0, 16, 16, skyMap);
        this.ship = SpaceObjectFactory.getInstance().getObjectById("cobra_mk_iii");
        this.ship.setPlayer(true);
        this.ship.setId("Camera");

        MathHelper.getRandomPosition(FlightScreen.PLANET_POSITION, this.tempVector, 115000.0, 20000.0).copy(this.systemStationPosition);
        if (fromStation) {
            this.tempVector.scale(-1500.0);
            this.tempVector.add(this.systemStationPosition);
            this.ship.setPosition(this.tempVector);
            this.ship.setForwardVector(new Vector3f(0.0, 0.0, 1.0));
            this.ship.setUpVector(new Vector3f(0.0, 1.0, 0.0));
            this.ship.setRightVector(new Vector3f(1.0, 0.0, 0.0));
        } else {
            this.ship.setPosition(FlightScreen.SHIP_ENTRY_POSITION);
        }
        if (initStarDust && Settings.particleDensity > 0) {
            this.starDust = new StarDust(this.ship.getPosition());
        }
        this.buttons = hud != null ? new AliteButtons(this) : null;
        this.laserManager = new LaserManager(this);
        this.timedEvents.push(...this.laserManager.registerTimedEvents());
        const visibleArea = this.alite.getGraphics().getVisibleArea();
        this.aspectRatio = visibleArea.width() / visibleArea.height();
        this.spawnManager.startSimulation(this.alite.getPlayer().getCurrentSystem());
        this.alite.getCobra().setMissileLocked(false);
        this.objectPicker = new ObjectPicker(this, visibleArea);
        AccelerometerHandler.needsCalibration = true;
    }

    initializeViperAction(): void {
        InGameManager.safeZoneViolated = false;
        const currentSystem = this.alite.getPlayer().getCurrentSystem();
        if (this.alite.getPlayer().getLegalStatus() === LegalStatus.CLEAN) {
            this.vipersWillEngage = false;
            return;
        }
        if (currentSystem == null) {
            return;
        }
        this.vipersWillEngage = true;
        if (this.station != null && this.station.getHitCount() > 1) {
            InGameManager.safeZoneViolated = true;
            return;
        }
        const government = currentSystem.getGovernment();
        if (government === Government.ANARCHY || government === Government.FEUDAL) {
            this.vipersWillEngage = false;
            return;
        }
        const roll = Math.floor(Math.random() * 100);
        const legalProblemLikelihoodInPercent = this.alite.getPlayer().getLegalProblemLikelihoodInPercent();
        if (roll >= legalProblemLikelihoodInPercent) {
            this.vipersWillEngage = false;
        }
        AliteLog.d("Checking Viper Attack", "Roll: " + roll +
            ", Likelihood: " + legalProblemLikelihoodInPercent + ", Result: " + this.vipersWillEngage);
    }

    public getLaserManager(): LaserManager {
        return this.laserManager;
    }

    clearObjectTransformations(): void {
        if (this.viewingTransformationHelper != null) {
            this.viewingTransformationHelper.clearObjects(this.sortedObjectsToDraw);
        }
    }

    getAspectRatio(): number {
        return this.aspectRatio;
    }

    public setScoopCallback(callback: ScoopCallback): void {
        if (this.helper != null) {
            this.helper.setScoopCallback(callback);
        }
    }

    public getScoopCallback(): ScoopCallback {
        if (this.helper != null) {
            return this.helper.getScoopCallback();
        }
        return null;
    }

    preMissionCheck(): void {
        for (const m of MissionManager.getInstance().getMissions()) {
            if (m.willStartOnDock()) {
                const te = m.getPreStartEvent(this);
                if (te != null) {
                    this.addTimedEvent(te);
                }
            }
        }
    }

    getPostDockingScreen(): AliteScreen {
        if (this.postDockingScreen == null) {
            this.postDockingScreen = new StatusScreen();
        }
        return this.postDockingScreen;
    }

    public setPostDockingScreen(screen: AliteScreen): void {
        this.postDockingScreen = screen;
    }

    public getActualPostDockingScreen(): Screen {
        return this.postDockingScreen;
    }

    public setMessage(text: string): void {
        this.message.setText(text);
    }

    public repeatMessage(text: string, times: number): void {
        this.message.repeatText(text, 1, times, 1);
    }

    public getHud(): AliteHud {
        return this.hud;
    }

    getSystemStationPosition(): Vector3f {
        return this.systemStationPosition;
    }

    initStarDust(): void {
        if (this.starDust != null) {
            this.starDust.setPosition(this.ship.getPosition());
        }
    }

    public isDockingComputerActive(): boolean {
        return this.dockingComputerAI.isActive();
    }

    public toggleDockingComputer(playSound: boolean): void {
        if (this.station == null) {
            return;
        }
        if (this.station.isAccessDenied()) {
            if (playSound) {
                SoundManager.play(Assets.com_accessDeclined);
                this.message.setText(L.string("com_access_declined"));
            }
            return;
        }
        if (this.dockingComputerAI.isActive()) {
            if (playSound) {
                SoundManager.play(Assets.com_dockingComputerDisengaged);
                this.setMessage(L.string("com_docking_computer_disengaged"));
            }
            if (this.hud != null) {
                this.hud.mapDirections(false, false, false, false);
            }
            this.dockingComputerAI.disengage();
        } else {
            if (playSound) {
                SoundManager.play(Assets.com_dockingComputerEngaged);
                this.setMessage(L.string("com_docking_computer_engaged"));
            }
            this.dockingComputerAI.engage();
        }
    }

    public toggleStationHandsDocking(): void {
        if (this.station == null) {
            return;
        }
        if (this.station.isAccessDenied()) {
            SoundManager.play(Assets.com_accessDeclined);
            this.message.setText(L.string("com_access_declined"));
            return;
        }
        if (this.feeText != null || this.dockingComputerAI.isActive()) {
            // Once station hands initiated docking, there's nothing you can do to stop it again...
            return;
        }
        this.feeText = L.string("assisted_docking",
            L.getOneDecimalFormatString("cash_amount_value_ccy", this.getDockingFee()));
    }

    public getDockingFee(): number {
        const currentSystem = this.alite.getPlayer().getCurrentSystem();
        return currentSystem == null || currentSystem.getTechLevel() <= 9 ? 100 :
            currentSystem.getTechLevel() > 13 ? 200 : 150;
    }

    private initiateStationHandsDocking(): void {
        // TODO different sound ("Transaction has been received. Lean back and enjoy the flight.")
        SoundManager.play(Assets.com_dockingComputerEngaged);
        this.setMessage(L.string("com_docking_computer_engaged"));
        this.dockingComputerAI.engage();
    }

    public yesSelected(): void {
        if (this.feeText == null) {
            return;
        }
        this.feeText = null;
        SoundManager.play(Assets.click);
        const dockingFee = this.getDockingFee();
        this.alite.getPlayer().setCash(this.alite.getPlayer().getCash() - dockingFee);
        this.initiateStationHandsDocking();
    }

    public noSelected(): void {
        if (this.feeText == null) {
            return;
        }
        SoundManager.play(Assets.click);
        this.feeText = null;
    }

    setPlanet(planet: AliteObject): void {
        this.planet = planet;
    }

    public getPlanet(): AliteObject {
        return this.planet;
    }

    setSun(sun: AliteObject): void {
        this.sun = sun;
    }

    setSunGlow(sunGlow: AliteObject): void {
        this.sunGlow = sunGlow;
    }

    public getSun(): AliteObject {
        return this.sun;
    }

    public getSunGlow(): AliteObject {
        return this.sunGlow;
    }

    public setStation(station: SpaceObject): void {
        this.station = station;
    }

    public getStation(): SpaceObject {
        return this.station;
    }

    yankOutOfTorus(): void {
        this.ship.setSpeed(-PlayerCobra.MAX_SPEED);
        this.setPlayerControl(true);
    }

    public setPlayerControl(playerControl: boolean): void {
        this.playerControl = playerControl;
        this.deltaYawRollPitch.x = 0.0;
        this.deltaYawRollPitch.y = 0.0;
        this.deltaYawRollPitch.z = 0.0;
    }

    public isPlayerControl(): boolean {
        return this.playerControl;
    }

    public killHud(): void {
        this.hud = null;
    }

    isPlayerAlive(): boolean {
        return this.hud != null;
    }

    public getSpawnManager(): ObjectSpawnManager {
        return this.spawnManager;
    }

    addTimedEvent(event: TimedEvent): void {
        this.timedEvents.push(event);
    }

    private clamp(val: number, min: number, max: number): number {
        return val < min ? min : val > max ? max : val;
    }

    public getShip(): SpaceObject {
        return this.ship;
    }

    public calibrate(): void {
        // Ensures that a re-calibration occurs on the next frame.
        this.calibrated = false;
        AccelerometerHandler.needsCalibration = true;
    }

    private getAlternativeAccelerometerData(): void {
        if (!this.calibrated) {
            this.zero.x = this.alite.getInput().getAccelX();
            this.zero.y = this.alite.getInput().getAccelY();
            this.zero.z = this.alite.getInput().getAccelZ();
            this.calibrated = true;
        } else {
            this.deltaOrientation.x = -this.clamp(Math.floor((this.alite.getInput().getAccelX() - this.zero.x) * 10.0) / 4.0, -2.0, 2.0);
            this.deltaOrientation.y = this.clamp(Math.floor((this.alite.getInput().getAccelY() - this.zero.y) * 50.0) / 10.0, -2.0, 2.0);
            this.deltaOrientation.z = -this.clamp(Math.floor((this.alite.getInput().getAccelZ() - this.zero.z) * 50.0) / 10.0, -2.0, 2.0);

            this.deltaYawRollPitch.z = this.deltaOrientation.z;
            if (Settings.reversePitch) {
                this.deltaYawRollPitch.z = -this.deltaYawRollPitch.z;
            }
            this.deltaYawRollPitch.y = this.deltaOrientation.y;
        }
    }

    private getAccelerometerData(): void {
        if (!this.calibrated) {
            this.calibrated = true;
        }
        const accelY = this.alite.getInput().getAccelY();
        const accelZ = this.alite.getInput().getAccelZ();

        this.deltaYawRollPitch.x = 0;
        this.deltaYawRollPitch.y = -this.clamp(Math.floor(accelY * 50.0) / 10.0, -2.0, 2.0);
        this.deltaYawRollPitch.z = this.clamp(Math.floor(accelZ * 30.0) / 10.0, -2.0, 2.0);

        if (Settings.reversePitch) {
            this.deltaYawRollPitch.z = -this.deltaYawRollPitch.z;
        }
    }

    private getHudControlData(): void {
        if (this.hud != null) {
            this.deltaYawRollPitch.z = this.hud.getZ();
            if (Settings.reversePitch) {
                this.deltaYawRollPitch.z = -this.deltaYawRollPitch.z;
            }
            this.deltaYawRollPitch.y = this.hud.getY();
        }
    }

    private updateShipOrientation(): void {
        if (!this.playerControl) {
            return;
        }
        // TODO: Re-implement control modes
        // switch (Settings.controlMode) {
        //     case ACCELEROMETER: this.getAccelerometerData(); break;
        //     case ALTERNATIVE_ACCELEROMETER: this.getAlternativeAccelerometerData(); break;
        //     case CONTROL_PAD:
        //     case CURSOR_BLOCK:
        //     case CURSOR_SPLIT_BLOCK: this.getHudControlData(); break;
        // }
    }

    terminateToTitleScreen(): void {
        SoundManager.stopAll();
        this.witchSpace = null;
        this.message.clearRepetition();
        try {
            this.alite.autoLoad();
        } catch (e) {
            AliteLog.e("Game Over", "Cannot reset commander to last autosave. Resetting.", e);
            this.alite.resetPlayer();
            this.alite.getPlayer().addVisitedPlanet();
        }
        this.alite.getNavigationBar().setFlightMode(false);
        this.newScreen = new ShipIntroScreen();
    }

    public terminateToStatusScreen(): void {
        SoundManager.stopAll();
        this.witchSpace = null;
        this.message.clearRepetition();
        this.alite.getNavigationBar().setFlightMode(false);
        try {
            AliteLog.d("[ALITE]", "Performing autosave. [Docked]");
            this.alite.autoSave();
        } catch (e) {
            AliteLog.e("[ALITE]", "Autosaving commander failed.", e);
        }
        this.newScreen = new StatusScreen();
    }

    public addObject(object: AliteObject): void {
        this.objectsToBeAdded.push(object);
    }

    private spawnMissile(so: SpaceObject): void {
        const missile = this.helper.spawnMissile(so, this.ship);
        this.message.repeatText(L.string("com_incoming_missile"), 2);
        missile.addDestructionCallback({
            execute: (deltaTime: number) => {
                this.message.clearRepetition();
            }
        });
    }

    private spawnObjects(ao: SpaceObject): void {
        for (const st of ao.getObjectsToSpawn()) {
            switch (st) {
                case ObjectType.Missile: this.spawnMissile(ao); break;
                case ObjectType.EscapeCapsule: this.helper.launchEscapeCapsule(ao); break;
                default: AliteLog.d("Unknown ShipType", "Supposed to spawn a " + st + " - but don't know how."); break;
            }
        }
        ao.clearObjectsToSpawn();
    }

    private updatePlanet(ao: AliteObject): void {
        const distSq = ao.getPosition().distanceSq(this.ship.getPosition());
        if (distSq > InGameManager.EXT_SAFE_ZONE_RADIUS_SQ) {
            this.alite.getCobra().setAltitude(PlayerCobra.MAX_ALTITUDE);
        } else {
            this.alite.getCobra().setAltitude(PlayerCobra.MAX_ALTITUDE * (distSq / InGameManager.EXT_SAFE_ZONE_RADIUS_SQ));
        }
        this.extendedSafeZone = this.station != null && this.witchSpace == null && distSq < InGameManager.EXT_SAFE_ZONE_RADIUS_SQ;
        InGameManager.playerInSafeZone = this.extendedSafeZone && distSq < InGameManager.SAFE_ZONE_RADIUS_SQ;
        if (this.extendedSafeZone && this.spawnManager.isInTorus()) {
            this.spawnManager.leaveTorus();
            this.message.setText(L.string("msg_mass_locked"));
        }
    }

    private removeObjectIfNecessary(objectIterator: number, allObjects: AliteObject[]): boolean {
        const ao = allObjects[objectIterator];
        if (ao.mustBeRemoved() || ao instanceof SpaceObject && (ao as SpaceObject).getHullStrength() <= 0) {
            ao.executeDestructionCallbacks();
            allObjects.splice(objectIterator, 1);
            return true;
        }
        return false;
    }

    private updateObjects(deltaTime: number, allObjects: AliteObject[]): void {
        this.helper.checkShipObjectCollision(allObjects);
        this.laserManager.update(deltaTime, allObjects);
        this.helper.checkProximity(allObjects);
        if (this.dockingComputerAI != null && this.dockingComputerAI.isActive()) {
            if (!this.dockingComputerAI.isOnFinalApproach()) {
                this.helper.checkShipStationProximity();
            }
            if (this.ship.getProximity() != null && this.ship.getProximity() !== this.station) {
                const distanceSq = this.ship.getPosition().distanceSq(this.ship.getProximity().getPosition());
                if (distanceSq > InGameHelper.STATION_VESSEL_PROXIMITY_DISTANCE_SQ) {
                    this.ship.setProximity(null);
                }
            }
        }

        for (let i = allObjects.length - 1; i >= 0; i--) {
            const ao = allObjects[i];
            if ("Planet" === ao.getId()) {
                this.updatePlanet(ao);
            }
            if (ao instanceof SpaceObject) {
                this.spawnObjects(ao as SpaceObject);
            }
            if (this.removeObjectIfNecessary(i, allObjects)) {
                continue;
            }
            if (ao instanceof SpaceObject) {
                (ao as SpaceObject).updateWithMovingForward(deltaTime);
                if ((ao as SpaceObject).getType() === ObjectType.Missile) {
                    this.helper.handleMissileUpdate(ao as SpaceObject, deltaTime);
                    ao.getPosition().sub(this.ship.getPosition(), this.tempVector);
                    if (this.tempVector.lengthSq() > AliteHud.MAX_DISTANCE_SQ) {
                        allObjects.splice(i, 1);
                    }
                }
            }
            ao.onUpdate(deltaTime);
        }
    }

    private updateTimedEvents(): void {
        this.removedTimedEvents.length = 0;
        for (const event of this.timedEvents) {
            event.perform();
            if (event.mustBeRemoved()) {
                this.removedTimedEvents.push(event);
            }
        }
        for (const event of this.removedTimedEvents) {
            const index = this.timedEvents.indexOf(event);
            if (index > -1) {
                this.timedEvents.splice(index, 1);
            }
        }
    }

    private handleStationAccessDeclined(): void {
        if (this.station == null || this.station.isAccessDenied()) {
            if (this.isDockingComputerActive()) {
                if (this.hud != null) {
                    this.hud.mapDirections(false, false, false, false);
                }
                this.dockingComputerAI.disengage();
                SoundManager.playOnce(Assets.com_accessDeclined, 3000);
                this.message.setText(L.string("com_access_declined"));
            }
        }
    }

    private updateRetroRockets(deltaTime: number): void {
        if (this.ship.getSpeed() > 0) {
            // Retro rockets decaying
            let newSpeed = this.ship.getSpeed() * (1.0 - deltaTime + deltaTime / 1.6);
            if (newSpeed < 100) {
                newSpeed = 0;
            }
            this.ship.setSpeed(newSpeed);
        }
    }

    public isTorusDriveEngaged(): boolean {
        return this.ship.getSpeed() < -PlayerCobra.TORUS_TEST_SPEED;
    }

    performUpdate(deltaTime: number, allObjects: AliteObject[]): void {
        if (this.paused || this.destroyed || this.helper == null) {
            return;
        }
        if (this.hud != null) {
            this.hud.update(deltaTime);
        }
        if (this.spawnManager != null && this.spawnManager.needsInitialization()) {
            this.spawnManager.initTimedEvents(this);
        }

        this.updateShipOrientation();
        this.ship.moveForward(deltaTime);
        this.ship.onUpdate(deltaTime);
        this.helper.updatePlayerCondition();
        this.handleStationAccessDeclined();
        this.updateRetroRockets(deltaTime);

        if (this.starDust != null) {
            this.starDust.update(this.ship.getPosition(), this.ship.getForwardVector(), this.isTorusDriveEngaged());
        }

        this.laserManager.performUpdate();

        this.updateTimedEvents();
        if (this.dockingComputerAI.isActive() && Settings.dockingComputerSpeed === 2 &&
            (this.alite.getPlayer().getLegalStatus() === LegalStatus.CLEAN || !this.vipersWillEngage ||
                (this.alite.getPlayer().getCurrentSystem() == null ||
                    this.alite.getPlayer().getCurrentSystem().getGovernment() === Government.ANARCHY ||
                    this.alite.getPlayer().getCurrentSystem().getGovernment() === Government.FEUDAL) && !InGameManager.safeZoneViolated)) {
            this.helper.automaticDockingSequence();
        }
        this.updateObjects(deltaTime, allObjects);

        allObjects.push(...this.objectsToBeAdded);
        this.objectsToBeAdded.length = 0;
        if (!this.isPlayerControl() && this.dockingComputerAI.isActive() || this.needsSpeedAdjustment) {
            if (!this.isPlayerAlive()) {
                this.dockingComputerAI.disengage();
            }
            this.ship.update(deltaTime);
            if (Math.abs(this.ship.getTargetSpeed() - this.ship.getSpeed()) < 0.0001) {
                this.needsSpeedAdjustment = false;
            }
        }
    }

    public setNeedsSpeedAdjustment(b: boolean): void {
        this.needsSpeedAdjustment = b;
    }

    public setViewport(newViewDirection: number): void {
        if (this.viewDirection === newViewDirection) {
            this.toggleZoom();
        } else {
            this.laserManager.setAutoFire(false);
            this.viewDirection = newViewDirection;
        }
    }

    public toggleZoom(): void {
        if (this.hud.getZoomFactor() > 3.5) {
            this.hud.setZoomFactor(1.0);
        } else {
            this.hud.zoomIn();
        }
    }

    private computeNewViewport(x: number, y: number): number {
        if (Math.abs(x - InGameManager.RADAR_CENTER_X) / InGameManager.RADAR_RADIUS_X > Math.abs(y - InGameManager.RADAR_CENTER_Y) / InGameManager.RADAR_RADIUS_Y) {
            return x > InGameManager.RADAR_CENTER_X ? PlayerCobra.DIR_RIGHT : PlayerCobra.DIR_LEFT;
        }
        return y > InGameManager.RADAR_CENTER_Y ? PlayerCobra.DIR_REAR : PlayerCobra.DIR_FRONT;
    }

    public handleMissileIcons(): void {
        if (this.alite.getCobra().isMissileLocked()) {
            this.alite.getCobra().setMissileLocked(false);
            this.missileLock = null;
            this.targetMissile = false;
        } else {
            this.targetMissile = !this.targetMissile;
        }
        this.alite.getCobra().setMissileTargetting(this.targetMissile);
    }

    public fireMissile(): void {
        if (!this.alite.getCobra().isMissileLocked()) {
            return;
        }
        this.alite.getCobra().setMissileLocked(false);
        // This should not happen, but just in case: Deactivate the missile now.
        if (this.missileLock == null) {
            this.targetMissile = false;
            this.laserManager.handleTouchUp();
            return;
        }

        this.alite.getCobra().setMissiles(this.alite.getCobra().getMissiles() - 1);
        SoundManager.play(Assets.fireMissile);
        this.helper.spawnMissile(this.ship, this.missileLock);
        this.missileLock.sendAIMessage("INCOMING_MISSILE");
        this.missileLock = null;
    }

    private handleSpeedChange(e: TouchEvent): void {
        if (this.lastX === -1 || this.lastY === -1) {
            return;
        }
        const diffX = e.x - this.lastX;
        const diffY = e.y - this.lastY;
        const ady = Math.abs(diffY);
        const adx = Math.abs(diffX);
        if (adx <= 10 && ady <= 10 && !this.changingSpeed || !this.playerControl || adx === ady) {
            return;
        }
        if (ady > adx) {
            if (InGameManager.OVERRIDE_SPEED || this.ship.getSpeed() > 0) {
                return;
            }
            // No speed change if retro rockets are being fired right now...
            this.changingSpeed = true;
            let newSpeed = this.ship.getSpeed() + diffY / 1.4;
            if (diffY > 0) {
                if (newSpeed > 0.0) {
                    newSpeed = 0.0;
                }
            } else if (newSpeed < -PlayerCobra.MAX_SPEED) {
                newSpeed = -PlayerCobra.MAX_SPEED;
            }
            this.ship.setSpeed(newSpeed);
            this.lastX = e.x;
            this.lastY = e.y;
            return;
        }

        if (!Settings.tapRadarToChangeView) {
            if (adx > 500) {
                if (diffX < 0) {
                    this.setViewport(this.viewDirection < 3 ? this.viewDirection + 1 : 0);
                } else {
                    const vd = this.viewDirection > 0 ? this.viewDirection - 1 : 3;
                    this.setViewport(vd);
                }
                this.lastX = e.x;
                this.lastY = e.y;
                this.viewDirectionChanged = true;
            }
            return;
        }
        if (InGameManager.OVERRIDE_SPEED || this.ship.getSpeed() > 0) {
            return;
        }
        this.changingSpeed = true;
        let newSpeed = this.ship.getSpeed() - diffX;
        if (newSpeed > 0.0) {
            newSpeed = 0.0;
        } else if (newSpeed < -PlayerCobra.MAX_SPEED) {
            newSpeed = -PlayerCobra.MAX_SPEED;
        }
        this.ship.setSpeed(newSpeed);
        this.lastX = e.x;
        this.lastY = e.y;
    }

    public handleExternalViewportChange(e: TouchEvent): number {
        if (Settings.tapRadarToChangeView) {
            return e.type === TouchEvent.TOUCH_UP && Rect.inside(e.x, e.y, AliteHud.RADAR_X1, AliteHud.RADAR_Y1,
                AliteHud.RADAR_X2, AliteHud.RADAR_Y2) && this.isPlayerAlive() ? this.computeNewViewport(e.x, e.y) : -1;
        }

        if (e.type === TouchEvent.TOUCH_DOWN) {
            this.lastX = e.x;
            this.lastY = e.y;
            return -1;
        }
        if (e.type === TouchEvent.TOUCH_DRAGGED) {
            if (this.lastX === -1 || this.lastY === -1) {
                return -1;
            }
            const diffX = e.x - this.lastX;
            const adx = Math.abs(diffX);
            if (adx <= 500) {
                return -1;
            }
            if (diffX < 0) {
                let vd = this.viewDirection + 1;
                if (vd === 4) {
                    vd = 0;
                }
                this.lastX = e.x;
                return vd;
            }
            let vd = this.viewDirection - 1;
            if (vd < 0) {
                vd = 3;
            }
            this.lastX = e.x;
            return vd;
        }

        return e.type === TouchEvent.TOUCH_UP && Rect.inside(e.x, e.y, AliteHud.RADAR_X1, AliteHud.RADAR_Y1,
            AliteHud.RADAR_X2, AliteHud.RADAR_Y2) && this.isPlayerAlive() ? 4 : -1;
    }

    handleUI(e: TouchEvent): boolean {
        if (this.hud == null) {
            return false;
        }
        this.buttons.checkFireRelease(e);
        if (this.isPlayerControl()) {
            if (this.hud.handleUI(e)) {
                return false;
            }
        }
        if (!this.buttons.handleTouch(e)) {
            if (e.type === TouchEvent.TOUCH_DOWN) {
                this.lastX = e.x;
                this.lastY = e.y;
            }
            if (e.type === TouchEvent.TOUCH_UP) {
                this.lastX = -1;
                this.lastY = -1;
                if (this.changingSpeed) {
                    this.changingSpeed = false;
                } else {
                    if (Rect.inside(e.x, e.y, AliteHud.RADAR_X1, AliteHud.RADAR_Y1,
                        AliteHud.RADAR_X2, AliteHud.RADAR_Y2) && this.isPlayerAlive()) {
                        if (Settings.tapRadarToChangeView) {
                            this.setViewport(this.computeNewViewport(e.x, e.y));
                        } else if (!this.viewDirectionChanged) {
                            this.toggleZoom();
                        }
                    } else if (Rect.inside(e.x, e.y, AliteHud.ALITE_TEXT_X1, AliteHud.ALITE_TEXT_Y1,
                        AliteHud.ALITE_TEXT_X2, AliteHud.ALITE_TEXT_Y2)) {
                        if (this.alite.getCurrentScreen() instanceof FlightScreen) {
                            (this.alite.getCurrentScreen() as FlightScreen).setPauseByTapOnLogo();
                        }
                    } else {
                        const picked = this.objectPicker.handleIdentify(e.x, e.y, this.sortedObjectsToDraw);
                        if (picked != null) {
                            SoundManager.play(Assets.identify);
                            this.message.setText(picked.getName());
                        }
                    }
                }
                this.viewDirectionChanged = false;
                return true;
            }
            if (e.type === TouchEvent.TOUCH_DRAGGED) {
                this.handleSpeedChange(e);
            }
        } else {
            this.newScreen = null;
            return true;
        }
        return false;
    }

    public getNewScreen(): Screen {
        return this.newScreen;
    }

    private performViewTransformation(deltaTime: number): void {
        // TODO: WebGL implementation
    }

    private calcViewTransformation(deltaTime: number): void {
        // TODO: WebGL implementation
    }

    private renderHud(): void {
        // TODO: WebGL implementation
    }

    private renderButtons(): void {
        // TODO: WebGL implementation
    }

    public isTargetInCenter(): boolean {
        return this.hud != null && this.hud.isTargetInCenter();
    }

    private isEnemy(go: AliteObject): boolean {
        if (!(go instanceof SpaceObject)) {
            return false;
        }
        const so = go as SpaceObject;
        const type = so.getType();
        return ObjectType.isEnemyShip(type) || type === ObjectType.Thargoid || type === ObjectType.Police ||
            type === ObjectType.Defender || so.isDrone() && so.hasLivingMother();
    }

    private renderHudObject(deltaTime: number, go: AliteObject): void {
        if (this.hud == null || go instanceof SpaceObject && (go as SpaceObject).isCloaked()) {
            return;
        }
        if (go.isVisibleOnHud()) {
            // TODO: Matrix math
            // Matrix.multiplyMM(this.tempMatrix[1], 0, this.viewMatrix, 0, go.getMatrix(), 0);
            this.hud.setObject(this.hudIndex++, this.tempMatrix[1][12], this.tempMatrix[1][13], this.tempMatrix[1][14], go.getHudColor(), this.isEnemy(go));
        }
        if (go instanceof SpaceObject && ObjectType.isSpaceStation((go as SpaceObject).getType()) && !this.planetWasSet) {
            // TODO: Matrix math
            // Matrix.multiplyMM(this.tempMatrix[1], 0, this.viewMatrix, 0, go.getMatrix(), 0);
            this.hud.setPlanet(this.tempMatrix[1][12], this.tempMatrix[1][13], this.tempMatrix[1][14]);
        }
        if ("Planet" === go.getId()) {
            if (!InGameManager.playerInSafeZone) {
                // TODO: Matrix math
                // Matrix.multiplyMM(this.tempMatrix[1], 0, this.viewMatrix, 0, go.getMatrix(), 0);
                this.hud.setPlanet(this.tempMatrix[1][12], this.tempMatrix[1][13], this.tempMatrix[1][14]);
                this.planetWasSet = true;
            } else {
                this.helper.checkAltitudeLowAlert();
            }
        }
        if ("Sun" === go.getId()) {
            const distSq = go.getPosition().distanceSq(this.ship.getPosition());
            if (distSq > InGameManager.EXT_SAFE_ZONE_RADIUS_SQ || this.witchSpace != null) {
                this.alite.getCobra().setCabinTemperature(0);
            } else {
                if (this.spawnManager.isInTorus()) {
                    this.spawnManager.leaveTorus();
                    this.message.setText(L.string("msg_mass_locked"));
                }
                this.alite.getCobra().setCabinTemperature(
                    Math.floor(PlayerCobra.MAX_CABIN_TEMPERATURE - PlayerCobra.MAX_CABIN_TEMPERATURE
                        * ((distSq - FlightScreen.SUN_SIZE * FlightScreen.SUN_SIZE) / InGameManager.EXT_SAFE_ZONE_RADIUS_SQ)));
                this.helper.checkCabinTemperatureAlert(deltaTime);
            }
        }
    }

    private renderAllObjects(deltaTime: number): void {
        // TODO: WebGL implementation
    }

    renderScroller(deltaTime: number): void {
        // TODO: WebGL implementation
    }

    public render(deltaTime: number, objects: AliteObject[]): void {
        // TODO: WebGL implementation
    }

    private debugDocking(): void {
        // TODO: WebGL implementation
    }

    computeDistanceSq(a: AliteObject, b: AliteObject): number {
        this.tempVector.x = b.getPosition().x - a.getPosition().x;
        this.tempVector.y = b.getPosition().y - a.getPosition().y;
        this.tempVector.z = b.getPosition().z - a.getPosition().z;
        this.tempVector.normalize();
        const aDistance = a.getDistanceFromCenterToBorder();
        const adx = aDistance * this.tempVector.x;
        const ady = aDistance * this.tempVector.y;
        const adz = aDistance * this.tempVector.z;
        this.tempVector.negate();
        const bDistance = b.getDistanceFromCenterToBorder();
        const bdx = bDistance * this.tempVector.x;
        const bdy = bDistance * this.tempVector.y;
        const bdz = bDistance * this.tempVector.z;

        return (a.getPosition().x + adx - b.getPosition().x - bdx) * (a.getPosition().x + adx - b.getPosition().x - bdx) +
            (a.getPosition().y + ady - b.getPosition().y - bdy) * (a.getPosition().y + ady - b.getPosition().y - bdy) +
            (a.getPosition().z + adz - b.getPosition().z - bdz) * (a.getPosition().z + adz - b.getPosition().z - bdz);
    }

    private displayDockingAlignment(spaceStation: SpaceObject, distanceSq: number): void {
        // TODO: WebGL implementation
    }

    calcAllObjects(deltaTime: number, objects: AliteObject[]): void {
        if (this.destroyed) {
            return;
        }
        if (this.laserManager == null) {
            return;
        }
        this.calcViewTransformation(deltaTime);
        this.viewingTransformationHelper.clearObjects(this.sortedObjectsToDraw);
        this.hudIndex = 0;
        this.planetWasSet = false;
        if (this.viewDirection !== PlayerCobra.DIR_FRONT) {
            this.viewingTransformationHelper.applyViewDirection(this.viewDirection, this.viewMatrix);
        }
        // TODO: Matrix math
        // MathHelper.copyMatrix(this.viewMatrix, this.tempMatrix[0]);

        this.viewingTransformationHelper.sortObjects(objects, this.viewMatrix, this.tempMatrix[2], this.laserManager.activeLasers,
            this.sortedObjectsToDraw, this.witchSpace != null, this.ship);
        try {
            for (const bucket of this.sortedObjectsToDraw) {
                for (const go of bucket.sortedObjects) {
                    if (go instanceof SpaceObject && (go as SpaceObject).isCloaked()) {
                        continue;
                    }
                    if (!this.isPlayerAlive() && go instanceof SpaceObject && ObjectType.isSpaceStation((go as SpaceObject).getType())) {
                        continue;
                    }
                    // TODO: Matrix math
                    // MathHelper.copyMatrix(this.tempMatrix[0], this.viewMatrix);
                    if (go instanceof Billboard) {
                        (go as Billboard).update(this.ship);
                    }
                    // TODO: Matrix math
                    // Matrix.multiplyMM(this.tempMatrix[2], 0, this.viewMatrix, 0, go.getMatrix(), 0);
                    go.setDisplayMatrix(this.tempMatrix[2]);
                }
            }
        } catch (e) {
            // This can happen if the game state is being paused while the current
            // screen is being rendered. Ignoring it is a bit of a hack, but gets
            // rid of the issue...
        }
    }

    public destroy(): void {
        this.destroyed = true;
        if (this.message != null) {
            this.message.clearRepetition();
        }
        SoundManager.stopAll();
        if (this.skysphere != null) {
            this.skysphere.destroy();
        }
        if (this.laserManager != null) {
            this.laserManager.destroy();
        }
        this.laserManager = null;
        this.helper = null;
        this.viewingTransformationHelper = null;
    }

    public traverseObjects(traverser: SpaceObjectTraverser): boolean {
        for (const db of this.sortedObjectsToDraw) {
            for (const eo of db.sortedObjects) {
                if (eo instanceof SpaceObject && !eo.mustBeRemoved()) {
                    if (traverser.handle(eo as SpaceObject)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    enterWitchSpace(): void {
        this.witchSpace = new WitchSpaceRender(this);
        this.witchSpace.enterWitchSpace();
    }

    public isWitchSpace(): boolean {
        return this.witchSpace != null;
    }

    private escapeWitchSpace(): void {
        if (this.witchSpace != null) {
            this.alite.getPlayer().increaseKillCountInWitchSpace(this.witchSpace.getWitchSpaceKillCounter());
            this.witchSpace = null;
        }
    }

    public isHyperdriveMalfunction(): boolean {
        return this.witchSpace != null && this.witchSpace.isHyperdriveMalfunction();
    }

    public isInExtendedSafeZone(): boolean {
        return this.extendedSafeZone;
    }

    getNumberOfObjects(traverser: SpaceObjectTraverser): number {
        let count = 0;
        for (const db of this.sortedObjectsToDraw) {
            for (const eo of db.sortedObjects) {
                if (eo instanceof SpaceObject && !eo.mustBeRemoved() && traverser.handle(eo as SpaceObject)) {
                    count++;
                }
            }
        }
        return count;
    }

    public getObjects(type: ObjectType): SpaceObject[] {
        const objects: SpaceObject[] = [];
        for (const db of this.sortedObjectsToDraw) {
            for (const eo of db.sortedObjects) {
                if (eo instanceof SpaceObject && (eo as SpaceObject).getType() === type && !eo.mustBeRemoved()) {
                    objects.push(eo as SpaceObject);
                }
            }
        }
        return objects;
    }

    getShipInDockingBay(): SpaceObject {
        for (const db of this.sortedObjectsToDraw) {
            for (const eo of db.sortedObjects) {
                if (eo instanceof SpaceObject && (eo as SpaceObject).isInBay()) {
                    return eo as SpaceObject;
                }
            }
        }
        return null;
    }

    setPaused(p: boolean): void {
        this.paused = p;
        this.spawnManager.setPaused(p);
        if (p) {
            if (this.oldMessage == null) {
                this.oldMessage = this.message;
            }
            if (this.scrollingText == null) {
                this.scrollingText = new ScrollingText();
            }
            this.message = new OnScreenMessage();
            this.message.repeatText(L.string("msg_pause_game", AliteConfig.GAME_NAME), 5, -1, 3);
        } else {
            this.scrollingText = null;
            this.message.clearRepetition();
            this.message = this.oldMessage;
            this.oldMessage = null;
            this.calibrate();
        }
        for (const te of this.timedEvents) {
            if (p) {
                te.pause();
            } else {
                te.resume();
            }
        }
        if (this.dockingComputerAI != null) {
            if (this.paused) {
                this.dockingComputerAI.pauseMusic();
            } else {
                this.dockingComputerAI.resumeMusic();
            }
        }
    }

    public clearMessageRepetition(): void {
        this.message.clearRepetition();
    }

    public forceForwardView(): void {
        this.viewDirection = PlayerCobra.DIR_FRONT;
        if (this.hud != null) {
            this.hud.setZoomFactor(1);
        }
    }

    private killHyperspaceJump(): boolean {
        if (this.hyperspaceTimer != null) {
            this.hyperspaceTimer.pause();
            this.hyperspaceTimer.remove();
            this.hyperspaceTimer = null;
            return true;
        }
        return false;
    }

    public toggleHyperspaceCountdown(galacticNumber: number): boolean {
        if (this.killHyperspaceJump()) {
            this.message.setText(L.string("msg_hyperspace_jump_aborted"));
            return false;
        }
        this.initialHyperspaceSystem = this.alite.getPlayer().getHyperspaceSystem();
        this.hyperspaceTimer = new HyperspaceTimer(this, galacticNumber);
        this.timedEvents.push(this.hyperspaceTimer);
        return true;
    }

    public isHyperspaceEngaged(isIntergalactic: boolean): boolean {
        return this.hyperspaceTimer != null && this.hyperspaceTimer.isIntergalactic() === isIntergalactic;
    }

    public performIntergalacticJump(galacticNumber: number): void {
        this.buttons.engageGalacticHyperspace(galacticNumber);
    }

    public toggleCloaked(): void {
        this.ship.setCloaked(!this.ship.isCloaked());
        if (this.ship.isCloaked()) {
            this.cloakingEvent = new CloakingEvent(this);
            this.timedEvents.push(this.cloakingEvent);
        } else {
            this.cloakingEvent.pause();
            this.cloakingEvent.remove();
            this.cloakingEvent = null;
            this.message.clearRepetition();
        }
    }

    performHyperspaceJump(galacticNumber: number): void {
        this.killHyperspaceJump();
        this.newScreen = new HyperspaceScreen(galacticNumber);
        this.escapeWitchSpace();
        InGameManager.playerInSafeZone = false;
        this.alite.setTimeFactor(1);
        this.alite.getPlayer().setHyperspaceSystem(this.initialHyperspaceSystem);
    }

    public getViewDirection(): number {
        return this.viewDirection;
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public reduceShipEnergy(i: number): void {
        this.alite.getCobra().setEnergy(this.alite.getCobra().getEnergy() - i);
        this.laserManager.checkEnergyLow();
        if (this.alite.getCobra().getEnergy() <= 0) {
            this.gameOver();
        }
    }

    private checkPromotion(): void {
        const score = this.alite.getPlayer().getScore();
        let promoted = false;
        const ratings = Object.values(Rating);
        let currentRating = this.alite.getPlayer().getRating();
        // TODO: This logic needs to be fixed to work with TS enums
        // while (score >= currentRating.getScoreThreshold() && currentRating.getScoreThreshold() > 0) {
        //     this.alite.getPlayer().setRating(ratings[currentRating.ordinal() + 1]);
        //     promoted = true;
        // }
        if (promoted) {
            this.message.setText(L.string("msg_right_on_commander"));
        }
    }

    computeBounty(destroyedObject: SpaceObject, destroyedByEquipment: string): void {
        const bounty = destroyedObject.getBounty();
        this.alite.getPlayer().setCash(this.alite.getPlayer().getCash() + bounty);
        this.computeScore(destroyedObject, EquipmentStore.MISSILES === destroyedByEquipment && this.ship.isEcmJammer() ?
            EquipmentStore.ECM_JAMMER : destroyedByEquipment);
        if (destroyedObject.getType() !== ObjectType.CargoPod) {
            SoundManager.play(Assets.com_targetDestroyed);
            const bountyString = bounty === 0 ? L.string("bounty_none", destroyedObject.getName()) :
                L.string("bounty_amount", destroyedObject.getName(), L.getOneDecimalFormatString("cash_amount_value_ccy", bounty));
            this.message.setDelayedText(bountyString);
        }
    }

    public computeScore(destroyedObject: SpaceObject, destroyedByEquipment: string): void {
        let points = destroyedObject.getScore();
        if (Settings.difficultyLevel === 0) {
            points >>= 1;
        } else if (Settings.difficultyLevel === 1) {
            points = Math.floor(points * 0.75);
        } else if (Settings.difficultyLevel === 2) {
            points = Math.floor(points * 0.85);
        } else if (Settings.difficultyLevel === 4) {
            points = Math.floor(points * 1.25);
        } else if (Settings.difficultyLevel === 5) {
            points <<= 1;
        }
        AliteLog.d("Player kill", "Destroyed " + destroyedObject.getId() +
            " at Difficulty " + Settings.difficultyLevel + " for " + points + " points.");
        this.alite.getPlayer().setScore(this.alite.getPlayer().getScore() + points);
        this.checkPromotion();
        Alite.getInstance().getPlayer().increaseKillCount(destroyedObject, destroyedByEquipment, this.ship.isCloaked());
        if (destroyedObject.getScore() > 0) {
            if (this.alite.getPlayer().getKillCount() % 1024 === 0) {
                this.message.setText(L.string("msg_good_shooting_commander"));
            } else if (this.alite.getPlayer().getKillCount() % 256 === 0) {
                this.message.setText(L.string("msg_right_on_commander"));
            }
        }
    }

    public gameOver(): void {
        if (this.isDockingComputerActive()) {
            this.toggleDockingComputer(false);
        }
        this.killHyperspaceJump();
        this.message.clearRepetition();
        if (this.ship.getUpdater() instanceof GameOverUpdater) {
            return;
        }
        SoundManager.stop(Assets.energyLow);
        SoundManager.stop(Assets.criticalCondition);
        this.setPlayerControl(false);
        if (this.alite.getCurrentScreen() instanceof FlightScreen) {
            (this.alite.getCurrentScreen() as FlightScreen).setInformationScreen(null);
        }
        this.forceForwardView();
        this.killHud();
        this.ship.setUpdater(new GameOverUpdater(this, this.ship));
        this.alite.getPlayer().setCondition(Condition.DOCKED);
    }

    public setHyperspaceHook(hyperspaceHook: IMethodHook): void {
        this.hyperspaceHook = hyperspaceHook;
    }

    public getHyperspaceHook(): IMethodHook {
        return this.hyperspaceHook;
    }

    public toggleECMJammer(): void {
        this.ship.setEcmJammer(!this.ship.isEcmJammer());
        if (this.ship.isEcmJammer()) {
            this.jammingEvent = new JammingEvent(this);
            this.timedEvents.push(this.jammingEvent);
        } else {
            this.jammingEvent.pause();
            this.jammingEvent.remove();
            this.jammingEvent = null;
            this.message.clearRepetition();
        }
    }

    resetHud(): void {
        if (this.hud != null) {
            this.hud = new AliteHud({
                apply: (speed: number) => {
                    return this.ship.getSpeed();
                }
            });
            if (this.buttons != null) {
                this.buttons.reset();
            }
        }
    }

    getWitchSpace(): WitchSpaceRender {
        return this.witchSpace;
    }

    setNewScreen(screen: AliteScreen): void {
        this.newScreen = screen;
    }

    getDockingComputerAI(): DockingComputerAI {
        return this.dockingComputerAI;
    }

    clearMissileLock(): void {
        this.missileLock = null;
    }

    getMessage(): OnScreenMessage {
        return this.message;
    }

    public getMissileLock(): SpaceObject {
        return this.missileLock;
    }

    isVipersWillEngage(): boolean {
        return this.vipersWillEngage;
    }

    setVipersWillEngage(): void {
        this.vipersWillEngage = true;
    }
}
