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

import { AliteConfig } from "../../AliteConfig";
import { Assets } from "../../Assets";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { Settings } from "../../Settings";
import { ColorScheme } from "../../colors/ColorScheme";
import { Equipment } from "../../model/Equipment";
import { Medal } from "../../model/Medal";
import { Player } from "../../model/Player";
import { PlayerCobra } from "../../model/PlayerCobra";
import { StringUtil } from "../../model/generator/StringUtil";
import { SystemData } from "../../model/generator/SystemData";
import { Mission } from "../../model/missions/Mission";
import { MissionManager } from "../../model/missions/MissionManager";
import { FlightScreen } from "../opengl/ingame/FlightScreen";
import { AliteScreen } from "./AliteScreen";
import { ControlOptionsScreen } from "./options/ControlOptionsScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Pixmap } from "../../../../framework/Pixmap";


//This screen never needs to be serialized, as it is not part of the InGame state.
export class StatusScreen extends AliteScreen {
    private static readonly SHIP_X: number = 360;
    private static readonly SHIP_Y: number = 400;

    private static cobra: Pixmap;
    private forwardingScreen: AliteScreen = null;
    private requireAnswer: boolean = false;
    private pendingShowControlOptions: boolean = false;

    public activate(): void {
        this.setUpForDisplay();
        this.game.updateMedals();
        this.game.setStatusOrAchievements();
        this.game.getNavigationBar().resetPending();
        for (const m of MissionManager.getInstance().getMissions()) {
            if (m.missionStarts()) {
                this.forwardingScreen = m.getMissionScreen();
                break;
            }
            if (m.isActive()) {
                const t: AliteScreen = m.checkForUpdate();
                if (t != null) {
                    this.forwardingScreen = t;
                    break;
                }
            }
        }
        if (!Settings.hasBeenPlayedBefore && this.game.getGenerator().getCurrentGalaxy() === 1) {
            const player: Player = this.game.getPlayer();
            if (player.getCurrentSystem() != null && player.getCurrentSystem().getIndex() === SystemData.LAVE_SYSTEM_INDEX) {
                this.showModalQuestionDialog(L.string(R.string.intro_new_player, AliteConfig.GAME_NAME));
                this.requireAnswer = true;
                Settings.hasBeenPlayedBefore = true;
                Settings.save(this.game.getFileIO());
            }
        }
    }

    private drawInformation(g: Graphics): void {
        const player: Player = this.game.getPlayer();

        g.drawText(L.string(R.string.status_present_system), 40, 150, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_hyperspace), 40, 195, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_condition), 40, 240, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_legal_status), 40, 285, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_rating), 40, 330, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_fuel), 40, 375, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.status_cash), 40, 420, ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
        const activeMissions: Mission[] = MissionManager.getInstance().getActiveMissions();
        if (activeMissions.length > 0) {
            g.drawText(L.string(R.string.status_mission_objective), 795, 150,
                ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT), Assets.regularFont);
            this.displayText(g, this.computeTextDisplay(g, activeMissions[0].getObjective(), 795, 195,
                AliteConfig.DESKTOP_WIDTH - 795, ColorScheme.get(ColorScheme.COLOR_MISSION_OBJECTIVE)));
        }

        if (player.getCurrentSystem() != null) {
            g.drawText(player.getCurrentSystem().getName(), 400, 150,
                ColorScheme.get(ColorScheme.COLOR_CURRENT_SYSTEM_NAME), Assets.regularFont);
        }
        if (player.getHyperspaceSystem() != null) {
            g.drawText(player.getHyperspaceSystem().getName(), 400, 195,
                ColorScheme.get(ColorScheme.COLOR_HYPERSPACE_SYSTEM_NAME), Assets.regularFont);
        }
        g.drawText(player.getCondition().getName(), 400, 240, player.getCondition().getColor(), Assets.regularFont);
        g.drawText(player.getLegalStatus().getName(), 400, 285, ColorScheme.get(ColorScheme.COLOR_LEGAL_STATUS), Assets.regularFont);
        g.drawText(player.getRating().getName() + L.string(R.string.status_score, player.getScore()),
            400, 330, ColorScheme.get(ColorScheme.COLOR_RATING), Assets.regularFont);
        g.drawText(L.getOneDecimalFormatString(R.string.status_fuel_value, player.getCobra().getFuel()), 400, 375,
            ColorScheme.get(ColorScheme.COLOR_REMAINING_FUEL), Assets.regularFont);
        g.drawText(L.getOneDecimalFormatString(R.string.cash_amount_value_currency, player.getCash()), 400, 420,
            ColorScheme.get(ColorScheme.COLOR_BALANCE), Assets.regularFont);
        if (!(this.game.getCurrentScreen() instanceof FlightScreen)) {
            g.drawUnderlinedText(L.string(R.string.status_visit_web_page, AliteConfig.ALITE_WEBSITE), 50, 1050,
                ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
        }
    }

    private drawLasers(g: Graphics): void {
        const cobra: PlayerCobra = this.game.getCobra();

        const lineColor: number = ColorScheme.get(ColorScheme.COLOR_ARROW);
        const textColor: number = ColorScheme.get(ColorScheme.COLOR_EQUIPMENT_DESCRIPTION);

        const front: Equipment = cobra.getLaser(PlayerCobra.DIR_FRONT);
        if (front != null) {
            g.drawText(front.getShortName(), StatusScreen.SHIP_X + 630, StatusScreen.SHIP_Y - 20, textColor, Assets.smallFont);
            const halfWidth: number = g.getTextWidth(front.getShortName(), Assets.smallFont) >> 1;
            g.drawLine(StatusScreen.SHIP_X + 630 + halfWidth, StatusScreen.SHIP_Y - 10, StatusScreen.SHIP_X + 630 + halfWidth, StatusScreen.SHIP_Y + 20, lineColor);
            g.drawArrow(StatusScreen.SHIP_X + 630 + halfWidth, StatusScreen.SHIP_Y + 20, StatusScreen.SHIP_X + 490, StatusScreen.SHIP_Y + 20, lineColor, Graphics.ArrowDirection.LEFT);
        }
        const back: Equipment = cobra.getLaser(PlayerCobra.DIR_REAR);
        if (back != null) {
            g.drawText(back.getShortName(), StatusScreen.SHIP_X + 130, StatusScreen.SHIP_Y + 620, textColor, Assets.smallFont);
            const halfWidth: number = g.getTextWidth(back.getShortName(), Assets.smallFont) >> 1;
            g.drawLine(StatusScreen.SHIP_X + 130 + halfWidth, StatusScreen.SHIP_Y + 580, StatusScreen.SHIP_X + 130 + halfWidth, StatusScreen.SHIP_Y + 590, lineColor);
            g.drawLine(StatusScreen.SHIP_X + 130 + halfWidth, StatusScreen.SHIP_Y + 580, StatusScreen.SHIP_X + 480, StatusScreen.SHIP_Y + 580, lineColor);
            g.drawArrow(StatusScreen.SHIP_X + 480, StatusScreen.SHIP_Y + 580, StatusScreen.SHIP_X + 480, StatusScreen.SHIP_Y + 550, lineColor, Graphics.ArrowDirection.UP);
        }
        const right: Equipment = cobra.getLaser(PlayerCobra.DIR_RIGHT);
        if (right != null) {
            g.drawText(right.getShortName(), StatusScreen.SHIP_X + 1000, StatusScreen.SHIP_Y + 420, textColor, Assets.smallFont);
            const halfWidth: number = g.getTextWidth(right.getShortName(), Assets.smallFont) >> 1;
            g.drawLine(StatusScreen.SHIP_X + 1000 + halfWidth, StatusScreen.SHIP_Y + 390, StatusScreen.SHIP_X + 1000 + halfWidth, StatusScreen.SHIP_Y + 370, lineColor);
            g.drawArrow(StatusScreen.SHIP_X + 940, StatusScreen.SHIP_Y + 370, StatusScreen.SHIP_X + 1000 + halfWidth, StatusScreen.SHIP_Y + 370, lineColor, Graphics.ArrowDirection.LEFT);
        }
        const left: Equipment = cobra.getLaser(PlayerCobra.DIR_LEFT);
        if (left != null) {
            g.drawText(left.getShortName(), StatusScreen.SHIP_X - 250, StatusScreen.SHIP_Y + 420, textColor, Assets.smallFont);
            const halfWidth: number = g.getTextWidth(left.getShortName(), Assets.smallFont) >> 1;
            g.drawLine(StatusScreen.SHIP_X - 250 + halfWidth, StatusScreen.SHIP_Y + 390, StatusScreen.SHIP_X - 250 + halfWidth, StatusScreen.SHIP_Y + 370, lineColor);
            g.drawArrow(StatusScreen.SHIP_X + 20, StatusScreen.SHIP_Y + 370, StatusScreen.SHIP_X - 250 + halfWidth, StatusScreen.SHIP_Y + 370, lineColor, Graphics.ArrowDirection.RIGHT);
        }
    }

    private drawEquipment(g: Graphics): void {
        const installedEquipment: Equipment[] = this.game.getCobra().getInstalledEquipment();
        const cobra: PlayerCobra = this.game.getCobra();
        const missileCount: number = cobra.getMissiles();

        let counter: number = 0;
        const beginY: number = missileCount > 0 ? StatusScreen.SHIP_Y + 140 : StatusScreen.SHIP_Y + 170;
        for (const equip of installedEquipment) {
            g.drawText(equip.getShortName(), StatusScreen.SHIP_X + 980, beginY - counter * 30,
                ColorScheme.get(ColorScheme.COLOR_EQUIPMENT_DESCRIPTION), Assets.smallFont);
            g.drawLine(StatusScreen.SHIP_X + 960, beginY - 12 - counter * 30, StatusScreen.SHIP_X + 930, beginY - 12 - counter * 30,
                ColorScheme.get(ColorScheme.COLOR_ARROW));
            g.drawLine(StatusScreen.SHIP_X + 930, beginY - 12 - counter * 30, StatusScreen.SHIP_X + 930, beginY + 24 - counter * 30,
                ColorScheme.get(ColorScheme.COLOR_ARROW));
            counter++;
        }
        if (missileCount > 0) {
            g.drawText(L.string(R.string.status_missiles_count, missileCount), StatusScreen.SHIP_X + 980, StatusScreen.SHIP_Y + 170,
                ColorScheme.get(ColorScheme.COLOR_EQUIPMENT_DESCRIPTION), Assets.smallFont);
            g.drawLine(StatusScreen.SHIP_X + 960, beginY + 18, StatusScreen.SHIP_X + 930, beginY + 18, ColorScheme.get(ColorScheme.COLOR_ARROW));
        }
        if (missileCount > 0 || installedEquipment.length > 0) {
            g.drawLine(StatusScreen.SHIP_X + 930, beginY + 18, StatusScreen.SHIP_X + 930, StatusScreen.SHIP_Y + 200, ColorScheme.get(ColorScheme.COLOR_ARROW));
            g.drawArrow(StatusScreen.SHIP_X + 780, StatusScreen.SHIP_Y + 200, StatusScreen.SHIP_X + 930, StatusScreen.SHIP_Y + 200,
                ColorScheme.get(ColorScheme.COLOR_ARROW), Graphics.ArrowDirection.LEFT);
        }
    }

    public static getGameTime(gameTime: number): string {
        let diffInSeconds: number = gameTime / 1e9; // nanoseconds to seconds
        const diffInDays: number = Math.floor(diffInSeconds / 86400);
        diffInSeconds -= diffInDays * 86400;
        const diffInHours: number = Math.floor(diffInSeconds / 3600);
        diffInSeconds -= diffInHours * 3600;
        const diffInMinutes: number = Math.floor(diffInSeconds / 60);
        diffInSeconds -= diffInMinutes * 60;
        return StringUtil.format("%02d:%02d:%02d:%02d", diffInDays, diffInHours, diffInMinutes, Math.floor(diffInSeconds));
    }

    private drawGameTime(g: Graphics): void {
        g.drawRect(StatusScreen.SHIP_X + 800, StatusScreen.SHIP_Y + 570, 300, 100, ColorScheme.get(ColorScheme.COLOR_MESSAGE));
        let halfWidth: number = g.getTextWidth(L.string(R.string.status_game_time), Assets.regularFont) >> 1;
        g.drawText(L.string(R.string.status_game_time), StatusScreen.SHIP_X + 800 + 150 - halfWidth, StatusScreen.SHIP_Y + 610,
            ColorScheme.get(ColorScheme.COLOR_MESSAGE), Assets.regularFont);
        const text: string = StatusScreen.getGameTime(this.game.getGameTime());
        halfWidth = g.getTextWidth(text, Assets.regularFont) >> 1;
        g.drawText(text, StatusScreen.SHIP_X + 800 + 150 - halfWidth, StatusScreen.SHIP_Y + 650, ColorScheme.get(ColorScheme.COLOR_MESSAGE), Assets.regularFont);
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        if (this.forwardingScreen != null) {
            this.newScreen = this.forwardingScreen;
            this.forwardingScreen = null;
            this.performScreenChange();
            this.postScreenChange();
        }
    }

    public processTouch(touch: TouchEvent): void {
        if (touch.type === TouchEvent.TOUCH_UP) {
            if (!(this.game.getCurrentScreen() instanceof FlightScreen)) {
                if (touch.x > 30 && touch.x < 960 && touch.y > 1020) {
                    if (Medal.changeGameLevelValue(Medal.MEDAL_ID_WEB_SITE_VISITED, 1)) {
                        Settings.save(this.game.getFileIO());
                        this.game.updateMedals();
                    }
                    window.open(AliteConfig.ALITE_WEBSITE, '_blank');
                }
            }
        }
        if (this.requireAnswer && this.messageResult !== AliteScreen.RESULT_NONE) {
            this.requireAnswer = false;
            if (this.messageResult === AliteScreen.RESULT_YES) {
                this.newScreen = new ControlOptionsScreen(!this.pendingShowControlOptions);
            } else if (!this.pendingShowControlOptions) {
                this.showLargeModalQuestionDialog(L.string(R.string.intro_new_player_info));
                this.requireAnswer = true;
                this.pendingShowControlOptions = true;
            }
            this.messageResult = AliteScreen.RESULT_NONE;
        }
    }

    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        const player: Player = this.game.getPlayer();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string(R.string.title_status, StringUtil.toUpperFirstCase(player.getName())));
        if (StatusScreen.cobra == null) {
            this.loadAssets();
        } else {
            g.drawPixmap(StatusScreen.cobra, StatusScreen.SHIP_X, StatusScreen.SHIP_Y);
        }

        this.drawInformation(g);
        this.drawEquipment(g);
        this.drawLasers(g);
        this.drawGameTime(g);
    }

    public dispose(): void {
        super.dispose();
        if (StatusScreen.cobra != null) {
            StatusScreen.cobra.dispose();
            StatusScreen.cobra = null;
        }
    }

    public loadAssets(): void {
        if (StatusScreen.cobra != null) {
            StatusScreen.cobra.dispose();
        }
        StatusScreen.cobra = this.game.getGraphics().newPixmap("cobra_small.png");
        super.loadAssets();
    }

    public getScreenCode(): number {
        return ScreenCodes.STATUS_SCREEN;
    }
}
