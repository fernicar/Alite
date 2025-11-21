/*
 * plist - An open source library to parse and generate property lists
 * Copyright (C) 2011 Daniel Dreibrodt
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
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { NSObject } from './NSObject';
import { BinaryPropertyListWriter } from './BinaryPropertyListWriter';
import { ASCIIPropertyListParser } from './ASCIIPropertyListParser';
import { NSDictionary } from './NSDictionary';
import { NSArray } from './NSArray';
import { NSData } from './NSData';


export class NSSet extends NSObject {
    private set: Set<NSObject>;
    private ordered: boolean;

    constructor(ordered: boolean = false, ...objects: NSObject[]) {
        super();
        this.ordered = ordered;
        // In JS, standard Sets are insertion-ordered. A custom sorted set would be needed for true ordered behavior.
        this.set = new Set<NSObject>(objects);
    }

    public addObject(obj: NSObject): void {
        this.set.add(obj);
    }

    public removeObject(obj: NSObject): void {
        this.set.delete(obj);
    }

    public allObjects(): NSObject[] {
        return Array.from(this.set);
    }

    public anyObject(): NSObject {
        return this.set.values().next().value || null;
    }

    public containsObject(obj: NSObject): boolean {
        return this.set.has(obj);
    }

    public member(obj: NSObject): NSObject {
        // Since JS Set uses reference equality for objects (unless they are primitives),
        // we might need to iterate to find an "equal" object.
        for (const o of this.set) {
            if (o.equals(obj)) {
                return o;
            }
        }
        return null;
    }

    // ... other methods like intersectsSet, isSubsetOfSet ...

    public count(): number {
        return this.set.size;
    }

    public equals(obj: any): boolean {
        if (!(obj instanceof NSSet) || this.set.size !== obj.set.size) {
            return false;
        }
        for (const item of this.set) {
            if (!obj.set.has(item)) { // This assumes deep equality is handled by the objects' `equals` method
                return false;
            }
        }
        return true;
    }

    public toXML(xml: { push: (s: string) => void }, level: number): void {
        this.indent(xml, level);
        xml.push("<array>");
        xml.push(NSObject.NEWLINE);
        for (const o of this.set) {
            o.toXML(xml, level + 1);
            xml.push(NSObject.NEWLINE);
        }
        this.indent(xml, level);
        xml.push("</array>");
    }

    public assignIDs(out: BinaryPropertyListWriter): void {
        super.assignIDs(out);
        for (const obj of this.set) {
            obj.assignIDs(out);
        }
    }

    public toBinary(out: BinaryPropertyListWriter): void {
        out.writeIntHeader(this.ordered ? 0xB : 0xC, this.set.size);
        for (const obj of this.set) {
            out.writeID(out.getID(obj));
        }
    }

    protected toASCII(ascii: { push: (s: string) => void }, level: number): void {
        this.indent(ascii, level);
        const array = this.allObjects();
        ascii.push(ASCIIPropertyListParser.ARRAY_BEGIN_TOKEN);
        // Simplified ASCII generation. A full implementation needs careful formatting.
        for (let i = 0; i < array.length; i++) {
            array[i].toASCII(ascii, 0);
            if (i < array.length - 1) {
                ascii.push(ASCIIPropertyListParser.ARRAY_ITEM_DELIMITER_TOKEN + " ");
            }
        }
        ascii.push(ASCIIPropertyListParser.ARRAY_END_TOKEN);
    }

    protected toASCIIGnuStep(ascii: { push: (s: string) => void }, level: number): void {
       this.toASCII(ascii, level); // Re-using for simplicity
    }
}
