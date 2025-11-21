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
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { ButtonRegistry } from "../../ButtonRegistry";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ScrollPane } from "../../ScrollPane";
import { ColorScheme } from "../../colors/ColorScheme";
import { Plugin } from "../../model/Plugin";
import { PluginModel } from "../../model/PluginModel";
import { StringUtil } from "../../model/generator/StringUtil";
import { AliteScreen } from "../AliteScreen";
import { OptionsScreen } from "./options/OptionsScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Point } from "../../../../framework/Point";
import { TextData } from "../../../../framework/TextData";

// Re-defining constants from IDownloaderClient for web
const STATE_IDLE = 1;
const STATE_FETCHING_URL = 2;
const STATE_CONNECTING = 3;
const STATE_DOWNLOADING = 4;
const STATE_COMPLETED = 5;
const STATE_PAUSED_NETWORK_UNAVAILABLE = 6;
const STATE_PAUSED_BY_REQUEST = 7;
const STATE_PAUSED_WIFI_DISABLED_NEED_CELLULAR_PERMISSION = 8;
const STATE_PAUSED_NEED_CELLULAR_PERMISSION = 9;
const STATE_PAUSED_WIFI_DISABLED = 10;
const STATE_PAUSED_NEED_CHARGE = 11;
const STATE_PAUSED_DEVICE_NOT_FOUND = 12;
const STATE_PAUSED_ROAMING = 13;
const STATE_PAUSED_NETWORK_SETUP_FAILURE = 14;
const STATE_PAUSED_SDCARD_UNAVAILABLE = 15;
const STATE_FAILED_UNLICENSED = 16;
const STATE_FAILED_FETCHING_URL = 17;
const STATE_FAILED_SDCARD_FULL = 18;
const STATE_FAILED_CANCELED = 19;
const STATE_FAILED = 20;


// Simple web replacement for DownloadProgressInfo
export class DownloadProgressInfo {
    constructor(
        public mOverallTotal: number,
        public mOverallProgress: number,
        public mTimeRemaining: number,
        public mCurrentSpeed: number
    ) {}
}


//This screen never needs to be serialized, as it is not part of the InGame state.
export class PluginsScreen extends AliteScreen {
    public static readonly PLUGINS_META_FILE = "alite_plugins.json";

    private readonly buttons: Button[] = [];
    private btnBack: Button;
    private pluginModel: PluginModel;
    private plugins: Plugin[];
    private currentPlugin: Plugin;

    private downloadState: number = 0;
    private progress: DownloadProgressInfo;
    private readonly scrollPane: ScrollPane;

    public constructor(yPosition: number) {
        super();
        this.scrollPane = new ScrollPane(0, 100, AliteConfig.DESKTOP_WIDTH, 950,
            () => new Point(AliteConfig.SCREEN_WIDTH, this.getHeight()));
        this.scrollPane.position.y = yPosition;
    }

    public activate(): void {
        this.pluginModel = new PluginModel(this.game.getFileIO(), PluginModel.DIRECTORY_PLUGINS + PluginsScreen.PLUGINS_META_FILE);
        this.plugins = this.pluginModel.getOrderedListOfPlugins();
        this.buildPluginButtons();
        this.btnBack = Button.createGradientRegularButton(1400, 950, 250, 100, L.string(R.string.options_back));
    }

    private buildPluginButtons(): void {
        this.buttons.length = 0; // .clear()
        const g: Graphics = this.game.getGraphics();
        let y: number = 100;
        const width: number = (AliteConfig.SCREEN_WIDTH >> 1) - 150;
        for (const plugin of this.plugins) {
            const description: TextData[] = this.computeTextDisplayWidths(g, plugin.description != null && plugin.description.trim().length > 0 ?
                plugin.description : L.string(R.string.plugins_no_description), 110, 2 * Assets.titleFont.getSize(),
                [width, width, 1300], ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT));
            let removalReason: TextData[] = null;
            if (Plugin.META_STATUS_REMOVED === plugin.status && plugin.removalReason != null && plugin.removalReason.trim().length > 0) {
                removalReason = this.computeTextDisplayWidths(g, L.string(R.string.plugins_removal_reason, plugin.removalReason),
                    110, description[description.length - 1].y + 50, [description.length === 1 ? width : 1300, 1300],
                    ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT));
            }
            const text: TextData[] = new Array(description.length + (removalReason != null ? removalReason.length : 0) + 1);
            description.forEach((td, i) => text[i + 1] = td);
            if (removalReason != null) {
                removalReason.forEach((td, i) => text[description.length + 1 + i] = td);
            }
            text[0] = new TextData(this.getPluginName(plugin), 110, Assets.titleFont.getSize(),
                ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.titleFont);

            const item: Button = Button.createRegularButton(20, y, AliteConfig.DESKTOP_WIDTH - 40, 50 * text.length + 60, null)
                .setTextData(text);
            this.buttons.push(item);
            ButtonRegistry.get().removeButton(this, item);
            const yc: number = y + (item.getHeight() - 110 >> 1);
            this.buttons.push(Button.createPictureButton(1430, yc, 110, 110, this.pics.get("download_icon_small"), 0.85)
                .setPixmapOffset(5, 5)
                .setCommand(AliteScreen.RESULT_YES));
            this.buttons.push(Button.createPictureButton(1560, yc, 110, 110, Assets.noIcon, 0.85)
                .setPixmapOffset(5, 5)
                .setCommand(AliteScreen.RESULT_NO));

            y += item.getHeight() + 20;
        }
    }

    private getPluginName(plugin: Plugin): string {
        return plugin.filename.substring(0, plugin.filename.lastIndexOf('.'));
    }

    private getHeight(): number {
        if (this.buttons.length === 0) {
            return 0;
        }
        const last: Button = this.buttons[this.buttons.length - 1];
        return last.getY() + last.getHeight();
    }

    public saveScreenState(dos: any): void {
        dos.writeInt(this.scrollPane.position.y);
    }

    public update(deltaTime: number): void {
        if (this.downloadState === 0) {
            super.update(deltaTime);
        } else {
            this.updateWithoutNavigation(deltaTime);
        }
        if (this.messageResult === AliteScreen.RESULT_YES) {
            this.pluginModel.removePlugin(this.currentPlugin, this.inputText);
            this.buildPluginButtons(); // required only for change removal reason / description text
        }
        this.messageResult = AliteScreen.RESULT_NONE;
        if (this.downloadState >= STATE_COMPLETED && !this.isMessageDialogActive()) {
            const message: string = L.string(this.downloadState === STATE_COMPLETED ?
                R.string.plugins_download_succeeded : R.string.plugins_download_failed, this.getPluginName(this.currentPlugin));
            AliteLog.d("Extension download", message); // Second part of original log removed for simplicity
            if (this.downloadState === STATE_COMPLETED) {
                this.pluginModel.downloadedPlugin(this.currentPlugin);
                this.buildPluginButtons();
            }
            this.showMessageDialog(message);
        }
    }

    protected processTouch(touch: TouchEvent): void {
        if (this.downloadState >= STATE_COMPLETED && !this.isMessageDialogActive()) {
            this.downloadState = 0;
            this.progress = null;
        }
        if (this.downloadState !== 0) {
            return;
        }

        this.scrollPane.handleEvent(touch);
        if (this.btnBack.isPressed(touch)) {
            this.newScreen = new OptionsScreen();
            return;
        }

        if (this.scrollPane.isSweepingGesture(touch)) {
            return;
        }

        for (let i = 0; i < this.buttons.length; i++) {
            const button: Button = this.buttons[i];
            if (button.isPressed(touch) && button.getCommand() !== 0) {
                this.currentPlugin = this.plugins[Math.floor(i / 3)];
                if (button.getCommand() === AliteScreen.RESULT_NO) {
                    this.popupTextInput(L.string(R.string.plugins_get_removal_reason), "", -1);
                    return;
                }
                this.downloadState = STATE_DOWNLOADING;
                this.progress = new DownloadProgressInfo(1, 0, -1, 0);

                // Replaced Android-specific downloader with a web-based one
                this.game.getPluginManager().downloadFile(this.currentPlugin, this);
                return;
            }
        }
    }

    private getRelativeTimeSpanString(timestamp: number): string {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }


    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(0xFF000000); // Black
        this.displayTitle(L.string(R.string.title_plugins));
        this.btnBack.render(g);

        this.scrollPane.scrollingFree();

        g.setClip(-1, 130, -1, 1000);
        for (let i = 0; i < this.buttons.length; i++) {
            const button: Button = this.buttons[i].setYOffset(-this.scrollPane.position.y);
            const status: string = this.plugins[Math.floor(i / 3)].status;

            switch (i % 3) {
                case 0:
                    button.render(g);
                    g.drawPixmap(this.pics.get(this.getIconName(status)), 45, button.getY() - this.scrollPane.position.y + 20);
                    if (this.downloadState !== 0 && this.plugins[Math.floor(i / 3)] === this.currentPlugin) {
                        this.renderProgressCircle();
                        break;
                    }
                    if (this.isRemovable(status)) {
                        const infoText: string = this.getRelativeTimeSpanString(this.plugins[Math.floor(i / 3)].downloadTime);
                        g.drawText(infoText, 1415 - g.getTextWidth(infoText, Assets.regularFont),
                            button.getY() - this.scrollPane.position.y + Assets.titleFont.getSize(),
                            ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);
                    }

                    if (this.isDownloadable(status)) {
                        const size: number = this.plugins[Math.floor(i / 3)].size;
                        const infoText: string = size > AliteLog.MB ? L.string(R.string.plugins_size_mb, size / AliteLog.MB) :
                            L.string(R.string.plugins_size_kb, size / AliteLog.KB);
                        g.drawText(infoText, 1415 - g.getTextWidth(infoText, Assets.regularFont),
                            button.getY() - this.scrollPane.position.y + 2 * Assets.titleFont.getSize(),
                            ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);
                    }
                    break;

                case 1:
                    button.setVisible(this.isDownloadable(status)).render(g);
                    break;

                case 2:
                    button.setVisible(this.isRemovable(status)).render(g);
                    break;
            }
        }
        g.setClip(-1, -1, -1, -1);
    }

    private getIconName(status: string): string {
        switch (status) {
            case Plugin.META_STATUS_NEW: return "ext_new";
            case Plugin.META_STATUS_DOWNLOADABLE: return "ext_downloadable";
            case Plugin.META_STATUS_INSTALLED: return "ext_installed";
            case Plugin.META_STATUS_UPGRADED: return "ext_upgraded";
            case Plugin.META_STATUS_OUTDATED: return "ext_outdated";
            case Plugin.META_STATUS_NEW_OF_REMOVED: return "ext_new_of_removed";
        }
        return "ext_removed";
    }

    private isDownloadable(status: string): boolean {
        switch (status) {
            case Plugin.META_STATUS_NEW:
            case Plugin.META_STATUS_DOWNLOADABLE:
            case Plugin.META_STATUS_OUTDATED:
            case Plugin.META_STATUS_REMOVED:
            case Plugin.META_STATUS_NEW_OF_REMOVED:
                return true;
        }
        return false;
    }

    private isRemovable(status: string): boolean {
        switch (status) {
            case Plugin.META_STATUS_INSTALLED:
            case Plugin.META_STATUS_UPGRADED:
            case Plugin.META_STATUS_OUTDATED:
                return true;
        }
        return false;
    }

    public loadAssets(): void {
        this.addPictures("download_icon_small", "ext_new", "ext_downloadable", "ext_installed",
            "ext_upgraded", "ext_outdated", "ext_removed", "ext_new_of_removed");
        super.loadAssets();
    }

    public dispose(): void {
        this.pluginModel.pluginsVisited();
        super.dispose();
    }

    public getScreenCode(): number {
        return ScreenCodes.PLUGINS_SCREEN;
    }


    // --- IDownloaderClient implementation for web ---
    public onDownloadStateChanged(newState: number): void {
        this.downloadState = newState;
    }

    public onDownloadProgress(progress: DownloadProgressInfo): void {
        this.progress = progress;
    }

    private renderProgressCircle(): void {
        const progressInPercent: number = (this.progress.mOverallProgress / this.progress.mOverallTotal * 100.0);
        const button: Button = this.buttons[3 * this.plugins.indexOf(this.currentPlugin)];
        const g: Graphics = this.game.getGraphics();
        const r: number = 60;
        const x: number = r + (AliteConfig.SCREEN_WIDTH >> 1);
        const y: number = r + button.getY() - this.scrollPane.position.y + 20;
        g.drawCircle(x, y, r, ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION));

        g.setLineWidth(3);
        g.drawArc(x, y, r, ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT), (3.6 * progressInPercent));
        g.setLineWidth(1);

        const text: string = StringUtil.format("%d%%", progressInPercent);
        g.drawText(text, x - (Assets.regularFont.getWidth(text, 1) >> 1),
            y + (Assets.regularFont.getSize() >> 1) - 10,
            ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);

        g.drawText(L.string(R.string.plugins_download_progress,
            this.progress.mOverallProgress / AliteLog.MB, this.progress.mOverallTotal / AliteLog.MB),
            x + r + 40, button.getY() - this.scrollPane.position.y + Assets.titleFont.getSize(),
            ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);
        g.drawText(L.string(R.string.plugins_download_time,
            this.progress.mCurrentSpeed / AliteLog.KB, (this.progress.mTimeRemaining / 1000.0)),
            x + r + 40, button.getY() - this.scrollPane.position.y + 2 * Assets.titleFont.getSize(),
            ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION), Assets.regularFont);
    }

}
