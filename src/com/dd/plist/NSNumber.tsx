/*
 * plist - An open source library to parse and generate property lists
 * Copyright (C) 2011 Daniel Dreibrodt, Keith Randall
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
import { BinaryPropertyListParser } from "./BinaryPropertyListParser";
import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";
import { StringBuilder } from "./StringBuilder";

/**
 * A number whose value is either an integer, a real number or boolean.
 *
 * @author Daniel Dreibrodt
 */
export class NSNumber extends NSObject implements Pick<Number, "valueOf"> {

    /**
     * Indicates that the number's value is an integer.
     * The number is stored as a JavaScript `number`.
     * Its original value could have been char, short, int, long or even long long.
     */
    public static readonly INTEGER = 0;

    /**
     * Indicates that the number's value is a real number.
     * The number is stored as a JavaScript `number`.
     * Its original value could have been float or double.
     */
    public static readonly REAL = 1;

    /**
     * Indicates that the number's value is boolean.
     */
    public static readonly BOOLEAN = 2;

    private type: number;
    private longValue: number;
    private doubleValue: number;
    private boolValue: boolean;

    constructor(bytes: Buffer, type: number);
    constructor(bytes: Buffer, startIndex: number, endIndex: number, type: number);
    constructor(text: string);
    constructor(i: number);
    constructor(l: number);
    constructor(d: number);
    constructor(b: boolean);
    constructor(...args: any[]) {
        super();
        if (args.length === 2 && Buffer.isBuffer(args[0]) && typeof args[1] === 'number') {
            const [bytes, type] = args;
            this.init(bytes, 0, bytes.length, type);
        } else if (args.length === 4 && Buffer.isBuffer(args[0]) && typeof args[1] === 'number' && typeof args[2] === 'number' && typeof args[3] === 'number') {
            const [bytes, startIndex, endIndex, type] = args;
            this.init(bytes, startIndex, endIndex, type);
        } else if (typeof args[0] === 'string') {
            const text = args[0];
            if (!text) throw new Error("The given string is null and cannot be parsed as number.");

            try {
                this.longValue = parseInt(text, 10);
                if (text.includes('.')) throw new Error('Not an integer');
                this.doubleValue = this.longValue;
                this.type = NSNumber.INTEGER;
            } catch (ex) {
                try {
                    this.doubleValue = parseFloat(text);
                    if (isNaN(this.doubleValue)) throw new Error('Not a number');
                    this.longValue = Math.round(this.doubleValue);
                    this.type = NSNumber.REAL;
                } catch (ex2) {
                    const lowerText = text.toLowerCase();
                    if (lowerText === 'true' || lowerText === 'yes') {
                        this.boolValue = true;
                    } else if (lowerText === 'false' || lowerText === 'no') {
                        this.boolValue = false;
                    } else {
                        throw new Error("The given string neither represents a double, an int nor a boolean value.");
                    }
                    this.type = NSNumber.BOOLEAN;
                    this.doubleValue = this.longValue = this.boolValue ? 1 : 0;
                }
            }
        } else if (typeof args[0] === 'number') {
            if (Number.isInteger(args[0])) {
                this.doubleValue = this.longValue = args[0];
                this.type = NSNumber.INTEGER;
            } else {
                this.longValue = Math.round(args[0]);
                this.doubleValue = args[0];
                this.type = NSNumber.REAL;
            }
        } else if (typeof args[0] === 'boolean') {
            this.boolValue = args[0];
            this.doubleValue = this.longValue = this.boolValue ? 1 : 0;
            this.type = NSNumber.BOOLEAN;
        }
    }


    private init(bytes: Buffer, startIndex: number, endIndex: number, type: number): void {
        switch (type) {
            case NSNumber.INTEGER: {
                this.doubleValue = this.longValue = BinaryPropertyListParser.parseLong(bytes, startIndex, endIndex);
                break;
            }
            case NSNumber.REAL: {
                this.doubleValue = BinaryPropertyListParser.parseDouble(bytes, startIndex, endIndex);
                this.longValue = Math.round(this.doubleValue);
                break;
            }
            default: {
                throw new Error("Type argument is not valid.");
            }
        }
        this.type = type;
    }


    public typeOf(): number {
        return this.type;
    }

    public isBoolean(): boolean {
        return this.type === NSNumber.BOOLEAN;
    }

    public isInteger(): boolean {
        return this.type === NSNumber.INTEGER;
    }

    public isReal(): boolean {
        return this.type === NSNumber.REAL;
    }

    public boolValue_(): boolean {
        if (this.type === NSNumber.BOOLEAN)
            return this.boolValue;
        else
            return this.longValue !== 0;
    }


    public longValue_(): number {
        return this.longValue;
    }


    public intValue(): number {
        return this.longValue;
    }


    public doubleValue_(): number {
        return this.doubleValue;
    }


    public floatValue(): number {
        return this.doubleValue;
    }

    public equals(obj: any): boolean {
        if (!(obj instanceof NSNumber)) return false;
        const n = obj as NSNumber;
        return this.type === n.type && this.longValue === n.longValue && this.doubleValue === n.doubleValue && this.boolValue === n.boolValue;
    }

    public hashCode(): number {
        let hash = this.type;
        hash = 37 * hash + this.longValue;
        // A simple way to hash a float in JS
        const doubleBits = Buffer.alloc(8);
        doubleBits.writeDoubleBE(this.doubleValue, 0);
        hash = 37 * hash + doubleBits.readInt32BE(0) ^ doubleBits.readInt32BE(4);
        hash = 37 * hash + (this.boolValue_() ? 1 : 0);
        return hash;
    }

    public toString(): string {
        switch (this.type) {
            case NSNumber.INTEGER: {
                return String(this.longValue_());
            }
            case NSNumber.REAL: {
                return String(this.doubleValue_());
            }
            case NSNumber.BOOLEAN: {
                return String(this.boolValue_());
            }
            default: {
                return super.toString();
            }
        }
    }

    public toXML(xml: StringBuilder, level: number): void {
        this.indent(xml, level);
        switch (this.type) {
            case NSNumber.INTEGER: {
                xml.append("<integer>");
                xml.append(this.longValue_());
                xml.append("</integer>");
                break;
            }
            case NSNumber.REAL: {
                xml.append("<real>");
                xml.append(this.doubleValue_());
                xml.append("</real>");
                break;
            }
            case NSNumber.BOOLEAN: {
                if (this.boolValue)
                    xml.append("<true/>");
                else
                    xml.append("<false/>");
                break;
            }
        }
    }

    public toBinary(out: BinaryPropertyListWriter): void {
        switch (this.typeOf()) {
            case NSNumber.INTEGER: {
                if (this.longValue_() < 0) {
                    out.write(0x13);
                    out.writeBytes(this.longValue_(), 8);
                } else if (this.longValue_() <= 0xff) {
                    out.write(0x10);
                    out.writeBytes(this.longValue_(), 1);
                } else if (this.longValue_() <= 0xffff) {
                    out.write(0x11);
                    out.writeBytes(this.longValue_(), 2);
                } else if (this.longValue_() <= 0xffffffff) {
                    out.write(0x12);
                    out.writeBytes(this.longValue_(), 4);
                } else {
                    out.write(0x13);
                    out.writeBytes(this.longValue_(), 8);
                }
                break;
            }
            case NSNumber.REAL: {
                out.write(0x23);
                out.writeDouble(this.doubleValue_());
                break;
            }
            case NSNumber.BOOLEAN: {
                out.write(this.boolValue_() ? 0x09 : 0x08);
                break;
            }
        }
    }

    protected toASCII(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        if (this.type === NSNumber.BOOLEAN) {
            ascii.append(this.boolValue ? "YES" : "NO");
        } else {
            ascii.append(this.toString());
        }
    }

    protected toASCIIGnuStep(ascii: StringBuilder, level: number): void {
        this.indent(ascii, level);
        switch (this.type) {
            case NSNumber.INTEGER: {
                ascii.append("<*I");
                ascii.append(this.toString());
                ascii.append(">");
                break;
            }
            case NSNumber.REAL: {
                ascii.append("<*R");
                ascii.append(this.toString());
                ascii.append(">");
                break;
            }
            case NSNumber.BOOLEAN: {
                if (this.boolValue) {
                    ascii.append("<*BY>");
                } else {
                    ascii.append("<*BN>");
                }
            }
        }
    }

    public compareTo(o: any): number {
        const x = this.doubleValue_();
        let y: number;
        if (o instanceof NSNumber) {
            y = o.doubleValue_();
            return (x < y) ? -1 : ((x === y) ? 0 : 1);
        } else if (typeof o === 'number') {
            y = o;
            return (x < y) ? -1 : ((x === y) ? 0 : 1);
        } else {
            return -1;
        }
    }

    valueOf(): number {
        return this.doubleValue_();
    }
}
