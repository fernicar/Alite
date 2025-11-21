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

import { Screen } from "./Screen";

export abstract class GlScreen extends Screen {
    private static readonly serialVersionUID = 2776881193369718139;

    private isActive: boolean;

    protected constructor() {
        super();
        this.isActive = false;
    }

    public abstract onActivation(): void;
    public abstract performUpdate(deltaTime: number): void;
    public abstract performPresent(deltaTime: number): void;

    public activate(): void {
        try {
            this.onActivation();
        } finally {
            this.isActive = true;
        }
    }

    public isActive(): boolean {
        return this.isActive;
    }

    public update(deltaTime: number): void {
        if (!this.isActive || this.isDisposed()) {
            return;
        }
        this.performUpdate(deltaTime);
    }

    public present(deltaTime: number): void {
        if (!this.isActive) {
            return;
        }
        this.performPresent(deltaTime);
    }

    public pause(): void {
        this.isActive = false;
    }

    public resume(): void {
    }

    public postScreenChange(): void {
    }

    public postNavigationRender(deltaTime: number): void {
    }

    public renderNavigationBar(): void {
    }

    public dispose(): void {
        this.pause();
        super.dispose();
    }
}
