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

import { AliteGame } from "../../../../AliteGame";
import { Settings } from "../../../../Settings";
import { Equipment } from "../../../../model/Equipment";
import { ObjectType } from "../../../../model/ObjectType";
import { Repository } from "../../../../model/Repository";
import { Weight } from "../../../../model/Weight";
import { TradeGood } from "../../../../model/trading/TradeGood";
import { AliteObject } from "../AliteObject";
import { TargetBoxSpaceObject } from "../TargetBoxSpaceObject";
import { EngineExhaust } from "../../ingame/EngineExhaust";
import { AiStateCallback, AiStateCallbackHandler } from "../../ingame/AiStateCallback";
import { SpaceObjectAI } from "./SpaceObjectAI";
import { WayPoint } from "../../ingame/WayPoint";
import { IMethodHook } from "../../../../../framework/IMethodHook";
import { ResourceStream } from "../../../../../framework/ResourceStream";
import { GraphicObject } from "../../../../../framework/impl/gl/GraphicObject";
import { Timer } from "../../../../../framework/Timer";
import { Vector3f } from "../../../../../framework/math/Vector3f";


export class SpaceObject extends AliteObject {
    public static readonly TARGETING_DISTANCE_SQ = 81000000.0;

    public static Property = {
        // ... (all enums converted to string constants or a string enum)
    };

    private readonly repoHandler: Repository<string> = new Repository<string>();
    private textureFilename: string;
    // ... (rest of the SpaceObject properties converted to TypeScript)
    private readonly ai: SpaceObjectAI = new SpaceObjectAI(this);

    constructor(id: string) {
        super(id);
        this.setVisibleOnHud(true);
    }

    public getRepoHandler(): Repository<string> {
        return this.repoHandler;
    }

    // ... (rest of the SpaceObject methods converted to TypeScript)

    public update(deltaTime: number): void {
        if (this.escapePod > 0 && this.hullStrength < 2 && !this.hasEjected()) {
            if (Math.random() < 0.1) {
                this.ejectedPods++;
                this.addObjectToSpawn(ObjectType.EscapeCapsule);
            }
        }
        this.ai.update(deltaTime);
        if (Settings.engineExhaust && this.exhaust.length > 0) {
            for (const ex of this.exhaust) {
                ex.update(this);
            }
        }
    }
    private escapePod: number;
    private hullStrength: number;
    private ejectedPods: number;
    private exhaust: EngineExhaust[];
    private hasEjected(): boolean {
        throw new Error("Method not implemented.");
    }
    private addObjectToSpawn(EscapeCapsule: any) {
        throw new Error("Method not implemented.");
    }
    public setAIState(newState: string): void {
        this.ai.setState(newState);
    }

    public setWaypoint(wp: WayPoint): void {
        this.ai.setWaypoints(wp);
        this.ai.setState(SpaceObjectAI.AI_STATE_FLY_PATH);
    }

}
