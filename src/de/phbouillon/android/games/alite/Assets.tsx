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

import { Music } from "../framework/Music";
import { Pixmap } from "../framework/Pixmap";
import { Sound } from "../framework/Sound";
import { GLText } from "../framework/impl/gl/font/GLText";
import { Alite } from "./Alite";

export class Assets {
    public static readonly DIRECTORY_SOUND = "sound/";
    private static readonly DIRECTORY_SOUND_COMPUTER = Assets.DIRECTORY_SOUND + "computer/";

    public static launchIcon: Pixmap;
    public static statusIcon: Pixmap;
    public static buyIcon: Pixmap;
    public static inventoryIcon: Pixmap;
    public static equipIcon: Pixmap;
    public static galaxyIcon: Pixmap;
    public static localIcon: Pixmap;
    public static planetIcon: Pixmap;
    public static diskIcon: Pixmap;
    public static achievementsIcon: Pixmap;
    public static optionsIcon: Pixmap;
    public static academyIcon: Pixmap;
    public static libraryIcon: Pixmap;
    public static hackerIcon: Pixmap;
    public static quitIcon: Pixmap;
    public static aliteLogoSmall: Pixmap;

    public static yesIcon: Pixmap;
    public static noIcon: Pixmap;

    public static regularFont: GLText;
    public static boldFont: GLText;
    public static italicFont: GLText;
    public static boldItalicFont: GLText;
    public static titleFont: GLText;
    public static smallFont: GLText;

    public static com_aftShieldHasFailed: Sound;
    public static com_frontShieldHasFailed: Sound;
    public static com_conditionRed: Sound;
    public static com_dockingComputerEngaged: Sound;
    public static com_dockingComputerDisengaged: Sound;
    public static com_hyperdriveMalfunction: Sound;
    public static com_hyperdriveRepaired: Sound;
    public static com_incomingMissile: Sound;
    public static com_laserTemperatureCritical: Sound;
    public static com_cabinTemperatureCritical: Sound;
    public static com_targetDestroyed: Sound;
    public static com_fuelSystemMalfunction: Sound;
    public static com_accessDeclined: Sound;
    public static com_escapeMalfunction: Sound;
    public static com_lostCargo: Sound;
    public static com_launch_area_violation_1st: Sound;
    public static com_launch_area_violation_2nd: Sound;
    public static com_launch_area_violation_3rd: Sound;

    public static click: Sound;
    public static error: Sound;
    public static alert: Sound;
    public static kaChing: Sound;
    public static fireLaser: Sound;
    public static laserHit: Sound;
    public static enemyFireLaser: Sound;
    public static hullDamage: Sound;
    public static shipDestroyed: Sound;
    public static scooped: Sound;
    public static fireMissile: Sound;
    public static missileLocked: Sound;
    public static torus: Sound;
    public static energyLow: Sound;
    public static altitudeLow: Sound;
    public static temperatureHigh: Sound;
    public static criticalCondition: Sound;
    public static ecm: Sound;
    public static retroRocketsOrEscapeCapsuleFired: Sound;
    public static identify: Sound;
    public static hyperspace: Sound;

    public static danube: Music;

    private static lostEquipmentSound: Map<string, Sound> = new Map();

    public static getLostEquipmentSound(equipmentName: string): Sound {
        return Assets.lostEquipmentSound.get(equipmentName);
    }

    public static setLostEquipmentSound(equipmentName: string): void {
        Assets.lostEquipmentSound.set(equipmentName, Assets.safeLoadSound(equipmentName));
    }

    public static safeLoadSound(soundFileName: string): Sound {
        return Alite.getInstance().getAudio().newSoundAsset(Assets.DIRECTORY_SOUND_COMPUTER + soundFileName + ".ogg");
    }
}
