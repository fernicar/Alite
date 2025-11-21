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

import { Alite } from "../../../../Alite";
import { Assets } from "../../../../Assets";
import { SoundManager } from "../../../../SoundManager";
import { EquipmentStore } from "../../../../model/EquipmentStore";
import { ObjectType } from "../../ingame/ObjectType";
import { SpaceObjectTraverser } from "../../ingame/SpaceObjectTraverser";
import { InGameManager } from "../../ingame/InGameManager";
import { SpaceObject } from "../../objects/space/SpaceObject";

export class ECMTraverser implements SpaceObjectTraverser {
    private static readonly serialVersionUID = 2946553436076856776;
    private readonly inGame: InGameManager;
    private missileDestroyed = false;

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
    }

    public reset(): void {
        this.missileDestroyed = false;
    }

    public handle(so: SpaceObject): boolean {
        if (so.getType() === ObjectType.Missile && !so.mustBeRemoved() && so.getTarget() === this.inGame.getShip()) {
            if (!this.missileDestroyed) {
                SoundManager.play(Assets.ecm);
                if (this.inGame.getHud() != null) {
                    this.inGame.getHud().showECM();
                }
                this.missileDestroyed = true;
            }
            so.setHullStrength(0);
            this.inGame.getLaserManager().explode(so);
            Alite.getInstance().getPlayer().increaseKillCount(so, EquipmentStore.ECM_SYSTEM, false);
            this.inGame.reduceShipEnergy(3);
        }
        return false;
    }
}
