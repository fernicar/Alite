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

import { AliteConfig } from "./AliteConfig";
import { AliteIntro } from "./AliteIntro";
import { L } from "./L";
import { R } from "./R";
import { AliteLog } from "./AliteLog";
import { Settings } from "./Settings";
import { StringUtil } from "./model/generator/StringUtil";
import { OXPParser } from "./oxp/OXPParser";
import { PluginsScreen } from "./screens/canvas/PluginsScreen";
import { FileIO } from "../framework/FileIO";
import { IMethodHook } from "../framework/IMethodHook";
import { PluginManager } from "../framework/PluginManager";
import { PluginModel } from "../framework/PluginModel";
import { WebFileIO } from "../framework/impl/WebFileIO";

// Note: This class is a conceptual mapping of the Android AliteStartManager.
// The lifecycle (onCreate, etc.) and UI management are simplified for a web context.
// Downloader logic for OBBs is removed as it's not applicable.

export class AliteStartManager {
    public static readonly ALITE_RESULT_CLOSE_ALL = 78615265;
    public static readonly ALITE_STATE_FILE = "current_state.dat";

    private static fileIO: FileIO;
    private onTaskCompleted: IMethodHook;
    private pluginUpdateCheck: boolean;
    private container: HTMLElement; // Represents the main game container div

    constructor(container: HTMLElement) {
        this.container = container;
        if (!AliteStartManager.fileIO) {
            AliteStartManager.fileIO = new WebFileIO(); // Assuming a web implementation of FileIO
        }
    }

    public async start(): Promise<void> {
        AliteLog.initialize(AliteStartManager.fileIO);
        AliteLog.d("AliteStartManager.start", "start begin");

        window.addEventListener('error', (event) => {
            AliteLog.e("Uncaught Exception (AliteStartManager)", `Message: ${event.message}`, event.error);
        });

        await Settings.load(AliteStartManager.fileIO);
        L.getInstance().setLocale(Settings.locale);

        // OBB download check is removed. Assume assets are available.
        this.upgradeAndLoadPlugins();
    }


    private setStatus(status: string): void {
        const statusTextView = this.container.querySelector('#statusTextView');
        if (statusTextView) {
            statusTextView.textContent = status;
        }
    }


    private upgradeAndLoadPlugins(): void {
        this.pluginUpdateCheck = true;
        this.renderLoadingUI();
        this.setStatus(L.string(R.string.notification_download_working));

        const downloadTextView = this.container.querySelector('#downloadTextView');
        if (downloadTextView) {
            downloadTextView.textContent = L.string(R.string.notification_plugins_loading);
        }

        AliteLog.d("Alite Start Manager", "Checking plugins");
        // Plugin update logic would need a web-based equivalent (e.g., fetching a manifest)
        // For now, we'll just load local plugins.

        this.onTaskCompleted = { execute: () => this.startGame() };

        if (downloadTextView) {
            downloadTextView.textContent = L.string(R.string.notification_plugins_loading);
        }

        const pluginLoader = new PluginLoader(this.container, this.onTaskCompleted);
        pluginLoader.execute(); // No AssetManager in web, loader needs to be adapted
    }


    private renderLoadingUI(): void {
        this.container.innerHTML = `
            <div id="startManagerLayout" style="color: white; text-align: center; padding-top: 50px;">
                <h2 id="downloadHeader">${L.string(R.string.download_needed)}</h2>
                <p id="statusTextView">Idle</p>
                <p id="downloadTextView"></p>
                <progress id="downloadProgressBar" value="0" max="100"></progress>
                <p id="downloadProgressPercentTextView">0%</p>
            </div>
        `;
    }

    private startGame(): void {
        AliteLog.d("Alite Start Manager", "Loading Alite State");
        this.loadCurrentGame();
    }

    public static async loadLocaleDependentPlugins(): Promise<void> {
        const pluginLoader = new PluginLoader(null, null);
        await pluginLoader.loadLocaleDependentPlugins();
    }


    private async loadCurrentGame(): Promise<void> {
        try {
            if (await AliteStartManager.fileIO.exists(AliteStartManager.ALITE_STATE_FILE)) {
                AliteLog.d("Alite Start Manager", "Alite state file exists. Starting game.");
                // Logic to check first byte for intro is removed for simplicity and robustness.
                // Always start the main game if a state file exists.
                this.startAlite();
                return;
            }
            AliteLog.d("Alite Start Manager", "No state file present: Starting intro.");
        } catch (e) {
            AliteLog.e("Alite Start Manager", "Exception occurred. Starting intro.", e);
        }
        this.startAliteIntro();
    }


    private startAliteIntro(): void {
        AliteLog.d("Alite Start Manager", "Starting INTRO!");
        this.container.innerHTML = ''; // Clear loading screen
        const intro = new AliteIntro(this.container);
        intro.start();
    }

    private startAlite(): void {
        AliteLog.d("Alite Start Manager", "Starting Alite.");
        this.container.innerHTML = ''; // Clear loading screen
        // The Alite class would be the main game entry point, which we need to instantiate.
        // new Alite(this.container).start();
        // Placeholder until Alite class is converted:
        console.error("Alite class not implemented yet. Cannot start game.");
    }
}


class PluginLoader {
    private container: HTMLElement;
    private onTaskCompleted: IMethodHook;
    private pluginTotal: number = 0;
    private pluginProgress: number = 0;

    constructor(container: HTMLElement, onTaskCompleted: IMethodHook) {
        this.container = container;
        this.onTaskCompleted = onTaskCompleted;
    }

    public async execute(): Promise<void> {
        await this.countPlugins();
        await this.loadPlugins();
        if (this.onTaskCompleted) {
            this.onTaskCompleted.execute(0);
        }
    }

    private async countPlugins(): Promise<void> {
        // In web, we can't easily list assets like in Android.
        // This would be replaced by a manifest file (e.g., plugins.json)
        // that lists all available plugins.
        // For now, let's assume a hardcoded list or that they are discovered.
        this.pluginTotal = 0; // Placeholder
    }

    private async loadPlugins(): Promise<void> {
        // Load bundled plugins (from manifest)
        // Load external plugins (from local storage or server)
        await this.loadLocaleDependentPlugins();
    }


    private updateProgress(pluginName: string): void {
        this.pluginProgress++;
        if (this.container) {
            const textView = this.container.querySelector('#downloadTextView');
            const percentView = this.container.querySelector('#downloadProgressPercentTextView');
            const progressBar = this.container.querySelector('#downloadProgressBar') as HTMLProgressElement;

            if (textView) textView.textContent = L.string(R.string.notification_plugin_loading, pluginName);

            const progressInPercent = this.pluginTotal === 0 ? 100 : Math.round(100 * this.pluginProgress / this.pluginTotal);

            if (percentView) percentView.textContent = `${progressInPercent}%`;
            if (progressBar) progressBar.value = progressInPercent;
        }
    }


    public async loadLocaleDependentPlugins(): Promise<void> {
        // SpaceObjectFactory.getInstance().clearLocaleDependentProperties();
        const locale = L.getInstance().getCurrentLocale();
        // This would fetch and parse plugins specific to the current language
        // e.g., from a path like `/locales/en_US/plugins/`
    }
}
