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

import { AliteLog } from "../../AliteLog";
import { Assets } from "../../Assets";
import { Button } from "../../Button";
import { L } from "../../L";
import { R } from "../../R";
import { ScreenCodes } from "../../ScreenCodes";
import { Settings } from "../../Settings";
import { SoundManager } from "../../SoundManager";
import { ColorScheme } from "../../colors/ColorScheme";
import { Equipment } from "../../model/Equipment";
import { EquipmentStore } from "../../model/EquipmentStore";
import { Player } from "../../model/Player";
import { PlayerCobra } from "../../model/PlayerCobra";
import { GalaxyGenerator } from "../../model/generator/GalaxyGenerator";
import { SystemData } from "../../model/generator/SystemData";
import { Mission } from "../../model/missions/Mission";
import { MissionManager } from "../../model/missions/MissionManager";
import { LaserPositionSelectionScreen } from "./LaserPositionSelectionScreen";
import { TradeScreen } from "./TradeScreen";
import { Pixmap } from "../../../../framework/Pixmap";
import { Screen } from "../../../../framework/Screen";

//This screen never needs to be serialized, as it is not part of the InGame state.
export class EquipmentScreen extends TradeScreen {
    private mountLaserPosition: number = -1;
    private static equipment: Map<number, Pixmap[]>;
    private equippedEquipment: Equipment = null;

    // default public constructor is required for navigation bar
    public constructor(pendingSelection: string = null) {
        super(true, pendingSelection);
    }

    protected createButtons(): void {
        this.tradeButton.length = 0; // .clear()
        const currentSystem: SystemData = this.game.getPlayer().getCurrentSystem();
        let techLevel: number = 1;
        let orphan: boolean = false;
        const galDrive: Equipment = EquipmentStore.get().getEquipmentById(EquipmentStore.GALACTIC_HYPERDRIVE);
        if (currentSystem != null) {
            techLevel = currentSystem.getTechLevel();
            orphan = this.game.getGenerator().isOrphan(currentSystem.getId());
        }
        const i = EquipmentStore.get().getIterator();
        let pos = 0;
        for (const e of i) {
            if (techLevel <= e.getMinTechLevel() &&
                (Settings.maxGalaxies === GalaxyGenerator.GALAXY_COUNT || !orphan || e !== galDrive)) {
                // Only show equipment items that are available on worlds with the given tech level or
                // we're in extended galaxy mode on an orphan planet and it's a galactic hyperdrive.
                continue;
            }
            const b = Button.createPictureButton(pos % TradeScreen.COLUMNS * TradeScreen.GAP_X + TradeScreen.X_OFFSET,
                Math.floor(pos / TradeScreen.COLUMNS) * TradeScreen.GAP_Y + TradeScreen.Y_OFFSET, TradeScreen.SIZE, TradeScreen.SIZE, EquipmentScreen.equipment.get(e.getId())[0])
                .setName(String(e.getId()));
            this.tradeButton.push(b);
            if (EquipmentScreen.equipment.get(e.getId()).length > 1) {
                b.setAnimation(EquipmentScreen.equipment.get(e.getId()));
            }
            pos++;
        }
    }

    protected getCost(index: number): string {
        const price: number = this.getEquipment(index).getCost();
        if (price === -1) { // variable price for fuel
            const currentSystem: SystemData = this.game.getPlayer().getCurrentSystem();
            return L.getOneDecimalFormatString(R.string.cash_amount_value_ccy, currentSystem == null ? 10 : currentSystem.getFuelPrice());
        }
        return L.string(R.string.cash_int_amount_value_ccy, price / 10);
    }

    private getEquipment(index: number): Equipment {
        return index < 0 ? null : EquipmentStore.get().getEquipmentByHash(this.getEquipmentId(index));
    }

    private getEquipmentId(index: number): number {
        return parseInt(this.tradeButton[index].getName());
    }

    public present(deltaTime: number): void {
        this.game.getGraphics().clear(ColorScheme.get(ColorScheme.COLOR_BACKGROUND));
        this.displayTitle(L.string(R.string.title_equip_ship));

        this.presentTradeGoods(deltaTime);
    }

    public clearSelection(): void {
        this.selectionIndex = -1;
        this.equippedEquipment = null;
    }

    protected presentSelection(index: number): void {
        const equipment: Equipment = this.getEquipment(index);
        this.game.getGraphics().drawText(L.string(R.string.equip_info, equipment.getName()),
            TradeScreen.X_OFFSET, 1050, ColorScheme.get(ColorScheme.COLOR_MESSAGE), Assets.regularFont);
    }

    public setLaserPosition(laserPosition: number): void {
        this.mountLaserPosition = laserPosition;
    }

    public getSelectedEquipment(): Equipment {
        return this.getEquipment(this.selectionIndex);
    }

    private maintainLaser(pos: number, laser: Equipment): number {
        const laserInPos: Equipment = this.game.getCobra().getLaser(pos);
        return laserInPos == null ? 0 : laserInPos === laser ? -1 : 1;
    }

    protected performTrade(index: number): void {
        const equipment: Equipment = this.getEquipment(index);
        const player: Player = this.game.getPlayer();
        for (const mission of MissionManager.getInstance().getActiveMissions()) {
            if (mission.performTrade(this, equipment)) {
                return;
            }
        }
        const cobra: PlayerCobra = player.getCobra();
        let price: number = equipment.getCost();
        let where: number = -1;
        let laserState: number = 0;
        if (equipment.isLaser()) {
            if (this.mountLaserPosition === -1) {
                this.newScreen = new LaserPositionSelectionScreen(this,
                    this.maintainLaser(PlayerCobra.DIR_FRONT, equipment),
                    this.maintainLaser(PlayerCobra.DIR_RIGHT, equipment),
                    this.maintainLaser(PlayerCobra.DIR_REAR, equipment),
                    this.maintainLaser(PlayerCobra.DIR_LEFT, equipment), index);
                return;
            }
            if (this.mountLaserPosition === -2) {
                // Do nothing: User canceled.
                this.mountLaserPosition = -1;
                return;
            }
            where = this.mountLaserPosition;
            this.mountLaserPosition = -1;
            laserState = this.maintainLaser(where, equipment);
            if (laserState !== 0) {
                price = laserState < 0 ? -equipment.getCost() : equipment.getCost() - cobra.getLaser(where).getCost();
            }
        }
        if (player.getCash() < price) {
            this.showMessageDialog(L.string(R.string.trade_not_enough_money));
            SoundManager.play(Assets.error);
            return;
        }
        if (equipment.getCost() === -1) {
            // Fuel
            if (cobra.getFuel() === cobra.getMaxFuel()) {
                this.showMessageDialog(L.getOneDecimalFormatString(R.string.equip_fuel_full, cobra.getMaxFuel()));
                SoundManager.play(Assets.error);
                return;
            }
        }
        if (!equipment.isLaser() && cobra.isEquipmentInstalled(equipment)) {
            this.showMessageDialog(L.string(R.string.equip_only_one_allowed, equipment.getShortName()));
            SoundManager.play(Assets.error);
            return;
        }
        if (cobra.isEquipmentInstalled(EquipmentStore.get().getEquipmentById(EquipmentStore.NAVAL_ENERGY_UNIT)) &&
            equipment.equals(EquipmentStore.get().getEquipmentById(EquipmentStore.EXTRA_ENERGY_UNIT))) {
            this.showMessageDialog(L.string(R.string.equip_only_one_allowed, equipment.getShortName()));
            SoundManager.play(Assets.error);
            return;
        }

        if (equipment.isLaser()) {
            player.setCash(player.getCash() - price);
            cobra.setLaser(where, laserState < 0 ? null : equipment);
            this.disposeSelectedAnimation(this.selectionIndex);
            this.selectionIndex = -1;
            this.cashLeft = this.getCashLeftString();

            SoundManager.play(Assets.kaChing);
            this.performAutoSave();
            return;
        }

        if (equipment.getCost() === -1) {
            // Fuel
            price = player.getCurrentSystem() == null ? 10 : player.getCurrentSystem().getFuelPrice();
            const fuelToBuy: number = cobra.getMaxFuel() - cobra.getFuel();
            const priceToPay: number = fuelToBuy * price / 10;
            if (priceToPay > player.getCash()) {
                this.showMessageDialog(L.string(R.string.trade_not_enough_money));
                SoundManager.play(Assets.error);
                return;
            }
            player.setCash(player.getCash() - priceToPay);
            player.getCobra().setFuel(cobra.getMaxFuel());
            this.disposeSelectedAnimation(this.selectionIndex);
            this.selectionIndex = -1;
            this.cashLeft = this.getCashLeftString();
            SoundManager.play(Assets.kaChing);
            this.equippedEquipment = EquipmentStore.get().getEquipmentById(EquipmentStore.FUEL);
            this.performAutoSave();
            return;
        }

        if (equipment === EquipmentStore.get().getEquipmentById(EquipmentStore.MISSILES)) {
            if (cobra.getMissiles() === PlayerCobra.MAXIMUM_MISSILES) {
                this.showMessageDialog(L.string(R.string.equip_max_missiles_reached, PlayerCobra.MAXIMUM_MISSILES));
                SoundManager.play(Assets.error);
                return;
            }
            player.setCash(player.getCash() - price);
            cobra.setMissiles(cobra.getMissiles() + 1);
            this.disposeSelectedAnimation(this.selectionIndex);
            this.selectionIndex = -1;
            this.cashLeft = this.getCashLeftString();
            SoundManager.play(Assets.kaChing);
            this.equippedEquipment = EquipmentStore.get().getEquipmentById(EquipmentStore.MISSILES);
            this.performAutoSave();
            return;
        }

        player.setCash(player.getCash() - price);
        cobra.addEquipment(equipment);
        if (equipment === EquipmentStore.get().getEquipmentById(EquipmentStore.RETRO_ROCKETS)) {
            cobra.setRetroRocketsUseCount(4 + Math.floor(Math.random() * 3));
        }
        SoundManager.play(Assets.kaChing);
        this.disposeSelectedAnimation(this.selectionIndex);
        this.selectionIndex = -1;
        this.cashLeft = this.getCashLeftString();
        this.equippedEquipment = equipment;
        this.performAutoSave();
    }

    private async performAutoSave(): Promise<void> {
        try {
            await this.game.autoSave();
        } catch (e) {
            AliteLog.e("Auto saving failed", e.message, e);
        }
    }

    protected disposeSelectedAnimation(index: number): void {
        this.equippedEquipment = null;
        const pixmaps = EquipmentScreen.equipment.get(this.getEquipmentId(index));
        if (pixmaps && pixmaps.length > 1) {
            const originalFirst = pixmaps.shift(); // keep first item
            for (const p of pixmaps) {
                p.dispose();
            }
            // Clear the array and put the first one back
            pixmaps.length = 0;
            pixmaps.push(originalFirst);
        }
    }


    public getEquippedEquipment(): Equipment {
        return this.equippedEquipment;
    }

    protected async loadSelectedAnimation(): Promise<void> {
        await this.loadEquipmentAnimation(this.selectionIndex);
        this.tradeButton[this.selectionIndex].setAnimation(EquipmentScreen.equipment.get(this.getEquipmentId(this.selectionIndex)));
    }

    protected performScreenChange(): void {
        if (this.inFlightScreenChange()) {
            return;
        }
        const oldScreen: Screen = this.game.getCurrentScreen();
        if (!(this.newScreen instanceof LaserPositionSelectionScreen)) {
            oldScreen.dispose();
        }
        this.game.setScreen(this.newScreen);
        this.game.getNavigationBar().performScreenChange();
        this.postScreenChange();
    }

    private async loadEquipmentAnimation(index: number): Promise<void> {
        const eqId: number = this.getEquipmentId(index);
        const path: string = EquipmentStore.get().getEquipmentByHash(eqId).getIcon();
        let i = 1;
        while (true) {
            const icon: Pixmap = await this.newAssetPixmap(path + "/" + i);
            if (icon == null) {
                break;
            }
            EquipmentScreen.equipment.get(eqId).push(icon);
            i++;
        }
    }

    private async newAssetPixmap(fileName: string): Promise<Pixmap> {
        try {
            fileName += ".png";
            const data = await this.game.getFileIO().readAssetFile(fileName);
            return this.game.getGraphics().newPixmap(fileName, data, 225, 225);
        } catch (ignored) {
            return null;
        }
    }

    public async loadAssets(): Promise<void> {
        EquipmentScreen.equipment = new Map<number, Pixmap[]>();
        const i = EquipmentStore.get().getIterator();
        for await (const e of i) {
            const p: Pixmap[] = [];
            if (!await this.game.getFileIO().existsAssetFile(e.getIcon() + ".png")) {
                e.setDefaultIcon();
            }
            p.push(await this.newAssetPixmap(e.getIcon()));
            EquipmentScreen.equipment.set(e.getId(), p);
        }
        super.loadAssets();
    }


    public dispose(): void {
        super.dispose();
        if (EquipmentScreen.equipment != null) {
            for (const ps of EquipmentScreen.equipment.values()) {
                if (ps && ps.length > 0) {
                    ps[0].dispose();
                }
            }
        }
    }

    public getScreenCode(): number {
        return ScreenCodes.EQUIP_SCREEN;
    }
}
