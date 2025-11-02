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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { Timer } from "../framework/Timer";
import { Repository } from "./Repository";

enum Property {
    available_to_all,
    available_to_NPCs,
    available_to_player,
    condition_script,
    damage_probability,
    display_color,
    fast_affinity_defensive,
    fast_affinity_offensive,
    incompatible_with_equipment,
    installation_time,
    is_external_store,
    portable_between_ships,
    provides,
    repair_time,
    requires_any_equipment,
    requires_cargo_space,
    requires_clean,
    requires_empty_pylon,
    requires_equipment,
    requires_free_passenger_berth,
    requires_full_fuel,
    requires_mounted_pylon,
    requires_not_clean,
    requires_non_full_fuel,
    script,
    script_info,
    strict_mode_only,
    strict_mode_compatible,
    visible,
    weapon_info,
    icon,
    lost_sound,
    name,
    short_name
}

enum WeaponProperty {
    range,
    energy,
    damage,
    recharge_rate,
    shot_temperature,
    color,
    threat_assessment,
    is_mining_laser,
    is_turret_laser,
    crosshairs,
    beam_length
}

export class Equipment {
    private static readonly EQUIPMENT_DEFAULT_ICON = "equipment_icons/default";

    private static readonly legacyEquipmentId = ["EQ_FUEL", "EQ_MISSILE",
        "EQ_CARGO_BAY", "EQ_ECM", "EQ_WEAPON_PULSE_LASER", "EQ_WEAPON_BEAM_LASER", "EQ_FUEL_SCOOPS",
        "EQ_ESCAPE_POD", "EQ_ENERGY_BOMB", "EQ_ENERGY_UNIT", "EQ_DOCK_COMP", "EQ_GAL_DRIVE",
        "EQ_WEAPON_MINING_LASER", "EQ_WEAPON_MILITARY_LASER", "EQ_RETRO_ROCKETS", "EQ_NAVAL_ENERGY_UNIT",
        "EQ_CLOAKING_DEVICE", "EQ_ECM_JAMMER"];

    private readonly id: number;
    private readonly minTechLevel: number;
    private readonly cost: number;
    private readonly repoHandler = new Repository<Property>();
    private timer: Timer;
    private weaponInfo: Repository<WeaponProperty>;

    constructor(equipmentName: string, name: string, minTechLevel: number, cost: number, shortName: string, properties: any) {
        this.id = Equipment.getEquipmentId(equipmentName);
        this.repoHandler.setLocalizedProperty(Property.name, name);
        this.minTechLevel = minTechLevel;
        this.cost = cost;
        this.repoHandler.setLocalizedProperty(Property.short_name, shortName);
        this.repoHandler.setProperty(Property.icon, Equipment.EQUIPMENT_DEFAULT_ICON);
        if (equipmentName.startsWith("EQ_WEAPON_")) {
            this.timer = new Timer().setAutoResetWithImmediateAtFirstCall();
            this.weaponInfo = new Repository<WeaponProperty>();
            this.weaponInfo.setProperty(WeaponProperty.range, 12500);
            this.weaponInfo.setProperty(WeaponProperty.energy, 0.8);
            this.weaponInfo.setProperty(WeaponProperty.damage, 15.0);
            this.weaponInfo.setProperty(WeaponProperty.shot_temperature, 7.0);
        }
        this.readProperties(properties);
    }

    private readProperties(properties: any): void {
        for (const key in properties) {
            if (key === "weapon_info") {
                if (!this.weaponInfo) {
                    throw new Error(`Invalid property '${key}' for equipment.`);
                }
                for (const wKey in properties[key]) {
                    this.weaponInfo.setProperty(WeaponProperty[wKey as keyof typeof WeaponProperty], properties[key][wKey]);
                }
            } else {
                this.repoHandler.setProperty(Property[key as keyof typeof Property], properties[key]);
            }
        }
    }

    public static getEquipmentId(equipmentName: string): number {
        const index = this.legacyEquipmentId.indexOf(equipmentName);
        // A simple hash function for strings
        const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        return index < 0 && equipmentName.length > 0 ? -hashCode(equipmentName) : index;
    }

    // ... (rest of the methods)
}
