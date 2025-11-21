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

import { AliteGame } from "../../AliteGame";
import { AliteConfig } from "../../AliteConfig";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { ScrollPane } from "../../ScrollPane";
import { ColorScheme } from "../../colors/ColorScheme";
import { Equipment } from "../../model/Equipment";
import { EquipmentStore } from "../../model/EquipmentStore";
import { InventoryItem } from "../../model/InventoryItem";
import { LegalStatus } from "../../model/LegalStatus";
import { Player } from "../../model/Player";
import { PlayerCobra } from "../../model/PlayerCobra";
import { Rating } from "../../model/Rating";
import { Weight } from "../../model/Weight";
import { GalaxyGenerator } from "../../model/generator/GalaxyGenerator";
import { StringUtil } from "../../model/generator/StringUtil";
import { Mission } from "../../model/missions/Mission";
import { MissionManager } from "../../model/missions/MissionManager";
import { TradeGood } from "../../model/trading/TradeGood";
import { AliteScreen } from "./AliteScreen";
import { HexNumberPadScreen } from "./HexNumberPadScreen";
import { StatusScreen } from "./StatusScreen";
import { Graphics } from "../../../../framework/Graphics";
import { TouchEvent } from "../../../../framework/Input";
import { Point } from "../../../../framework/Point";
import { Screen } from "../../../../framework/Screen";


class HackerState {
    public values: Uint8Array = new Uint8Array(256);

    public getCommanderName(): string {
        const len = this.values.indexOf(0, 0);
        return new TextDecoder().decode(this.values.slice(0, len > -1 ? len : 16)).trim();
    }

    private getBitFromState(offset: number, bit: number): boolean {
        return (this.values[offset] & (1 << (bit - 1))) !== 0;
    }

    private setBitToState(value: boolean, offset: number, bit: number): void {
        const val = 1 << (bit - 1);
        this.values[offset] = (this.values[offset] & (255 - val)) + (value ? val : 0);
    }

    private getLowerHalfByte(offset: number): number { return this.values[offset] & 15; }
    private setLowerHalfByte(value: number, offset: number): void { this.values[offset] = (value & 15) + (this.values[offset] & 240); }
    private getUpperHalfByte(offset: number): number { return (this.values[offset] & 240) >> 4; }
    private setUpperHalfByte(value: number, offset: number): void { this.values[offset] = ((value & 15) << 4) + (this.values[offset] & 15); }

    private getLongFromState(offset: number, bytes: number): number {
        let result = 0;
        for (let i = 0; i < bytes; i++) {
            result = (result * 256) + this.values[offset + i];
        }
        return result;
    }

    private setLongToState(value: number, offset: number, bytes: number): void {
        for (let i = bytes - 1; i >= 0; i--) {
            this.values[offset + i] = value & 0xFF;
            value /= 256;
        }
    }


    public setCommanderName(name: string): void {
        const commanderName = new TextEncoder().encode(name);
        this.values.set(commanderName.slice(0, 16));
        for (let i = commanderName.length; i < 16; i++) {
            this.values[i] = 0;
        }
    }

    // ... (rest of the getter/setter methods for HackerState)
}


export class HackerScreen extends AliteScreen {
    private state: HackerState;
    private done: Button;
    private readonly offset: number;
    private readonly values: Button[] = new Array(256);
    private readonly scrollPane: ScrollPane;

    constructor(dis?: any) {
        super();
        this.offset = this.game.getGraphics().getTextWidth("MM", Assets.titleFont) - 8;
        this.game.getNavigationBar().setActive(false);
        this.scrollPane = new ScrollPane(0, 220, AliteConfig.SCREEN_WIDTH,
            AliteConfig.SCREEN_HEIGHT, () => new Point(AliteConfig.SCREEN_WIDTH, 16 * 80));

        if (dis) {
            dis.read(this.state.values, 0, 256);
            this.scrollPane.position.y = dis.readInt();
        } else {
            this.initializeState();
        }
    }


    public activate(): void {
        this.done = Button.createGradientTitleButton(1720, 880, 200, 200, L.string(R.string.hacker_btn_done));
        let counter = 0;
        for (let y = 0; y < 16; y++) {
            const yPos = 120 + 80 * (y + 1) - Assets.titleFont.getSize();
            for (let x = 0; x < 16; x++) {
                this.values[counter] = Button.createTitleButton(5 + this.offset * (x + 1), yPos, this.offset, 80, this.state.values[counter].toString(16).toUpperCase().padStart(2, '0'));
                counter++;
            }
        }
        this.game.getPlayer().setCheater(true);
    }


    public saveScreenState(dos: any): void {
        dos.write(this.state.values, 0, 256);
        dos.writeInt(this.scrollPane.position.y);
    }

    private initializeState(): void {
        this.state = new HackerState();
        // ... (code to populate state from game data)
    }

    private assignState(): void {
        // ... (code to assign state back to game data)
    }

    public changeState(valueIndex: number, newValue: number): void {
        this.state.values[valueIndex] = newValue;
        this.values[valueIndex].setText(newValue.toString(16).toUpperCase().padStart(2, '0'));
    }

    protected performScreenChange(): void {
        if (this.inFlightScreenChange()) return;

        const oldScreen: Screen = this.game.getCurrentScreen();
        if (!(this.newScreen instanceof HexNumberPadScreen)) {
            oldScreen.dispose();
        }
        this.game.setScreen(this.newScreen);
        this.game.getNavigationBar().performScreenChange();
        this.postScreenChange();
    }


    protected processTouch(touch: TouchEvent): void {
        this.scrollPane.handleEvent(touch);
        if (this.scrollPane.isSweepingGesture(touch)) return;

        if (this.done.isPressed(touch)) {
            this.assignState();
            this.game.getNavigationBar().setActive(true);
            this.game.getNavigationBar().setActiveIndex(AliteGame.NAVIGATION_BAR_STATUS);
            this.newScreen = new StatusScreen();
        } else if (touch.y < AliteConfig.SCREEN_HEIGHT - 60) {
            for (let i = 0; i < 256; i++) {
                const b = this.values[i];
                b.setSelected(false);
                if (b.isPressed(touch)) {
                    b.setSelected(true);
                    this.newScreen = new HexNumberPadScreen(this, i % 16 < 8 ? 975 : 60, 180, i);
                }
            }
        }
    }


    public present(deltaTime: number): void {
        const g: Graphics = this.game.getGraphics();
        g.clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayWideTitle(L.string(R.string.title_hacker));

        for (let i = 0; i < 16; i++) {
            const hex = i.toString(16).toUpperCase().padStart(2, '0');
            g.drawText(hex, 20 + this.offset * (i + 1), 140, ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT), Assets.titleFont);
        }

        this.scrollPane.scrollingFree();

        g.setClip(0, 60, -1, 930);
        for (let i = 0; i < 16; i++) {
            const hex = `${i.toString(16).toUpperCase()}0`;
            const y = 120 - this.scrollPane.position.y + 80 * (i + 1);
            g.drawText(hex, 20, y, ColorScheme.get(ColorScheme.COLOR_ADDITIONAL_TEXT), Assets.titleFont);
        }

        let count = 0;
        for (const b of this.values) {
            b.setYOffset(-this.scrollPane.position.y);
            b.setTextColor(b.isSelected() ? ColorScheme.get(ColorScheme.COLOR_BASE_INFORMATION) :
                (Math.floor(count / 16) + count % 16) % 2 === 0 ? ColorScheme.get(ColorScheme.COLOR_INFORMATION_TEXT) :
                    ColorScheme.get(ColorScheme.COLOR_MAIN_TEXT));
            b.render(g);
            count++;
        }
        g.setClip(-1, -1, -1, -1);

        this.done.render(g);
    }


    public renderNavigationBar(): void {
        // No navigation bar desired.
    }

    public getScreenCode(): number {
        return ScreenCodes.HACKER_SCREEN;
    }
}
