export class InputManager {
    private keys: { [key: string]: boolean } = {};

    constructor() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    private onKeyDown(event: KeyboardEvent) {
        this.keys[event.code] = true;
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys[event.code] = false;
    }

    public isKeyPressed(keyCode: string): boolean {
        return this.keys[keyCode] || false;
    }

    public getRoll(): number {
        if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) {
            return -1;
        }
        if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) {
            return 1;
        }
        return 0;
    }

    public getPitch(): number {
        if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) {
            return 1;
        }
        if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) {
            return -1;
        }
        return 0;
    }
}
