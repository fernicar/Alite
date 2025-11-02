export namespace TouchEvent {
    export const TOUCH_UP = 0;
    export const TOUCH_DOWN = 1;
}

export interface TouchEvent {
    type: number;
    x: number;
    y: number;
}
