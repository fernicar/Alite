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

import { AliteConfig } from "../../AliteConfig";
import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ScrollPane } from "../../ScrollPane";
import { Settings } from "../../Settings";
import { SoundManager } from "../../SoundManager";
import { ColorScheme } from "../../colors/ColorScheme";
import { Medal } from "../../model/Medal";
import { ItemDescriptor, LibraryPage, Toc, TocEntry } from "../../model/library";
import { AliteScreen } from "./AliteScreen";
import { LibraryScreen } from "./LibraryScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Pixmap } from "../../../../framework/Pixmap";
import { Point } from "../../../../framework/Point";
import { GLText } from "../../../../framework/impl/gl/font/GLText";
import { TextData } from "../../../../framework/TextData";

class PageText {
    words: StyledText[];
    positions: number[];
    pixmap: Pixmap = null;

    constructor(wordsOrPixmap: StyledText[] | Pixmap, positions?: number[]) {
        if (wordsOrPixmap instanceof Pixmap) {
            this.pixmap = wordsOrPixmap;
        } else {
            this.words = wordsOrPixmap;
            this.positions = positions;
        }
    }
}


class Sentence {
    words: StyledText[] = [];
    width: number = 0;
    cr: boolean = false;

    add(g: Graphics, word: StyledText): void {
        this.words.push(word);
        if (word.pixmap) return;
        if (this.width !== 0) {
            this.width += g.getTextWidth(" ", word.font);
        }
        this.width += g.getTextWidth(word.text, word.font);
    }

    getWidth(g: Graphics, word: StyledText): number {
        if (word.pixmap) return 0;
        if (this.width === 0) {
            return g.getTextWidth(word.text, word.font);
        }
        return this.width + g.getTextWidth(" ", word.font) + g.getTextWidth(word.text, word.font);
    }

    terminate(): void {
        this.cr = true;
    }
}


class StyledText {
    text: string;
    font: GLText;
    color: number;
    pixmap: Pixmap = null;

    constructor(textOrPixmap: string | Pixmap, font: GLText = Assets.regularFont, color: number = ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT)) {
        if (typeof textOrPixmap === 'string') {
            this.text = textOrPixmap;
            this.font = font;
            this.color = color;
        } else {
            this.pixmap = textOrPixmap;
        }
    }
}


export class LibraryPageScreen extends AliteScreen {
    // ... (rest of the class properties and methods converted to TypeScript)
    private static readonly PAGE_BEGIN = 120;
    private readonly entries: TocEntry[];
    private entryIndex: number;
    private pageHeight: number;
    private readonly scrollPane: ScrollPane;
    private readonly pageText: PageText[] = [];
    private next: Button;
    private prev: Button;
    private toc: Button;
    private backgroundImage: Button;
    private readonly images: Button[] = [];
    private imageText: string = null;
    private largeImage: Button = null;
    private readonly currentFilter: string;
    private currentFont: GLText = Assets.regularFont;
    private newFont: GLText = null;
    private currentColor: number = ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT);
    private newColor: number = -1;
    private needsCr: boolean = false;
    private readonly inlineImages: Pixmap[] = [];

    constructor(entriesOrDis: TocEntry[] | any, entryIndex?: number, currentFilter?: string) {
        super();
        // ... (constructor logic)
    }

    public activate(): void {
        // ... (activation logic)
    }

    private computePageText(g: Graphics, text: string): void {
        // ... (text formatting and layout logic)
    }

    protected processTouch(touch: TouchEvent): void {
        // ... (touch handling logic)
    }

    public present(deltaTime: number): void {
        // ... (rendering logic)
    }

    public loadAssets(): void {
        this.addPictures("prev_icon", "next_icon");
    }

    public dispose(): void {
        super.dispose();
        for (const pm of this.inlineImages) {
            pm.dispose();
        }
        this.inlineImages.length = 0;
    }

    public getScreenCode(): number {
        return ScreenCodes.LIBRARY_PAGE_SCREEN;
    }
}
