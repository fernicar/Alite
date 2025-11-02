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

import { Assets } from "../../Assets";
import { Mission } from "./Mission";

export class MissionManager {
    public static readonly DIRECTORY_SOUND_MISSION = Assets.DIRECTORY_SOUND + "mission/";

    private static readonly instance = new MissionManager();

    private readonly missions: Map<number, Mission> = new Map();

    private constructor() {
    }

    public static getInstance(): MissionManager {
        return this.instance;
    }

    public register(m: Mission): void {
        this.missions.set(m.getId(), m);
    }

    public get(id: number): Mission | undefined {
        return this.missions.get(id);
    }

    public clear(): void {
        this.missions.clear();
    }

    public getMissions(): IterableIterator<Mission> {
        return this.missions.values();
    }

    public getActiveMissions(): Mission[] {
        return Array.from(this.missions.values()).filter(m => m.isActive());
    }

    public getCompletedMissionCount(): number {
        return Array.from(this.missions.values()).filter(m => m.isCompleted()).length;
    }

    public clearActiveMissions(): void {
        for (const m of this.missions.values()) {
            m.active = false;
        }
    }

    public toJson(): any[] {
        return Array.from(this.missions.values()).map(m => m.toJson());
    }

    public fromJson(missions: any[]): void {
        for (const prop of missions) {
            const missionId = prop.id;
            const m = this.missions.get(missionId);
            if (m) {
                m.fromJson(prop);
            } else {
                console.error("[ALITE] loadCommander", "Invalid mission skipped, id: " + missionId);
            }
        }
    }
}
