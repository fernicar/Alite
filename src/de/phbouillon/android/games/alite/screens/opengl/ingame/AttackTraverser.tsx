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

import { Alite } from '../../../Alite';
import { Condition } from '../../../model/Condition';
import { SpaceObject } from '../objects/space/SpaceObject';
import { SpaceObjectTraverser } from './SpaceObjectTraverser';
import { ObjectType } from './ObjectType';

export class AttackTraverser implements SpaceObjectTraverser {
    public handle(so: SpaceObject): boolean {
        if (ObjectType.isEnemyShip(so.getType()) || so.getType() === ObjectType.Thargoid ||
            (so.isDrone() && so.hasLivingMother())) {
            Alite.get().getPlayer().setCondition(Condition.RED);
            return true;
        }
        return false;
    }
}
