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

import { GLText } from '../../../framework/impl/gl/font/GLText';

export class TextData {
	public x: number;
	public y: number;
	public text: string;
	public font: GLText;
	public color: number;
	public scale: number;

	constructor(text: string, x: number, y: number, color: number, font: GLText) {
		this.text = text;
		this.x = x;
		this.y = y;
		this.color = color;
		this.font = font;
		this.scale = 1.0;
	}
}
