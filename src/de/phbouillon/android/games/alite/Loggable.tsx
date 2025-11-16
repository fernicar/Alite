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

export interface Loggable {
	debug(title: string, message: string): void;
	warning(title: string, message: string): void;
	error(title: string, message: string, cause?: Error): void;

	/**
	 * NOTE: WebGL vendor data may be limited depending on the browser and hardware.
	 */
	getGlVendorData(name: number): string;

	/**
	 * NOTE: Browser environments do not provide direct access to memory data.
	 * This method may return limited or estimated information.
	 */
	getMemoryData(): string;

	/**
	 * NOTE: Browser environments provide limited device information.
	 * This method may return a user agent string or other available details.
	 */
	getDeviceInfo(): string;
}
