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

import { Timer } from "../../../../../framework/Timer";
import { Alite } from "../../../Alite";
import { Assets } from "../../../Assets";
import { ColorScheme } from "../../../colors/ColorScheme";

class DelayedText {
    private static readonly serialVersionUID = -936827160142919485;

    text: string;
    private timer: Timer;
    private delayInSec: number;
    durationInSec: number;

    constructor(text: string, delayInSec: number) {
        this.text = text;
        this.delayInSec = delayInSec;
        this.timer = new Timer();
        this.durationInSec = 5;
    }

    passed(): boolean {
        return this.timer.hasPassedSeconds(this.delayInSec);
    }
}

export class OnScreenMessage {
    private static readonly serialVersionUID = 1948958480746165833;

    private text = "";
    private readonly activationTime = new Timer();
    private durationInSec: number;
    private repetitionIntervalInSec: number;
    private readonly lastRepetitionInactive = new Timer();
    private repetitionTimes = -1;
    private repetitionDurationInSec: number;
    private repetitionText: string;
    private scale = 1.0;
    private readonly delayedTexts: DelayedText[] = [];

    setText(text: string): void {
        this.text = text;
        this.scale = 1.0;
        this.activate(5);
    }

    setDelayedText(text: string): void {
        this.delayedTexts.push(new DelayedText(text, 10));
    }

    setScaledTextForDuration(text: string, durationInSec: number, scale: number): void {
        this.text = text;
        this.scale = scale;
        this.activate(durationInSec);
    }

    repeatText(text: string, intervalInSec: number, times: number = -1, durationInSec: number = 1): void {
        if (this.repetitionText != null && this.repetitionText === text) {
            return;
        }
        this.scale = 1.0;
        this.text = text;
        this.activate(durationInSec);
        this.repetitionDurationInSec = durationInSec;
        this.repetitionIntervalInSec = intervalInSec;
        this.repetitionText = text;
        this.repetitionTimes = times;
    }

    clearRepetition(): void {
        this.repetitionText = null;
    }

    private activate(durationInSec: number): void {
        this.activationTime.reset();
        this.durationInSec = durationInSec;
    }

    isActive(): boolean {
        return !this.activationTime.hasPassedSeconds(this.durationInSec);
    }

    render(): void {
        let toBeRemoved: DelayedText = null;
        for (const dt of this.delayedTexts) {
            if (dt.passed()) {
                this.text = dt.text;
                this.scale = 1.0;
                this.activate(dt.durationInSec);
                toBeRemoved = dt;
            }
        }
        if (toBeRemoved != null) {
            const index = this.delayedTexts.indexOf(toBeRemoved);
            if (index > -1) {
                this.delayedTexts.splice(index, 1);
            }
        }
        if (this.isActive()) {
            this.lastRepetitionInactive.reset();
            Alite.getInstance().getGraphics().drawCenteredText(this.text, 960, 650, ColorScheme.get(ColorScheme.COLOR_HUD_MESSAGE),
                Assets.regularFont, this.scale);
            return;
        }
        if (this.repetitionText == null || !this.lastRepetitionInactive.hasPassedSeconds(this.repetitionIntervalInSec)) {
            return;
        }
        if (this.repetitionTimes > 0) {
            this.repetitionTimes--;
        } else if (this.repetitionTimes === 0) {
            this.clearRepetition();
            this.repetitionTimes = -1;
            return;
        }
        this.text = this.repetitionText;
        this.activate(this.repetitionDurationInSec);
    }
}
