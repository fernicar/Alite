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

import { Settings } from "../../../../Settings";
import { SpaceObjectTraverser } from "../../ingame/SpaceObjectTraverser";
import { InGameManager } from "../../ingame/InGameManager";
import { ObjectType } from "../../ingame/ObjectType";
import { SpaceObject } from "../../objects/space/SpaceObject";
import { AliteHud } from "../AliteHud";

export class TorusBlockingTraverser implements SpaceObjectTraverser {
    private static readonly serialVersionUID = -5185606119234486770;
    private readonly inGame: InGameManager;

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
    }

    public handle(so: SpaceObject): boolean {
        const type = so.getType();
        return (ObjectType.isEnemyShip(type) || type === ObjectType.Missile || ObjectType.isSpaceStation(type) ||
            type === ObjectType.Shuttle && !Settings.freePath ||
            type === ObjectType.Thargoid || type === ObjectType.Thargon ||
            type === ObjectType.Trader && !Settings.freePath || type === ObjectType.Police || type === ObjectType.Defender) &&
            so.getPosition().distanceSq(this.inGame.getShip().getPosition()) <= AliteHud.MAX_DISTANCE_SQ;
    }
}
