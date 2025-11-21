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

import { Timer } from "../../../../../framework/Timer";
import { IMethodHook } from "../../../../../framework/IMethodHook";
import { GraphicObject } from "../../../../../framework/impl/gl/GraphicObject";
import { Vector3f } from "../../../../../framework/math/Vector3f";
import { InGameManager } from "../../ingame/InGameManager";
import { ObjectType } from "../../ingame/ObjectType";
import { SpaceObject } from "../../objects/space/SpaceObject";
import { SpaceObjectFactory } from "../../objects/space/SpaceObjectFactory";

enum EscapeCapsuleState {
    SPAWN,
    MOVE,
    QUIT
}

export class EscapeCapsuleUpdater implements IMethodHook {
    private static readonly serialVersionUID = -296076467539527770;

    private readonly inGame: InGameManager;
    private readonly timer = new Timer();
    private state: EscapeCapsuleState = EscapeCapsuleState.SPAWN;
    private cobra: SpaceObject = null;
    private esc: SpaceObject = null;
    private readonly vec1 = new Vector3f(0, 0, 0);
    private readonly vec2 = new Vector3f(0, 0, 0);

    constructor(inGame: InGameManager) {
        this.inGame = inGame;
    }

    public execute(deltaTime: number): void {
        switch (this.state) {
            case EscapeCapsuleState.SPAWN:
                this.spawnShip();
                this.spawnEscapeCapsule();
                break;
            case EscapeCapsuleState.MOVE:
                this.moveShip();
                this.moveEscapeCapsule(deltaTime);
                break;
            case EscapeCapsuleState.QUIT:
                this.endSequence();
                break;
        }
    }

    private spawnShip(): void {
        const ship = this.inGame.getShip();
        ship.computeMatrix();
        this.cobra = SpaceObjectFactory.getInstance().getObjectById("cobra_mk_iii");
        this.cobra.setUpVector(ship.getUpVector());
        this.cobra.setRightVector(ship.getRightVector());
        this.cobra.setForwardVector(ship.getForwardVector());
        this.cobra.applyDeltaRotation(15, 15, -25);
        ship.getPosition().copy(this.vec1);
        ship.getForwardVector().copy(this.vec2);
        this.vec2.scale(-800);
        this.vec1.add(this.vec2);
        ship.getUpVector().copy(this.vec2);
        this.vec2.scale(-50);
        this.vec1.add(this.vec2);
        this.cobra.setPosition(this.vec1);
        this.cobra.setSpeed(-this.cobra.getMaxSpeed());
        ship.setSpeed(0);
        this.state = EscapeCapsuleState.MOVE;
        this.inGame.addObject(this.cobra);
    }

    private spawnEscapeCapsule(): void {
        this.esc = SpaceObjectFactory.getInstance().getRandomObjectByType(ObjectType.EscapeCapsule);
        this.cobra.getForwardVector().copy(this.vec1);
        this.vec1.negate();
        this.esc.setForwardVector(this.vec1);

        this.esc.setRightVector(this.cobra.getRightVector());
        this.cobra.getUpVector().copy(this.vec1);
        this.vec1.negate();
        this.esc.setUpVector(this.vec1);
        this.cobra.getPosition().copy(this.vec1);
        this.esc.setPosition(this.vec1);
        this.esc.setSpeed(-this.esc.getMaxSpeed());
        this.inGame.addObject(this.esc);
    }

    private moveShip(): void {
        if (this.timer.hasPassedSeconds(4)) {
            this.state = EscapeCapsuleState.QUIT;
        }
        // Nothing else to be done here; InGameRender advances the cobra...
    }

    private moveEscapeCapsule(deltaTime: number): void {
        this.esc.moveForward(deltaTime);
    }

    private endSequence(): void {
        this.inGame.terminateToStatusScreen();
    }
}
