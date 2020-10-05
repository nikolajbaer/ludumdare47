import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from "cannon";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js"
import { SphereGeometry } from 'three';


function bleed(number, rate, threshold) {
    if (Math.abs(number) < threshold) {
        number = 0;
    } else if (number < 0) {
        number += rate;
    } else if (number > 0) {
        number -= rate;
    }
    return number;
}

function addhashes(v1, v2) {
    var v3 = {}
    var key = null
    for (key in v1) {
        v3[key] = v1[key] + v2[key];
    }
    return v3;
}

class Particle extends THREE.Object3D {
    constructor(startingPosition) {
        const COLORS = [
            'yellow', 'orange'
        ]
        super();
        this.clock = new THREE.Clock();
        this.clock.start();
        this.ttl = 0.25;
        this.drag = 0.0001;
        this.startX = (Math.random() < 0.5 ? 0.29 : -0.35) + startingPosition.x;
        this.startY = startingPosition.y;
        this.startZ = 0.9;
        this.geo = new THREE.BoxGeometry(0.1,0.1,0.2);
        this.mat = new THREE.MeshLambertMaterial({ color: COLORS[Math.floor(Math.random() * COLORS.length)]});
        this.mat.transparent = true;
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.x = this.startX;
        this.mesh.position.y = this.startY;
        this.mesh.position.z = this.startZ;
        this.done = false;
        this.force = {x:0, y:0, z:  (0.7 + Math.random()) / 100 };
        this.vel = {x: 0, y: 0, z:0};
    }

    update() {
        var elapsed = this.clock.getElapsedTime();
        if (elapsed > this.ttl) {
            this.done = true;
        }
        var pct = 1 - (elapsed / this.ttl);

        this.mesh.material.opacity = pct;
        
        this.vel = addhashes(this.force, this.vel);
        this.force.x = bleed(this.force.x, this.drag, 0.0001);
        this.force.y = bleed(this.force.y, this.drag, 0.0001);
        this.force.z = bleed(this.force.z, this.drag, 0.0001);

        this.mesh.position.x = this.vel.x + this.mesh.position.x;
        this.mesh.position.y = this.vel.y + this.mesh.position.y;
        this.mesh.position.z = this.vel.z + this.mesh.position.z;
    }
}


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
        this.lane = 0;
        this.invincible = false;

        this.particleCount = 20;
        this.particles = [];

        // tween to target position
        this.tweenX = null;        
        this.health = 100;
    }

    particleReport() {
        this.particles.forEach(p => {
            console.log(p);
        });
    }
    setControlScheme(controlScheme) {
        document.addEventListener('meshLoaded', evt => {
            console.log("configuring control scheme");
            controlScheme(this);
        });
    }

    tweenTo(x,zrot){
        this.tweenX = new TWEEN.Tween(this.mesh.position).to({
            x:x,
        },this.slide_speed).start();
        new TWEEN.Tween(this.mesh.rotation).to({
            z: zrot,
        },this.slide_speed).start();
    }

    slideLeft(){ this.tweenTo( -this.extent, -THREE.MathUtils.degToRad(-25) ) }
    slideRight(){ this.tweenTo( this.extent,  -THREE.MathUtils.degToRad(25) ) }
    recenter(){ this.tweenTo( 0 , 0) }

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

        if (this.health > 0 && this.particles.length < this.particleCount) {
            var p = new Particle({x: this.mesh.position.x + Math.random()/10, y:this.mesh.position.y + 0.25});
            this.particles.push(p);
            this.add(p.mesh);
        }

        for (var i = 0; i < this.particles.length; i ++) {
            var p = this.particles[i];
            p.update();
            if (p.done) {
                this.remove(p.mesh);
                this.particles = this.particles.slice(0, i).concat(this.particles.slice(i+1));
            }
        }        
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
        if (!this.invincible) {
            this.health -= damage
        }
        if(this.health <= 0){
            const event = new CustomEvent("gameOver",{
                detail: {
                    damage: damage,
                    health: this.health,
                }
            })
            window.dispatchEvent( event )
        }else{
            const event = new CustomEvent("damageTaken",{
                detail: {
                    damage: damage,
                    health: this.health,
                }
            })
            window.dispatchEvent( event );
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
                    value: body.value,
                }
            })
            window.dispatchEvent( event )
        }
    }

    explode(n,t,death){
        // TODO cache these
        const poof_geom = new THREE.SphereGeometry();
        const poof_mat = new THREE.MeshLambertMaterial({ color: 0xff00ff, transparent: true, opacity:0.8 });
        const START_SCALE = 0.1
        const START_VEL = 3
        const END_SCALE = 4

        for(var i=0; i<n; i++){
            const mesh = new THREE.Mesh(poof_geom,poof_mat);
            mesh.scale.multiplyScalar((Math.random() * 0.5 + 0.5) * START_SCALE)
            this.mesh.add(mesh)
            new TWEEN.Tween(mesh.scale).to({
                x: END_SCALE,
                y: END_SCALE,
                z: END_SCALE,
            }).start()
            new TWEEN.Tween(mesh.position).to({
                x: (0.5 - Math.random()) * START_VEL,
                y: (0.5 - Math.random()) * START_VEL,
                z: (0.5 - Math.random()) * START_VEL
            },t).onComplete( e => {
                this.mesh.remove(mesh)
                if(death){
                    this.mesh.visible = false;
                }
            }).start()
        }
        
    }
}

export default Ship;
