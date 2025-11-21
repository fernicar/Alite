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

import { DOMParser } from "xmldom";
import { NSArray } from "./NSArray";
import { NSData } from "./NSData";
import { NSDate } from "./NSDate";
import { NSDictionary } from "./NSDictionary";
import { NSNumber } from "./NSNumber";
import { NSObject } from "./NSObject";
import { NSString } from "./NSString";
import { PropertyListFormatException } from "./PropertyListFormatException";

/**
 * Parses XML property lists.
 *
 * @author Daniel Dreibrodt
 */
export class XMLPropertyListParser {

    private static parser = new DOMParser();

    /**
     * Instantiation is prohibited.
     */
    private constructor() {
        /** empty **/
    }

    /**
     * Parses a XML property list from a string.
     *
     * @param xml The XML property list string.
     * @returns The root object of the property list. This is usually a NSDictionary but can also be an NSArray.
     * @throws {Error} If the XML is malformed or the property list has an invalid format.
     */
    public static parse(xml: string): NSObject {
        const doc = this.parser.parseFromString(xml, "text/xml");
        return this.parseDocument(doc);
    }


    /**
     * Parses the XML document by generating the appropriate NSObjects for each XML node.
     *
     * @param doc The XML document.
     * @returns The root NSObject of the property list contained in the XML document.
     * @throws {PropertyListFormatException} If the given property list has an invalid format.
     */
    private static parseDocument(doc: Document): NSObject {
        const docType = doc.doctype;
        if (docType === null) {
            if (doc.documentElement.nodeName !== "plist") {
                throw new Error("The given XML document is not a property list.");
            }
        } else if (docType.name !== "plist") {
            throw new Error("The given XML document is not a property list.");
        }

        let rootNode: Node;

        if (doc.documentElement.nodeName === "plist") {
            // Root element wrapped in plist tag
            const rootNodes = this.filterElementNodes(doc.documentElement.childNodes);
            if (rootNodes.length === 0) {
                throw new PropertyListFormatException("The given XML property list has no root element!");
            } else if (rootNodes.length === 1) {
                rootNode = rootNodes[0];
            } else {
                throw new PropertyListFormatException("The given XML property list has more than one root element!");
            }
        } else {
            // Root NSObject not wrapped in plist-tag
            rootNode = doc.documentElement;
        }

        return this.parseObject(rootNode);
    }

    /**
     * Parses a node in the XML structure and returns the corresponding NSObject
     *
     * @param n The XML node.
     * @returns The corresponding NSObject.
     */
    private static parseObject(n: Node): NSObject {
        const type = n.nodeName;
        switch (type) {
            case "dict": {
                const dict = new NSDictionary();
                const children = this.filterElementNodes(n.childNodes);
                for (let i = 0; i < children.length; i += 2) {
                    const key = children[i];
                    const val = children[i + 1];
                    const keyString = this.getNodeTextContents(key);
                    dict.put(keyString, this.parseObject(val));
                }
                return dict;
            }
            case "array": {
                const children = this.filterElementNodes(n.childNodes);
                const array = new NSArray(children.length);
                for (let i = 0; i < children.length; i++) {
                    array.setValue(i, this.parseObject(children[i]));
                }
                return array;
            }
            case "true":
                return new NSNumber(true);
            case "false":
                return new NSNumber(false);
            case "integer":
            case "real":
                return new NSNumber(this.getNodeTextContents(n));
            case "string":
                return new NSString(this.getNodeTextContents(n));
            case "data":
                return new NSData(this.getNodeTextContents(n));
            case "date":
                return new NSDate(this.getNodeTextContents(n));
            default:
                return null;
        }
    }

    /**
     * Returns all element nodes that are contained in a list of nodes.
     *
     * @param list The list of nodes to search.
     * @returns The sub-list containing only nodes representing actual elements.
     */
    private static filterElementNodes(list: NodeList): Node[] {
        const result: Node[] = [];
        for (let i = 0; i < list.length; i++) {
            if (list.item(i).nodeType === 1 /* Node.ELEMENT_NODE */) {
                result.push(list.item(i));
            }
        }
        return result;
    }

    /**
     * Returns a node's text content.
     *
     * @param n The node.
     * @returns The node's text content.
     */
    private static getNodeTextContents(n: Node): string {
        return n.textContent;
    }
}
