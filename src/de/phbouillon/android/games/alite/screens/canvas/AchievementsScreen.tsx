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
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ScrollPane } from "../../ScrollPane";
import { Settings } from "../../Settings";
import { AliteColor } from "../../colors/AliteColor";
import { ColorScheme } from "../../colors/ColorScheme";
import { EquipmentStore } from "../../model/EquipmentStore";
import { Medal } from "../../model/Medal";
import { SystemData } from "../../model/generator/SystemData";
import { Toc } from "../../model/library/Toc";
import { TradeGoodStore } from "../../model/trading/TradeGoodStore";
import { AliteButtons } from "../opengl/sprites/buttons/AliteButtons";
import { PlanetScreen } from "./PlanetScreen";
import { AliteScreen } from "./AliteScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Pixmap } from "../../../../framework/Pixmap";
import { Point } from "../../../../framework/Point";
import { SpriteData } from "../../../../framework/SpriteData";
import { TextData } from "../../../../framework/TextData";


export class AchievementsScreen extends AliteScreen {
    private static readonly TEXTURE_FILE = "medals.png";
    private static readonly ICON_GRAY_TROPHY = "gray_trophy";

    private readonly viewedMedals: Set<Medal.Item> = new Set();
    private maxHeight: number;

    private readonly scrollPane: ScrollPane;

    constructor(yPosition: number = 0) {
        super();
        this.scrollPane = new ScrollPane(0, 80, AliteConfig.DESKTOP_WIDTH,
            AliteConfig.SCREEN_HEIGHT, () => new Point(AliteConfig.SCREEN_WIDTH, this.maxHeight));
        this.scrollPane.position.y = yPosition;
    }

    public activate(): void {
        this.setUpForDisplay();
    }

    private drawInformation(): void {
        let y = 120 - this.scrollPane.position.y;
        const g = this.game.getGraphics();
        g.setClip(-1, 0, -1, AliteConfig.SCREEN_HEIGHT - 80);

        for (const medal of this.game.getMedals()) {
            const name = L.string(medal.getName());

            let nameColor = ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION);
            let levelColor = ColorScheme.get(ColorScheme.COLOR_RATING);
            let descriptionColor = ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT);
            let nextLevelColor = ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT);

            const reachedThreshold = medal.reachedThreshold();
            if (reachedThreshold === 0) {
                nameColor = AliteColor.grayScale(nameColor);
                levelColor = AliteColor.grayScale(levelColor);
                descriptionColor = AliteColor.grayScale(descriptionColor);
                nextLevelColor = AliteColor.grayScale(nextLevelColor);
            }

            const icon = this.getMedalPixmap(medal, reachedThreshold > 0);
            if (icon) {
                g.drawPixmap(icon, 100 - (icon.getWidth() >> 1), y);
                if (medal.isUnseen()) {
                    const iconNew = this.pics.get("ext_new");
                    if (iconNew) {
                        g.drawPixmap(iconNew, 100 + (icon.getWidth() >> 1) - (iconNew.getWidth() >> 1), y - (iconNew.getHeight() >> 2));
                    }
                }
            }


            g.drawText(name, 200, y + 30, nameColor, Assets.titleFont);
            g.drawText(` (${L.string(R.string.medal_level, medal.getLevel())})`,
                200 + g.getTextWidth(name, Assets.titleFont), y + 30, levelColor, Assets.regularFont);

            const nextLevel = medal.nextThreshold();
            g.drawText(nextLevel === 0 ? L.string(R.string.medal_max_level) :
                L.string(R.string.medal_next_threshold, medal.highestLevelThreshold() % 10 !== 0 ?
                    L.string(R.string.num_all) : this.getShortCompactNumber(nextLevel)),
                1100, y + 30, nextLevelColor, Assets.regularFont);

            let dy = y;
            if (reachedThreshold > 0 && nextLevel !== 0) {
                g.drawText(L.string(R.string.medal_reached_threshold, this.getShortCompactNumber(reachedThreshold)),
                    200, y + 80, levelColor, Assets.regularFont);
                dy += 40;
            }

            const text = this.computeTextDisplay(g, L.string(medal.getDescription()), 200, dy + 90, 900, descriptionColor);
            this.displayText(g, text);

            y += Math.max(100 + 40 * text.length, icon ? icon.getHeight() : 0) + 60;
            if (medal.isUnseen() && y - 60 <= this.scrollPane.area.bottom) {
                this.viewedMedals.add(medal);
            }
        }
        this.maxHeight = y - 120 + this.scrollPane.position.y;
        g.setClip(-1, -1, -1, -1);
    }


    private getMedalPixmap(medal: Medal.Item, achieved: boolean): Pixmap {
        const get = (name: string) => this.pics.get(achieved ? name : AchievementsScreen.ICON_GRAY_TROPHY);
        const getButton = (name: string) => achieved ? this.getFromButtons(name) : this.pics.get(AchievementsScreen.ICON_GRAY_TROPHY);

        switch (medal.getId()) {
            case Medal.MEDAL_ID_TIME: return getButton("time_drive");
            case 110: return get("travel_icon");
            case Medal.MEDAL_ID_PLANETS: return get("local_icon");
            case Medal.MEDAL_ID_GALAXY: return get("galaxy_icon");
            case Medal.MEDAL_ID_HYPER_JUMP: return getButton("hyperspace");
            case Medal.MEDAL_ID_FUEL: return get(EquipmentStore.FUEL);
            case Medal.MEDAL_ID_INVENTORY: return get("inventory_icon");
            case Medal.MEDAL_ID_FIREARMS: return get("firearms_icon");
            case Medal.MEDAL_ID_RICH: return get("gold_icon");
            case Medal.MEDAL_ID_MINER: return get(EquipmentStore.MINING_LASER);
            case Medal.MEDAL_ID_KILL_THARGON: return get("thargon");
            case Medal.MEDAL_ID_KILL_TRADER: return get("trader");
            case Medal.MEDAL_ID_KILL_POLICE: return get("police");
            case Medal.MEDAL_ID_JAMMER: return getButton("ecm_jammer");
            case Medal.MEDAL_ID_ENERGY_BOMB: return getButton("energy_bomb");
            case Medal.MEDAL_ID_MISSILE: return getButton("missile");
            case Medal.MEDAL_ID_ECM: return getButton("ecm");
            case Medal.MEDAL_ID_LASER:
                const threshold = medal.reachedThreshold();
                return this.pics.get(!achieved ? AchievementsScreen.ICON_GRAY_TROPHY : threshold <= 10 ? EquipmentStore.PULSE_LASER :
                    threshold <= 100 ? EquipmentStore.BEAM_LASER : EquipmentStore.MILITARY_LASER);
            case Medal.MEDAL_ID_RETRO_ROCKETS: return getButton("retro_rockets");
            case Medal.MEDAL_ID_CLOAKING: return getButton("cloaking_device");
            case Medal.MEDAL_ID_ESCAPE_CAPSULE: return getButton("escape_capsule");
            case Medal.MEDAL_ID_EQUIPMENT: return get("equipment_icon");
            case Medal.MEDAL_ID_MECHANIC: return get("options_icon");
            case Medal.MEDAL_ID_FUEL_SCOOP: return get(EquipmentStore.FUEL_SCOOP);
            case Medal.MEDAL_ID_MISSION: return get("mission_icon");
            case Medal.MEDAL_ID_ABOUT: return get("about_icon");
            case Medal.MEDAL_ID_TUTORIAL: return get("academy_icon");
            case Medal.MEDAL_ID_LIBRARY: return get("library_icon");
            case Medal.MEDAL_ID_INTERRUPTER: return get("quit_icon");
            default:
                for (let i = medal.getLevel(); i >= 0; i--) {
                    const spriteName = `${medal.getId()}_${i}`;
                    if (this.game.getTextureManager().getSprite(AchievementsScreen.TEXTURE_FILE, spriteName)) {
                        if (!this.pics.has(spriteName)) {
                            this.pics.set(spriteName, this.getImagePart(this.game.getTextureManager().getSprite(AchievementsScreen.TEXTURE_FILE, spriteName), "medals", spriteName));
                        }
                        return this.pics.get(spriteName);
                    }
                }
                return this.pics.get(achieved ? "trophy" : AchievementsScreen.ICON_GRAY_TROPHY);
        }
    }


    private getImagePart(data: SpriteData, textureName: string, spriteName: string): Pixmap {
        const pixmap = this.pics.get(textureName);
        const x = data.x * pixmap.getWidth();
        const y = data.y * pixmap.getHeight();
        const w = data.origWidth;
        const h = data.origHeight;
        return this.game.getGraphics().newPixmap(pixmap, spriteName, x, y, w, h);
    }

    private getFromButtons(spriteName: string): Pixmap {
        if (!this.pics.has(spriteName)) {
            const part = this.getImagePart(AliteGame.get().getTextureManager().getSprite(AliteButtons.TEXTURE_FILE, spriteName), "buttons", spriteName);
            this.pics.set(spriteName, this.getResizedPixmapPart(part, 0, 0, spriteName, 150, 150));
        }
        return this.pics.get(spriteName);
    }


    private getShortCompactNumber(number: number): string {
        return number >= 1000000 ? (number / 1000000) + L.string(R.string.num_million) :
            number < 10000 ? String(number) : (number / 1000) + L.string(R.string.num_thousand);
    }

    public saveScreenState(dos: any): void {
        dos.writeInt(this.scrollPane.position.y);
    }

    public present(deltaTime: number): void {
        this.game.getGraphics().clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string(R.string.title_achievements));
        try {
            this.drawInformation();
        } catch (ignored) {
            // Handle potential errors during rendering
        }
        this.scrollPane.scrollingFree();
    }

    protected processTouch(touch: TouchEvent): void {
        this.scrollPane.handleEvent(touch);
    }

    public dispose(): void {
        super.dispose();
        if (this.viewedMedals.size > 0) {
            for (const medal of this.viewedMedals) {
                medal.viewed();
            }
            Settings.save(this.game.getFileIO());
            this.game.getNavigationBar().setNotificationNumber(AliteGame.NAVIGATION_BAR_ACHIEVEMENTS,
                this.game.getNavigationBar().getNotificationNumber(AliteGame.NAVIGATION_BAR_ACHIEVEMENTS) - this.viewedMedals.size);
        }
    }


    public async loadAssets(): Promise<void> {
        try {
            await this.game.getTextureManager().addTexture(AchievementsScreen.TEXTURE_FILE);
            this.pics.set("medals", this.game.getGraphics().newPixmap(AchievementsScreen.TEXTURE_FILE, ""));

            await this.game.getTextureManager().addTexture(AliteButtons.TEXTURE_FILE);
            this.pics.set("buttons", this.game.getGraphics().newPixmap(AliteButtons.TEXTURE_FILE, ""));

            // Simplified asset loading logic for web
            // ... lots of asset loading ...

        } catch (e) {
            AliteLog.e("Achievement icon load error", "Loading icon failed.", e);
        }
        super.loadAssets();
    }


    private getResizedPixmapPart(pixmap: Pixmap, x: number, y: number, name: string, destWidth: number, destHeight: number): Pixmap {
        return this.getResizedPixmapRect(pixmap, x, y, pixmap.getWidth() - x, pixmap.getHeight() - y, name, destWidth, destHeight);
    }

    private getResizedPixmapRect(pixmap: Pixmap, x: number, y: number, width: number, height: number, name: string, destWidth: number, destHeight: number): Pixmap {
        // This is a simplified stand-in. In a real scenario, you'd likely use a library
        // or a more complex canvas operation to scale portions of an image.
        const newPixmap = this.game.getGraphics().newPixmap(pixmap, name, x, y, width, height);
        // Assume newPixmap can be resized, or this logic needs to be inside the graphics implementation
        // newPixmap.resize(destWidth, destHeight);
        return newPixmap;
    }


    public getScreenCode(): number {
        return ScreenCodes.ACHIEVEMENTS_SCREEN;
    }
}
