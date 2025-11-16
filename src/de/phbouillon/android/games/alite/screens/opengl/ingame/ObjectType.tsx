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

export enum ObjectType {
    Trader,
    Pirate,
    Thargoid,
    Thargon,
    Police,
    Shuttle,
    Asteroid,
    Coriolis, // station
    Dodecahedron, // station
    Icosahedron, // station
    Missile,
    EscapeCapsule,
    CargoPod,
    Buoy,
    Alloy,
    Constrictor,
    Cougar,
    TieFighter,
    Defender
}

export namespace ObjectType {
    export function isSpaceStation(type: ObjectType): boolean {
        return type === ObjectType.Coriolis || type === ObjectType.Dodecahedron || type === ObjectType.Icosahedron;
    }

    export function isEnemyShip(type: ObjectType): boolean {
        return type === ObjectType.Pirate || type === ObjectType.Constrictor || type === ObjectType.Cougar || type === ObjectType.TieFighter;
    }
}
