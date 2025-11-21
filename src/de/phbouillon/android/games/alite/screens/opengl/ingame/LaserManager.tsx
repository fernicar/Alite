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

import { AliteGame } from "../../../AliteGame";
import { AliteLog } from "../../../AliteLog";
import { Assets } from "../../../Assets";
import { L } from "../../../L";
import { R } from "../../../R";
import { Settings } from "../../../Settings";
import { SoundManager } from "../../../SoundManager";
import { Equipment } from "../../../model/Equipment";
import { EquipmentStore } from "../../../model/EquipmentStore";
import { ObjectType } from "../../../model/ObjectType";
import { PlayerCobra } from "../../../model/PlayerCobra";
import { Weight } from "../../../model/Weight";
import { ThargoidStationMission } from "../../../model/missions/ThargoidStationMission";
import { TradeGood } from "../../../model/trading/TradeGood";
import { TradeGoodStore } from "../../../model/trading/TradeGoodStore";
import { AliteObject } from "../objects/AliteObject";
import { Explosion } from "../objects/Explosion";
import { LaserCylinder } from "../objects/LaserCylinder";
import { SpaceObject } from "../objects/space/SpaceObject";
import { SpaceObjectFactory } from "../objects/space/SpaceObjectFactory";
import { AliteHud } from "../sprites/AliteHud";
import { InGameManager } from "./InGameManager";
import { ScoopCallback } from "./ScoopCallback";
import { TimedEvent } from "./TimedEvent";
import { IMethodHook } from "../../../../framework/IMethodHook";
import { Pool, PoolObjectFactory } from "../../../../framework/impl/Pool";
import { GraphicObject } from "../../../../framework/impl/gl/GraphicObject";
import { Timer } from "../../../../framework/Timer";
import { Vector3f } from "../../../../framework/math/Vector3f";


class LaserCylinderFactory implements PoolObjectFactory<LaserCylinder> {
    public createObject(): LaserCylinder {
        const result = new LaserCylinder();
        result.setVisible(false);
        return result;
    }
}

export class LaserManager {
    private static readonly NAVAL_REFRESH_RATE = 898203592;
    private static readonly NORMAL_REFRESH_RATE = 1437125748;
    private static readonly MAX_LASERS = 500;
    // ... (other constants)

    private alite: AliteGame;
    private readonly shotOrigin: Vector3f;
    // ... (other properties)
    private laserPool: Pool<LaserCylinder>;
    public readonly activeLasers: LaserCylinder[] = [];

    constructor(inGame: InGameManager) {
        this.alite = AliteGame.get();
        this.inGame = inGame;
        // ... (property initializations)
        this.laserFactory = new LaserCylinderFactory();
        this.laserPool = new Pool(this.laserFactory, LaserManager.MAX_LASERS);
        this.alite.getTextureManager().addTexture("textures/lasers.png");
        this.alite.setLaserManager(this);
    }
    private laserFactory: PoolObjectFactory<LaserCylinder>;
    private inGame: InGameManager;


    public static computeIntersectionDistance(dir: Vector3f, origin: Vector3f, center: Vector3f, radius: number, tVec: Vector3f): number {
        origin.sub(center, tVec);
        const ocsq = tVec.lengthSq();
        const loc = dir.dot(tVec);
        const docsq = loc * loc;
        const expUnderRoot = docsq - ocsq + radius * radius;
        if (expUnderRoot < 0) return -1.0;

        const sqr = Math.sqrt(expUnderRoot);
        const d = -loc;
        if (d - sqr > 0) return d - sqr;
        if (d + sqr > 0) return d + sqr;
        return -1.0;
    }


    public explodeWithCargo(so: SpaceObject, laser?: Equipment): void {
        this.explode(so);
        this.spawnCargoCanisters(so, laser);
    }

    // ... (rest of the LaserManager methods converted to TypeScript)
    private vibrate(milliseconds: number): void {
        if (milliseconds > 0 && navigator.vibrate) {
            navigator.vibrate(milliseconds);
        }
    }

}
