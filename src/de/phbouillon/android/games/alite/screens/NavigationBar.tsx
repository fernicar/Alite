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

import { Graphics } from "../../framework/Graphics";
import { TouchEvent } from "../../framework/Input";
import { Pixmap } from "../../framework/Pixmap";
import { Screen } from "../../framework/Screen";
import { GLES11 } from "../../framework/impl/gl/GLES11";
import { Alite } from "../Alite";
import { AliteConfig } from "../AliteConfig";
import { AliteLog } from "../AliteLog";
import { Assets } from "../Assets";
import { L } from "../L";
import { R } from "../R";
import { ScrollPane } from "../ScrollPane";
import { ColorScheme } from "../colors/ColorScheme";
import { SoundManager } from "../SoundManager";
import { FlightScreen } from "./opengl/ingame/FlightScreen";

// Import all possible screen targets for the factory
import { StatusScreen } from "./canvas/StatusScreen";
import { BuyScreen } from "./canvas/BuyScreen";
import { InventoryScreen } from "./canvas/InventoryScreen";
import { EquipmentScreen } from "./canvas/EquipmentScreen";
import { LocalScreen } from "./canvas/LocalScreen";
import { GalaxyScreen } from "./canvas/GalaxyScreen";
import { PlanetScreen } from "./canvas/PlanetScreen";
import { DiskScreen } from "./canvas/DiskScreen";
import { AchievementsScreen } from "./canvas/AchievementsScreen";
import { OptionsScreen } from "./canvas/options/OptionsScreen";
import { LibraryScreen } from "./canvas/LibraryScreen";
import { TutorialSelectionScreen } from "./canvas/tutorial/TutorialSelectionScreen";
import { HackerScreen } from "./canvas/HackerScreen";
import { QuitScreen } from "./canvas/QuitScreen";


class NavigationEntry {
    titleId: number;
    image: Pixmap;
    navigationTarget: string;
    visible: boolean;
    notificationNumber: number;

    constructor(titleId: number, image: Pixmap, navigationTarget: string) {
        this.titleId = titleId;
        this.image = image;
        this.navigationTarget = navigationTarget;
        this.visible = true;
        this.notificationNumber = 0;
    }
}

// Factory to replace reflection
const screenFactory: { [key: string]: new (...args: any[]) => Screen } = {
    "canvas.StatusScreen": StatusScreen,
    "canvas.BuyScreen": BuyScreen,
    "canvas.InventoryScreen": InventoryScreen,
    "canvas.EquipmentScreen": EquipmentScreen,
    "canvas.LocalScreen": LocalScreen,
    "canvas.GalaxyScreen": GalaxyScreen,
    "canvas.PlanetScreen": PlanetScreen,
    "canvas.DiskScreen": DiskScreen,
    "canvas.AchievementsScreen": AchievementsScreen,
    "canvas.options.OptionsScreen": OptionsScreen,
    "canvas.LibraryScreen": LibraryScreen,
    "canvas.tutorial.TutorialSelectionScreen": TutorialSelectionScreen,
    "canvas.HackerScreen": HackerScreen,
    "canvas.QuitScreen": QuitScreen,
};


export class NavigationBar {
    private activeIndex: number;
    private pendingIndex = -1;
    private active = true;

    private readonly scrollPane: ScrollPane;
    private readonly targets: NavigationEntry[] = [];

    constructor() {
        const game = Alite.get();
        const g = game.getGraphics();
        Assets.launchIcon = g.newPixmap("navigation_icons/launch_icon.png");
        Assets.statusIcon = g.newPixmap("navigation_icons/status_icon.png");
        Assets.buyIcon = g.newPixmap("navigation_icons/buy_icon.png");
        Assets.inventoryIcon = g.newPixmap("navigation_icons/inventory_icon.png");
        Assets.equipIcon = g.newPixmap("navigation_icons/equipment_icon.png");
        Assets.localIcon = g.newPixmap("navigation_icons/local_icon.png");
        Assets.galaxyIcon = g.newPixmap("navigation_icons/galaxy_icon.png");
        Assets.planetIcon = g.newPixmap("navigation_icons/planet_icon.png");
        Assets.diskIcon = g.newPixmap("navigation_icons/disk_icon.png");
        Assets.achievementsIcon = g.newPixmap("navigation_icons/achievements_icon.png");
        Assets.optionsIcon = g.newPixmap("navigation_icons/options_icon.png");
        Assets.libraryIcon = g.newPixmap("navigation_icons/library_icon.png");
        Assets.academyIcon = g.newPixmap("navigation_icons/academy_icon.png");
        Assets.hackerIcon = g.newPixmap("navigation_icons/hacker_icon.png");
        Assets.quitIcon = g.newPixmap("navigation_icons/quit_icon.png");

        this.scrollPane = new ScrollPane(AliteConfig.DESKTOP_WIDTH, 0, AliteConfig.SCREEN_WIDTH, AliteConfig.SCREEN_HEIGHT,
            () => ({ x: AliteConfig.SCREEN_WIDTH, y: this.getHeight() }));
    }

    public ensureVisible(index: number): void {
        this.scrollPane.position.y = 0;
        const height = this.getHeight();
        let found = (this.scrollPane.position.y + AliteConfig.SCREEN_HEIGHT) / AliteConfig.NAVIGATION_BAR_SIZE > index + 1;
        while (!found) {
            this.scrollPane.position.y += AliteConfig.NAVIGATION_BAR_SIZE;
            if (this.scrollPane.position.y > height - AliteConfig.SCREEN_HEIGHT) {
                found = true;
                this.scrollPane.position.y = height - AliteConfig.SCREEN_HEIGHT;
            } else {
                found = (this.scrollPane.position.y + AliteConfig.SCREEN_HEIGHT) / AliteConfig.NAVIGATION_BAR_SIZE > index + 1;
            }
        }
    }

    private getHeight(): number {
        const visibleCount = this.targets.filter(t => t.visible).length;
        return AliteConfig.NAVIGATION_BAR_SIZE * visibleCount;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public add(titleId: number, image: Pixmap, navigationTarget: string): number {
        this.targets.push(new NavigationEntry(titleId, image, navigationTarget));
        return this.targets.length - 1;
    }

    public setFlightMode(b: boolean): void {
        this.targets[Alite.NAVIGATION_BAR_LAUNCH].titleId = b ? R.string.navbar_front : R.string.navbar_launch;
        this.targets[Alite.NAVIGATION_BAR_DISK].visible = !b;
        this.targets[Alite.NAVIGATION_BAR_ACADEMY].visible = !b;
        this.targets[Alite.NAVIGATION_BAR_HACKER].visible = !b && Alite.get().isHackerActive();
    }

    public setVisible(index: number, visible: boolean): void { this.targets[index].visible = visible; }
    public isVisible(index: number): boolean { return this.targets[index].visible; }
    public setNotificationNumber(index: number, number: number): void { this.targets[index].notificationNumber = number; }
    public getNotificationNumber(index: number): number { return this.targets[index].notificationNumber; }

    public render(g: Graphics): void {
        // if (AndroidGame.resetting) {
        //     GLES11.glClear(GLES11.GL_COLOR_BUFFER_BIT);
        //     return;
        // }

        let counter = 0;
        let positionCounter = 0;
        let selX = -1;
        let selY = -1;

        for (const entry of this.targets) {
            if (!entry.visible) {
                counter++;
                continue;
            }

            if ((counter + 1) * AliteConfig.NAVIGATION_BAR_SIZE < this.scrollPane.position.y) {
                counter++;
                positionCounter++;
                continue;
            }

            const title = L.string(entry.titleId);
            const halfWidth = g.getTextWidth(title, Assets.regularFont) / 2;
            const halfHeight = g.getTextHeight(title, Assets.regularFont) / 2;

            const y = positionCounter * AliteConfig.NAVIGATION_BAR_SIZE - this.scrollPane.position.y + 1;
            const x = AliteConfig.DESKTOP_WIDTH;

            g.diagonalGradientRect(x + 5, y + 5, AliteConfig.NAVIGATION_BAR_SIZE - 6, AliteConfig.NAVIGATION_BAR_SIZE - 6,
                ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT), ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK));

            if (entry.image) g.drawPixmap(entry.image, x + 5, y + 5);
            if (counter === this.activeIndex) { selX = x; selY = y; }

            g.rec3d(x, y, AliteConfig.NAVIGATION_BAR_SIZE, AliteConfig.NAVIGATION_BAR_SIZE, 5,
                ColorScheme.get(counter === this.activeIndex ? ColorScheme.COLOR_SELECTED_COLORED_FRAME_LIGHT : ColorScheme.COLOR_FRAME_LIGHT),
                ColorScheme.get(counter === this.activeIndex ? ColorScheme.COLOR_SELECTED_COLORED_FRAME_DARK : ColorScheme.COLOR_FRAME_DARK));

            const yPosText = y - 1;
            const yPos = entry.image == null ? (yPosText + (AliteConfig.NAVIGATION_BAR_SIZE / 2) - halfHeight + Assets.regularFont.getSize() / 2)
                : yPosText + AliteConfig.NAVIGATION_BAR_SIZE - 16;

            g.drawText(title, AliteConfig.DESKTOP_WIDTH + (AliteConfig.NAVIGATION_BAR_SIZE / 2) - halfWidth, yPos,
                ColorScheme.get(counter === this.activeIndex ? ColorScheme.COLOR_SELECTED_TEXT : ColorScheme.COLOR_MESSAGE), Assets.regularFont);

            if (entry.notificationNumber > 0) {
                const numberPixmap = g.getNotificationNumber(Assets.regularFont, entry.notificationNumber);
                g.drawPixmap(numberPixmap, x + AliteConfig.NAVIGATION_BAR_SIZE - 8 - numberPixmap.getWidth(), y + 10);
            }

            counter++;
            positionCounter++;
        }

        if (selX !== -1 && selY !== -1) {
            g.rec3d(selX, selY, AliteConfig.NAVIGATION_BAR_SIZE, AliteConfig.NAVIGATION_BAR_SIZE, 5,
                ColorScheme.get(ColorScheme.COLOR_SELECTED_COLORED_FRAME_LIGHT),
                ColorScheme.get(ColorScheme.COLOR_SELECTED_COLORED_FRAME_DARK));
        }
    }

    public setActiveIndex(newIndex: number): void {
        this.activeIndex = newIndex;
        this.ensureVisible(this.activeIndex);
    }

    public checkNavigationBar(event: TouchEvent): Screen {
        this.scrollPane.handleEvent(event);
        return event.type === TouchEvent.TOUCH_UP && this.active && !this.scrollPane.isSweepingGesture(event)
            ? this.touched(event.x, event.y)
            : null;
    }

    public moveToTop(): void { this.scrollPane.moveToTop(); }
    public isAtBottom(): boolean { return this.scrollPane.isAtBottom(); }

    private touched(x: number, y: number): Screen {
        let index = Math.floor((y + this.scrollPane.position.y) / AliteConfig.NAVIGATION_BAR_SIZE);
        let realIndex = index;
        for (let i = 0; i <= realIndex; i++) {
            if (i >= this.targets.length) {
                AliteLog.e("NavigationBar", `Index out of bounds: ${index}`);
                return null;
            }
            if (!this.targets[i].visible) {
                realIndex++;
            }
        }
        index = realIndex;

        if (index < 0 || index >= this.targets.length) {
            AliteLog.e("NavigationBar", `Index out of bounds: ${index}`);
            return null;
        }
        if (index === this.activeIndex || this.pendingIndex !== -1) return null;

        const entry = this.targets[index];

        if (R.string.navbar_front === entry.titleId) {
            SoundManager.play(Assets.click);
            const flightScreen = Alite.get().getCurrentScreen() as FlightScreen;
            flightScreen.setForwardView();
            flightScreen.setInformationScreen(null);
            return null;
        }

        if (entry.navigationTarget) {
            SoundManager.play(Assets.click);
            const ScreenClass = screenFactory[entry.navigationTarget];
            if (ScreenClass) {
                this.pendingIndex = index;
                return new ScreenClass();
            } else {
                AliteLog.e("Navigation bar", `Screen ${entry.navigationTarget} cannot be opened`);
            }
        }
        return null;
    }


    public resetPending(): void { this.pendingIndex = -1; }

    public performScreenChange(): void {
        if (this.pendingIndex !== -1) {
            this.activeIndex = this.pendingIndex;
            this.pendingIndex = -1;
        }
    }
}
