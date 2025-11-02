import { TouchEvent } from "../../framework/Input";

export abstract class Component<T> {
    protected fingerDown = false;

    public isDown(): boolean {
        return this.fingerDown;
    }

    public abstract checkEvent(e: TouchEvent): boolean;
}
