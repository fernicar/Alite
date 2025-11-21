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

import { IMethodHook } from "../../../../../../../../framework/IMethodHook";
import { Assets } from "../../../../Assets";
import { SoundManager } from "../../../../SoundManager";
import { StringUtil } from "../../../../model/generator/StringUtil";
import { InGameManager } from "./InGameManager";
import { TimedEvent } from "./TimedEvent";

export class HyperspaceTimer extends TimedEvent {
    private static readonly serialVersionUID = -855725511472476223L;

    private countDown: number;
    private readonly galacticNumber: number;

    constructor(inGame: InGameManager, galacticNumber: number) {
        super(1000000000);
        this.galacticNumber = galacticNumber;
        this.countDown = galacticNumber === 0 ? 10 : 30;
        inGame.getMessage().setText(StringUtil.format("%d", this.countDown));
        this.addAlarmEvent({
            execute: (deltaTime: number) => {
                this.countDown--;
                SoundManager.play(Assets.click);
                if (this.countDown === 0) {
                    SoundManager.stopAll();
                    if (inGame.getHyperspaceHook() != null) {
                        inGame.getHyperspaceHook().execute(0);
                    } else {
                        inGame.performHyperspaceJump(galacticNumber);
                    }
                }
                inGame.getMessage().setText(StringUtil.format("%d", this.countDown));
            }
        });
    }

    public isIntergalactic(): boolean {
        return this.galacticNumber !== 0;
    }
}
