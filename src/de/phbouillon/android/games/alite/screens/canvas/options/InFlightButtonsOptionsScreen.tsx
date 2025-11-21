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

import { AliteLog } from "../../../AliteLog";
import { Assets } from "../../../Assets";
import { Button } from "../../../Button";
import { L } from "../../../L";
import { R } from "../../../R";
import { ScreenCodes } from "../../../ScreenCodes";
import { Settings } from "../../../Settings";
import { ColorScheme } from "../../../colors/ColorScheme";
import { AliteButtons } from "../../opengl/sprites/buttons/AliteButtons";
import { AliteScreen } from "../AliteScreen";
import { ControlOptionsScreen } from "./ControlOptionsScreen";
import { Graphics } from "../../../../../framework/Graphics";
import { TouchEvent } from "../../../../../framework/Input";
import { Pixmap } from "../../../../../framework/Pixmap";
import { SpriteData } from "../../../../../framework/SpriteData";

class ButtonConfigData {
    button: Button;
    groupIndex: number;
    settingsPosition: number;
    name: string;
}

class ButtonConfigGroup {
    buttons: ButtonConfigData[] = new Array(3);
}


//This screen never needs to be serialized, as it is not part of the InGame state.
export class InFlightButtonsOptionsScreen extends AliteScreen {
    private readonly uiButton: ButtonConfigData[] = new Array(12);

    private selectionMode: Button;
    private reset: Button;
    private back: Button;
    private selectedButton: ButtonConfigData = null;
    private readonly buttonGroups: ButtonConfigGroup[] = new Array(4);
    private groupSelectionMode: boolean = true;
    private confirmReset: boolean = false;


    public constructor(groupSelectionMode: boolean = true) {
        super();
        this.groupSelectionMode = groupSelectionMode;
    }

    public activate(): void {
        this.uiButton[Settings.FIRE] = this.createButton(Settings.buttonPosition[Settings.FIRE],
            "fire", Settings.FIRE, L.string(R.string.in_flight_button_fire));
        this.uiButton[Settings.MISSILE] = this.createButton(Settings.buttonPosition[Settings.MISSILE],
            "missile", Settings.MISSILE, L.string(R.string.in_flight_button_missile));
        this.uiButton[Settings.ECM] = this.createButton(Settings.buttonPosition[Settings.ECM],
            "ecm", Settings.ECM, L.string(R.string.in_flight_button_ecm));
        this.uiButton[Settings.RETRO_ROCKETS] = this.createButton(Settings.buttonPosition[Settings.RETRO_ROCKETS],
            "retro_rockets", Settings.RETRO_ROCKETS, L.string(R.string.in_flight_button_retro_rockets));
        this.uiButton[Settings.ESCAPE_CAPSULE] = this.createButton(Settings.buttonPosition[Settings.ESCAPE_CAPSULE],
            "escape_capsule", Settings.ESCAPE_CAPSULE, L.string(R.string.in_flight_button_escape_capsule));
        this.uiButton[Settings.ENERGY_BOMB] = this.createButton(Settings.buttonPosition[Settings.ENERGY_BOMB],
            "energy_bomb", Settings.ENERGY_BOMB, L.string(R.string.in_flight_button_energy_bomb));
        this.uiButton[Settings.STATUS] = this.createButton(Settings.buttonPosition[Settings.STATUS],
            "status", Settings.STATUS, L.string(R.string.in_flight_button_status));
        this.uiButton[Settings.TORUS] = this.createButton(Settings.buttonPosition[Settings.TORUS],
            "torus_docking", Settings.TORUS, L.string(R.string.in_flight_button_drive_docking));
        this.uiButton[Settings.HYPERSPACE] = this.createButton(Settings.buttonPosition[Settings.HYPERSPACE],
            "hyperspace", Settings.HYPERSPACE, L.string(R.string.in_flight_button_hyperspace));
        this.uiButton[Settings.GALACTIC_HYPERSPACE] = this.createButton(Settings.buttonPosition[Settings.GALACTIC_HYPERSPACE],
            "gal_hyperspace", Settings.GALACTIC_HYPERSPACE, L.string(R.string.in_flight_button_galactic_hyperspace));
        this.uiButton[Settings.CLOAKING_DEVICE] = this.createButton(Settings.buttonPosition[Settings.CLOAKING_DEVICE],
            "cloaking_device", Settings.CLOAKING_DEVICE, L.string(R.string.in_flight_button_cloaking_device));
        this.uiButton[Settings.ECM_JAMMER] = this.createButton(Settings.buttonPosition[Settings.ECM_JAMMER],
            "ecm_jammer", Settings.ECM_JAMMER, L.string(R.string.in_flight_button_ecm_jammer));

        this.selectionMode = Button.createGradientTitleButton(50, 860, 1620, 100,
            L.string(R.string.options_in_flight_selection_mode, L.string(this.groupSelectionMode ? R.string.options_in_flight_selection_mode_group : R.string.options_in_flight_selection_mode_button)));
        this.back = Button.createGradientTitleButton(50, 970, 780, 100, L.string(R.string.options_back));
        this.reset = Button.createGradientTitleButton(890, 970, 780, 100, L.string(R.string.options_in_flight_reset_positions));
    }

    private createButton(position: number, spriteName: string, settingsPosition: number, name: string): ButtonConfigData {
        let xt: number;
        let yt: number;
        let groupIndex: number;
        const buttonIndex: number = position % 3;

        if (position < 6) {
            xt = (position % 3 % 2 === 0 ? 0 : 150) + (position < 3 ? 0 : 300);
            groupIndex = position < 3 ? 0 : 1;
        } else {
            xt = (position % 3 % 2 === 0 ? 1500 : 1350) - (position < 9 ? 0 : 300);
            groupIndex = position < 9 ? 2 : 3;
        }
        yt = buttonIndex * 150 + 200;

        const result: Button = Button.createPictureButton(xt, yt, 200, 200, this.pics.get(spriteName));

        const config: ButtonConfigData = new ButtonConfigData();
        config.button = result;
        config.groupIndex = groupIndex;
        config.settingsPosition = settingsPosition;
        config.name = name;
        if (this.buttonGroups[groupIndex] == null) {
            this.buttonGroups[groupIndex] = new ButtonConfigGroup();
        }

        this.buttonGroups[groupIndex].buttons[buttonIndex] = config;

        return config;
    }

    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));

        this.displayTitle(L.string(R.string.title_button_position_options));

        g.drawText(L.string(R.string.options_in_flight_primary), 20, 150, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.options_in_flight_secondary), 320, 150, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.options_in_flight_secondary), 1180, 150, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
        g.drawText(L.string(R.string.options_in_flight_primary), 1480, 150, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.regularFont);
        this.centerText(L.string(this.groupSelectionMode ?
            this.selectedButton == null ? R.string.options_in_flight_source_button_group : R.string.options_in_flight_target_button_group :
            this.selectedButton == null ? R.string.options_in_flight_source_button : R.string.options_in_flight_target_button),
            800, Assets.regularFont, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));

        for (const b of this.uiButton) {
            b.button.render(g);
            if (b.button.isSelected()) {
                g.drawPixmap(this.pics.get("overlay"), b.button.getX(), b.button.getY());
                if (!b.name.includes(";")) {
                    this.centerText(b.name, b.button.getY() + 100, Assets.regularFont, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
                } else {
                    this.centerText(b.name.substring(0, b.name.indexOf(";")), b.button.getY() + 80, Assets.regularFont, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
                    this.centerText(b.name.substring(b.name.indexOf(";") + 1), b.button.getY() + 120, Assets.regularFont, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
                }
            }
        }

        this.selectionMode.render(g);
        this.back.render(g);
        this.reset.render(g);
    }


    private swapSingleButton(src: ButtonConfigData, target: ButtonConfigData): void {
        AliteLog.d("Swapping Buttons", `${src.name}, ${target.name} => ${Settings.buttonPosition[src.settingsPosition]}, ${Settings.buttonPosition[target.settingsPosition]}`);

        // Find and replace buttons in the groups
        let srcIndexInGroup = -1;
        let targetIndexInGroup = -1;
        for (let i = 0; i < 3; i++) {
            if (this.buttonGroups[src.groupIndex]?.buttons[i] === src) srcIndexInGroup = i;
            if (this.buttonGroups[target.groupIndex]?.buttons[i] === target) targetIndexInGroup = i;
        }

        if (srcIndexInGroup !== -1) this.buttonGroups[src.groupIndex].buttons[srcIndexInGroup] = target;
        if (targetIndexInGroup !== -1) this.buttonGroups[target.groupIndex].buttons[targetIndexInGroup] = src;


        const srcValue: number = Settings.buttonPosition[src.settingsPosition];
        const tgtValue: number = Settings.buttonPosition[target.settingsPosition];
        const x: number = src.button.getX();
        const y: number = src.button.getY();
        const x2: number = target.button.getX();
        const y2: number = target.button.getY();
        target.button.move(x, y);
        src.button.move(x2, y2);
        const srcGrp: number = src.groupIndex;
        src.groupIndex = target.groupIndex;
        target.groupIndex = srcGrp;
        Settings.buttonPosition[src.settingsPosition] = tgtValue;
        Settings.buttonPosition[target.settingsPosition] = srcValue;

        AliteLog.d("Swapped Buttons", `${src.name}, ${target.name} => ${Settings.buttonPosition[src.settingsPosition]}, ${Settings.buttonPosition[target.settingsPosition]}`);
    }


    private swapButtons(target: ButtonConfigData): void {
        if (this.groupSelectionMode) {
            if (target.groupIndex !== this.selectedButton.groupIndex) {
                const srcGI: number = this.selectedButton.groupIndex;
                const tGI: number = target.groupIndex;
                const srcGroupButtons = [...this.buttonGroups[srcGI].buttons]; // Create a copy
                const targetGroupButtons = [...this.buttonGroups[tGI].buttons]; // Create a copy
                for (let i = 0; i < 3; i++) {
                    this.swapSingleButton(targetGroupButtons[i], srcGroupButtons[i]);
                }
            }
        } else {
            this.swapSingleButton(this.selectedButton, target);
        }
        for (const b of this.uiButton) {
            b.button.setSelected(false);
        }
        this.selectedButton = null;
        Settings.save(this.game.getFileIO());
    }

    private selectGroup(b: ButtonConfigData): void {
        for (let j = 0; j < 3; j++) {
            this.buttonGroups[b.groupIndex].buttons[j].button.setSelected(true);
        }
    }

    protected processTouch(touch: TouchEvent): void {
        if (this.back.isPressed(touch)) {
            this.newScreen = new ControlOptionsScreen(false);
            return;
        }
        if (this.selectionMode.isPressed(touch)) {
            this.groupSelectionMode = !this.groupSelectionMode;
            this.selectionMode.setText(L.string(R.string.options_in_flight_selection_mode,
                L.string(this.groupSelectionMode ? R.string.options_in_flight_selection_mode_group :
                    R.string.options_in_flight_selection_mode_button)));
            this.selectedButton = null;
            for (const b of this.uiButton) {
                b.button.setSelected(false);
            }
            return;
        }
        if (this.reset.isPressed(touch)) {
            this.showQuestionDialog(L.string(R.string.options_in_flight_reset_positions_confirm));
            this.confirmReset = true;
            return;
        }

        if (touch.type !== TouchEvent.TOUCH_UP) {
            return;
        }
        if (this.confirmReset && this.messageResult !== AliteScreen.RESULT_NONE) {
            this.confirmReset = false;
            if (this.messageResult === AliteScreen.RESULT_YES) {
                for (let i = 0; i < 12; i++) {
                    Settings.buttonPosition[i] = i;
                }
                this.activate();
            }
            this.messageResult = AliteScreen.RESULT_NONE;
            return;
        }
        this.messageResult = AliteScreen.RESULT_NONE;
        for (const b of this.uiButton) {
            if (b.button.isTouched(touch.x, touch.y)) {
                if (this.selectedButton == null) {
                    this.selectedButton = b;
                    if (this.groupSelectionMode) {
                        this.selectGroup(b);
                    } else {
                        b.button.setSelected(true);
                    }
                } else {
                    this.swapButtons(b);
                }
                break;
            }
        }
    }

    public loadAssets(): void {
        this.addPicturesFromAliteButtonsTexture("torus_docking", "hyperspace", "gal_hyperspace",
            "status", "ecm", "escape_capsule", "energy_bomb", "retro_rockets", "ecm_jammer",
            "cloaking_device", "missile", "fire", "overlay");
        super.loadAssets();
    }

    private addPicturesFromAliteButtonsTexture(...spriteNames: string[]): void {
        if (!this.pics.has("buttons")) {
            this.game.getTextureManager().addTexture(AliteButtons.TEXTURE_FILE);
            this.pics.set("buttons", this.game.getGraphics().newPixmap(AliteButtons.TEXTURE_FILE, ""));
        }
        for (const spriteName of spriteNames) {
            const data: SpriteData = this.game.getTextureManager().getSprite(AliteButtons.TEXTURE_FILE, spriteName);
            const pixmap: Pixmap = this.pics.get("buttons");
            // This assumes newPixmap can handle a source pixmap and region, a feature common in 2D graphics libraries
            // and necessary for sprite sheet functionality.
            this.pics.set(spriteName, this.game.getGraphics().newPixmap(pixmap, spriteName,
                data.x * pixmap.getWidth(),
                data.y * pixmap.getHeight(),
                data.origWidth,
                data.origHeight
            ));
        }
    }


    public getScreenCode(): number {
        return ScreenCodes.INFLIGHT_BUTTONS_OPTIONS_SCREEN;
    }

    public saveScreenState(dos: any): void {
        dos.writeBoolean(this.groupSelectionMode);
    }
}
