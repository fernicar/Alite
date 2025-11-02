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
import { LibraryPage } from "./LibraryPage";
import { TocEntry } from "./TocEntry";

export class Toc {
    public static readonly DIRECTORY_LIBRARY = "library/";
    public static readonly TOC_FILENAME = Toc.DIRECTORY_LIBRARY + "toc.json";

    private readonly entries: TocEntry[] = [];

    private constructor() {
    }

    public static async read(): Promise<Toc> {
        const toc = new Toc();

        try {
            const response = await fetch(Toc.TOC_FILENAME);
            const data = await response.json();
            toc.getEntriesFromParent(data, 0);
        } catch (e) {
            console.error("Reading table of contents", "Error during reading table of contents", e);
        }

        return toc;
    }

    private getEntriesFromParent(parent: any, level: number): void {
        if (parent.children) {
            for (const child of parent.children) {
                if (child.tag === "tocEntry") {
                    const newEntry = this.parseTocEntryNode(child, level);
                    this.entries.push(newEntry);
                    this.getEntriesFromParent(child, level + 1);
                }
            }
        }
    }

    private parseTocEntryNode(tocEntryNode: any, level: number): TocEntry {
        const fileName = tocEntryNode.attr.file;
        let linkedPage: LibraryPage | null = null;
        try {
            // This is a placeholder for L.raw
            const content = `{"tag":"page","children":[{"tag":"paragraph","children":["Lorem ipsum..."]}]}`;
            linkedPage = LibraryPage.load(fileName, content);
        } catch (ignored) {
            console.error("[ALITE] Toc", "Error reading library node " + fileName + ".");
        }
        const name = tocEntryNode.children[0].text.replace(/\s+/g, " ").trim();
        return new TocEntry(fileName, name, linkedPage!, level);
    }

    public getEntries(filter?: string): TocEntry[] {
        return filter ? this.filterEntries(filter) : this.entries;
    }

    private filterEntries(filter: string): TocEntry[] {
        const filteredEntries: TocEntry[] = [];
        for (const entry of this.entries) {
            const libPage = entry.getLinkedPage();
            if (libPage) {
                const highlights = filter.toLowerCase().split(" ");
                let paragraph = libPage.getParagraphs();
                if (paragraph) {
                    paragraph = paragraph.toLowerCase();
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
