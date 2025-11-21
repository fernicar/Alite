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
import { AliteLog } from "../../../../AliteLog";
import { Assets } from "../../../../Assets";
import { L } from "../../../../L";
import { R } from "../../../../R";
import { Settings } from "../../../../Settings";
import { SoundManager } from "../../../../SoundManager";
import { AliteColor } from "../../../../colors/AliteColor";
import { Condition } from "../../../../model/Condition";
import { EquipmentStore } from "../../../../model/EquipmentStore";
import { LegalStatus } from "../../../../model/LegalStatus";
import { PlayerCobra } from "../../../../model/PlayerCobra";
import { Rating } from "../../../../model/Rating";
import { GalaxyGenerator } from "../../../../model/generator/GalaxyGenerator";
import { SystemData } from "../../../../model/generator/SystemData";
import { QuantityPadScreen } from "../../../canvas/QuantityPadScreen";
import { StatusScreen } from "../../../canvas/StatusScreen";
import { ECMTraverser, EnergyBombTraverser, TorusBlockingTraverser } from "../ingame/Traversers";
import { InGameManager } from "../ingame/InGameManager";
import { SpaceObject } from "../../objects/space/SpaceObject";
import { ButtonData } from "./ButtonData";
import { ButtonGroup } from "./ButtonGroup";
import { Sprite } from "../../../../../framework/impl/gl/Sprite";
import { Timer } from "../../../../../framework/Timer";
import { TouchEvent } from "../../../../../framework/Input";


export class AliteButtons {
    public static readonly TEXTURE_FILE = "textures/ui4.png";

    private static readonly RETRO_ROCKET_SPEED = 8350.0;

    public static OVERRIDE_HYPERSPACE = false;
    public static OVERRIDE_INFORMATION = false;
    public static OVERRIDE_LASER = false;
    public static OVERRIDE_MISSILE = false;
    public static OVERRIDE_TORUS = false;

    private static readonly TORUS_DRIVE = 0;
    // ... (rest of the button constants)
    private static readonly TIME_DRIVE = 13;

    private readonly buttons: ButtonData[] = new Array(15);
    // ... (rest of the properties)
    private inGame: InGameManager;


    constructor(inGame: InGameManager) {
        this.alite = AliteGame.get();
        this.inGame = inGame;

        this.alite.getTextureManager().addTexture(AliteButtons.TEXTURE_FILE);
        this.reset();

        this.greenOverlay = this.genSprite("green_overlay", 0, 0);
        // ... (rest of constructor)
    }
    private alite: AliteGame;
    private greenOverlay: Sprite;


    private genSprite(name: string, x: number, y: number): Sprite {
        return new Sprite(x, y, this.alite.getTextureManager().getSprite(AliteButtons.TEXTURE_FILE, name), AliteButtons.TEXTURE_FILE);
    }


    public reset(): void {
        this.createButtonGroups();
        this.createButtons();
        this.setSweepPos();
        // ...
    }

    // ... (rest of the methods converted to TypeScript)
    private deactivateFire(): void {
        if (this.alite.getLaserManager()) {
            this.alite.getLaserManager().setAutoFire(false);
        }
    }
}
