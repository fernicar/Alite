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

import { Graphics } from "../../../framework/Graphics";
import { TouchEvent } from "../../../framework/Input";
import { Pixmap } from "../../../framework/Pixmap";
import { PluginModel } from "../../../framework/PluginModel";
import { Alite } from "../../Alite";
import { AliteIntro } from "../../AliteIntro";
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { Settings } from "../../Settings";
import { Slider } from "../../Slider";
import { ColorScheme } from "../../colors/ColorScheme";
import { LegalStatus } from "../../model/LegalStatus";
import { Player } from "../../model/Player";
import { PlayerCobra } from "../../model/PlayerCobra";
import { Rating } from "../../model/Rating";
import { EquipmentStore } from "../../model/EquipmentStore";
import { StringUtil } from "../../model/generator/StringUtil";
import { PluginsScreen } from "../PluginsScreen";
import { AboutScreen } from "../opengl/AboutScreen";
import { FlightScreen } from "../opengl/ingame/FlightScreen";
import { AliteScreen } from "../AliteScreen";
import { GameplayOptionsScreen } from "./GameplayOptionsScreen";
import { DisplayOptionsScreen } from "./DisplayOptionsScreen";
import { AudioOptionsScreen } from "./AudioOptionsScreen";
import { ControlOptionsScreen } from "./ControlOptionsScreen";
import { DebugSettingsScreen } from "./DebugSettingsScreen";


export class OptionsScreen extends AliteScreen {
    public static SHOW_DEBUG_MENU = false;
    private static readonly ROW_SIZE = 130;
    private static readonly BUTTON_SIZE = 100;

    private readonly buttons: Button[] = new Array(10);
    private confirmReset = false;

    protected createButton(row: number, text: string): Button {
        return Button.createGradientTitleButton(50, OptionsScreen.ROW_SIZE * (row + 1), 1620, OptionsScreen.BUTTON_SIZE, text);
    }

    protected createSmallButton(row: number, left: boolean, text: string): Button {
        return Button.createGradientTitleButton(left ? 50 : 890, OptionsScreen.ROW_SIZE * (row + 1), 780, OptionsScreen.BUTTON_SIZE, text);
    }

    protected createFloatSlider(row: number, minValue: number, maxValue: number, text: string, currentValue: number): Slider {
        const s = new Slider(50, OptionsScreen.ROW_SIZE * (row + 1), 1620, OptionsScreen.BUTTON_SIZE, minValue, maxValue, currentValue, text, Assets.titleFont);
        s.setScaleTexts(StringUtil.format("%2.1f", minValue), StringUtil.format("%2.1f", maxValue), StringUtil.format("%2.1f", (maxValue + minValue) / 2.0));
        return s;
    }

    public activate(): void {
        this.game.updateMedals();
        L.getInstance().loadLocaleList(Settings.getLocaleFiles(this.game.getFileIO()));

        this.buttons[0] = this.createSmallButton(0, true, L.string(R.string.title_gameplay_options)).setEvent(() => this.newScreen = new GameplayOptionsScreen());
        this.buttons[1] = this.createSmallButton(0, false, L.string(R.string.title_display_options)).setEvent(() => this.newScreen = new DisplayOptionsScreen());
        this.buttons[2] = this.createSmallButton(1, true, L.string(R.string.title_audio_options)).setEvent(() => this.newScreen = new AudioOptionsScreen());
        this.buttons[3] = this.createSmallButton(1, false, L.string(R.string.title_control_options)).setEvent(() => this.newScreen = new ControlOptionsScreen(false));

        this.buttons[4] = this.createSmallButton(2, true, L.string(R.string.options_main_language, L.getInstance().getCurrentLocale().getDisplayLanguage(L.getInstance().getCurrentLocale())))
            .setEvent(() => {
                L.getInstance().setLocale(L.getInstance().getNextLocale());
                this.game.changeLocale();
                Settings.save(this.game.getFileIO());
                this.newScreen = new OptionsScreen();
            });
        this.addPixmapAfterText(this.buttons[4], this.getCountryFlag(L.getInstance().getCurrentLocale().getCountry()));

        const count = new PluginModel(this.game.getFileIO(), `${PluginModel.DIRECTORY_PLUGINS}${PluginsScreen.PLUGINS_META_FILE}`).countNewAndUpgraded();
        this.buttons[5] = this.createSmallButton(2, false, L.string(R.string.title_plugins)).setEvent(() => this.newScreen = new PluginsScreen(0));
        if (count > 0) {
            this.addPixmapToRight(this.buttons[5], this.game.getGraphics().getNotificationNumber(Assets.regularFont, count));
        }

        this.buttons[6] = this.createSmallButton(4, true, OptionsScreen.SHOW_DEBUG_MENU ? L.string(R.string.title_debug_menu) : L.string(R.string.debug_settings_log_to_file, L.string(Settings.logToFile ? R.string.options_yes : R.string.options_no)))
            .setEvent(b => {
                if (OptionsScreen.SHOW_DEBUG_MENU) {
                    this.newScreen = new DebugSettingsScreen();
                } else {
                    Settings.logToFile = !Settings.logToFile;
                    b.setText(L.string(R.string.debug_settings_log_to_file, L.string(Settings.logToFile ? R.string.options_yes : R.string.options_no)));
                    Settings.save(this.game.getFileIO());
                }
            });
        this.buttons[7] = this.createSmallButton(4, false, this.getTutorialModeText()).setEvent(b => {
            Settings.continuousTutorialMode = !Settings.continuousTutorialMode;
            b.setText(this.getTutorialModeText());
            Settings.save(this.game.getFileIO());
        });
        this.buttons[8] = this.createButton(5, L.string(R.string.options_main_reset_game)).setEvent(() => {
            this.showQuestionDialog(L.string(R.string.options_main_reset_game_confirm));
            this.confirmReset = true;
        });
        this.buttons[9] = this.createButton(6, L.string(R.string.options_main_about)).setEvent(() => this.newScreen = new AboutScreen()).setVisible(!(this.game.getCurrentScreen() instanceof FlightScreen));
    }

    private getTutorialModeText(): string {
        return L.string(R.string.options_main_tutorial, L.string(Settings.continuousTutorialMode ? R.string.options_tutorial_mode_continuous : R.string.options_tutorial_mode_tap));
    }

    private getCountryFlag(countryCode: string): Pixmap {
        // This relies on platform-specific font rendering of emoji flags, which may not work everywhere.
        const firstLetter = String.fromCodePoint(countryCode.codePointAt(0) - 0x41 + 0x1F1E6);
        const secondLetter = String.fromCodePoint(countryCode.codePointAt(1) - 0x41 + 0x1F1E6);

        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        ctx.font = '60px sans-serif';
        ctx.fillText(`${firstLetter}${secondLetter}`, 10, 50);

        return this.game.getGraphics().newPixmap(canvas as any, "countryFlag");
    }

    private addPixmapAfterText(b: Button, pixmap: Pixmap): void {
        b.setPixmap(pixmap).setPixmapOffset((b.getWidth() + this.game.getGraphics().getTextWidth(b.getText(), Assets.titleFont) + 10) / 2, (b.getHeight() - pixmap.getHeight()) / 2);
    }

    private addPixmapToRight(b: Button, pixmap: Pixmap): void {
        b.setPixmap(pixmap).setPixmapOffset(b.getWidth() - pixmap.getWidth() - 15, (b.getHeight() - pixmap.getHeight()) / 2);
    }

    public present(deltaTime: number): void {
        const g = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string(R.string.title_options));
        for (const b of this.buttons) {
            if (b) b.render(g);
        }
    }

    public static cycleFromZeroTo(current: number, max: number): number {
        return current < max ? current + 1 : 0;
    }

    protected processTouch(touch: TouchEvent): void {
        if (touch.type === TouchEvent.TOUCH_UP && this.confirmReset && this.messageResult !== AliteScreen.RESULT_NONE) {
            this.confirmReset = false;
            if (this.messageResult === AliteScreen.RESULT_YES) {
                this.resetGame();
            }
            this.messageResult = AliteScreen.RESULT_NONE;
        }

        for (const b of this.buttons) {
            if (b && b.isPressed(touch)) {
                b.onEvent();
                return;
            }
        }
    }

    private resetGame(): void {
        // AndroidGame.resetting = true;
        Settings.introVideoQuality = 255;
        Settings.save(this.game.getFileIO());
        this.game.resetPlayer();
        this.game.updateMedals();
        this.game.setGameTime(0);

        // Debug settings
        if(OptionsScreen.SHOW_DEBUG_MENU) {
            // ... logic to set up a debug state ...
        }

        this.game.getPlayer().addVisitedPlanet();
        // Restart logic needs to be adapted for web, usually a page reload.
        window.location.reload();
    }

    public getScreenCode(): number {
        return ScreenCodes.OPTIONS_SCREEN;
    }
}
