import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from "cannon";
import * as THREE from "three";
import Tween from "./tween";

class Ship {
    constructor(scene, world) {
        var model = SHIP_GLB;
        var loader = new GLTFLoader();

        this.body = null;
        this.mesh = null;
        this.clock = new THREE.Clock();
        this.elapsed = 0;
        this.ready = false;
        // tween to target position
        this.tweenX = null;        

        this.setControlScheme = function (controlScheme) {
            document.addEventListener('meshLoaded', evt => {
                console.log("configuring control scheme");
                controlScheme(this);
            });
        };

        this.setCamera = function (camera) {
            document.addEventListener('meshLoaded', evt => {
                console.log("configuring camera");
                this.mesh.add(camera);
            });
        };

        this.update = function () {
            const dt = this.clock.getDelta();
            if (!this.ready)
                return;
            this.elapsed += dt;

            if (this.tweenX) {
               this.mesh.position.x = this.tweenX.current;               
            }
            this.mesh.position.y = Math.sin(this.elapsed / 2) + 1;
        };

        loader.load(model, function (glb) {
            console.log("loading ship model", glb.scenes);
            this.mesh = glb.scenes[0].children[0];
            console.log("mesh loaded, doing meshLoaded events");
            this.ready = true;
            document.dispatchEvent(new Event("meshLoaded", { bubbles: true, cancelable: false }));
            this.mesh.position.set(0, 1, 0);

            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.body = new CANNON.Body({
                mass: 5,
                position: new CANNON.Vec3(0, 0.5, 0),
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 3, 0.5)),
                type: CANNON.Body.KINEMATIC,
                name: 'ship'
            });

            this.body.mesh = this.mesh;

            world.add(this.body);
            scene.add(this.mesh);
        }.bind(this));

    }
}

export default Ship;
