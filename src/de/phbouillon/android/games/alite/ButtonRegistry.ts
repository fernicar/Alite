import { Button } from "./Button";
import { TouchEvent } from "../../framework/Input";

export class ButtonRegistry {
    private static instance: ButtonRegistry;
    private buttons: Button[] = [];

    private constructor() {
        // private constructor
    }

    public static get(): ButtonRegistry {
        if (!ButtonRegistry.instance) {
            ButtonRegistry.instance = new ButtonRegistry();
        }
        return ButtonRegistry.instance;
    }

    public addButton(button: Button) {
        this.buttons.push(button);
    }

    public checkEvent(e: TouchEvent): number {
        for (const button of this.buttons) {
            if (button.isPressed(e)) {
                return button.getCommand();
            }
        }
        return 0;
    }
}
