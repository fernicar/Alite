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

import { EquipmentStore } from "../../../../../model/EquipmentStore";
import { InGameManager } from "../../ingame/InGameManager";
import { SpaceObjectTraverser } from "../../ingame/SpaceObjectTraverser";
import { SpaceObject } from "../../objects/space/SpaceObject";

export class EnergyBombTraverser implements SpaceObjectTraverser {
    private static readonly serialVersionUID = -9064469382296503087;
    private readonly inGame: InGameManager;

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
    }

    public handle(so: SpaceObject): boolean {
        if (so.isAffectedByEnergyBomb()) {
            so.setHullStrength(0);
            so.executeHit(this.inGame.getShip());
            this.inGame.getLaserManager().explode(so);
            this.inGame.computeScore(so, EquipmentStore.ENERGY_BOMB);
        }
        return false;
    }
}
