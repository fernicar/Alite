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

import { ShipControl } from "./ShipControl";
import { SoundType } from "../framework/Sound";
import { UPDATE_MODE_AUTO_UPDATE_OVER_WIFI_ONLY } from "../framework/PluginManager";

// --- Stubs for dependencies ---
class ColorScheme {
    static COLOR_SCHEME_CLASSIC = "classic";
    static setColorScheme(files: any, a: any, b: any) {}
}
class L {
    static getInstance() { return { loadLocaleList: (f: any) => {}, getCurrentLocale: () => 'en_US' }; }
    static getLocaleOf(s: string) { return 'en_US'; }
    static getLanguageCountry(l: string) { return 'en_US'; }
}
class GalaxyGenerator { static GALAXY_COUNT = 8; }
class Medal {
    static setGameLevelMedals(s: string) {}
    static getGameLevelMedals() { return ""; }
}
// --- End Stubs ---

export class Settings {
    private static readonly SETUP_FILE_NAME = ".alite";

    public static readonly FIRE = 0;
    public static readonly MISSILE = 1;
    public static readonly ECM = 2;
    public static readonly RETRO_ROCKETS = 3;
    public static readonly ESCAPE_CAPSULE = 4;
    public static readonly ENERGY_BOMB = 5;
    public static readonly STATUS = 6;
    public static readonly TORUS = 7;
    public static readonly HYPERSPACE = 8;
    public static readonly GALACTIC_HYPERSPACE = 9;
    public static readonly CLOAKING_DEVICE = 10;
    public static readonly ECM_JAMMER = 11;

    public static animationsEnabled = true;
    private static debugActive = false;
    public static logToFile = false;
    public static displayFrameRate = false;
    public static displayDockingInformation = false;
    public static memDebug = false;
    static onlineMemDebug = false;
    public static textureLevel = 1;
    public static colorDepth = 1;
    public static alpha = 0.75;
    public static controlAlpha = 0.5;
    public static volumes = [1.0, 0.5, 0.5, 0.5];
    public static vibrateLevelOnDamage = 0.5;
    public static vibrateLevelOnHit = 0;
    public static controlMode: ShipControl = ShipControl.ACCELEROMETER;
    public static controlPosition = 1;
    public static introVideoQuality = 255;
    public static unlimitedFuel = false;
    public static enterInSafeZone = false;
    public static disableAttackers = false;
    public static disableTraders = false;
    public static invulnerable = false;
    public static laserDoesNotOverheat = false;
    public static particleDensity = 2;
    public static tapRadarToChangeView = true;
    public static laserButtonAutoFire = true;
    public static hasBeenPlayedBefore = false;
    public static buttonPosition = new Array(12).fill(0);
    public static engineExhaust = true;
    public static targetBox = true;
    public static lockScreen = 0;
    public static colorScheme = ColorScheme.COLOR_SCHEME_CLASSIC;
    public static laserPowerOverride = 0;
    public static shieldPowerOverride = 0;
    public static freePath = false;
    public static autoId = true;
    public static reversePitch = false;
    public static flatButtonDisplay = false;
    public static dockingComputerSpeed = 0;
    public static difficultyLevel = 3;
    private static restoredCommanderCount = 0;
    public static navButtonsVisible = true;
    public static locale = 'en_US';
    public static extensionUpdateMode = UPDATE_MODE_AUTO_UPDATE_OVER_WIFI_ONLY;
    public static maxGalaxies = GalaxyGenerator.GALAXY_COUNT;
    public static continuousTutorialMode = true;
    public static watchedTocEntries: Set<string> = new Set();

    private constructor() {}

    public static load() {
        // L.getInstance().loadLocaleList([]); // TODO: Implement locale loading
        this.resetButtonPosition();

        const settingsStr = localStorage.getItem(this.SETUP_FILE_NAME);
        if (!settingsStr) {
            console.log("No settings found, using defaults.");
            // Apply some defaults from original catch block
            this.dockingComputerSpeed = 0;
            this.continuousTutorialMode = true;
            ColorScheme.setColorScheme(null, null, this.colorScheme);
            return;
        }

        try {
            const s = JSON.parse(settingsStr);

            this.animationsEnabled = s.animationsEnabled ?? this.animationsEnabled;
            this.locale = s.locale ?? this.locale;
            this.debugActive = s.debugActive ?? this.debugActive;
            this.logToFile = s.logToFile ?? this.logToFile;
            this.displayFrameRate = s.displayFrameRate ?? this.displayFrameRate;
            this.displayDockingInformation = s.displayDockingInformation ?? this.displayDockingInformation;
            this.memDebug = s.memDebug ?? this.memDebug;
            this.textureLevel = s.textureLevel ?? this.textureLevel;
            this.colorDepth = s.colorDepth ?? this.colorDepth;
            this.alpha = s.alpha ?? this.alpha;
            this.volumes = s.volumes ?? this.volumes;
            this.controlMode = s.controlMode ?? this.controlMode;
            this.controlPosition = s.controlPosition ?? this.controlPosition;
            this.controlAlpha = s.controlAlpha ?? this.controlAlpha;
            this.introVideoQuality = s.introVideoQuality ?? this.introVideoQuality;
            this.unlimitedFuel = s.unlimitedFuel ?? this.unlimitedFuel;
            this.enterInSafeZone = s.enterInSafeZone ?? this.enterInSafeZone;
            this.disableAttackers = s.disableAttackers ?? this.disableAttackers;
            this.disableTraders = s.disableTraders ?? this.disableTraders;
            this.invulnerable = s.invulnerable ?? this.invulnerable;
            this.laserDoesNotOverheat = s.laserDoesNotOverheat ?? this.laserDoesNotOverheat;
            this.particleDensity = s.particleDensity ?? this.particleDensity;
            this.tapRadarToChangeView = s.tapRadarToChangeView ?? this.tapRadarToChangeView;
            this.laserButtonAutoFire = s.laserButtonAutoFire ?? this.laserButtonAutoFire;
            this.hasBeenPlayedBefore = s.hasBeenPlayedBefore ?? this.hasBeenPlayedBefore;
            this.buttonPosition = s.buttonPosition ?? this.buttonPosition;
            this.engineExhaust = s.engineExhaust ?? this.engineExhaust;
            this.lockScreen = s.lockScreen ?? this.lockScreen;
            this.colorScheme = s.colorScheme ?? this.colorScheme;
            this.targetBox = s.targetBox ?? this.targetBox;
            this.autoId = s.autoId ?? this.autoId;
            this.reversePitch = s.reversePitch ?? this.reversePitch;
            this.flatButtonDisplay = s.flatButtonDisplay ?? this.flatButtonDisplay;
            this.vibrateLevelOnDamage = s.vibrateLevelOnDamage ?? this.vibrateLevelOnDamage;
            this.dockingComputerSpeed = s.dockingComputerSpeed ?? this.dockingComputerSpeed;
            this.difficultyLevel = s.difficultyLevel ?? this.difficultyLevel;
            this.restoredCommanderCount = s.restoredCommanderCount ?? this.restoredCommanderCount;
            this.navButtonsVisible = s.navButtonsVisible ?? this.navButtonsVisible;
            this.extensionUpdateMode = s.extensionUpdateMode ?? this.extensionUpdateMode;
            this.continuousTutorialMode = s.continuousTutorialMode ?? this.continuousTutorialMode;
            this.vibrateLevelOnHit = s.vibrateLevelOnHit ?? this.vibrateLevelOnHit;

            Medal.setGameLevelMedals(s.gameLevelMedals ?? "");
            this.watchedTocEntries = new Set(s.watchedTocEntries ?? []);

        } catch (e) {
            console.error("Error loading settings:", e);
            this.dockingComputerSpeed = 0;
            this.continuousTutorialMode = true;
        }

        ColorScheme.setColorScheme(null, null, this.colorScheme);
    }

    public static save() {
        try {
            const settingsToSave = {
                animationsEnabled: this.animationsEnabled,
                locale: L.getLanguageCountry(L.getInstance().getCurrentLocale()),
                debugActive: this.debugActive,
                logToFile: this.logToFile,
                displayFrameRate: this.displayFrameRate,
                displayDockingInformation: this.displayDockingInformation,
                memDebug: this.memDebug,
                textureLevel: this.textureLevel,
                colorDepth: this.colorDepth,
                alpha: this.alpha,
                volumes: this.volumes,
                controlMode: this.controlMode,
                controlPosition: this.controlPosition,
                controlAlpha: this.controlAlpha,
                introVideoQuality: this.introVideoQuality,
                unlimitedFuel: false, // Not saving debug settings
                enterInSafeZone: false, // Not saving debug settings
                disableAttackers: this.disableAttackers,
                disableTraders: this.disableTraders,
                invulnerable: false, // Not saving debug settings
                laserDoesNotOverheat: false, // Not saving debug settings
                particleDensity: this.particleDensity,
                tapRadarToChangeView: this.tapRadarToChangeView,
                laserButtonAutoFire: this.laserButtonAutoFire,
                hasBeenPlayedBefore: this.hasBeenPlayedBefore,
                buttonPosition: this.buttonPosition,
                engineExhaust: this.engineExhaust,
                lockScreen: this.lockScreen,
                colorScheme: this.colorScheme,
                targetBox: this.targetBox,
                autoId: this.autoId,
                reversePitch: this.reversePitch,
                flatButtonDisplay: this.flatButtonDisplay,
                vibrateLevelOnDamage: this.vibrateLevelOnDamage,
                dockingComputerSpeed: this.dockingComputerSpeed,
                difficultyLevel: this.difficultyLevel,
                restoredCommanderCount: this.restoredCommanderCount,
                navButtonsVisible: this.navButtonsVisible,
                extensionUpdateMode: this.extensionUpdateMode,
                continuousTutorialMode: this.continuousTutorialMode,
                gameLevelMedals: Medal.getGameLevelMedals(),
                watchedTocEntries: Array.from(this.watchedTocEntries),
                vibrateLevelOnHit: this.vibrateLevelOnHit,
            };

            localStorage.setItem(this.SETUP_FILE_NAME, JSON.stringify(settingsToSave));

        } catch (e) {
            console.error("Error saving settings:", e);
        }
    }

    public static resetButtonPosition() {
        for (let i = 0; i < 12; i++) {
            this.buttonPosition[i] = i;
        }
    }
}
