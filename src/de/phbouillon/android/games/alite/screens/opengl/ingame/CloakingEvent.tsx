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

import { IMethodHook } from '../../../../framework/IMethodHook';
import { L } from '../../../L';
import { R } from '../../../../../gen/de/phbouillon/android/games/alite/R';
import { InGameManager } from './InGameManager';
import { TimedEvent } from './TimedEvent';

class CloakingEvent extends TimedEvent {
    constructor(inGame: InGameManager) {
        super(359281437);
        inGame.getMessage().repeatText(L.string(R.string.msg_cloaking_active), 3);
        this.addAlarmEvent(new (class implements IMethodHook {
            public execute(deltaTime: number): void {
                inGame.reduceShipEnergy(1);
            }
        }));
    }
}
