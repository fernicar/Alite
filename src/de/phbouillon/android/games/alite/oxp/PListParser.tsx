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

import { PropertyListParser } from "../../../../../../../com/dd/plist/PropertyListParser";
import { AliteLog } from "../../AliteLog";
import { ResourceStream } from "../../../../../../framework/ResourceStream";
import { NSDictionary } from "../../../../../../../com/dd/plist/NSDictionary";
import { NSObject } from "../../../../../../../com/dd/plist/NSObject";
import { NSArray } from "../../../../../../../com/dd/plist/NSArray";

export class PListParser {
    private stream: ResourceStream;

    constructor(stream: ResourceStream) {
        this.stream = stream;
    }

    parseFile(fileName: string): NSDictionary {
        return this.parseFileInternal(fileName) as NSDictionary;
    }

    getInputStream(fileName: string): any { // InputStream
        return this.stream.getStream(fileName);
    }

    private parseFileInternal(fileName: string): NSObject {
        try {
            const is = this.stream.getStream(fileName);
            // Assuming PropertyListParser.parse can handle a stream-like object or byte array
            const dictionary = PropertyListParser.parse(is);
            // is.close(); // Not applicable in JS streams in the same way
            return dictionary;
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Error reading PList", e.message, e);
            }
        }
        return null;
    }

    parseArrayFile(fileName: string): NSArray {
        return this.parseFileInternal(fileName) as NSArray;
    }
}
