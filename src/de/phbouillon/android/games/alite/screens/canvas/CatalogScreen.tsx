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
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ColorScheme } from "../../colors/ColorScheme";
import { CommanderData } from "../../model/CommanderData";
import { AliteScreen } from "../AliteScreen";
import { DiskScreen } from "./DiskScreen";
import { StatusScreen } from "./StatusScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";

//This screen never needs to be serialized, as it is not part of the InGame state.
export class CatalogScreen extends AliteScreen {
    protected title: string;
    private readonly button: Button[] = [];
    private commanderData: CommanderData[] = [];
    private btnListForward: Button;
    private btnListBackward: Button;
    private btnBack: Button;
    private deleteButton: Button;
    private currentPage: number = 0;
    private confirmDelete: boolean = false;
    private selectedCommanderData: CommanderData[] = [];
    private pendingSelectionIndices: number[] = null;
    private pendingShowMessage: boolean = false;

    constructor(titleOrDis: string | any) {
        super();
        if (typeof titleOrDis === 'string') {
            this.title = titleOrDis;
        } else {
            // Deserialization logic
            this.title = L.string(R.string.title_catalog);
            this.currentPage = titleOrDis.readInt();
            this.confirmDelete = titleOrDis.readBoolean();
            const selectionCount = titleOrDis.readInt();
            if (selectionCount !== 0) {
                this.pendingSelectionIndices = [];
                for (let i = 0; i < selectionCount; i++) {
                    this.pendingSelectionIndices.push(titleOrDis.readInt());
                }
            }
            this.pendingShowMessage = titleOrDis.readBoolean();
        }
    }


    public async activate(): Promise<void> {
        const commanders = await this.game.getCommanderFiles();
        this.btnListBackward = Button.createGradientRegularButton(1400, 950, 100, 100, "<");
        this.btnListForward = Button.createGradientRegularButton(1550, 950, 100, 100, ">");
        this.btnBack = Button.createGradientRegularButton(1100, 950, 250, 100, L.string(R.string.options_back));

        this.button.length = 0;
        this.commanderData.length = 0;
        if (commanders != null) {
            for (let i = 0; i < commanders.length; i++) {
                const data = await this.game.getQuickCommanderInfo(commanders[i].name);
                if (data != null) {
                    const b = Button.createPictureButton(20, 210 + (i % 5) * 140, 1680, 120,
                        this.pics.get("catalog_button"))
                        .setPushedBackground(this.pics.get("catalog_button_pushed"))
                        .setText("")
                        .setFont(Assets.regularFont);
                    this.button.push(b);
                    this.commanderData.push(data);
                }
            }
        }

        this.commanderData.sort((c1, c2) => {
            if (c1 == null) {
                return c2 == null ? 0 : -1;
            }
            if (c2 == null) {
                return 1;
            }
            // Autosave always comes first
            if (c1.isAutoSaved()) {
                return c2.isAutoSaved() ? this.game.getFileIO().fileLastModifiedDate(c2.getFileName()) -
                    this.game.getFileIO().fileLastModifiedDate(c1.getFileName()) : -1;
            }
            if (c2.isAutoSaved()) {
                return 1;
            }
            const n1: string = c1.getName() == null ? "" : c1.getName();
            const n2: string = c2.getName() == null ? "" : c2.getName();
            const result: number = n1.localeCompare(n2);
            // We want to display longer game times first.
            return result === 0 ? c1.getGameTime() < c2.getGameTime() ? 1 : -1 : result;
        });

        this.deleteButton = Button.createGradientRegularButton(50, 950, 600, 100, L.string(R.string.cmdr_btn_delete_one));
        if (this.pendingSelectionIndices != null) {
            const n: number = this.commanderData.length;
            for (const i of this.pendingSelectionIndices) {
                if (i >= 0 && i < n) {
                    this.selectedCommanderData.push(this.commanderData[i]);
                    this.button[i].setPixmap(this.pics.get("catalog_button_selected")).setSelected(true);
                }
            }
            this.pendingSelectionIndices.length = 0;
        }
        if (this.pendingShowMessage) {
            if (this.selectedCommanderData.length === 1) {
                this.showQuestionDialog(L.string(R.string.cmdr_delete_one_confirm, this.selectedCommanderData[0].getName()));
            } else {
                this.showQuestionDialog(L.string(R.string.cmdr_delete_more_confirm));
            }
            this.pendingShowMessage = false;
        }
        this.confirmDelete = true;
    }

    public saveScreenState(dos: any): void {
        dos.writeInt(this.currentPage);
        dos.writeBoolean(this.confirmDelete);
        dos.writeInt(this.selectedCommanderData.length);
        for (const c of this.selectedCommanderData) {
            dos.writeInt(this.commanderData.indexOf(c));
        }
        dos.writeBoolean(this.isMessageDialogActive());
    }

    protected processTouch(touch: TouchEvent): void {
        if (this.btnBack.isPressed(touch)) {
            this.newScreen = new DiskScreen();
            return;
        }
        if (this.btnListForward.isPressed(touch)) {
            this.currentPage++;
        }
        if (this.btnListBackward.isPressed(touch)) {
            this.currentPage--;
        }
        for (let i = this.currentPage * 5; i < Math.min(this.currentPage * 5 + 5, this.button.length); i++) {
            if (this.button[i].isPressed(touch)) {
                const select: boolean = !this.selectedCommanderData.includes(this.commanderData[i]);
                if (select) {
                    this.selectedCommanderData.push(this.commanderData[i]);
                    this.button[i].setPixmap(this.pics.get("catalog_button_selected"));
                } else {
                    this.selectedCommanderData = this.selectedCommanderData.filter(item => item !== this.commanderData[i]);
                    this.button[i].setPixmap(this.pics.get("catalog_button"));
                }
                this.button[i].setSelected(select);
                if (this.deleteButton != null) {
                    this.deleteButton.setText(this.selectedCommanderData.length > 1 ?
                        L.string(R.string.cmdr_btn_delete_more) : L.string(R.string.cmdr_btn_delete_one));
                }
            }
        }
        if (this.deleteButton != null && this.deleteButton.isPressed(touch) && this.messageResult === AliteScreen.RESULT_NONE) {
            if (this.selectedCommanderData.length === 1) {
                this.showQuestionDialog(L.string(R.string.cmdr_delete_one_confirm, this.selectedCommanderData[0].getName()));
            } else {
                this.showQuestionDialog(L.string(R.string.cmdr_delete_more_confirm));
            }
            this.confirmDelete = true;
        }

        if (touch.type !== TouchEvent.TOUCH_UP) {
            return;
        }
        if (this.confirmDelete && this.messageResult !== AliteScreen.RESULT_NONE) {
            this.confirmDelete = false;
            if (this.messageResult === AliteScreen.RESULT_YES) {
                for (const cd of this.selectedCommanderData) {
                    this.game.getFileIO().deleteFile(cd.getFileName());
                }
                this.newScreen = new CatalogScreen(L.string(R.string.title_catalog));
            }
            this.clearSelection();
            this.messageResult = AliteScreen.RESULT_NONE;
        }
    }

    private clearSelection(): void {
        for (const aButton of this.button) {
            if (aButton.isSelected()) {
                aButton.setPixmap(this.pics.get("catalog_button")).setSelected(false);
            }
        }
        this.selectedCommanderData.length = 0;
    }

    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(this.title);

        g.diagonalGradientRect(20, 100, 1680, 80, ColorScheme.get(ColorScheme.COLOR_BACKGROUND_DARK), ColorScheme.get(ColorScheme.COLOR_BACKGROUND_LIGHT));
        g.rec3d(20, 100, 1680, 800, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));
        g.drawText(L.string(R.string.cmdr_table_name), 50, 160, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        g.drawText(L.string(R.string.cmdr_table_system), 600, 160, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        g.drawText(L.string(R.string.cmdr_table_time), 850, 160, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        g.drawText(L.string(R.string.cmdr_table_score), 1100, 160, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        g.drawText(L.string(R.string.cmdr_table_rating), 1300, 160, ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT), Assets.titleFont);
        g.rec3d(20, 100, 1680, 80, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));
        g.rec3d(590, 100, 3, 800, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));
        g.rec3d(840, 100, 3, 800, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));
        g.rec3d(1090, 100, 3, 800, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));
        g.rec3d(1290, 100, 3, 800, 3, ColorScheme.get(ColorScheme.COLOR_FRAME_LIGHT), ColorScheme.get(ColorScheme.COLOR_FRAME_DARK));

        for (let i = this.currentPage * 5; i < Math.min(this.currentPage * 5 + 5, this.button.length); i++) {
            this.button[i].render(g);
            const data: CommanderData = this.commanderData[i];
            const color: number = ColorScheme.get(i % 2 === 0 ? ColorScheme.COLOR_MESSAGE : ColorScheme.COLOR_MAIN_TEXT);
            let textToDisplay: string = data.getName();
            let suffix: string = "";
            if (data.isAutoSaved()) {
                let no: number = 0;
                if (data.getFileName().includes("1")) {
                    no = 1;
                } else if (data.getFileName().includes("2")) {
                    no = 2;
                }
                textToDisplay = "[" + L.string(R.string.cmdr_file_autosave) + " " + (no + 1) + "] " + data.getName();
            }
            while (g.getTextWidth(textToDisplay + suffix, Assets.regularFont) > 500) {
                textToDisplay = textToDisplay.substring(0, textToDisplay.length - 1);
                suffix = "...";
            }
            g.drawText(textToDisplay + suffix, 50, 285 + (i % 5) * 140, color, Assets.regularFont);
            g.drawText(data.getDockedSystem(), 600, 285 + (i % 5) * 140, color, Assets.regularFont);
            const timeString: string = StatusScreen.getGameTime(data.getGameTime());
            g.drawText(timeString, AliteConfig.SCREEN_HEIGHT - g.getTextWidth(timeString, Assets.regularFont),
                285 + (i % 5) * 140, color, Assets.regularFont);
            g.drawText("" + data.getPoints(), 1280 - g.getTextWidth("" + data.getPoints(), Assets.regularFont),
                285 + (i % 5) * 140, color, Assets.regularFont);
            g.drawText(data.getRating().getName(), 1300, 285 + (i % 5) * 140, color, Assets.regularFont);
        }
        this.btnListBackward.render(g);
        this.btnListForward.render(g);
        this.btnBack.render(g);
        if (this.deleteButton != null) {
            this.deleteButton.render(g);
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
        this.btnListBackward.setVisible(this.currentPage > 0);
        this.btnListForward.setVisible(this.currentPage < (this.button.length - 1) / 5);
        if (this.deleteButton != null) {
            this.deleteButton.setVisible(this.selectedCommanderData.length > 0);
        }
    }

    public loadAssets(): void {
        this.addPictures("catalog_button", "catalog_button_selected", "catalog_button_pushed");
        super.loadAssets();
    }

    public getScreenCode(): number {
        return ScreenCodes.CATALOG_SCREEN;
    }
}
