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

import { Equipment } from "./Equipment";

export class EquipmentStore {
    public static readonly FUEL = "EQ_FUEL";
    public static readonly MISSILES = "EQ_MISSILE";
    public static readonly LARGE_CARGO_BAY = "EQ_CARGO_BAY";
    public static readonly ECM_SYSTEM = "EQ_ECM";
    public static readonly PULSE_LASER = "EQ_WEAPON_PULSE_LASER";
    public static readonly BEAM_LASER = "EQ_WEAPON_BEAM_LASER";
    public static readonly FUEL_SCOOP = "EQ_FUEL_SCOOPS";
    public static readonly ESCAPE_CAPSULE = "EQ_ESCAPE_POD";
    public static readonly ENERGY_BOMB = "EQ_ENERGY_BOMB";
    public static readonly EXTRA_ENERGY_UNIT = "EQ_ENERGY_UNIT";
    public static readonly DOCKING_COMPUTER = "EQ_DOCK_COMP";
    public static readonly GALACTIC_HYPERDRIVE = "EQ_GAL_DRIVE";
    public static readonly MINING_LASER = "EQ_WEAPON_MINING_LASER";
    public static readonly MILITARY_LASER = "EQ_WEAPON_MILITARY_LASER";
    public static readonly RETRO_ROCKETS = "EQ_RETRO_ROCKETS";
    public static readonly NAVAL_ENERGY_UNIT = "EQ_NAVAL_ENERGY_UNIT";
    public static readonly CLOAKING_DEVICE = "EQ_CLOAKING_DEVICE";
    public static readonly ECM_JAMMER = "EQ_ECM_JAMMER";

    private static instance: EquipmentStore;
    private readonly equipments: Equipment[] = [];

    public static get(): EquipmentStore {
        if (!EquipmentStore.instance) {
            EquipmentStore.instance = new EquipmentStore();
        }
        return EquipmentStore.instance;
    }

    private constructor() {
    }

    public addEquipment(equipment: Equipment): void {
        if (!this.equipments.includes(equipment)) {
            this.equipments.push(equipment);
        }
    }

    public getEquipmentById(name: string): Equipment {
        return this.getEquipmentByHash(Equipment.getEquipmentId(name));
    }

    public getEquipmentByHash(id: number): Equipment {
        for (const equipment of this.equipments) {
            if (equipment.getId() === id) {
                return equipment;
            }
        }
        return null;
    }

    public getIterator(): IterableIterator<Equipment> {
        return this.equipments.values();
    }

    public getEquipmentCount(): number {
        return this.equipments.filter(equipment => equipment.allowToFit()).length;
    }
}
