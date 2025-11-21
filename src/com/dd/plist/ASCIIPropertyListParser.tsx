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
import { NSDictionary } from "./NSDictionary";
import { NSData } from "./NSData";
import { NSDate } from "./NSDate";
import { NSNumber } from "./NSNumber";
import { NSString } from "./NSString";
import { PropertyListFormatException } from "./PropertyListFormatException";

export class ASCIIPropertyListParser {
    private data: string;
    private index: number;

    private static readonly WHITESPACE_CHARS = ' \t\n\r';
    public static readonly ARRAY_BEGIN_TOKEN = '(';
    public static readonly ARRAY_END_TOKEN = ')';
    public static readonly ARRAY_ITEM_DELIMITER_TOKEN = ',';
    public static readonly DICTIONARY_BEGIN_TOKEN = '{';
    public static readonly DICTIONARY_END_TOKEN = '}';
    private static readonly DICTIONARY_ASSIGN_TOKEN = '=';
    public static readonly DICTIONARY_ITEM_DELIMITER_TOKEN = ';';
    private static readonly QUOTEDSTRING_BEGIN_TOKEN = '"';
    private static readonly QUOTEDSTRING_END_TOKEN = '"';
    private static readonly QUOTEDSTRING_ESCAPE_TOKEN = '\\';
    public static readonly DATA_BEGIN_TOKEN = '<';
    public static readonly DATA_END_TOKEN = '>';
    // ... (other constants)

    private constructor(propertyListContent: string) {
        this.data = propertyListContent;
        this.index = 0;
    }

    public static parse(data: string): NSObject {
        const parser = new ASCIIPropertyListParser(data);
        return parser.doParse();
    }

    private doParse(): NSObject {
        this.index = 0;
        // Skip BOM if present
        if (this.data.charCodeAt(0) === 0xFEFF) {
            this.index++;
        }
        this.skipWhitespacesAndComments();
        this.expect(ASCIIPropertyListParser.DICTIONARY_BEGIN_TOKEN, ASCIIPropertyListParser.ARRAY_BEGIN_TOKEN, '/');
        try {
            return this.parseObject();
        } catch (e) {
            if (e instanceof RangeError) { // Index out of bounds
                throw new PropertyListFormatException("Reached end of input unexpectedly.", this.index);
            }
            throw e;
        }
    }


    private expect(...expectedSymbols: string[]): void {
        if (!expectedSymbols.includes(this.data[this.index])) {
            const excString = `Expected '${expectedSymbols.join("' or '")}' but found '${this.data[this.index]}'`;
            throw new PropertyListFormatException(excString, this.index);
        }
    }

    private skipWhitespacesAndComments(): void {
        let commentSkipped: boolean;
        do {
            commentSkipped = false;
            while (this.index < this.data.length && ASCIIPropertyListParser.WHITESPACE_CHARS.includes(this.data[this.index])) {
                this.index++;
            }

            if (this.data.startsWith('//', this.index)) {
                this.index += 2;
                const newline = this.data.indexOf('\n', this.index);
                this.index = newline === -1 ? this.data.length : newline;
                commentSkipped = true;
            } else if (this.data.startsWith('/*', this.index)) {
                this.index += 2;
                const endComment = this.data.indexOf('*/', this.index);
                if (endComment === -1) throw new PropertyListFormatException("Unclosed comment", this.index);
                this.index = endComment + 2;
                commentSkipped = true;
            }
        } while (commentSkipped);
    }

    private parseObject(): NSObject {
        switch (this.data[this.index]) {
            case ASCIIPropertyListParser.ARRAY_BEGIN_TOKEN:
                return this.parseArray();
            case ASCIIPropertyListParser.DICTIONARY_BEGIN_TOKEN:
                return this.parseDictionary();
            case ASCIIPropertyListParser.DATA_BEGIN_TOKEN:
                return this.parseData();
            case ASCIIPropertyListParser.QUOTEDSTRING_BEGIN_TOKEN: {
                const quotedString = this.parseQuotedString();
                // Apple dates are quoted strings of length 20 and after the 4 year digits a dash is found
                if (quotedString.length === 20 && quotedString.charAt(4) === '-') {
                    try {
                        return new NSDate(quotedString);
                    } catch (ignored) { /* not a date, return as string */ }
                }
                return new NSString(quotedString);
            }
            default: {
                if (/\d/.test(this.data[this.index])) {
                    return this.parseDateString();
                }
                const parsedString = this.parseString();
                try {
                    return new NSNumber(parsedString);
                } catch (ignored) {
                    return new NSString(parsedString);
                }
            }
        }
    }

    private parseArray(): NSArray {
        this.index++; // Skip begin token
        this.skipWhitespacesAndComments();
        const objects: NSObject[] = [];
        while (this.data[this.index] !== ASCIIPropertyListParser.ARRAY_END_TOKEN) {
            objects.push(this.parseObject());
            this.skipWhitespacesAndComments();
            if (this.data[this.index] === ASCIIPropertyListParser.ARRAY_ITEM_DELIMITER_TOKEN) {
                this.index++;
            } else {
                break; // End of array
            }
            this.skipWhitespacesAndComments();
        }
        this.expect(ASCIIPropertyListParser.ARRAY_END_TOKEN);
        this.index++; // Skip end token
        return new NSArray(...objects);
    }

    private parseDictionary(): NSDictionary {
        this.index++; // Skip begin token
        this.skipWhitespacesAndComments();
        const dict = new NSDictionary();
        while (this.data[this.index] !== ASCIIPropertyListParser.DICTIONARY_END_TOKEN) {
            const keyString = this.data[this.index] === ASCIIPropertyListParser.QUOTEDSTRING_BEGIN_TOKEN
                ? this.parseQuotedString()
                : this.parseString();
            this.skipWhitespacesAndComments();
            this.expect(ASCIIPropertyListParser.DICTIONARY_ASSIGN_TOKEN);
            this.index++;
            this.skipWhitespacesAndComments();
            const object = this.parseObject();
            dict.put(keyString, object);
            this.skipWhitespacesAndComments();
            this.expect(ASCIIPropertyListParser.DICTIONARY_ITEM_DELIMITER_TOKEN);
            this.index++;
            this.skipWhitespacesAndComments();
        }
        this.index++; // Skip end token
        return dict;
    }


    private parseData(): NSObject {
        this.index++; // Skip begin token
        // GnuStep data format is not fully implemented for brevity
        const dataString = this.readInputUntil(ASCIIPropertyListParser.DATA_END_TOKEN).replace(/\s+/g, '');
        this.index++; // Skip end token

        const bytes = new Uint8Array(dataString.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(dataString.substring(i * 2, i * 2 + 2), 16);
        }
        return new NSData(bytes.buffer);
    }


    private parseDateString(): NSObject {
        const numericalString = this.parseString();
        if (numericalString.length > 4 && numericalString.charAt(4) === '-') {
            try {
                return new NSDate(numericalString);
            } catch (ignored) { /* Not a date */ }
        }
        return new NSNumber(numericalString);
    }


    private parseString(): string {
        const stopChars = ` \t\n\r,;=)`;
        return this.readInputUntil(...stopChars);
    }

    private parseQuotedString(): string {
        this.index++; // Skip begin token
        let end = this.index;
        let unescapedBackslash = true;
        while (this.data[end] !== ASCIIPropertyListParser.QUOTEDSTRING_END_TOKEN || (this.data[end - 1] === ASCIIPropertyListParser.QUOTEDSTRING_ESCAPE_TOKEN && unescapedBackslash)) {
            if (this.data[end] === ASCIIPropertyListParser.QUOTEDSTRING_ESCAPE_TOKEN) {
                unescapedBackslash = !(this.data[end - 1] === ASCIIPropertyListParser.QUOTEDSTRING_ESCAPE_TOKEN && unescapedBackslash);
            }
            end++;
        }
        const unescapedString = ASCIIPropertyListParser.unescapeQuotedString(this.data.substring(this.index, end));
        this.index = end + 1; // Skip end token
        return unescapedString;
    }

    private static unescapeQuotedString(s: string): string {
        return s.replace(/\\(.)/g, (match, char) => {
            switch (char) {
                case '\\': return '\\';
                case '"': return '"';
                case 'b': return '\b';
                case 'n': return '\n';
                case 'r': return '\r';
                case 't': return '\t';
                // Unicode and octal escapes are more complex and omitted for this simplified version
                default: return char;
            }
        });
    }

    private readInputUntil(...symbols: string[]): string {
        let s = "";
        while (this.index < this.data.length && !symbols.includes(this.data[this.index])) {
            s += this.data[this.index];
            this.index++;
        }
        return s;
    }
}
