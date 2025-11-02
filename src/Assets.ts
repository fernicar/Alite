import * as THREE from 'three';

export class Assets {
    // Icons
    public static launchIcon: THREE.Texture;
    public static statusIcon: THREE.Texture;
    public static buyIcon: THREE.Texture;
    public static inventoryIcon: THREE.Texture;
    public static equipIcon: THREE.Texture;
    public static galaxyIcon: THREE.Texture;
    public static localIcon: THREE.Texture;
    public static planetIcon: THREE.Texture;
    public static diskIcon: THREE.Texture;
    public static achievementsIcon: THREE.Texture;
    public static optionsIcon: THREE.Texture;
    public static academyIcon: THREE.Texture;
    public static libraryIcon: THREE.Texture;
    public static hackerIcon: THREE.Texture;
    public static quitIcon: THREE.Texture;
    public static aliteLogoSmall: THREE.Texture;
    public static yesIcon: THREE.Texture;
    public static noIcon: THREE.Texture;

    // Sounds
    public static com_aftShieldHasFailed: AudioBuffer;
    public static com_frontShieldHasFailed: AudioBuffer;
    // ... other sounds will be added here

    public static async load() {
        const textureLoader = new THREE.TextureLoader();
        const audioLoader = new THREE.AudioLoader();

        const loadTexture = (path: string) => textureLoader.loadAsync(path);
        const loadAudio = (path: string) => audioLoader.loadAsync(path);

        [
            this.launchIcon,
            this.statusIcon,
            // ... other icons
        ] = await Promise.all([
            loadTexture('assets/equipment_icons/launch.png'),
            loadTexture('assets/equipment_icons/status.png'),
            // ... other icons
        ]);

        [
            this.com_aftShieldHasFailed,
            this.com_frontShieldHasFailed,
            // ... other sounds
        ] = await Promise.all([
            loadAudio('assets/sound/computer/aft_shield_has_failed.ogg'),
            loadAudio('assets/sound/computer/front_shield_has_failed.ogg'),
            // ... other sounds
        ]);
    }
}
