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
import { GraphicObject } from "../../../../../framework/impl/gl/GraphicObject";
import { Vector3f } from "../../../../../framework/math/Vector3f";
import { L } from "../../../L";
import { SpaceObject } from "../objects/space/SpaceObject";
import { SpaceObjectFactory } from "../objects/space/SpaceObjectFactory";
import { InGameManager } from "./InGameManager";

enum GameOverState {
    SPAWN,
    MOVE,
    EXPLODE,
    QUIT
}

export class GameOverUpdater {
    private static readonly serialVersionUID = 5497403578670138689;

    private readonly inGame: InGameManager;
    private readonly ship: GraphicObject;
    private readonly startTime = new Timer();
    private state: GameOverState = GameOverState.SPAWN;
    private cobra: SpaceObject = null;
    private needsDestruction = true;
    private readonly vec1 = new Vector3f(0, 0, 0);
    private readonly vec2 = new Vector3f(0, 0, 0);

    constructor(inGame: InGameManager, ship: GraphicObject) {
        this.inGame = inGame;
        this.ship = ship;
    }

    public execute(deltaTime: number): void {
        switch (this.state) {
            case GameOverState.SPAWN: this.spawnShip(); break;
            case GameOverState.MOVE: this.moveShip(); break;
            case GameOverState.EXPLODE: this.destroyShip(); break;
            case GameOverState.QUIT: this.endSequence(); break;
        }
    }

    private spawnShip(): void {
        this.ship.computeMatrix();
        this.cobra = SpaceObjectFactory.getInstance().getObjectById("cobra_mk_iii");
        this.cobra.setIdentified();
        this.cobra.setUpVector(this.ship.getUpVector());
        this.cobra.setRightVector(this.ship.getRightVector());
        this.cobra.setForwardVector(this.ship.getForwardVector());
        this.cobra.applyDeltaRotation(15, 15, -15);
        this.ship.getPosition().copy(this.vec1);
        this.ship.getForwardVector().copy(this.vec2);
        this.vec2.scale(-200);
        this.vec1.add(this.vec2);
        this.ship.getUpVector().copy(this.vec2);
        this.vec2.scale(-50);
        this.vec1.add(this.vec2);
        this.cobra.setPosition(this.vec1);
        this.cobra.setSpeed(-this.cobra.getMaxSpeed());
        this.ship.setSpeed(0);
        this.state = GameOverState.MOVE;
        this.inGame.addObject(this.cobra);
        this.inGame.getMessage().setScaledTextForDuration(L.string("msg_game_over"), 14, 4.0);
    }

    private moveShip(): void {
        if (this.startTime.hasPassedSeconds(2)) {
            this.state = GameOverState.EXPLODE;
        }
        // Nothing else to be done here; InGameManager advances the cobra...
    }

    private destroyShip(): void {
        if (this.needsDestruction) {
            this.cobra.setHullStrength(0);
            this.inGame.getLaserManager().explodeWithCargo(this.cobra);
            this.needsDestruction = false;
        }
        if (this.startTime.hasPassedSeconds(10)) {
            this.state = GameOverState.QUIT;
        }
    }

    private endSequence(): void {
        this.inGame.terminateToTitleScreen();
    }
}
