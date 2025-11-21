/* Alite - Discover the Universe on your Favorite Android Device
 * Copyright (C) 2015 Philipp Bouillon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful and
 * fun, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { L } from "../../L";
import { AliteLog } from "../../AliteLog";
import { TocEntry } from "./TocEntry";
import { LibraryPage } from "./LibraryPage";

export class Toc {
    public static readonly DIRECTORY_LIBRARY = "library/";
    public static readonly TOC_FILENAME = Toc.DIRECTORY_LIBRARY + "toc.xml";

    private readonly entries: TocEntry[] = [];

    private constructor() {
    }

    public static async read(is: any /* InputStream-like object, e.g., string or ArrayBuffer */): Promise<Toc> {
        const toc = new Toc();

        try {
            // Assuming `is` is a string containing the XML content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(is, "text/xml");
            const root = xmlDoc.documentElement;
            await toc.getEntriesFromParent(root, 0);
        } catch (e) {
            if (e instanceof Error) {
                AliteLog.e("Reading table of contents", "Error during reading table of contents", e);
            }
        }

        return toc;
    }

    private async getEntriesFromParent(parent: Element, level: number): Promise<void> {
        const children = parent.childNodes;
        if (children != null && children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                const childNode = children[i];
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                    const e = childNode as Element;
                    if (e.nodeName === "tocEntry") {
                        const newEntry = await Toc.parseTocEntryNode(e, level);
                        this.entries.push(newEntry);
                        await this.getEntriesFromParent(e, level + 1);
                    }
                }
            }
        }
    }

    private static async parseTocEntryNode(tocEntryNode: Element, level: number): Promise<TocEntry> {
        let linkedPage: LibraryPage = null;
        const fileName = tocEntryNode.getAttribute("file");
        try {
            // L.raw needs to be adapted for web to fetch the file content.
            // linkedPage = await LibraryPage.load(fileName, L.raw(Toc.DIRECTORY_LIBRARY + fileName + ".xml"));
        } catch (ignored) {
            AliteLog.e("[ALITE] Toc", `Error reading library node ${fileName}.`);
        }
        let name = tocEntryNode.textContent;
        name = name == null ? "" : name.replace(/\s+/g, " ").trim();
        return new TocEntry(fileName, name, linkedPage, level);
    }

    public getEntries(filter?: string): TocEntry[] {
        return filter != null ? this.filterEntries(filter) : this.entries;
    }

    private filterEntries(filter: string): TocEntry[] {
        const filteredEntries: TocEntry[] = [];
        for (const entry of this.entries) {
            const libPage = entry.getLinkedPage();
            if (libPage != null) {
                const highlights = filter.toLocaleLowerCase(/* L.getInstance().getCurrentLocale() */).split(" ");
                let paragraph = libPage.getParagraphs();
                if (paragraph != null) {
                    paragraph = paragraph.toLocaleLowerCase(/* L.getInstance().getCurrentLocale() */);
                    for (const h of highlights) {
                        if (paragraph.includes(h)) {
                            filteredEntries.push(entry);
                            break;
                        }
                    }
                }
            }
        }
        return filteredEntries;
    }
}
