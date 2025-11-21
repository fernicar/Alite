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
import { NSNumber } from "./NSNumber";
import { NSDate } from "./NSDate";
import { NSData } from "./NSData";
import { NSString } from "./NSString";
import { UID } from "./UID";
import { NSArray } from "./NSArray";
import { NSSet } from "./NSSet";
import { NSDictionary } from "./NSDictionary";
import { PropertyListFormatException } from "./PropertyListFormatException";

export class BinaryPropertyListParser {
    private majorVersion: number;
    private minorVersion: number;
    private data: ArrayBuffer;
    private view: DataView;
    private objectRefSize: number;
    private offsetTable: number[];

    private constructor() {
        // empty
    }

    public static parse(data: ArrayBuffer): NSObject {
        const parser = new BinaryPropertyListParser();
        return parser.doParse(data);
    }

    private doParse(data: ArrayBuffer): NSObject {
        this.data = data;
        this.view = new DataView(this.data);

        const magic = new TextDecoder("ascii").decode(this.data.slice(0, 8));
        if (!magic.startsWith("bplist")) {
            throw new Error(`The given data is no binary property list. Wrong magic bytes: ${magic}`);
        }

        this.majorVersion = parseInt(magic.charAt(6));
        this.minorVersion = parseInt(magic.charAt(7));

        if (this.majorVersion > 0) {
            throw new Error(`Unsupported binary property list format: v${this.majorVersion}.${this.minorVersion}.`);
        }

        const trailer = this.data.slice(this.data.byteLength - 32);
        const trailerView = new DataView(trailer);

        const offsetSize = trailerView.getUint8(6);
        this.objectRefSize = trailerView.getUint8(7);
        const numObjects = this.readLong(trailerView, 8, 16);
        const topObject = this.readLong(trailerView, 16, 24);
        const offsetTableOffset = this.readLong(trailerView, 24, 32);

        this.offsetTable = new Array(numObjects);
        for (let i = 0; i < numObjects; i++) {
            const offset = offsetTableOffset + i * offsetSize;
            this.offsetTable[i] = this.readInt(this.view, offset, offset + offsetSize);
        }

        return this.parseObject(topObject);
    }


    private parseObject(obj: number): NSObject {
        const offset = this.offsetTable[obj];
        const type = this.view.getUint8(offset);
        const objType = (type & 0xF0) >> 4;
        const objInfo = (type & 0x0F);

        switch (objType) {
            case 0x0: { // Simple
                switch (objInfo) {
                    case 0x8: return new NSNumber(false);
                    case 0x9: return new NSNumber(true);
                    default: throw new PropertyListFormatException(`Unknown simple object type: ${objInfo}`);
                }
            }
            case 0x1: { // Integer
                const length = 1 << objInfo;
                return new NSNumber(this.data.slice(offset + 1, offset + 1 + length), NSNumber.INTEGER);
            }
            case 0x2: { // Real
                const length = 1 << objInfo;
                return new NSNumber(this.data.slice(offset + 1, offset + 1 + length), NSNumber.REAL);
            }
            case 0x3: { // Date
                if (objInfo !== 0x3) throw new PropertyListFormatException(`Unknown date object type: ${objInfo}`);
                return new NSDate(this.data.slice(offset + 1, offset + 9));
            }
            case 0x4: { // Data
                const [length, dataOffset] = this.readLengthAndOffset(objInfo, offset);
                return new NSData(this.data.slice(offset + dataOffset, offset + dataOffset + length));
            }
            case 0x5: { // ASCII String
                const [length, strOffset] = this.readLengthAndOffset(objInfo, offset);
                return new NSString(this.data.slice(offset + strOffset, offset + strOffset + length), "ascii");
            }
            case 0x6: { // UTF-16 BE String
                const [characters, strOffset] = this.readLengthAndOffset(objInfo, offset);
                const length = characters * 2;
                return new NSString(this.data.slice(offset + strOffset, offset + strOffset + length), "utf-16be");
            }
            case 0xA: { // Array
                const [length, arrayOffset] = this.readLengthAndOffset(objInfo, offset);
                const array = new NSArray(length);
                for (let i = 0; i < length; i++) {
                    const objRef = this.readInt(this.view, offset + arrayOffset + i * this.objectRefSize, offset + arrayOffset + (i + 1) * this.objectRefSize);
                    array.setValue(i, this.parseObject(objRef));
                }
                return array;
            }
            case 0xD: { // Dictionary
                const [length, contentOffset] = this.readLengthAndOffset(objInfo, offset);
                const dict = new NSDictionary();
                for (let i = 0; i < length; i++) {
                    const keyRef = this.readInt(this.view, offset + contentOffset + i * this.objectRefSize, offset + contentOffset + (i + 1) * this.objectRefSize);
                    const valRef = this.readInt(this.view, offset + contentOffset + (length * this.objectRefSize) + i * this.objectRefSize, offset + contentOffset + (length * this.objectRefSize) + (i + 1) * this.objectRefSize);
                    const key = this.parseObject(keyRef);
                    const val = this.parseObject(valRef);
                    dict.put(key.toString(), val);
                }
                return dict;
            }
            default: {
                throw new PropertyListFormatException(`Unknown object type: ${objType}`);
            }
        }
    }


    private readLengthAndOffset(objInfo: number, offset: number): [number, number] {
        if (objInfo === 0xF) {
            const int_type = this.view.getUint8(offset + 1);
            const intInfo = int_type & 0x0F;
            const intLength = 1 << intInfo;
            const offsetValue = 2 + intLength;
            const lengthValue = this.readInt(this.view, offset + 2, offset + 2 + intLength);
            return [lengthValue, offsetValue];
        }
        return [objInfo, 1];
    }


    private readLong(view: DataView, start: number, end: number): number {
        let l = 0;
        for (let i = start; i < end; i++) {
            l = (l * 256) + view.getUint8(i);
        }
        return l;
    }

    private readInt(view: DataView, start: number, end: number): number {
        let i = 0;
        for (let j = start; j < end; j++) {
            i = (i * 256) + view.getUint8(j);
        }
        return i;
    }

    // Static helpers
    public static parseLong(bytes: ArrayBuffer, startIndex: number, endIndex: number): number {
        const view = new DataView(bytes);
        let l = 0;
        for (let i = startIndex; i < endIndex; i++) {
            l = (l * 256) + view.getUint8(i);
        }
        return l;
    }

    public static parseDouble(bytes: ArrayBuffer, startIndex: number, endIndex: number): number {
        const view = new DataView(bytes, startIndex, endIndex - startIndex);
        if (endIndex - startIndex === 8) {
            return view.getFloat64(0, false); // big-endian
        } else if (endIndex - startIndex === 4) {
            return view.getFloat32(0, false); // big-endian
        } else {
            throw new Error(`endIndex (${endIndex}) - startIndex (${startIndex}) != 4 or 8`);
        }
    }
}
