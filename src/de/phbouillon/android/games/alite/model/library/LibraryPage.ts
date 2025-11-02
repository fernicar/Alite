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

import { ItemDescriptor } from "./ItemDescriptor";

export class LibraryPage {
    private paragraphs: string[];
    private images: ItemDescriptor[];
    private backgroundImage: ItemDescriptor | null;
    private watched: boolean;

    private static getPageText(root: any): any {
        return root.children.find((c: any) => c.tag === "Content").children.find((c: any) => c.tag === "Text");
    }

    private static getParagraphsFromText(text: any): string[] {
        const result: string[] = [];
        if (text.children) {
            for (const child of text.children) {
                if (child.tag === "p") {
                    result.push(child.children[0].text.replace(/\s+/g, " "));
                } else if (child.tag === "InlineImage") {
                    result.push(`[G:${child.attr.name}]`);
                } else if (child.tag === "table") {
                    const table = `[T:${child.children[0].text.replace(/\s+/g, "[s]").replace(/\n/g, "")}:T]\n\n`;
                    result.push(table);
                }
            }
        }
        if (result.length === 0) {
            result.push(text.children[0].text.replace(/\s+/g, " "));
        }
        return result;
    }

    private static extractItems(itemNodes: any[]): ItemDescriptor[] {
        const result: ItemDescriptor[] = [];
        if (itemNodes) {
            for (const object of itemNodes) {
                const texts = object.children.filter((c: any) => c.tag === "Text");
                let text = "";
                if (texts.length > 0) {
                    const desc = this.getParagraphsFromText(texts[0]);
                    if (desc.length > 0) {
                        text = desc.join("\n\n").trim();
                    }
                }
                const item = new ItemDescriptor(object.attr.name, text, object.attr.localized === "true");
                result.push(item);
            }
        }
        return result;
    }

    private static getImages(root: any): ItemDescriptor[] {
        const images = root.children.find((c: any) => c.tag === "Content").children.filter((c: any) => c.tag === "Image");
        return this.extractItems(images);
    }

    private static getBackgroundImage(root: any): ItemDescriptor | null {
        const backgroundImage = root.children.find((c: any) => c.tag === "Content").children.filter((c: any) => c.tag === "BackgroundImage");
        const itemDescriptors = this.extractItems(backgroundImage);
        return itemDescriptors.length > 0 ? itemDescriptors[0] : null;
    }

    public static load(fileName: string, content: string): LibraryPage {
        const result = new LibraryPage();
        try {
            const root = JSON.parse(content);
            result.paragraphs = this.getParagraphsFromText(this.getPageText(root));
            result.images = this.getImages(root);
            result.backgroundImage = this.getBackgroundImage(root);
        } catch (t) {
            console.error("Error reading Library Page " + fileName, "An error occurred while parsing page " + fileName + ".", t);
        }
        return result;
    }

    public getParagraphs(): string | null {
        if (!this.paragraphs) {
            return null;
        }
        return this.paragraphs.join("\n\n");
    }

    public toString(): string {
        let builder = "";
        builder += "Content:\n";
        builder += !this.paragraphs || this.paragraphs.length === 0 ? "-" : this.getParagraphs();
        if (this.images && this.images.length > 0) {
            builder += "Images:\n";
            for (const id of this.images) {
                builder += `  Name: ${id.getFileName()}\n`;
                builder += `  Desc: ${id.getText()}\n`;
                builder += `  Localized: ${id.isLocalized()}\n`;
            }
            builder += "\n";
        }
        if (this.backgroundImage) {
            builder += "backgroundImage:\n";
            builder += `  Name: ${this.backgroundImage.getFileName()}\n\n`;
        }
        return builder;
    }

    public getImages(): ItemDescriptor[] {
        return this.images;
    }

    public getBackgroundImage(): ItemDescriptor | null {
        return this.backgroundImage;
    }

    public isWatched(): boolean {
        if (this.images) {
            for (const image of this.images) {
                if (!image.isWatched()) {
                    return false;
                }
            }
        }
        return this.watched && (!this.backgroundImage || this.backgroundImage.isWatched());
    }

    public setWatched(): void {
        this.watched = true;
    }
}
