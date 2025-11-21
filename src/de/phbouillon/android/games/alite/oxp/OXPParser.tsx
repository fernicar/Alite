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

import { AliteLog } from "../AliteLog";
import { BuildConfig } from "../BuildConfig";
import { L } from "../L";
import { Equipment } from "../model/Equipment";
import { EquipmentStore } from "../model/EquipmentStore";
import { Repository } from "../model/Repository";
import { EngineExhaust } from "../screens/opengl/ingame/EngineExhaust";
import { AIMethod, SpaceObject } from "../screens/opengl/objects/space";
import { SpaceObjectFactory } from "../screens/opengl/objects/space/SpaceObjectFactory";
import { FileIO } from "../../framework/FileIO";
import { ResourceStream } from "../../framework/ResourceStream";
import { Vector3f } from "../../framework/math/Vector3f";
import { NSArray, NSDictionary, NSObject, NSNumber, NSString, PropertyListParser } from "../../..//com/dd/plist";


export class OXPParser {
    public static readonly DIRECTORY_CONFIG = "Config/";
    private static readonly FILE_DEMO_SHIPS = OXPParser.DIRECTORY_CONFIG + "demoships.plist";
    // ... (other file constants)

    private readonly pluginName: string;
    private installedPlugins: OXPParser[];
    // ... (other properties)
    private repoHandler: Repository<ManifestProperty> = new Repository<ManifestProperty>();

    constructor(fileIO: FileIO, pluginName: string, installedPlugins: OXPParser[]);
    constructor(pluginName: string, inputStreamMethod: ResourceStream, listerMethod: (dir: string) => string[]);
    constructor(...args: any[]) {
        if (args.length === 3 && typeof args[0] === 'object') {
            const [fileIO, pluginName, installedPlugins] = args as [FileIO, string, OXPParser[]];
            this.pluginName = pluginName;
            this.installedPlugins = installedPlugins;
            // ... (logic for zip/directory handling)
        } else {
            const [pluginName, inputStreamMethod, listerMethod] = args as [string, ResourceStream, (dir: string) => string[]];
            this.pluginName = pluginName;
            this.inputStreamMethod = inputStreamMethod;
            this.listerMethod = listerMethod;
            this.isPluginFile = true;
        }
        if (this.isPluginFile) {
            this.repoHandler.setProperty(ManifestProperty.title, this.getPluginName());
        }
    }
    private inputStreamMethod: ResourceStream;
    private listerMethod: (dir: string) => string[];
    private isPluginFile: boolean;


    public async isPlugged(): Promise<boolean> {
        await this.plug();
        return this.plugged;
    }

    private async plug(): Promise<void> {
        if (!this.isPluginFile) return;

        AliteLog.d("Loading plugin", `Loading plugin ${this.pluginName}`);

        try {
            // In web, parsing plist would be async
            // await this.readManifestFileProperties();
            // ... (and so on for all read* methods)
        } catch (e) {
            if (this.manifestRequired) throw e;
        }
    }


    // ... (rest of the OXPParser methods converted to async TypeScript)
    private getRequiredString(dict: NSDictionary, property: string, fileName: string): string {
        return Repository.throwIfMissing(fileName, property, this.getString(dict, property));
    }
    private getString(dict: NSDictionary, property: string): string {
        const value = dict?.get(property) as NSString;
        return value?.getContent();
    }
    private getNumber(value: NSNumber): number | string {
        return value ? (value.isReal() ? value.doubleValue_() : value.longValue_()) : "";
    }
    public getIdentifier(): string { return this.repoHandler.getStringProperty(ManifestProperty.identifier); }
    public getVersion(): string { return this.repoHandler.getStringProperty(ManifestProperty.version); }


}

enum ManifestProperty {
    identifier,
    required_oolite_version,
    title,
    version,
    category,
    description,
    download_url,
    author,
    file_size,
    information_url,
    license,
    maximum_oolite_version,
    tags,
    conflict_oxps,
    optional_oxps,
    requires_oxps
}
