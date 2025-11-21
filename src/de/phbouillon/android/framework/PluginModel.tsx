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

import { FileIO } from "./FileIO";
import { Plugin } from "./Plugin";
import { PluginManager } from "./PluginManager";
import { AliteLog } from "../games/alite/AliteLog";

// NOTE: This is a heavily stubbed version. A full port would require replacing
// Google Drive APIs with a different backend, and JSON parsing would be native.

export class PluginModel {
    public static readonly DIRECTORY_LOCALES = "locales/";
    public static readonly DIRECTORY_PLUGINS = "plugins/";

    private fileIO: FileIO;
    private metaFileName: string;

    private serverFiles: Map<string, Plugin>;
    private metaInfo: Map<string, Plugin>;
    private localFiles: Map<string, any>; // Using `any` for `File` stub

    constructor(fileIO: FileIO, metaFileName: string) {
        this.fileIO = fileIO;
        this.metaFileName = metaFileName;
        this.metaInfo = this.readMetaFile();
    }

    public setServerFiles(serverFiles: Map<string, Plugin>): this {
        this.serverFiles = serverFiles;
        return this;
    }

    public getOrderedListOfPlugins(): Plugin[] {
        const pluginList = Array.from(this.metaInfo.values());
        pluginList.sort((c1, c2) => c1.filename.localeCompare(c2.filename));
        return pluginList;
    }

    private readMetaFile(): Map<string, Plugin> {
        const meta = new Map<string, Plugin>();
        try {
            // const content = new TextDecoder().decode(this.fileIO.readFileContents(this.metaFileName));
            // const scheme = JSON.parse(content);
            // const files = scheme.items;
            // for (const file of files) {
            //     meta.set(file.filename, new Plugin(
            //         file.fileId, file.folder, file.filename, file.size,
            //         new Date(file.modifiedTime).getTime(), file.description,
            //         file.status, file.removalReason, new Date(file.downloadTime).getTime()
            //     ));
            // }
             console.warn("readMetaFile is stubbed. File content is not actually read.");
        } catch (e) {
            AliteLog.e("Plugin meta info load", "Loading meta info of plugins failed.", e);
        }
        return meta;
    }

    // ... other methods like checkPluginFiles, checkLocalFiles, checkServerFiles, etc.
    // would be converted here. They are complex and rely on the unimplemented stubs,
    // so they are omitted for this focused conversion task.

    public pluginsVisited(): void {
        for (const m of this.metaInfo.values()) {
            if (m.status === Plugin.META_STATUS_NEW) m.status = Plugin.META_STATUS_DOWNLOADABLE;
            else if (m.status === Plugin.META_STATUS_UPGRADED) m.status = Plugin.META_STATUS_INSTALLED;
        }
        this.saveRefreshedMetaFile();
    }

    public countNewAndUpgraded(): number {
        let count = 0;
        for (const m of this.metaInfo.values()) {
            if ([Plugin.META_STATUS_NEW, Plugin.META_STATUS_UPGRADED, Plugin.META_STATUS_OUTDATED].includes(m.status)) {
                count++;
            }
        }
        return count;
    }

    public removePlugin(plugin: Plugin, removalReason: string): void {
        // const path = (PluginModel.DIRECTORY_LOCALES === `${plugin.folder}/` ? PluginModel.DIRECTORY_LOCALES : PluginModel.DIRECTORY_PLUGINS) + plugin.filename;
        // if (this.fileIO.deleteFile(path)) {
        //     plugin.status = Plugin.META_STATUS_REMOVED;
        //     plugin.removalReason = removalReason;
        //     this.saveRefreshedMetaFile();
        // }
        console.warn("removePlugin is stubbed.");
    }

    public downloadedPlugin(plugin: Plugin): void {
        plugin.status = Plugin.META_STATUS_INSTALLED;
        plugin.removalReason = null;
        plugin.downloadTime = Date.now();
        this.saveRefreshedMetaFile();
    }

    private saveRefreshedMetaFile(): void {
        try {
            // const items = Array.from(this.metaInfo.values()).map(m => ({
            //     fileId: m.fileId,
            //     folder: m.folder,
            //     filename: m.filename,
            //     size: m.size,
            //     modifiedTime: new Date(m.modifiedTime).toISOString(),
            //     description: m.description,
            //     status: m.status,
            //     removalReason: m.removalReason,
            //     downloadTime: new Date(m.downloadTime).toISOString(),
            // }));
            // const json = { items };
            // const jsonString = JSON.stringify(json, null, 2);
            // // this.fileIO.writeFile logic here...
            console.warn("saveRefreshedMetaFile is stubbed. Meta file not saved.");
        } catch (e) {
            AliteLog.e("Plugin meta info save", "Saving meta info of plugins failed", e);
        }
    }

}
