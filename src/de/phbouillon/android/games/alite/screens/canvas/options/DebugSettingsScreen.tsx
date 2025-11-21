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


import { Assets } from "../../../Assets";
import { Button } from "../../../Button";
import { L } from "../../../L";
import { R } from "../../../R";
import { ScreenCodes } from "../../../ScreenCodes";
import { Settings } from "../../../Settings";
import { SoundManager } from "../../../SoundManager";
import { ColorScheme } from "../../../colors/ColorScheme";
import { EquipmentStore } from "../../../model/EquipmentStore";
import { Player } from "../../../model/Player";
import { Rating } from "../../../model/Rating";
import { AliteScreen } from "../AliteScreen";
import { MoreDebugSettingsScreen } from "./MoreDebugSettingsScreen";
import { Graphics } from "../../../../../framework/Graphics";
import { TouchEvent } from "../../../../../framework/Input";


//This screen never needs to be serialized, as it is not part of the InGame state.
export class DebugSettingsScreen extends AliteScreen {
    private logToFile: Button;
    private memDebug: Button;
    private showFrameRate: Button;
    private showDockingDebug: Button;
    private adjustCredits: Button;
    private adjustLegalStatus: Button;
    private adjustScore: Button;
    private addDockingComputer: Button;
    private unlimitedFuel: Button;
    private arriveInSafeZone: Button;
    private disableAttackers: Button;
    private disableTraders: Button;
    private invulnerable: Button;
    private laserDoesNotOverheat: Button;
    private more: Button;

    public constructor() {
        super();
        this.game.getPlayer().setCheater(true);
    }

    private formatCash(): string {
        const player: Player = this.game.getPlayer();
        return L.getOneDecimalFormatString(R.string.cash_amount_value_ccy, player.getCash());
    }

    public activate(): void {
        this.logToFile = Button.createGradientTitleButton(50, 130, 780, 100, L.string(R.string.debug_settings_log_to_file,
            L.string(Settings.logToFile ? R.string.options_yes : R.string.options_no)));
        this.memDebug = Button.createGradientTitleButton(890, 130, 780, 100, L.string(R.string.debug_settings_mem_debug,
            L.string(Settings.memDebug ? R.string.options_yes : R.string.options_no)));

        this.showFrameRate = Button.createGradientTitleButton(50, 250, 780, 100,
            L.string(R.string.debug_settings_show_frame_rate, L.string(Settings.displayFrameRate ? R.string.options_yes : R.string.options_no)));
        this.invulnerable = Button.createGradientTitleButton(890, 250, 780, 100,
            L.string(R.string.debug_settings_invulnerable, L.string(Settings.invulnerable ? R.string.options_yes : R.string.options_no)));
        this.showDockingDebug = Button.createGradientTitleButton(50, 370, 780, 100,
            L.string(R.string.debug_settings_show_docking_debug, L.string(Settings.displayDockingInformation ? R.string.options_yes : R.string.options_no)));
        this.laserDoesNotOverheat = Button.createGradientTitleButton(890, 370, 780, 100,
            L.string(R.string.debug_settings_laser_does_not_overheat, L.string(Settings.laserDoesNotOverheat ? R.string.options_no : R.string.options_yes)));
        this.adjustCredits = Button.createGradientTitleButton(50, 490, 780, 100,
            L.string(R.string.debug_settings_adjust_credits, this.formatCash()));
        this.arriveInSafeZone = Button.createGradientTitleButton(890, 490, 780, 100,
            L.string(R.string.debug_settings_arrive_in_safe_zone, L.string(Settings.enterInSafeZone ? R.string.options_yes : R.string.options_no)));
        this.adjustLegalStatus = Button.createGradientTitleButton(50, 610, 780, 100,
            L.string(R.string.debug_settings_adjust_legal_status, this.game.getPlayer().getLegalStatus().getName(), this.game.getPlayer().getLegalValue()));
        this.disableAttackers = Button.createGradientTitleButton(890, 610, 780, 100,
            L.string(R.string.debug_settings_disable_attackers, L.string(Settings.disableAttackers ? R.string.options_yes : R.string.options_no)));
        this.adjustScore = Button.createGradientTitleButton(50, 730, 780, 100,
            L.string(R.string.debug_settings_adjust_score, this.game.getPlayer().getScore()));
        this.disableTraders = Button.createGradientTitleButton(890, 730, 780, 100,
            L.string(R.string.debug_settings_disable_traders, L.string(Settings.disableTraders ? R.string.options_yes : R.string.options_no)));
        this.addDockingComputer = Button.createGradientTitleButton(50, 850, 780, 100,
            L.string(R.string.debug_settings_add_docking_computer));
        this.unlimitedFuel = Button.createGradientTitleButton(890, 850, 780, 100,
            L.string(R.string.debug_settings_unlimited_fuel, L.string(Settings.unlimitedFuel ? R.string.options_yes : R.string.options_no)));
        this.more = Button.createGradientTitleButton(50, 970, 1620, 100, L.string(R.string.debug_settings_button_more));
    }

    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string(R.string.title_debug_options));

        this.logToFile.render(g);
        this.memDebug.render(g);
        this.showFrameRate.render(g);
        this.invulnerable.render(g);
        this.showDockingDebug.render(g);
        this.laserDoesNotOverheat.render(g);
        this.adjustCredits.render(g);
        this.arriveInSafeZone.render(g);
        this.adjustLegalStatus.render(g);
        this.disableAttackers.render(g);
        this.adjustScore.render(g);
        this.disableTraders.render(g);
        this.addDockingComputer.render(g);
        this.unlimitedFuel.render(g);
        this.more.render(g);
    }

    protected processTouch(touch: TouchEvent): void {
        if (touch.type !== TouchEvent.TOUCH_UP) {
            return;
        }
        if (this.logToFile.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.logToFile = !Settings.logToFile;
            this.logToFile.setText(L.string(R.string.debug_settings_log_to_file,
                L.string(Settings.logToFile ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.memDebug.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.memDebug = !Settings.memDebug;
            this.memDebug.setText(L.string(R.string.debug_settings_mem_debug, L.string(Settings.memDebug ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.showFrameRate.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.displayFrameRate = !Settings.displayFrameRate;
            this.showFrameRate.setText(L.string(R.string.debug_settings_show_frame_rate, L.string(Settings.displayFrameRate ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.invulnerable.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.invulnerable = !Settings.invulnerable;
            this.invulnerable.setText(L.string(R.string.debug_settings_invulnerable, L.string(Settings.invulnerable ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.showDockingDebug.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.displayDockingInformation = !Settings.displayDockingInformation;
            this.showDockingDebug.setText(L.string(R.string.debug_settings_show_docking_debug, L.string(Settings.displayDockingInformation ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.laserDoesNotOverheat.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.laserDoesNotOverheat = !Settings.laserDoesNotOverheat;
            this.laserDoesNotOverheat.setText(L.string(R.string.debug_settings_laser_does_not_overheat, L.string(Settings.laserDoesNotOverheat ? R.string.options_no : R.string.options_yes)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.adjustCredits.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            this.game.getPlayer().setCash(this.game.getPlayer().getCash() + 10000);
            this.adjustCredits.setText(L.string(R.string.debug_settings_adjust_credits, this.formatCash()));
            return;
        }
        if (this.adjustLegalStatus.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            const player: Player = this.game.getPlayer();
            if (player.getLegalValue() !== 0) {
                player.setLegalValue(player.getLegalValue() >> 1);
            } else {
                player.setLegalValue(255);
            }
            this.adjustLegalStatus.setText(L.string(R.string.debug_settings_adjust_legal_status, this.game.getPlayer().getLegalStatus().getName(), this.game.getPlayer().getLegalValue()));
            return;
        }
        if (this.adjustScore.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            const player: Player = this.game.getPlayer();
            let score: number = player.getScore();
            if (score < Rating.HARMLESS.getScoreThreshold() - 1) {
                score = Rating.HARMLESS.getScoreThreshold() - 1;
            } else if (score < Rating.MOSTLY_HARMLESS.getScoreThreshold() - 1) {
                score = Rating.MOSTLY_HARMLESS.getScoreThreshold() - 1;
            } else if (score < Rating.POOR.getScoreThreshold() - 1) {
                score = Rating.POOR.getScoreThreshold() - 1;
            } else if (score < Rating.AVERAGE.getScoreThreshold() - 1) {
                score = Rating.AVERAGE.getScoreThreshold() - 1;
            } else if (score < Rating.ABOVE_AVERAGE.getScoreThreshold() - 1) {
                score = Rating.ABOVE_AVERAGE.getScoreThreshold() - 1;
            } else if (score < Rating.COMPETENT.getScoreThreshold() - 1) {
                score = Rating.COMPETENT.getScoreThreshold() - 1;
            } else if (score < Rating.DANGEROUS.getScoreThreshold() - 1) {
                score = Rating.DANGEROUS.getScoreThreshold() - 1;
            } else if (score < Rating.DEADLY.getScoreThreshold() - 1) {
                score = Rating.DEADLY.getScoreThreshold() - 1;
            }
            player.setScore(score);
            while (score >= this.game.getPlayer().getRating().getScoreThreshold() && this.game.getPlayer().getRating().getScoreThreshold() > 0) {
                this.game.getPlayer().setRating(Rating.values()[this.game.getPlayer().getRating().ordinal() + 1]);
            }
            this.adjustScore.setText(L.string(R.string.debug_settings_adjust_score, this.game.getPlayer().getScore()));
            return;
        }
        if (this.addDockingComputer.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            this.game.getCobra().addEquipment(EquipmentStore.get().getEquipmentById(EquipmentStore.DOCKING_COMPUTER));
            return;
        }
        if (this.unlimitedFuel.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.unlimitedFuel = !Settings.unlimitedFuel;
            this.unlimitedFuel.setText(L.string(R.string.debug_settings_unlimited_fuel, L.string(Settings.unlimitedFuel ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.arriveInSafeZone.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.enterInSafeZone = !Settings.enterInSafeZone;
            this.arriveInSafeZone.setText(L.string(R.string.debug_settings_arrive_in_safe_zone, L.string(Settings.enterInSafeZone ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.disableAttackers.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.disableAttackers = !Settings.disableAttackers;
            this.disableAttackers.setText(L.string(R.string.debug_settings_disable_attackers, L.string(Settings.disableAttackers ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.disableTraders.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            Settings.disableTraders = !Settings.disableTraders;
            this.disableTraders.setText(L.string(R.string.debug_settings_disable_traders, L.string(Settings.disableTraders ? R.string.options_yes : R.string.options_no)));
            Settings.save(this.game.getFileIO());
            return;
        }
        if (this.more.isTouched(touch.x, touch.y)) {
            SoundManager.play(Assets.click);
            this.newScreen = new MoreDebugSettingsScreen();
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.DEBUG_SCREEN;
    }

}
