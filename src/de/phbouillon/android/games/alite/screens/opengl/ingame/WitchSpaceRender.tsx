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

import { IMethodHook } from "../../../../../framework/IMethodHook";
import { Alite } from "../../../Alite";
import { Assets } from "../../../Assets";
import { L } from "../../../L";
import { SoundManager } from "../../../SoundManager";
import { Rating } from "../../../model/Rating";
import { InGameManager } from "./InGameManager";
import { TimedEvent } from "./TimedEvent";

export class WitchSpaceRender {
    private static readonly serialVersionUID = -1502376043768839904;

    private readonly inGame: InGameManager;
    private witchSpaceKillCounter = 0;
    private driveRepairedMessage: TimedEvent = null;
    private hyperdriveMalfunction = false;

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
    }

    increaseWitchSpaceKillCounter(): void {
        this.witchSpaceKillCounter++;
        const playerRating = Alite.getInstance().getPlayer().getRating();
        if (this.driveRepairedMessage != null || !this.hyperdriveMalfunction ||
            this.witchSpaceKillCounter < Math.min(8, playerRating + 1)) {
            return;
        }
        this.driveRepairedMessage = new TimedEvent((Math.random() * 5 + 3) * 1_000_000_000);
        this.inGame.addTimedEvent(this.driveRepairedMessage.addAlarmEvent({
            execute: (deltaTime: number) => {
                this.hyperdriveMalfunction = false;
                this.inGame.getMessage().repeatText(L.string("com_hyperdrive_repaired"), 1, 4, 1);
                SoundManager.play(Assets.com_hyperdriveRepaired);
                this.driveRepairedMessage.remove();
            }
        }));
    }

    isHyperdriveMalfunction(): boolean {
        return this.hyperdriveMalfunction;
    }

    public getWitchSpaceKillCounter(): number {
        return this.witchSpaceKillCounter;
    }

    enterWitchSpace(): void {
        this.witchSpaceKillCounter = 0;
        Alite.getInstance().getPlayer().setHyperspaceSystem(null);
        this.hyperdriveMalfunction = true;
        if (this.inGame.getHud() != null) {
            this.inGame.getHud().setWitchSpace();
        }
        this.inGame.getMessage().repeatText(L.string("com_hyperdrive_malfunction"), 1, 4, 1);
        SoundManager.play(Assets.com_hyperdriveMalfunction);
        const playerRating = Alite.getInstance().getPlayer().getRating();
        let attackers = Math.floor(Math.random() * (playerRating - Rating.AVERAGE));
        if (attackers < 1) {
            attackers = 1;
        } else if (attackers > 4) {
            attackers = 4;
        }
        for (let i = 0; i < attackers; i++) {
            this.inGame.getSpawnManager().spawnThargoidInWitchSpace();
        }
    }
}
