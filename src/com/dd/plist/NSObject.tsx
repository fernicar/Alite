/*
 * plist - An open source library to parse and generate property lists
 * Copyright (C) 2014 Daniel Dreibrodt
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

import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";
import { NSArray } from "./NSArray";
import { NSData } from "./NSData";
import { NSDate } from "./NSDate";
import { NSDictionary } from "./NSDictionary";
import { NSNumber } from "./NSNumber";
import { NSSet } from "./NSSet";
import { NSString } from "./NSString";
import { UID } from "./UID";
import { StringBuilder } from "./StringBuilder";

/**
 * Abstract interface for any object contained in a property list.
 * The names and functions of the various objects orient themselves
 * towards Apple's Cocoa API.
 *
 * @author Daniel Dreibrodt
 */
export abstract class NSObject {

    public static readonly NEWLINE = "\n";
    public static readonly INDENT = "\t";
    public static readonly ASCII_LINE_LENGTH = 80;

    /**
     * Generates the XML representation of the object.
     * @param xml The StringBuilder to append the XML representation to.
     * @param level The indentation level.
     */
    public abstract toXML(xml: StringBuilder, level: number): void;

    /**
     * Assigns IDs to all the objects in this NSObject subtree.
     * @param out The writer object that handles the binary serialization.
     */
    public assignIDs(out: BinaryPropertyListWriter): void {
        out.assignID(this);
    }

    /**
     * Generates the binary representation of the object.
     * @param out The output stream to serialize the object to.
     */
    public abstract toBinary(out: BinaryPropertyListWriter): void;

    /**
     * Generates a valid XML property list including headers using this object as root.
     * @returns The XML representation of the property list.
     */
    public toXMLPropertyList(): string {
        const xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.append(NSObject.NEWLINE);
        xml.append("<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">");
        xml.append(NSObject.NEWLINE);
        xml.append("<plist version=\"1.0\">");
        xml.append(NSObject.NEWLINE);
        this.toXML(xml, 0);
        xml.append(NSObject.NEWLINE);
        xml.append("</plist>");
        return xml.toString();
    }

    protected abstract toASCII(ascii: StringBuilder, level: number): void;

    protected abstract toASCIIGnuStep(ascii: StringBuilder, level: number): void;

    protected indent(xml: StringBuilder, level: number): void {
        for (let i = 0; i < level; i++) {
            xml.append(NSObject.INDENT);
        }
    }

    public static wrap(value: any): NSObject {
        if (value === null || value === undefined) {
            return null;
        }

        if (value instanceof NSObject) {
            return value;
        }

        if (typeof value === 'boolean') {
            return new NSNumber(value);
        }
        if (typeof value === 'number') {
            return new NSNumber(value);
        }
        if (typeof value === 'string') {
            return new NSString(value);
        }
        if (value instanceof Date) {
            return new NSDate(value);
        }
        if (value instanceof Uint8Array) { // In JS, byte arrays are typically Uint8Array
            return new NSData(value);
        }
        if (Array.isArray(value)) {
            const arr = new NSArray(value.length);
            for (let i = 0; i < value.length; i++) {
                arr.setValue(i, this.wrap(value[i]));
            }
            return arr;
        }
        if (value instanceof Map) {
            const dict = new NSDictionary();
            for (const [key, val] of value.entries()) {
                dict.put(String(key), this.wrap(val));
            }
            return dict;
        }
        if (value instanceof Set) {
            const set = new NSSet();
            for (const o of value) {
                set.addObject(this.wrap(o));
            }
            return set;
        }
        // For plain objects, convert to NSDictionary
        if (typeof value === 'object') {
            const dict = new NSDictionary();
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    dict.put(key, this.wrap(value[key]));
                }
            }
            return dict;
        }

        // Fallback for other types? Potentially serialize or throw error.
        // For now, returning null to match original behavior of ignoring unsupported types.
        return null;
    }


    public toJavaObject(): any {
        if (this instanceof NSArray) {
            const arrayA = (this as NSArray).getArray();
            return arrayA.map(item => item.toJavaObject());
        }
        if (this instanceof NSDictionary) {
            const mapA = (this as NSDictionary).getHashMap();
            const mapB = new Map<string, any>();
            for (const [key, value] of mapA.entries()) {
                mapB.set(key, value.toJavaObject());
            }
            return mapB;
        }
        if (this instanceof NSSet) {
            const setA = (this as NSSet).getSet();
            const setB = new Set<any>();
            for (const o of setA) {
                setB.add(o.toJavaObject());
            }
            return setB;
        }
        if (this instanceof NSNumber) {
            const num = this as NSNumber;
            if (num.isBoolean()) return num.boolValue_();
            if (num.isInteger()) return num.longValue_();
            return num.doubleValue_();
        }
        if (this instanceof NSString) {
            return (this as NSString).getContent();
        }
        if (this instanceof NSData) {
            return (this as NSData).bytes();
        }
        if (this instanceof NSDate) {
            return (this as NSDate).getDate();
        }
        if (this instanceof UID) {
            return (this as UID).getBytes();
        }
        return this;
    }
}
