/*
 * plist - An open source library to parse and generate property lists
 * Copyright (C) 2012 Keith Randall
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

import { NSObject } from './NSObject';
import { NSDictionary } from './NSDictionary';
import { NSArray } from './NSArray';
import { NSSet } from './NSSet';

// A simple in-memory binary writer
class BinaryWriter {
    private buffer: number[] = [];

    write(value: number | number[] | Uint8Array) {
        if (typeof value === 'number') {
            this.buffer.push(value & 0xFF);
        } else {
            this.buffer.push(...Array.from(value));
        }
    }

    getBytes(): Uint8Array {
        return new Uint8Array(this.buffer);
    }

    length(): number {
        return this.buffer.length;
    }
}


export class BinaryPropertyListWriter {

    public static readonly VERSION_00 = 0;

    private version = BinaryPropertyListWriter.VERSION_00;
    private out: BinaryWriter;
    private count = 0;
    private idMap = new Map<NSObject, number>();
    private idSizeInBytes = 0;

    constructor(out: BinaryWriter, version: number) {
        this.out = out;
        this.version = version;
    }

    public static async write(root: NSObject): Promise<Uint8Array> {
        const writer = new BinaryPropertyListWriter(new BinaryWriter(), this.VERSION_00);
        await writer.writeRoot(root);
        return writer.out.getBytes();
    }

    private async writeRoot(root: NSObject) {
        this.out.write(new TextEncoder().encode('bplist00'));

        root.assignIDs(this);

        this.idSizeInBytes = this.computeIdSizeInBytes(this.idMap.size);

        const offsets: number[] = new Array(this.idMap.size);

        for (const [obj, id] of this.idMap.entries()) {
            offsets[id] = this.out.length();
            if (obj === null) {
                this.write(0x00);
            } else {
                obj.toBinary(this);
            }
        }

        const offsetTableOffset = this.out.length();
        const offsetSizeInBytes = this.computeOffsetSizeInBytes(offsetTableOffset);
        for (const offset of offsets) {
            this.writeBytes(offset, offsetSizeInBytes);
        }

        // Trailer
        this.write(new Array(6).fill(0)); // 6 null bytes
        this.write(offsetSizeInBytes);
        this.write(this.idSizeInBytes);
        this.writeLong(this.idMap.size);
        this.writeLong(this.idMap.get(root));
        this.writeLong(offsetTableOffset);
    }

    assignID(obj: NSObject) {
        if (!this.idMap.has(obj)) {
            this.idMap.set(obj, this.idMap.size);
        }
    }

    getID(obj: NSObject): number {
        return this.idMap.get(obj);
    }

    private computeIdSizeInBytes(numberOfIds: number): number {
        if (numberOfIds < 256) return 1;
        if (numberOfIds < 65536) return 2;
        return 4;
    }

    private computeOffsetSizeInBytes(maxOffset: number): number {
        if (maxOffset < 256) return 1;
        if (maxOffset < 65536) return 2;
        if (maxOffset < 4294967296) return 4;
        return 8;
    }

    writeIntHeader(kind: number, value: number) {
        if (value < 15) {
            this.write((kind << 4) + value);
        } else if (value < 256) {
            this.write((kind << 4) + 15);
            this.write(0x10);
            this.writeBytes(value, 1);
        } else if (value < 65536) {
            this.write((kind << 4) + 15);
            this.write(0x11);
            this.writeBytes(value, 2);
        } else {
            this.write((kind << 4) + 15);
            this.write(0x12);
            this.writeBytes(value, 4);
        }
    }

    write(b: number | number[] | Uint8Array) {
        this.out.write(b);
    }

    writeBytes(value: number, bytes: number) {
        const buffer = new ArrayBuffer(bytes);
        const view = new DataView(buffer);
        if(bytes === 1) view.setUint8(0, value);
        else if(bytes === 2) view.setUint16(0, value, false); // Big-endian
        else if(bytes === 4) view.setUint32(0, value, false);
        else if(bytes === 8) {
             // JS handles 64-bit integers with BigInt
            view.setBigUint64(0, BigInt(value), false);
        }
        this.out.write(new Uint8Array(buffer));
    }

    writeID(id: number) {
        this.writeBytes(id, this.idSizeInBytes);
    }

    writeLong(value: number) {
        this.writeBytes(value, 8);
    }

    writeDouble(value: number) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setFloat64(0, value, false); // Big-endian
        this.out.write(new Uint8Array(buffer));
    }
}
