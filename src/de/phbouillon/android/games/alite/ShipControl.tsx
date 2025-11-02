import { L } from "./L";

export enum ShipControl {
    ACCELEROMETER,
    ALTERNATIVE_ACCELEROMETER,
    CONTROL_PAD,
    CURSOR_BLOCK,
    CURSOR_SPLIT_BLOCK,
}

export namespace ShipControl {
    export function getDescription(control: ShipControl): string {
        switch (control) {
            case ShipControl.ACCELEROMETER:
                return L.string("ship_ctrl_acc");
            case ShipControl.ALTERNATIVE_ACCELEROMETER:
                return L.string("ship_ctrl_alt_acc");
            case ShipControl.CONTROL_PAD:
                return L.string("ship_ctrl_control_pad");
            case ShipControl.CURSOR_BLOCK:
                return L.string("ship_ctrl_cursor_block");
            case ShipControl.CURSOR_SPLIT_BLOCK:
                return L.string("ship_ctrl_cursor_split_block");
            default:
                return "";
        }
    }
}
