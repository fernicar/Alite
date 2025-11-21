/*
 * plist - An open source library to parse and generate property lists
 * Copyright (C) 2011-2014 Daniel Dreibrodt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { NSObject } from "./NSObject";
import { NSArray } from "./NSArray";
import { NSDictionary } from "./NSDictionary";
import { BinaryPropertyListParser } from "./BinaryPropertyListParser";
import { XMLPropertyListParser } from "./XMLPropertyListParser";
import { ASCIIPropertyListParser } from "./ASCIIPropertyListParser";
import { PropertyListFormatException } from "./PropertyListFormatException";
import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";

const TYPE_XML = 0;
const TYPE_BINARY = 1;
const TYPE_ASCII = 2;
const TYPE_ERROR_BLANK = 10;
const TYPE_ERROR_UNKNOWN = 11;


export class PropertyListParser {

    /**
     * Prevent instantiation.
     */
    private constructor() {
        /** empty **/
    }

    /**
     * Determines the type of a property list by means of the first bytes of its data.
     * @param dataBeginning The very first bytes of data of the property list (minus any whitespace) as a string.
     * @returns The type of the property list.
     */
    private static determineType(dataBeginning: string): number {
        dataBeginning = dataBeginning.trim();
        if (dataBeginning.length === 0) {
            return TYPE_ERROR_BLANK;
        }
        if (dataBeginning.startsWith("bplist")) {
            return TYPE_BINARY;
        }
        if (dataBeginning.startsWith("(") || dataBeginning.startsWith("{") || dataBeginning.startsWith("/")) {
            return TYPE_ASCII;
        }
        if (dataBeginning.startsWith("<")) {
            return TYPE_XML;
        }
        return TYPE_ERROR_UNKNOWN;
    }

    /**
     * Determines the type of a property list from a byte array.
     * @param bytes The byte array.
     * @returns The type of the property list.
     */
    private static determineTypeFromBuffer(bytes: ArrayBuffer): number {
        const view = new Uint8Array(bytes);
        let offset = 0;
        if (view.length >= 3 && view[0] === 0xEF && view[1] === 0xBB && view[2] === 0xBF) {
            offset += 3; // Skip BOM
        }
        while (offset < view.length && (view[offset] === 32 || view[offset] === 9 || view[offset] === 13 || view[offset] === 10 || view[offset] === 12)) {
            offset++;
        }
        const firstBytes = new TextDecoder("utf-8").decode(view.slice(offset, Math.min(offset + 8, view.length)));
        return this.determineType(firstBytes);
    }


    public static async parse(data: string | ArrayBuffer): Promise<NSObject> {
        if (typeof data === 'string') {
            const type = this.determineType(data);
            switch (type) {
                case TYPE_XML:
                    return XMLPropertyListParser.parse(data);
                case TYPE_ASCII:
                    return ASCIIPropertyListParser.parse(data);
                default:
                    throw new PropertyListFormatException("The given data is not a property list of a supported format.");
            }
        } else {
            const type = this.determineTypeFromBuffer(data);
            switch (type) {
                case TYPE_BINARY:
                    return BinaryPropertyListParser.parse(data);
                // For XML/ASCII, it's easier to first decode to string
                case TYPE_XML:
                    return XMLPropertyListParser.parse(new TextDecoder("utf-8").decode(data));
                case TYPE_ASCII:
                    return ASCIIPropertyListParser.parse(new TextDecoder("ascii").decode(data));
                default:
                    throw new PropertyListFormatException("The given data is not a property list of a supported format.");
            }
        }
    }


    /**
     * Saves a property list with the given object as root into a XML string.
     * @param root The root object.
     * @returns The XML property list as a string.
     */
    public static saveAsXML(root: NSObject): string {
        return root.toXMLPropertyList();
    }


    /**
     * Saves a property list with the given object as root in binary format into an ArrayBuffer.
     * @param root The root object.
     * @returns The binary property list as an ArrayBuffer.
     */
    public static saveAsBinary(root: NSObject): ArrayBuffer {
        return BinaryPropertyListWriter.write(root);
    }

    /**
     * Saves a property list with the given object as root into an ASCII string.
     * @param root The root object, which must be a NSDictionary or NSArray.
     * @returns The ASCII property list as a string.
     */
    public static saveAsASCII(root: NSDictionary | NSArray): string {
        return root.toASCIIPropertyList();
    }


    /**
     * Saves a property list with the given object as root into a GnuStep ASCII string.
     * @param root The root object, which must be a NSDictionary or NSArray.
     * @returns The GnuStep ASCII property list as a string.
     */
    public static saveAsGnuStepASCII(root: NSDictionary | NSArray): string {
        return root.toGnuStepASCIIPropertyList();
    }
}
