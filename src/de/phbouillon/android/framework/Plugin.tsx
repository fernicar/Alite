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

import { AliteLog } from "../games/alite/AliteLog";

export class Plugin {
    public static readonly META_STATUS_NEW = "NEW";
    public static readonly META_STATUS_DOWNLOADABLE = "DOWNLOADABLE";
    public static readonly META_STATUS_INSTALLED = "INSTALLED";
    public static readonly META_STATUS_UPGRADED = "UPGRADED";
    public static readonly META_STATUS_OUTDATED = "OUTDATED";
    public static readonly META_STATUS_REMOVED = "REMOVED";
    public static readonly META_STATUS_NEW_OF_REMOVED = "NEW_OF_REMOVED";

    public fileId: string;
    public folder: string;
    public filename: string;
    public size: number;
    public modifiedTime: number;
    public description: string;
    public status: string;
    public removalReason: string;
    public downloadTime: number;

    constructor(fileId: string, folder: string, filename: string, size: number, modifiedTime: number,
        description: string, status: string, removalReason: string, downloadTime: number) {
        this.fileId = fileId;
        this.folder = folder;
        this.filename = filename;
        this.size = size;
        this.modifiedTime = modifiedTime;
        this.description = description;
        this.status = status;
        this.removalReason = removalReason;
        this.downloadTime = downloadTime;

        AliteLog.d("Meta file item creation",
            `fileId:${fileId}, folder:${folder}, filename:${filename}, size:${size}, ` +
            `modifiedTime:${new Date(modifiedTime)}, description:${description}, ` +
            `status:${status}, removalReason:${removalReason}, downloadTime:${new Date(downloadTime)}`);
    }

}
