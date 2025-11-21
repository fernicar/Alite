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

import { Screen } from "../../framework/Screen";
import { Alite } from "../Alite";
import { AliteLog } from "../AliteLog";
import { ScreenCodes } from "./ScreenCodes";
import { NavigationBar } from "./screens/NavigationBar";
import { BuyScreen } from "./screens/canvas/BuyScreen";
import { EquipmentScreen } from "./screens/canvas/EquipmentScreen";
import { InventoryScreen } from "./screens/canvas/InventoryScreen";
import { GalaxyScreen } from "./screens/canvas/GalaxyScreen";
import { LocalScreen } from "./screens/canvas/LocalScreen";
import { ShipIntroScreen } from "./screens/canvas/ShipIntroScreen";
import { StatusScreen } from "./screens/canvas/StatusScreen";
import { PlanetScreen } from "./screens/canvas/PlanetScreen";
import { QuantityPadScreen } from "./screens/canvas/QuantityPadScreen";
import { DiskScreen } from "./screens/canvas/DiskScreen";
import { LoadScreen } from "./screens/canvas/LoadScreen";
import { SaveScreen } from "./screens/canvas/SaveScreen";
import { CatalogScreen } from "./screens/canvas/CatalogScreen";
import { OptionsScreen } from "./screens/canvas/options/OptionsScreen";
import { DisplayOptionsScreen } from "./screens/canvas/options/DisplayOptionsScreen";
import { PluginsScreen } from "./screens/canvas/PluginsScreen";
import { AudioOptionsScreen } from "./screens/canvas/options/AudioOptionsScreen";
import { ControlOptionsScreen } from "./screens/canvas/options/ControlOptionsScreen";
import { GameplayOptionsScreen } from "./screens/canvas/options/GameplayOptionsScreen";
import { InFlightButtonsOptionsScreen } from "./screens/canvas/options/InFlightButtonsOptionsScreen";
import { DebugSettingsScreen } from "./screens/canvas/options/DebugSettingsScreen";
import { MoreDebugSettingsScreen } from "./screens/canvas/options/MoreDebugSettingsScreen";
import { AboutScreen } from "./screens/opengl/AboutScreen";
import { LibraryScreen } from "./screens/canvas/LibraryScreen";
import { LibraryPageScreen } from "./screens/canvas/LibraryPageScreen";
import { TutorialSelectionScreen } from "./screens/canvas/tutorial/TutorialSelectionScreen";
import { HackerScreen } from "./screens/canvas/HackerScreen";
import { HexNumberPadScreen } from "./screens/canvas/HexNumberPadScreen";
import { ConstrictorScreen } from "./screens/canvas/missions/ConstrictorScreen";
import { CougarScreen } from "./screens/canvas/missions/CougarScreen";
import { SupernovaScreen } from "./screens/canvas/missions/SupernovaScreen";
import { ThargoidDocumentsScreen } from "./screens/canvas/missions/ThargoidDocumentsScreen";
import { ThargoidStationScreen } from "./screens/canvas/missions/ThargoidStationScreen";
import { TutIntroduction } from "./screens/canvas/tutorial/TutIntroduction";
import { TutTrading } from "./screens/canvas/tutorial/TutTrading";
import { TutEquipment } from "./screens/canvas/tutorial/TutEquipment";
import { TutNavigation } from "./screens/canvas/tutorial/TutNavigation";
import { TutHud } from "./screens/canvas/tutorial/TutHud";
import { TutBasicFlying } from "./screens/canvas/tutorial/TutBasicFlying";
import { TutAdvancedFlying } from "./screens/canvas/tutorial/TutAdvancedFlying";
import { HyperspaceScreen } from "./screens/opengl/HyperspaceScreen";
import { FlightScreen } from "./screens/opengl/ingame/FlightScreen";
import { AchievementsScreen } from "./screens/canvas/AchievementsScreen";


export class ScreenBuilder {
    public static createScreen(state: Uint8Array): boolean {
        const screenCode = state[0];
        // In web, we'll need a way to manage global state loading. This is a placeholder.
        if (screenCode !== ScreenCodes.FLIGHT_SCREEN) {
            try {
                AliteLog.d("[ALITE]", "Loading autosave.");
                Alite.get().autoLoad();
            } catch (e) {
                AliteLog.e("[ALITE]", "Loading autosave commander failed.", e);
            }
        }

        try {
            // DataInputStream would be replaced by a custom DataView-based reader
            const dis = {
                _buffer: new DataView(state.buffer, 1),
                _offset: 0,
                readByte: function() { const v = this._buffer.getInt8(this._offset); this._offset += 1; return v; },
                readInt: function() { const v = this._buffer.getInt32(this._offset); this._offset += 4; return v; },
                readFloat: function() { const v = this._buffer.getFloat32(this._offset); this._offset += 4; return v; },
                readBoolean: function() { return this.readByte() !== 0; },
            };
            AliteLog.d("[ALITE]", `Set screen, code: ${screenCode}.`);
            Alite.get().setScreen(this.getInstanceByScreenCode(dis as any, screenCode));
            return true;
        } catch (e) {
             AliteLog.e("ScreenBuilderError", `Error creating screen instance for code ${screenCode}.`, e);
        } finally {
            this.moveToScreen();
        }
        return false;
    }

    private static getInstanceByScreenCode(dis: any, screenCode: number): Screen {
        // This replaces the massive switch case with a more maintainable map.
        const screenMap: { [key: number]: (d: any) => Screen } = {
            [ScreenCodes.BUY_SCREEN]: d => new BuyScreen(this.readString(d)),
            [ScreenCodes.EQUIP_SCREEN]: d => new EquipmentScreen(this.readString(d)),
            [ScreenCodes.INVENTORY_SCREEN]: d => new InventoryScreen(this.readString(d)),
            [ScreenCodes.GALAXY_SCREEN]: d => new GalaxyScreen(d.readFloat(), d.readInt(), d.readInt()),
            [ScreenCodes.LOCAL_SCREEN]: d => new LocalScreen(d.readFloat(), d.readInt(), d.readInt()),
            [ScreenCodes.SHIP_INTRO_SCREEN]: d => new ShipIntroScreen(this.readString(d)),
            [ScreenCodes.STATUS_SCREEN]: d => new StatusScreen(),
            [ScreenCodes.PLANET_SCREEN]: d => { PlanetScreen.disposeInhabitantLayers(); return new PlanetScreen(); },
            [ScreenCodes.QUANTITY_PAD_SCREEN]: d => new QuantityPadScreen(d),
            // ... and so on for all screen codes
        };

        const factory = screenMap[screenCode];
        if(factory) {
            return factory(dis);
        }

        throw new Error(`Screen code ${screenCode} not found in factory.`);
    }


    private static moveToScreen(): void {
        const screen = Alite.get().getCurrentScreen();
        if (!screen) return;
        const navigationBar = Alite.get().getNavigationBar();
        const screenCode = screen.getScreenCode();

        const navMap: { [key: number]: number } = {
            [ScreenCodes.STATUS_SCREEN]: Alite.NAVIGATION_BAR_STATUS,
            [ScreenCodes.BUY_SCREEN]: Alite.NAVIGATION_BAR_BUY,
            [ScreenCodes.QUANTITY_PAD_SCREEN]: Alite.NAVIGATION_BAR_BUY,
            [ScreenCodes.INVENTORY_SCREEN]: Alite.NAVIGATION_BAR_INVENTORY,
            [ScreenCodes.EQUIP_SCREEN]: Alite.NAVIGATION_BAR_EQUIP,
            [ScreenCodes.GALAXY_SCREEN]: Alite.NAVIGATION_BAR_GALAXY,
            [ScreenCodes.LOCAL_SCREEN]: Alite.NAVIGATION_BAR_LOCAL,
            [ScreenCodes.PLANET_SCREEN]: Alite.NAVIGATION_BAR_PLANET,
            [ScreenCodes.DISK_SCREEN]: Alite.NAVIGATION_BAR_DISK,
            [ScreenCodes.CATALOG_SCREEN]: Alite.NAVIGATION_BAR_DISK,
            [ScreenCodes.LOAD_SCREEN]: Alite.NAVIGATION_BAR_DISK,
            [ScreenCodes.SAVE_SCREEN]: Alite.NAVIGATION_BAR_DISK,
            [ScreenCodes.ACHIEVEMENTS_SCREEN]: Alite.NAVIGATION_BAR_ACHIEVEMENTS,
            [ScreenCodes.LIBRARY_SCREEN]: Alite.NAVIGATION_BAR_LIBRARY,
            [ScreenCodes.LIBRARY_PAGE_SCREEN]: Alite.NAVIGATION_BAR_LIBRARY,
            [ScreenCodes.TUTORIAL_SELECTION_SCREEN]: Alite.NAVIGATION_BAR_ACADEMY,
        };

        if (navMap[screenCode] !== undefined) {
             if(screenCode === ScreenCodes.STATUS_SCREEN) {
                Alite.get().setStatusOrAchievements();
             } else {
                navigationBar.setActiveIndex(navMap[screenCode]);
             }
        } else if (screenCode >= ScreenCodes.OPTIONS_SCREEN && screenCode <= ScreenCodes.MORE_DEBUG_OPTIONS_SCREEN) {
             navigationBar.setActiveIndex(Alite.NAVIGATION_BAR_OPTIONS);
        } else if (screenCode === ScreenCodes.HACKER_SCREEN && Alite.get().isHackerActive()) {
             navigationBar.setActiveIndex(Alite.NAVIGATION_BAR_HACKER);
        }
    }


    public static writeString(dos: any, str: string): void {
        dos.writeByte(str ? str.length : 0);
        if (str) {
            dos.writeChars(str);
        }
    }

    public static readString(dis: any): string {
        const length = dis.readByte();
        if (length === 0) return null;
        let result = "";
        for (let i = 0; i < length; i++) {
            result += dis.readChar();
        }
        return result;
    }

    public static readEmptyString(dis: any): string {
        const result = this.readString(dis);
        return result || "";
    }
}
