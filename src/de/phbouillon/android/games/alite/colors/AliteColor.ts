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

export class AliteColor {
    // Color constants from android.graphics.Color
    public static readonly BLACK = 0xFF000000;
    public static readonly DKGRAY = 0xFF444444;
    public static readonly GRAY = 0xFF888888;
    public static readonly LTGRAY = 0xFFCCCCCC;
    public static readonly WHITE = 0xFFFFFFFF;
    public static readonly RED = 0xFFFF0000;
    public static readonly GREEN = 0xFF00FF00;
    public static readonly BLUE = 0xFF0000FF;
    public static readonly YELLOW = 0xFFFFFF00;
    public static readonly CYAN = 0xFF00FFFF;
    public static readonly MAGENTA = 0xFFFF00FF;
    public static readonly TRANSPARENT = 0;

	// Further pre-defined color constants
	static readonly GRAYISH_BLUE          = 0xFF8CAAEF;
	static readonly LIGHT_GREEN           = 0xFF8CEF00;
	public static readonly ORANGE         = 0xFFEF6500;
	static readonly ELECTRIC_BLUE         = 0xFF0892D0;
	static readonly DARK_ELECTRIC_BLUE    = 0xFF085290;
	static readonly PINK                  = 0xFFEEACAC;
	static readonly DARK_PINK             = 0xFF885555;
	static readonly DKGRAY_MED_ALPHA      = 0xAA444444;
	static readonly GRAY_MED_ALPHA        = 0xAA888888;
	static readonly LIGHT_GREEN_LOW_ALPHA = 0x5500AA00;
	static readonly DARK_GREEN_LOW_ALPHA  = 0x55007700;
	static readonly LIGHT_BLUE            = 0xFFACACEE;
	static readonly DARK_BLUE             = 0xFF555588;
	static readonly LIGHT_RED_LOW_ALPHA   = 0x55AA0000;
	static readonly DARK_RED_LOW_ALPHA    = 0x55770000;

	private static readonly colorNameMap: Map<string, number> = new Map([
		["black", AliteColor.BLACK],
		["darkgray", AliteColor.DKGRAY],
		["gray", AliteColor.GRAY],
		["lightgray", AliteColor.LTGRAY],
		["white", AliteColor.WHITE],
		["red", AliteColor.RED],
		["green", AliteColor.GREEN],
		["blue", AliteColor.BLUE],
		["yellow", AliteColor.YELLOW],
		["cyan", AliteColor.CYAN],
		["magenta", AliteColor.MAGENTA],
		["aqua", 0xFF00FFFF],
		["fuchsia", 0xFFFF00FF],
		["darkgrey", AliteColor.DKGRAY],
		["grey", AliteColor.GRAY],
		["lightgrey", AliteColor.LTGRAY],
		["lime", 0xFF00FF00],
		["maroon", 0xFF800000],
		["navy", 0xFF000080],
		["olive", 0xFF808000],
		["purple", 0xFF800080],
		["silver", 0xFFC0C0C0],
		["teal", 0xFF008080],
		["transparent", AliteColor.TRANSPARENT],
		["clear", AliteColor.TRANSPARENT],
		["grayishblue", AliteColor.GRAYISH_BLUE],
		["lightgreen", AliteColor.LIGHT_GREEN],
		["orange", AliteColor.ORANGE],
		["electricblue", AliteColor.ELECTRIC_BLUE],
		["darkelectricblue", AliteColor.DARK_ELECTRIC_BLUE],
		["pink", AliteColor.PINK],
		["darkpink", AliteColor.DARK_PINK],
		["dkgraymedalpha", AliteColor.DKGRAY_MED_ALPHA],
		["graymedalpha", AliteColor.GRAY_MED_ALPHA],
		["lightgreenlowalpha", AliteColor.LIGHT_GREEN_LOW_ALPHA],
		["darkgreenlowalpha", AliteColor.DARK_GREEN_LOW_ALPHA],
		["lightblue", AliteColor.LIGHT_BLUE],
		["darkblue", AliteColor.DARK_BLUE],
		["lightredlowalpha", AliteColor.LIGHT_RED_LOW_ALPHA],
		["darkredlowalpha", AliteColor.DARK_RED_LOW_ALPHA],
		["brown", 0xFF996633],
	]);

	public static argb(alpha: number, red: number, green: number, blue: number): number {
		return ((alpha * 255.0 + 0.5) << 24) |
			   ((red   * 255.0 + 0.5) << 16) |
			   ((green * 255.0 + 0.5) <<  8) |
			   (blue  * 255.0 + 0.5);
	}

	public static colorAlpha(color: number, alpha: number): number {
		return ((alpha * 255.0 + 0.5) << 24) | (color & 0x00ffffff);
	}

	public static lighten(color: number, percent: number): number {
		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;
		const a = (color >> 24) & 0xff;

		return this.argb(a / 255.0,
			Math.min(1, r / 255.0 + percent),
			Math.min(1, g / 255.0 + percent),
			Math.min(1, b / 255.0 + percent));
	}

	public static grayScale(color: number): number {
		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;
		const a = (color >> 24) & 0xff;

		const gray = (r * 0.3 + g * 0.59 + b * 0.11) / 255.0;
		return this.argb(a / 255.0, gray, gray, gray);
	}

	public static parseColor(colorString: string): number {
		if (colorString.charAt(0) === '#') {
			let color = parseInt(colorString.substring(1), 16);
			if (colorString.length === 7) {
				color |= 0xff000000;
			} else if (colorString.length !== 9) {
				throw new Error("Unknown color");
			}
			return color;
		}
		const color = this.colorNameMap.get(colorString.toLowerCase());
		if (color !== undefined) {
			return color;
		}
		throw new Error("Unknown color");
	}
}
