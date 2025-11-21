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
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { NSObject } from "./NSObject";
import { BinaryPropertyListWriter } from "./BinaryPropertyListWriter";

/**
 * A UID. Only found in binary property lists that are keyed archives.
 *
 * @author Daniel Dreibrodt
 */
export class UID extends NSObject {

    private bytes: number[];
    private name: string;

    constructor(name: string, bytes: number[]) {
        super();
        this.name = name;
        this.bytes = bytes;
    }

    public getBytes(): number[] {
        return this.bytes;
    }

    public getName(): string {
        return this.name;
    }

    /**
     * There is no XML representation specified for UIDs.
     * In this implementation UIDs are represented as strings in the XML output.
     *
     * @param xml   The xml StringBuilder
     * @param level The indentation level
     */
    toXML(xml: { append: (arg0: string) => void; }, level: number): void {
        this.indent(xml, level);
        xml.append("<string>");
        for (let i = 0; i < this.bytes.length; i++) {
            const b = this.bytes[i];
            if (b < 16)
                xml.append("0");
            xml.append(b.toString(16));
        }
        xml.append("</string>");
    }

    toBinary(out: BinaryPropertyListWriter): void {
        out.write(0x80 + this.bytes.length - 1);
        out.write(this.bytes);
    }

    protected toASCII(ascii: { append: (arg0: string) => void; }, level: number): void {
        this.indent(ascii, level);
        ascii.append("\"");
        for (let i = 0; i < this.bytes.length; i++) {
            const b = this.bytes[i];
            if (b < 16)
                ascii.append("0");
            ascii.append(b.toString(16));
        }
        ascii.append("\"");
    }

    protected toASCIIGnuStep(ascii: { append: (arg0: string) => void; }, level: number): void {
        this.toASCII(ascii, level);
    }
}
