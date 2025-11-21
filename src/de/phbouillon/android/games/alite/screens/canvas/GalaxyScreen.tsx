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

import { AliteGame } from "../../AliteGame";
import { AliteConfig } from "../../AliteConfig";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ScrollPane } from "../../ScrollPane";
import { SoundManager } from "../../SoundManager";
import { ColorScheme } from "../../colors/ColorScheme";
import { Player } from "../../model/Player";
import { SystemData } from "../../model/generator/SystemData";
import { AliteScreen } from "./AliteScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Point } from "../../../../framework/Point";
import { Rect } from "../../../../framework/Rect";


class MappedSystemData {
    system: SystemData;
    xDiff: number = 0;

    constructor(system: SystemData) {
        this.system = system;
    }

    public getLocationId(): number {
        return (this.system.getX() << 8) + this.system.getY();
    }
}


export class GalaxyScreen extends AliteScreen {
    private static readonly HALF_WIDTH = 760;
    private static readonly HALF_HEIGHT = 460;
    private static readonly CROSS_SIZE = 40;
    private static readonly CROSS_DISTANCE = 2;
    private static readonly SCALE_CONST = AliteConfig.DESKTOP_WIDTH / 256.0;

    private zoomFactor = 1;
    private zoomFactorForFind = 1;
    private title: string;
    private systemData: MappedSystemData[];
    private readonly doubleLocations: Set<number> = new Set();
    private findButton: Button;
    private homeButton: Button;
    private targetX = 0;
    private targetY = 0;
    private readonly scrollPane: ScrollPane;
    private zoom = false;
    private scalingReferenceX = -1;
    private scalingReferenceY: number;
    private wasHomeButtonPressed: boolean;

    constructor(zoomFactor: number = 1, centerX: number = 0, centerY: number = 0) {
        super();
        this.zoomFactor = zoomFactor;
        this.scrollPane = new ScrollPane(0, 80, AliteConfig.DESKTOP_WIDTH, 1000,
            () => new Point(AliteConfig.DESKTOP_WIDTH * this.zoomFactor, 920 * this.zoomFactor));
        this.scrollPane.position.x = centerX;
        this.scrollPane.position.y = centerY;
    }


    public saveScreenState(dos: any): void {
        dos.writeFloat(this.zoomFactor);
        dos.writeInt(this.scrollPane.position.x);
        dos.writeInt(this.scrollPane.position.y);
    }

    private findClosestSystem(x: number, y: number): MappedSystemData {
        let minDist = -1;
        const player: Player = this.game.getPlayer();
        let closestSystem: MappedSystemData = null;
        for (const system of this.systemData) {
            const sx = this.transformX(system.system.getX());
            const sy = this.transformY(system.system.getY());
            const dist = (sx - x) * (sx - x) + (sy - y) * (sy - y);
            if (dist < minDist || closestSystem === null) {
                if (this.doubleLocations.has(system.getLocationId()) && player.getHyperspaceSystem() === system.system) {
                    continue;
                }
                minDist = dist;
                closestSystem = system;
            }
        }
        return closestSystem;
    }


    private capitalize(t: string): string {
        if (!t || t.length < 1) return "";
        return t.length < 2 ? t : t.charAt(0).toUpperCase() + t.substring(1).toLowerCase();
    }

    private findSystem(text: string): void {
        if (text.trim().length === 0) {
            return;
        }
        for (const system of this.systemData) {
            if (system.system.getName().toLowerCase() === text.toLowerCase()) {
                this.game.getPlayer().setHyperspaceSystem(system.system);
                this.moveToCenter(system.system.getX(), system.system.getY());
                return;
            }
        }
        const galaxy: number = this.game.getGenerator().findGalaxyOfPlanet(text);
        if (galaxy === -1) {
            this.showMessageDialog(L.string(R.string.galaxy_unknown_planet, this.capitalize(text)));
            SoundManager.play(Assets.error);
        } else {
            this.showMessageDialog(L.string(R.string.galaxy_unknown_planet_in_galaxy, this.capitalize(text), galaxy,
                this.game.getGenerator().getCurrentGalaxy()));
            SoundManager.play(Assets.alert);
        }
    }


    public processTouch(touch: TouchEvent): void {
        if (touch.type === TouchEvent.TOUCH_SCALE) {
            if (this.scalingReferenceX === -1) {
                this.scalingReferenceX = (touch.x2 + this.scrollPane.position.x) / GalaxyScreen.SCALE_CONST / this.zoomFactor;
                this.scalingReferenceY = (touch.y2 + this.scrollPane.position.y - 100) / GalaxyScreen.SCALE_CONST / this.zoomFactor;
            }
            this.zoomFactor = touch.zoomFactor;
            this.scrollPane.changePosition(this.transformX(this.scalingReferenceX), this.transformY(this.scalingReferenceY), touch.x2, touch.y2);
            this.zoom = true;
            this.targetX = 0;
            this.targetY = 0;
        }

        if (this.game.getInput().getTouchCount() > 1 ||
            (touch.type === TouchEvent.TOUCH_DRAGGED && touch.pointer === 0 && this.zoom)) {
            return;
        }
        this.scrollPane.handleEvent(touch);
        this.targetX = 0;
        this.targetY = 0;

        if (this.homeButton.isPressed(touch)) {
            const homeSystem: SystemData = this.game.getPlayer().getCurrentSystem();
            this.game.getPlayer().setHyperspaceSystem(homeSystem);
            if (homeSystem === null) {
                this.moveToCenter(this.game.getPlayer().getPosition().x, this.game.getPlayer().getPosition().y);
            } else {
                this.moveToCenter(homeSystem.getX(), homeSystem.getY());
            }
            this.wasHomeButtonPressed = true;
            return;
        }

        if (this.findButton.isPressed(touch)) {
            this.popupTextInput(L.string(R.string.galaxy_find_planet_name), "", 8);
            return;
        }

        if (touch.type === TouchEvent.TOUCH_UP && touch.pointer === 0 && this.zoom) {
            this.zoom = false;
            this.scalingReferenceX = -1;
            return;
        }

        if (touch.type !== TouchEvent.TOUCH_UP || this.scrollPane.isSweepingGesture(touch)) {
            return;
        }

        const closestSystem = this.findClosestSystem(touch.x, touch.y);
        const sx = this.transformX(closestSystem.system.getX());
        const sy = this.transformY(closestSystem.system.getY());
        if (!Rect.inside(sx, sy, 0, 20, AliteConfig.DESKTOP_WIDTH, AliteConfig.SCREEN_HEIGHT)) {
            return;
        }
        this.game.getPlayer().setHyperspaceSystem(closestSystem.system);
        SoundManager.play(Assets.click);
    }


    private transformX(x: number): number {
        return x * GalaxyScreen.SCALE_CONST * this.zoomFactor - this.scrollPane.position.x;
    }

    private transformY(y: number): number {
        return 100 + y * GalaxyScreen.SCALE_CONST * this.zoomFactor - this.scrollPane.position.y;
    }

    private moveToCenter(x: number, y: number): void {
        if (this.zoomFactor > this.zoomFactorForFind) {
            const zoomRatio: number = (this.zoomFactorForFind - 1) / (this.zoomFactor - 1);
            this.scrollPane.position.x *= zoomRatio;
            this.scrollPane.position.y *= zoomRatio;
        }
        this.zoomFactor = this.zoomFactorForFind;
        this.game.getInput().setZoomFactor(this.zoomFactor);
        this.targetX = (AliteConfig.DESKTOP_WIDTH >> 1) - this.transformX(x);
        this.targetY = 80 + (AliteConfig.SCREEN_HEIGHT >> 1) - this.transformY(y);
    }

    private renderName(system: MappedSystemData): void {
        const g: Graphics = this.game.getGraphics();
        const sx = this.transformX(system.system.getX());
        const sy = this.transformY(system.system.getY());
        const nameWidth: number = g.getTextWidth(system.system.getName(), Assets.regularFont);
        let positionX: number = 3 * this.zoomFactor + 2;
        let positionY: number = 40;
        if (sx + nameWidth > GalaxyScreen.HALF_WIDTH << 1) {
            positionX = -positionX - nameWidth;
        }
        if (sy + 40 > GalaxyScreen.HALF_HEIGHT << 1) {
            positionY = -40;
        }
        if (this.game.getPlayer().isPlanetVisited(system.system.getId())) {
            g.drawUnderlinedText(system.system.getName(), sx + positionX, sy + positionY,
                system.system.getEconomy().getColor(), Assets.regularFont);
        } else {
            g.drawText(system.system.getName(), sx + positionX, sy + positionY,
                system.system.getEconomy().getColor(), Assets.regularFont);
        }
    }


    public updateMap(): void {
        if (this.targetX !== 0 || this.targetY !== 0) {
            let deltaX: number = this.targetX >> 4;
            let deltaY: number = this.targetY >> 3;
            if (deltaX === 0 && this.targetX !== 0) {
                deltaX = this.targetX < 0 ? -1 : 1;
            }
            if (deltaY === 0 && this.targetY !== 0) {
                deltaY = this.targetY < 0 ? -1 : 1;
            }
            this.scrollPane.setScrollingTarget(deltaX, deltaY);
            this.targetX -= deltaX;
            this.targetY -= deltaY;
        }
        this.scrollPane.scrollingFree();
    }


    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.messageResult === AliteScreen.RESULT_YES) {
            this.findSystem(this.inputText);
        }
        this.messageResult = AliteScreen.RESULT_NONE;
        this.updateMap();
    }

    private renderCurrentPositionCross(): void {
        const g: Graphics = this.game.getGraphics();
        const player: Player = this.game.getPlayer();
        const hyperspaceSystem: SystemData = player.getHyperspaceSystem();

        const px = this.transformX(hyperspaceSystem === null ? player.getPosition().x : hyperspaceSystem.getX());
        const py = this.transformY(hyperspaceSystem === null ? player.getPosition().y : hyperspaceSystem.getY());
        g.drawLine(px, py - GalaxyScreen.CROSS_SIZE - GalaxyScreen.CROSS_DISTANCE, px, py - GalaxyScreen.CROSS_DISTANCE, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION));
        g.drawLine(px, py + GalaxyScreen.CROSS_SIZE + GalaxyScreen.CROSS_DISTANCE, px, py + GalaxyScreen.CROSS_DISTANCE, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION));
        g.drawLine(px - GalaxyScreen.CROSS_SIZE - GalaxyScreen.CROSS_DISTANCE, py, px - GalaxyScreen.CROSS_DISTANCE, py, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION));
        g.drawLine(px + GalaxyScreen.CROSS_SIZE + GalaxyScreen.CROSS_DISTANCE, py, px + GalaxyScreen.CROSS_DISTANCE, py, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION));
    }


    private renderCurrentFuelCircle(): void {
        const g: Graphics = this.game.getGraphics();
        const player: Player = this.game.getPlayer();
        const r: number = 36 * GalaxyScreen.SCALE_CONST * this.zoomFactor >> 1;
        const hyperspaceSystem: SystemData = player.getHyperspaceSystem();
        if (hyperspaceSystem !== null) {
            const px = this.transformX(hyperspaceSystem.getX());
            const py = this.transformY(hyperspaceSystem.getY());
            g.drawDashedCircle(px, py, r, ColorScheme.get(ColorScheme.COLOR_DASHED_FUEL_CIRCLE));
        }

        const currentSystem: SystemData = player.getCurrentSystem();
        const px = this.transformX(currentSystem === null ? player.getPosition().x : player.getCurrentSystem().getX());
        const py = this.transformY(currentSystem === null ? player.getPosition().y : player.getCurrentSystem().getY());
        g.drawCircle(px, py, r * player.getCobra().getFuel() / player.getCobra().getMaxFuel(),
            ColorScheme.get(ColorScheme.COLOR_FUEL_CIRCLE));
    }

    private renderDistance(): void {
        const player: Player = this.game.getPlayer();
        const g: Graphics = this.game.getGraphics();

        if (player.getHyperspaceSystem() !== null) {
            const distance: number = player.computeDistance();
            g.drawText(L.string(R.string.galaxy_distance_info,
                player.getHyperspaceSystem().getName(), Math.floor(distance / 10), distance % 10),
                100, 1060, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);
        }
    }


    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();

        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(this.title);

        g.setClip(0, -1, -1, 1000);
        const r: number = 3 * this.zoomFactor;
        for (const system of this.systemData) {
            const sx = this.transformX(system.system.getX()) + system.xDiff;
            const sy = this.transformY(system.system.getY());
            g.fillCircle(sx, sy, r, system.system.getEconomy().getColor());
            if (this.namesVisible() && Rect.inside(sx, sy, 0, 0, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT)) {
                this.renderName(system);
            } else if (this.game.getPlayer().isPlanetVisited(system.system.getId())) {
                g.drawLine(sx - r, sy + r + 2, sx + r, sy + r + 2, system.system.getEconomy().getColor());
            }
        }

        this.renderCurrentPositionCross();
        this.renderCurrentFuelCircle();
        this.renderDistance();

        g.setClip(-1, -1, -1, -1);

        this.homeButton.render(g);
        this.findButton.render(g);
    }

    private setupUi(): void {
        this.initializeSystems();

        this.findButton = Button.createGradientRegularButton(1375, 980, 320, 100, L.string(R.string.galaxy_btn_find))
            .setPixmap(this.pics.get("search_icon"))
            .setTextPosition(Button.TextPosition.RIGHT);

        this.homeButton = Button.createGradientRegularButton(1020, 980, 320, 100, L.string(R.string.galaxy_btn_home))
            .setPixmap(this.pics.get("home_icon"))
            .setTextPosition(Button.TextPosition.RIGHT);
    }

    public activate(): void {
        this.activateScreen(L.string(R.string.title_galaxy, this.game.getGenerator().getCurrentGalaxy()));
    }

    private initPosition(centerX: number, centerY: number, zoomFactor: number): void {
        this.zoomFactor = zoomFactor;
        this.zoomFactorForFind = zoomFactor;
        this.scrollPane.changePosition(this.transformX(centerX), this.transformY(centerY), AliteConfig.DESKTOP_WIDTH >> 1,
            80 + (AliteConfig.SCREEN_HEIGHT >> 1));
    }

    private activateScreen(title: string): void {
        this.title = title;
        this.game.getInput().setZoomFactor(this.zoomFactor);
        this.setupUi();
    }

    private initializeSystems(): void {
        const raxlaa = this.game.isRaxxlaVisible() ? 1 : 0;

        const systems = this.game.getGenerator().getSystems();
        this.systemData = new Array(systems.length + raxlaa);
        const doubleCounts: Map<number, number> = new Map();

        for (let i = 0; i < systems.length; i++) {
            this.systemData[i] = new MappedSystemData(systems[i]);
            const key = this.systemData[i].getLocationId();
            const count = doubleCounts.get(key) || 0;
            doubleCounts.set(key, count + 1);
            if (count > 0) {
                this.doubleLocations.add(key);
                this.systemData[i].xDiff = count << 3;
            }
        }
        if (raxlaa === 1) {
            this.systemData[systems.length] = new MappedSystemData(SystemData.RAXXLA_SYSTEM);
        }
    }


    public namesVisible(): boolean {
        return this.zoomFactor >= 4.0;
    }

    public wasHomeButtonPressed_(): boolean {
        return this.wasHomeButtonPressed;
    }

    public getZoomFactor(): number {
        return this.zoomFactor;
    }

    public loadAssets(): void {
        this.addPictures("search_icon", "home_icon");
        super.loadAssets();
    }

    public getScreenCode(): number {
        return ScreenCodes.GALAXY_SCREEN;
    }
}
