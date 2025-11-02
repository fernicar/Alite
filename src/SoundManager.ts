// Placeholder for the Assets object, which will be implemented later.
const Assets: any = {};

export class SoundManager {
    private static audioContext = new AudioContext();

    public static play(sound: any) {
        if (sound) {
            sound.play();
        }
    }

    public static stopAll() {
        // This will be implemented once the Assets object is in place.
    }
}
