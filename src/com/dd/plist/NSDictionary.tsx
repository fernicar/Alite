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

import { NSObject } from "./NSObject";
import { NSArray } from "./NSArray";
import { NSData } from "./NSData";
import { NSDate } from "./NSDate";
import { NSNumber } from "./NSNumber";
import { NSString } from "./NSString";
import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";
import { ASCIIPropertyListParser } from "./ASCIIPropertyListParser";
import { StringBuilder } from "./StringBuilder";

/**
 * A NSDictionary is a collection of keys and values, essentially a Map.
 * The keys are simple Strings whereas the values can be any kind of NSObject.
 *
 * @author Daniel Dreibrodt
 * @see Map
 * @see NSObject
 */
export class NSDictionary extends NSObject implements Map<string, NSObject> {

    private dict: Map<string, NSObject>;

    /**
     * Creates a new empty NSDictionary.
     */
    constructor() {
        super();
        this.dict = new Map<string, NSObject>();
    }

    /**
     * Gets the map which stores the keys and values of this dictionary.
     * Changes to the map's contents are directly reflected in this
     * dictionary.
     *
     * @returns The map which is used by this dictionary to store its contents.
     */
    public getHashMap(): Map<string, NSObject> {
        return this.dict;
    }

    /**
     * Gets the NSObject stored for the given key.
     *
     * @param key The key.
     * @returns The object.
     */
    public objectForKey(key: string): NSObject {
        return this.dict.get(key);
    }

    public get size(): number {
        return this.dict.size;
    }

    public clear(): void {
        this.dict.clear();
    }

    public has(key: string): boolean {
        return this.dict.has(key);
    }

    public get(key: string): NSObject | undefined {
        return this.dict.get(key);
    }

    public set(key: string, value: NSObject): this {
        this.dict.set(key, value);
        return this;
    }

    public delete(key: string): boolean {
        return this.dict.delete(key);
    }

    public put(key: string, obj: any): NSObject {
        if (key === null) return null;
        const value = NSObject.wrap(obj);
        if (value === null) return this.dict.get(key);
        return this.dict.set(key, value).get(key);
    }

    public remove(key: string): NSObject {
        const value = this.dict.get(key);
        this.dict.delete(key);
        return value;
    }

    public keySet(): Set<string> {
        return new Set(this.dict.keys());
    }

    public values(): IterableIterator<NSObject> {
        return this.dict.values();
    }

    public entrySet(): [string, NSObject][] {
        return Array.from(this.dict.entries());
    }

    public forEach(callbackfn: (value: NSObject, key: string, map: Map<string, NSObject>) => void, thisArg?: any): void {
        this.dict.forEach(callbackfn, thisArg);
    }

    public [Symbol.iterator](): IterableIterator<[string, NSObject]> {
        return this.dict.entries();
    }

    public [Symbol.toStringTag]: string = "Map";

    /**
     * Counts the number of contained key-value pairs.
     *
     * @returns The size of this NSDictionary.
     */
    public count(): number {
        return this.dict.size;
    }

    public equals(obj: any): boolean {
        if (!(obj instanceof NSDictionary)) return false;
        if (obj.count() !== this.count()) return false;

        for (const [key, value] of this.dict.entries()) {
            const otherValue = obj.get(key);
            if (otherValue === null || !value.equals(otherValue)) {
                return false;
            }
        }
        return true;
    }


    /**
     * Gets a list of all keys used in this NSDictionary.
     *
     * @returns The list of all keys used in this NSDictionary.
     */
    public allKeys(): string[] {
        return Array.from(this.dict.keys());
    }

    public hashCode(): number {
        let hash = 7;
        hash = 83 * hash + (this.dict != null ? Array.from(this.dict.entries()).reduce((acc, [key, val]) => acc + (key.hashCode() ^ val.hashCode()), 0) : 0);
        return hash;
    }

    public toXML(xml: StringBuilder, level: number): void {
        this.indent(xml, level);
        xml.append("<dict>");
        xml.append(NSObject.NEWLINE);
        for (const key of this.dict.keys()) {
            const val = this.objectForKey(key);
            this.indent(xml, level + 1);
            xml.append("<key>");
            if (key.includes("&") || key.includes("<") || key.includes(">")) {
                xml.append("<![CDATA[");
                xml.append(key.replace(/]]>/g, "]]]]><![CDATA[>"));
                xml.append("]]>");
            } else {
                xml.append(key);
            }
            xml.append("</key>");
            xml.append(NSObject.NEWLINE);
            val.toXML(xml, level + 1);
            xml.append(NSObject.NEWLINE);
        }
        this.indent(xml, level);
        xml.append("</dict>");
    }


    public assignIDs(out: BinaryPropertyListWriter): void {
        super.assignIDs(out);
        for (const [key, value] of this.dict.entries()) {
            new NSString(key).assignIDs(out);
            value.assignIDs(out);
        }
    }


    public toBinary(out: BinaryPropertyListWriter): void {
        out.writeIntHeader(0xD, this.dict.size);
        const entries = Array.from(this.dict.entries());
        for (const [key] of entries) {
            out.writeID(out.getID(new NSString(key)));
        }
        for (const [, value] of entries) {
            out.writeID(out.getID(value));
        }
    }

    public toASCIIPropertyList(): string {
        const ascii = new StringBuilder();
        this.toASCII(ascii, 0);
        ascii.append(NSObject.NEWLINE);
        return ascii.toString();
    }


    public toGnuStepASCIIPropertyList(): string {
        const ascii = new StringBuilder();
        this.toASCIIGnuStep(ascii, 0);
        ascii.append(NSObject.NEWLINE);
        return ascii.toString();
    }

    protected toASCII(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.DICTIONARY_BEGIN_TOKEN);
        ascii.append(NSObject.NEWLINE);
        const keys = this.allKeys();
        for (const key of keys) {
            const val = this.objectForKey(key);
            this.indent(ascii, level + 1);
            ascii.append("\"");
            ascii.append(NSString.escapeStringForASCII(key));
            ascii.append("\" =");
            if (val instanceof NSDictionary || val instanceof NSArray || val instanceof NSData) {
                ascii.append(NSObject.NEWLINE);
                val.toASCII(ascii, level + 2);
            } else {
                ascii.append(" ");
                val.toASCII(ascii, 0);
            }
            ascii.append(ASCIIPropertyListParser.DICTIONARY_ITEM_DELIMITER_TOKEN);
            ascii.append(NSObject.NEWLINE);
        }
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.DICTIONARY_END_TOKEN);
    }

    protected toASCIIGnuStep(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.DICTIONARY_BEGIN_TOKEN);
        ascii.append(NSObject.NEWLINE);
        const keys = Array.from(this.dict.keys());
        for (const key of keys) {
            const val = this.objectForKey(key);
            this.indent(ascii, level + 1);
            ascii.append("\"");
            ascii.append(NSString.escapeStringForASCII(key));
            ascii.append("\" =");
            if (val instanceof NSDictionary || val instanceof NSArray || val instanceof NSData) {
                ascii.append(NSObject.NEWLINE);
                val.toASCIIGnuStep(ascii, level + 2);
            } else {
                ascii.append(" ");
                val.toASCIIGnuStep(ascii, 0);
            }
            ascii.append(ASCIIPropertyListParser.DICTIONARY_ITEM_DELIMITER_TOKEN);
            ascii.append(NSObject.NEWLINE);
        }
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.DICTIONARY_END_TOKEN);
    }

    public containsValue(value: any): boolean {
        const wrap = NSObject.wrap(value);
        if (wrap === null) return false;
        for (const val of this.dict.values()) {
            if (val.equals(wrap)) return true;
        }
        return false;
    }
}
