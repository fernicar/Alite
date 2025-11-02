import * as THREE from 'three';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './AliteConfig';
import { InputManager } from './InputManager';

class Alite {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private inputManager: InputManager;
    private cube: THREE.Mesh;

    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
        this.camera.position.z = 5;

        this.inputManager = new InputManager();

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);
    }

    public start() {
        this.animate();
    }

    private animate() {
        requestAnimationFrame(() => this.animate());

        const roll = this.inputManager.getRoll();
        const pitch = this.inputManager.getPitch();

        this.cube.rotation.y += roll * 0.05;
        this.cube.rotation.x += pitch * 0.05;

        this.renderer.render(this.scene, this.camera);
    }
}

export default Alite;
