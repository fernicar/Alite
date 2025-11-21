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

import { Music } from "../../../framework/Music";
import { Sound } from "../../../framework/Sound";
import { AliteLog } from "../AliteLog";
import { Assets } from "../Assets";
import { Settings } from "../Settings";

export class SoundManager {
    public static play(sound: Sound): void {
        if (sound == null) {
            AliteLog.w("Sound not yet loaded.", "Can't play sound, because it wasn't loaded yet.");
            return;
        }
        sound.play(Settings.volumes[sound.getType()]);
    }

    public static playOnce(sound: Sound, delayInMs: number): void {
        if (sound == null) {
            AliteLog.w("Sound not yet loaded.", "Can't play sound, because it wasn't loaded yet.");
            return;
        }
        sound.playOnce(Settings.volumes[sound.getType()], delayInMs);
    }

    public static isPlaying(sound: Sound): boolean {
        if (sound == null) {
            AliteLog.w("Sound not yet loaded.", "Can't play sound, because it wasn't loaded yet.");
            return false;
        }
        return sound.isPlaying();
    }

    public static repeat(sound: Sound): void {
        if (sound == null) {
            AliteLog.w("Sound not yet loaded.", "Can't play sound, because it wasn't loaded yet.");
            return;
        }
        sound.repeat(Settings.volumes[sound.getType()]);
    }

    public static stop(sound: Sound): void {
        if (sound == null) {
            AliteLog.w("Sound not yet loaded.", "Can't play sound, because it wasn't loaded yet.");
            return;
        }
        sound.stop();
    }

    private static stopInternal(asset: Sound | Music): void {
        if (asset != null) {
            asset.stop();
        }
    }

    public static stopAll(): void {
        this.stopInternal(Assets.alert);
        this.stopInternal(Assets.click);
        this.stopInternal(Assets.danube);
        if (Assets.danube != null) {
            Assets.danube.dispose();
            Assets.danube = null;
        }
        this.stopInternal(Assets.enemyFireLaser);
        this.stopInternal(Assets.energyLow);
        this.stopInternal(Assets.criticalCondition);
        this.stopInternal(Assets.temperatureHigh);
        this.stopInternal(Assets.altitudeLow);
        this.stopInternal(Assets.error);
        this.stopInternal(Assets.fireLaser);
        this.stopInternal(Assets.torus);
        this.stopInternal(Assets.fireMissile);
        this.stopInternal(Assets.hullDamage);
        this.stopInternal(Assets.kaChing);
        this.stopInternal(Assets.laserHit);
        this.stopInternal(Assets.missileLocked);
        this.stopInternal(Assets.scooped);
        this.stopInternal(Assets.ecm);
        this.stopInternal(Assets.identify);
        this.stopInternal(Assets.retroRocketsOrEscapeCapsuleFired);
        this.stopInternal(Assets.hyperspace);
        this.stopInternal(Assets.shipDestroyed);
    }
}
