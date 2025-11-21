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

import { ASCIIPropertyListParser } from "./ASCIIPropertyListParser";
import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";
import { NSData } from "./NSData";
import { NSDictionary } from "./NSDictionary";
import { NSObject } from "./NSObject";
import { StringBuilder } from "./StringBuilder";


/**
 * Represents an Array.
 *
 * @author Daniel Dreibrodt
 */
export class NSArray extends NSObject {

    private array: NSObject[];

    /**
     * Creates an empty array of the given length.
     *
     * @param length The number of elements this array will be able to hold.
     */
    constructor(length: number);
    /**
     * Creates a array from an existing one
     *
     * @param a The array which should be wrapped by the NSArray
     */
    constructor(...a: NSObject[]);
    constructor(...args: any[]) {
        super();
        if (args.length === 1 && typeof args[0] === "number") {
            this.array = new Array<NSObject>(args[0]);
        } else {
            this.array = args as NSObject[];
        }
    }


    /**
     * Returns the object stored at the given index.
     * Equivalent to <code>getArray()[i]</code>.
     *
     * @param i The index of the object.
     * @return The object at the given index.
     */
    public objectAtIndex(i: number): NSObject {
        return this.array[i];
    }

    /**
     * Remove the i-th element from the array.
     * The array will be resized.
     *
     * @param i The index of the object
     */
    public remove(i: number): void {
        if ((i >= this.array.length) || (i < 0))
            throw new Error(`invalid index:${i};the array length is ${this.array.length}`);
        this.array.splice(i, 1);
    }

    /**
     * Stores an object at the specified index.
     * If there was another object stored at that index it will be replaced.
     * Equivalent to <code>getArray()[key] = value</code>.
     *
     * @param key   The index where to store the object.
     * @param value The object.
     */
    public setValue(key: number, value: any): void {
        this.array[key] = NSObject.wrap(value);
    }

    /**
     * Returns the array of NSObjects represented by this NSArray.
     * Any changes to the values of this array will also affect the NSArray.
     *
     * @return The actual array represented by this NSArray.
     */
    public getArray(): NSObject[] {
        return this.array;
    }

    /**
     * Returns the size of the array.
     *
     * @return The number of elements that this array can store.
     */
    public count(): number {
        return this.array.length;
    }

    /**
     * Checks whether an object is present in the array or whether it is equal
     * to any of the objects in the array.
     *
     * @param obj The object to look for.
     * @return <code>true</code>, when the object could be found. <code>false</code> otherwise.
     * @see Object#equals(java.lang.Object)
     */
    public containsObject(obj: any): boolean {
        const nso: NSObject = NSObject.wrap(obj);
        for (const elem of this.array) {
            if (elem == null) {
                if (obj == null)
                    return true;
                continue;
            }
            if (elem.equals(nso)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Searches for an object in the array. If it is found its index will be
     * returned. This method also returns an index if the object is not the same
     * as the one stored in the array but has equal contents.
     *
     * @param obj The object to look for.
     * @return The index of the object, if it was found. -1 otherwise.
     * @see Object#equals(java.lang.Object)
     * @see #indexOfIdenticalObject(Object)
     */
    public indexOfObject(obj: any): number {
        const nso: NSObject = NSObject.wrap(obj);
        for (let i = 0; i < this.array.length; i++) {
            if (this.array[i].equals(nso)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Searches for an object in the array. If it is found its index will be
     * returned. This method only returns the index of an object that is
     * <b>identical</b> to the given one. Thus objects that might contain the
     * same value as the given one will not be considered.
     *
     * @param obj The object to look for.
     * @return The index of the object, if it was found. -1 otherwise.
     * @see #indexOfObject(Object)
     */
    public indexOfIdenticalObject(obj: any): number {
        const nso: NSObject = NSObject.wrap(obj);
        for (let i = 0; i < this.array.length; i++) {
            if (this.array[i] === nso) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the last object contained in this array.
     * Equivalent to <code>getArray()[getArray().length-1]</code>.
     *
     * @return The value of the highest index in the array.
     */
    public lastObject(): NSObject {
        return this.array[this.array.length - 1];
    }

    /**
     * Returns a new array containing only the values stored at the given
     * indices. The values are sorted by their index.
     *
     * @param indexes The indices of the objects.
     * @return The new array containing the objects stored at the given indices.
     */
    public objectsAtIndexes(...indexes: number[]): NSObject[] {
        const result: NSObject[] = new Array<NSObject>(indexes.length);
        indexes.sort((a, b) => a - b);
        for (let i = 0; i < indexes.length; i++)
            result[i] = this.array[indexes[i]];
        return result;
    }

    public equals(obj: any): boolean {
        if (obj == null)
            return false;
        if (obj instanceof NSArray) {
            return this.array === (obj as NSArray).getArray() || this.array.every((v, i) => v.equals((obj as NSArray).getArray()[i]));
        } else {
            const nso: NSObject = NSObject.wrap(obj);
            if (nso instanceof NSArray) {
                return this.array === (nso as NSArray).getArray() || this.array.every((v, i) => v.equals((nso as NSArray).getArray()[i]));
            }
        }
        return false;
    }

    public hashCode(): number {
        let hash = 7;
        hash = 89 * hash + this.array.reduce((acc, val) => acc + (val ? val.hashCode() : 0), 0);
        return hash;
    }

    public toXML(xml: StringBuilder, level: number): void {
        this.indent(xml, level);
        xml.append("<array>");
        xml.append(NSObject.NEWLINE);
        for (const o of this.array) {
            o.toXML(xml, level + 1);
            xml.append(NSObject.NEWLINE);
        }
        this.indent(xml, level);
        xml.append("</array>");
    }

    public assignIDs(out: BinaryPropertyListWriter): void {
        super.assignIDs(out);
        for (const obj of this.array) {
            obj.assignIDs(out);
        }
    }

    public toBinary(out: BinaryPropertyListWriter): void {
        out.writeIntHeader(0xA, this.array.length);
        for (const obj of this.array) {
            out.writeID(out.getID(obj));
        }
    }

    /**
     * Generates a valid ASCII property list which has this NSArray as its
     * root object. The generated property list complies with the format as
     * described in <a href="https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/PropertyLists/OldStylePlists/OldStylePLists.html">
     * Property List Programming Guide - Old-Style ASCII Property Lists</a>.
     *
     * @return ASCII representation of this object.
     */
    public toASCIIPropertyList(): string {
        const ascii: StringBuilder = new StringBuilder();
        this.toASCII(ascii, 0);
        ascii.append(NSObject.NEWLINE);
        return ascii.toString();
    }

    /**
     * Generates a valid ASCII property list in GnuStep format which has this
     * NSArray as its root object. The generated property list complies with
     * the format as described in <a href="http://www.gnustep.org/resources/documentation/Developer/Base/Reference/NSPropertyList.html">
     * GnuStep - NSPropertyListSerialization class documentation
     * </a>
     *
     * @return GnuStep ASCII representation of this object.
     */
    public toGnuStepASCIIPropertyList(): string {
        const ascii: StringBuilder = new StringBuilder();
        this.toASCIIGnuStep(ascii, 0);
        ascii.append(NSObject.NEWLINE);
        return ascii.toString();
    }

    protected toASCII(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.ARRAY_BEGIN_TOKEN);
        let indexOfLastNewLine: number = ascii.lastIndexOf(NSObject.NEWLINE);
        for (let i = 0; i < this.array.length; i++) {
            const objClass = this.array[i];
            if ((objClass instanceof NSDictionary || objClass instanceof NSArray || objClass instanceof NSData)
                && indexOfLastNewLine !== ascii.length()) {
                ascii.append(NSObject.NEWLINE);
                indexOfLastNewLine = ascii.length();
                this.array[i].toASCII(ascii, level + 1);
            } else {
                if (i !== 0)
                    ascii.append(" ");
                this.array[i].toASCII(ascii, 0);
            }

            if (i !== this.array.length - 1)
                ascii.append(ASCIIPropertyListParser.ARRAY_ITEM_DELIMITER_TOKEN);

            if (ascii.length() - indexOfLastNewLine > NSObject.ASCII_LINE_LENGTH) {
                ascii.append(NSObject.NEWLINE);
                indexOfLastNewLine = ascii.length();
            }
        }
        ascii.append(ASCIIPropertyListParser.ARRAY_END_TOKEN);
    }

    protected toASCIIGnuStep(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        ascii.append(ASCIIPropertyListParser.ARRAY_BEGIN_TOKEN);
        let indexOfLastNewLine: number = ascii.lastIndexOf(NSObject.NEWLINE);
        for (let i = 0; i < this.array.length; i++) {
            const objClass = this.array[i];
            if ((objClass instanceof NSDictionary || objClass instanceof NSArray || objClass instanceof NSData)
                && indexOfLastNewLine !== ascii.length()) {
                ascii.append(NSObject.NEWLINE);
                indexOfLastNewLine = ascii.length();
                this.array[i].toASCIIGnuStep(ascii, level + 1);
            } else {
                if (i !== 0)
                    ascii.append(" ");
                this.array[i].toASCIIGnuStep(ascii, 0);
            }

            if (i !== this.array.length - 1)
                ascii.append(ASCIIPropertyListParser.ARRAY_ITEM_DELIMITER_TOKEN);

            if (ascii.length() - indexOfLastNewLine > NSObject.ASCII_LINE_LENGTH) {
                ascii.append(NSObject.NEWLINE);
                indexOfLastNewLine = ascii.length();
            }
        }
        ascii.append(ASCIIPropertyListParser.ARRAY_END_TOKEN);
    }
}
