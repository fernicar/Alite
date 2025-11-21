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

import { AliteConfig } from "./AliteConfig";
import { AliteLog } from "./AliteLog";
import { Assets } from "./Assets";
import { CommanderData } from "./model/CommanderData";
import { Condition } from "./model/Condition";
import { Medal } from "./model/Medal";
import { Player } from "./model/Player";
import { PlayerCobra } from "./model/PlayerCobra";
import { Rating } from "./model/Rating";
import { GalaxyGenerator } from "./model/generator/GalaxyGenerator";
import { SystemData } from "./model/generator/SystemData";
import { ConstrictorMission } from "./model/missions/ConstrictorMission";
import { CougarMission } from "./model/missions/CougarMission";
import { EndMission } from "./model/missions/EndMission";
import { MissionManager } from "./model/missions/MissionManager";
import { SupernovaMission } from "./model/missions/SupernovaMission";
import { ThargoidDocumentsMission } from "./model/missions/ThargoidDocumentsMission";
import { ThargoidStationMission } from "./model/missions/ThargoidStationMission";
import { NavigationBar } from "./screens/NavigationBar";
import { LoadingScreen } from "./screens/canvas/LoadingScreen";
import { FlightScreen } from "./screens/opengl/ingame/FlightScreen";
import { InGameManager } from "./screens/opengl/ingame/InGameManager";
import { LaserManager } from "./screens/opengl/ingame/LaserManager";
import { SpaceObjectTraverser } from "./screens/opengl/ingame/SpaceObjectTraverser";
import { SpaceObject } from "./screens/opengl/objects/space/SpaceObject";
import { SpaceObjectFactory } from "./screens/opengl/objects/space/SpaceObjectFactory";
import { FileUtils } from "./io/FileUtils";
import { Screen } from "../framework/Screen";
import { Timer } from "../framework/Timer";
import { WebGame } from "../framework/impl/WebGame";
import { GLText } from "../framework/impl/gl/font/GLText";


export class Alite extends WebGame {
    public static readonly LOG_IS_INITIALIZED = "logIsInitialized";

    public static NAVIGATION_BAR_LAUNCH: number;
    // ... (rest of NAVIGATION_BAR constants)
    public static NAVIGATION_BAR_QUIT: number;

    private static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

    private player: Player;
    private generator: GalaxyGenerator;
    private readonly clock: Timer = new Timer();
    private elapsedTime: number;
    private lastPlayedTime: number;
    private playedContiguousDays: number;
    private maxPlayedContiguousDays: number;
    private navigationBar: NavigationBar;
    private readonly fileUtils: FileUtils;
    private laserManager: LaserManager;
    private static alite: Alite;
    private saving: boolean = false;
    private isHackerActive: boolean;
    private inGame: InGameManager;
    private medal: typeof Medal;

    constructor(container: HTMLElement) {
        super(container, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT);
        Alite.alite = this;
        this.fileUtils = new FileUtils(this.getFileIO());
    }


    public getStartScreen(): Screen {
        return new LoadingScreen();
    }


    public async start(): Promise<void> {
        AliteLog.initialize(this.getFileIO());
        AliteLog.d("Alite.start", "start begin");

        window.addEventListener('error', (event) => {
            AliteLog.e("Uncaught Exception (Alite)", `Message: ${event.message}`, event.error);
        });

        this.registerMissions();
        this.initialize();
        super.start(); // This will start the game loop
    }


    public initialize(): void {
        if (!this.generator) {
            this.generator = new GalaxyGenerator();
            this.generator.buildGalaxy(1);
        }
        if (!this.player) {
            this.resetPlayer();
            this.player.addVisitedPlanet();
        }
    }

    public resetPlayer(): void {
        this.player = new Player();
        this.medal = Medal;
        this.medal.initialize(this);
        this.medal.initMedals();
    }

    public getMedals(): Medal.Item[] {
        return this.medal.getMedals();
    }

    public updateMedals(): void {
        if (this.player.getCondition() === Condition.DOCKED) {
            this.navigationBar.setNotificationNumber(Alite.NAVIGATION_BAR_ACHIEVEMENTS, this.medal.updateMedals());
        }
    }


    private registerMissions(): void {
        MissionManager.getInstance().clear();
        MissionManager.getInstance().register(new ConstrictorMission());
        MissionManager.getInstance().register(new ThargoidDocumentsMission());
        MissionManager.getInstance().register(new SupernovaMission());
        MissionManager.getInstance().register(new CougarMission());
        MissionManager.getInstance().register(new ThargoidStationMission());
        MissionManager.getInstance().register(new EndMission());
    }

    // ... (rest of Alite class methods converted to TypeScript)
    public static get(): Alite {
        return alite;
    }

    public async autoSave(): Promise<void> {
        if (this.getCurrentScreen() instanceof TutorialScreen) {
            return;
        }
        await this.fileUtils.autoSave();
    }

    public fromJson(json: string): void {
        const o = JSON.parse(json);
        this.generator.buildGalaxy(o.currentGalaxy);
        this.setGameTime(o.gameTime);
        this.lastPlayedTime = o.lastPlayedTime || 0;
        this.playedContiguousDays = o.playedContiguousDays || 0;
        this.maxPlayedContiguousDays = o.maxPlayedContiguousDays || 0;
        // ... (rest of deserialization logic)
    }

}
