import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from "cannon";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js"

class Ship extends THREE.Object3D {
    constructor(model, slide_speed, extent) {
        super();
        this.model = model;
        this.body = null;
        this.mesh = null;
        this.clock = new THREE.Clock();
        this.elapsed = 0;
        this.ready = false;
        this.slide_speed = slide_speed
        this.extent = extent // 1/2 width of the track

        // tween to target position
        this.tweenX = null;        
        this.health = 100;
    }

    setControlScheme(controlScheme) {
        document.addEventListener('meshLoaded', evt => {
            console.log("configuring control scheme");
            controlScheme(this);
        });
    }

    tweenTo(x) {
        if(this.tweenX != null){ this.tweenX.stop() }
        this.tweenX = new TWEEN.Tween(this.mesh.position).to({
            x:x 
        },this.slide_speed).start();
    }

    slideLeft(){ this.tweenTo( -this.extent ) }
    slideRight(){this.tweenTo( this.extent ) }
    recenter(){ this.tweenTo( 0 ) }

    setCamera(camera) {
        document.addEventListener('meshLoaded', evt => {
            console.log("configuring camera");
            this.add(camera);
        });
    }

    update(delta,elapsed) {
        if (!this.ready)
            return;
        this.elapsed = elapsed;
        this.mesh.position.y = (Math.sin(this.elapsed * 2 + 5.2) + Math.sin(this.elapsed) + Math.sin(this.elapsed * 2.9 + 0.34) + Math.sin(this.elapsed * 4.6 + 9.3) ) / 4 / 2 + 0.5;
    }

    load(world,scene){
        const loader = new GLTFLoader();
        loader.load(this.model, glb => {
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
                position: new CANNON.Vec3(0, 0, 0),
                shape: new CANNON.Box(new CANNON.Vec3(0.5, 3, 0.5)),
                type: CANNON.Body.KINEMATIC,
                name: 'ship'
            });
            this.body.addEventListener("collide", e => { this.collideHandler(e) })

            this.body.mesh = this.mesh;

            world.add(this.body);
            this.add(this.mesh);
        });
    }

    applyDamage(damage){
        this.health -= damage
        if(this.health < 0){
            const event = new Event("gameOver")
            window.dispatchEvent( event )
        }else{
            const event = new CustomEvent("damageTaken",{
                detail: {
                    damage: damage,
                    health: this.health,
                }
            })
            window.dispatchEvent( event )
        }
    }

    collideHandler(event){
        const body = event.body;
        if(body.remove != undefined){
            return;
        }
        body.remove = true;

        if( body.damage != undefined){
            this.applyDamage(body.damage);
        }else if( body.value != undefined ){
            const event = new CustomEvent("coinCollected", {
                detail: {
                    value: body.value
                }
            })
            window.dispatchEvent( event )
        }
    }
}

export default Ship;
