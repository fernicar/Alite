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

import { FileIO } from "../../../../../../src/de/phbouillon/android/framework/FileIO";

export class TestFileIO implements FileIO {
    public getFileName(fileName: string): string {
        return null;
    }

    public readFile(fileName: string): Promise<any> {
        return Promise.resolve(null);
    }

    public writeFile(fileName: string): Promise<any> {
        return Promise.resolve(null); // In a real test, could use a mock stream
    }

    public appendFile(fileName: string): Promise<any> {
        return Promise.resolve(null);
    }

    public fileLastModifiedDate(fileName: string): number {
        return 0;
    }

    public exists(fileName: string): boolean {
        return false;
    }

    public mkDir(fileName: string): boolean {
        return false;
    }

    public readFileContents(fileName: string, fromOffset?: number): Promise<Uint8Array> {
        return Promise.resolve(new Uint8Array(0));
    }

    public readPartialFileContents(fileName: string, offsetOrLength: number, length?: number): Promise<Uint8Array> {
        return Promise.resolve(new Uint8Array(0));
    }

    public getFiles(directory: string, fileNamePattern: string): any[] {
        return [];
    }

    public deleteFile(fileName: string): boolean {
        return false;
    }

    public copyFile(srcFileName: string, dstFileName: string): Promise<void> {
        return Promise.resolve();
    }

    public zip(zipName: string, ...fileNames: string[]): Promise<void> {
        return Promise.resolve();
    }

    public unzip(zipFile: any, targetDirectory: any): Promise<void> {
        return Promise.resolve();
    }

    public getPrivatePath(fileName: string): Promise<any> {
        return Promise.resolve(null);
    }

    public readPrivateFile(fileName: string): Promise<any> {
        return Promise.resolve(null);
    }

    public existsPrivateFile(fileName: string): boolean {
        return false;
    }

    public readAssetFile(fileName: string): Promise<any> {
        return Promise.resolve(null);
    }

    public existsAssetFile(fileName: string): boolean {
        return false;
    }
}
