export default Ship;
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from "cannon";

function Ship(scene, world) {
    var model = SHIP_GLB;
    var loader = new GLTFLoader();
    
    this.body = null;
    this.mesh = null;



    this.setControlScheme = function(controlScheme) {
        document.addEventListener('meshLoaded', evt => {
            console.log("configuring control scheme");
            controlScheme(this);
        });
    }

    this.setCamera = function(camera) {
        document.addEventListener('meshLoaded', evt => {
            console.log("configuring camera");
            this.mesh.add(camera);
        }); 
    }

    loader.load( model, function ( glb ) {
        console.log("loading ship model", glb.scenes);
        // mesh extracted from model.
        this.mesh = glb.scenes[0].children[0];
        console.log("mesh loaded, doing meshLoaded events");
        document.dispatchEvent(new Event("meshLoaded", {bubbles:true, cancelable:false}));
        this.mesh.position.set(0,1,0);
  
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0,0.5,0),
            shape: new CANNON.Box(new CANNON.Vec3(0.5,3,0.5)),
            type: CANNON.Body.KINEMATIC,
            name: 'ship'
        });

        this.body.mesh = this.mesh 

        world.add(this.body);
        scene.add( this.mesh );
    }.bind(this) );

}
