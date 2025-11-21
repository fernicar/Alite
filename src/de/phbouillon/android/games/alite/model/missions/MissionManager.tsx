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

import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Mission } from "./Mission";

export class MissionManager {
    public static readonly DIRECTORY_SOUND_MISSION = Assets.DIRECTORY_SOUND + "mission/";

    private static readonly instance = new MissionManager();

    private readonly missions: Map<number, Mission> = new Map();

    public static getInstance(): MissionManager {
        return MissionManager.instance;
    }

    private constructor() {
    }

    public register(m: Mission): void {
        this.missions.set(m.getId(), m);
    }

    public get(id: number): Mission {
        return this.missions.get(id);
    }

    public clear(): void {
        this.missions.clear();
    }

    public getMissions(): IterableIterator<Mission> {
        return this.missions.values();
    }

    public getActiveMissions(): Mission[] {
        const activeMissions: Mission[] = [];
        for (const m of this.missions.values()) {
            if (m.isActive()) {
                activeMissions.push(m);
            }
        }
        return activeMissions;
    }

    public getCompletedMissionCount(): number {
        let count = 0;
        for (const m of this.missions.values()) {
            if (m.isCompleted()) {
                count++;
            }
        }
        return count;
    }

    public clearActiveMissions(): void {
        for (const m of this.missions.values()) {
            m.active = false;
        }
    }

    public toJson(): any[] {
        const missionsArray: any[] = [];
        for (const m of this.missions.values()) {
            const missionJson = m.toJson({ id: m.getId() });
            missionsArray.push(missionJson);
        }
        return missionsArray;
    }

    public fromJson(missions: any[]): void {
        for (let i = 0; i < missions.length; i++) {
            const prop = missions[i];
            const missionId = prop.id;
            const m = this.missions.get(missionId);
            if (m != null) {
                m.fromJson(prop);
            } else {
                AliteLog.e("[ALITE] loadCommander", `Invalid mission skipped, id: ${missionId}`);
            }
        }
    }
}
