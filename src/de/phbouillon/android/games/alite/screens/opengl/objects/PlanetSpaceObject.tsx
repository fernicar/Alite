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

import { Disk } from "../../../framework/impl/gl/Disk";
import { Sphere } from "../../../framework/impl/gl/Sphere";
import { Alite } from "../../Alite";
import { AliteLog } from "../../AliteLog";
import { SystemData } from "../../model/generator/SystemData";
import { SpriteData } from "../../../framework/SpriteData";
import { AliteObject } from "./AliteObject";

export class PlanetSpaceObject extends AliteObject {
    private static readonly serialVersionUID = -8124332316784922499;
    private readonly rings: Disk;
    private readonly ringShadow: Disk;
    private readonly planet: Sphere;
    private readonly clouds: Sphere;
    private readonly atmosphere: Sphere;

    constructor(system: SystemData, preview: boolean) {
        super("Planet");
        const alite = Alite.getInstance();
        if (system == null) {
            system = alite.getGenerator().getSystems()[0];
        }
        const planetRadius = preview ? 10000.0 : 30000.0;
        const ringStart = preview ? 11000.0 : 31000.0;
        const ringSize = preview ? 25000.0 : 55000.0;
        const cloudStart = preview ? 10150.0 : 30150.0;
        const atmosphereStart = preview ? 10300.0 : 30800.0; //30300.0;

        if (alite.getGenerator().getCurrentGalaxy() === 1 && system.getIndex() === SystemData.LAVE_SYSTEM_INDEX) {
            alite.getTextureManager().addTexture("textures/planets/lave.png");
            this.planet = new Sphere(planetRadius, 32, 32, "textures/planets/lave.png", null, false);
            this.rings = null;
            this.ringShadow = null;
        } else if (system === SystemData.RAXXLA_SYSTEM) {
            alite.getTextureManager().addTexture("textures/planets/bdwarf.png");
            this.planet = new Sphere(planetRadius, 32, 32, "textures/planets/bdwarf.png", null, false);
            this.rings = new Disk(ringStart, ringSize, 80, 360, 60, 20, 256, "textures/planets/ring16.png");
            this.ringShadow = new Disk(ringStart, ringSize, 360, 80, 20, 60, 256, "textures/planets/ring16s.png");
        } else {
            const planetTexture = system.getPlanetTexture();
            const fileIndex = Math.floor(planetTexture / 8) + 1;
            alite.getTextureManager().addTexture(`textures/planets/0${fileIndex}.png`);
            const spriteData = alite.getTextureManager().getSprite(`textures/planets/0${fileIndex}.png`, `${planetTexture + 1}`);
            this.planet = new Sphere(planetRadius, 32, 32, `textures/planets/0${fileIndex}.png`, spriteData, false);
            const ringsTexture = system.getRingsTexture();
            this.rings = ringsTexture !== 0 ?
                new Disk(ringStart, ringSize, 80, 360, 60, 20, 256, `textures/planets/ring${ringsTexture}.png`) : null;
            this.ringShadow = ringsTexture !== 0 ? new Disk(ringStart, ringSize, 360, 80, 20, 60, 256, `textures/planets/ring${ringsTexture}s.png`) : null;
        }

        AliteLog.d("Planet Debugger", `Planet ${system.getName()} has ${this.rings == null ? "no rings." : "rings with texture ring" + system.getRingsTexture()}`);
        const cloudsTexture = system.getCloudsTexture();
        this.clouds = cloudsTexture !== 0 ?
            new Sphere(cloudStart, 32, 32, `textures/planets/clouds${cloudsTexture}.png`, null, false) : null;
        this.atmosphere = new Sphere(atmosphereStart, 32, 32, "textures/atmosphere2.png", null, false);
        this.boundingSphereRadius = this.rings == null ? atmosphereStart : ringSize;
        this.distanceFromCenterToBorder = this.boundingSphereRadius;
    }

    public render(): void {
        // All of the following are Android GLES11 calls and need to be replaced with WebGL.
        /*
        GLES11.glDisable(GLES11.GL_LIGHTING);
        this.planet.render();
        GLES11.glDisable(GLES11.GL_DEPTH_TEST);
        GLES11.glEnable(GLES11.GL_BLEND);
        GLES11.glBlendFunc(GLES11.GL_SRC_ALPHA, GLES11.GL_ONE_MINUS_SRC_ALPHA);
        if (this.clouds != null) {
            this.clouds.render();
        }
        GLES11.glEnable(GLES11.GL_BLEND);
        GLES11.glDisable(GLES11.GL_CULL_FACE);
        GLES11.glBlendFunc(GLES11.GL_ONE, GLES11.GL_ONE);
        GLES11.glEnable(GLES11.GL_DEPTH_TEST);
        this.atmosphere.render();

        GLES11.glEnable(GLES11.GL_LIGHTING);
        GLES11.glBlendFunc(GLES11.GL_SRC_ALPHA, GLES11.GL_ONE_MINUS_SRC_ALPHA);
        if (this.rings != null) {
            this.rings.render();
            this.ringShadow.render();
        }
        GLES11.glDisable(GLES11.GL_DEPTH_TEST);

        GLES11.glEnable(GLES11.GL_CULL_FACE);
        Alite.getInstance().getTextureManager().setTexture(null);
        */
        AliteLog.d("PlanetSpaceObject", "WebGL rendering logic needed here.");
    }

    public dispose(): void {
        if (this.atmosphere != null) {
            this.atmosphere.destroy();
        }
        if (this.clouds != null) {
            this.clouds.destroy();
        }
        if (this.planet != null) {
            this.planet.destroy();
        }
        if (this.rings != null) {
            this.rings.destroy();
        }
        if (this.ringShadow != null) {
            this.ringShadow.destroy();
        }
    }
}
