import * as THREE from "three";
import * as CANNON from "cannon";
import TWEEN from "@tweenjs/tween.js";
import PICKUP_SOUND1 from "./assets/sounds/pickup.mp3"
import PICKUP_SOUND2 from "./assets/sounds/pickup-001.mp3"
import PICKUP_SOUND3 from "./assets/sounds/pickup-002.mp3"
import PICKUP_SOUND4 from "./assets/sounds/pickup-003.mp3"
import PICKUP_SOUND5 from "./assets/sounds/pickup-004.mp3"
import PICKUP_SOUND6 from "./assets/sounds/pickup-005.mp3"
import PICKUP_SOUND7 from "./assets/sounds/pickup-006.mp3"
import PICKUP_SOUND8 from "./assets/sounds/pickup-007.mp3"

const pickup_sounds = [
    PICKUP_SOUND1, 
    PICKUP_SOUND2,
    PICKUP_SOUND3,
    PICKUP_SOUND4,
    PICKUP_SOUND5,
    PICKUP_SOUND6,
    PICKUP_SOUND7,
    PICKUP_SOUND8,
];

export default class Track extends THREE.Group {
    constructor( radius, speed, width ){ 
        super();
        this.radius = radius;
        this.speed = speed;
        this.width = width;
        this.extent = width/2;
        this.active = false; // activated after first "step" of physics engine
        this.axis = new THREE.Vector3(1,0,0) 
        this.collected = 0
        this.required = 0
        this.trackMaterials = [
            new THREE.MeshPhysicalMaterial({clearcoat: 1.0, metalness: 0.9, color: 0x202030 }),
            new THREE.MeshPhysicalMaterial({color: 0x804060, clearcoat: 1.0, metalness: 0.9})
        ];
        this.trackMaterials.forEach( trackMaterial => {
            trackMaterial.side = THREE.DoubleSide;            
        })
        const trackGeometry = new THREE.CylinderGeometry(
            radius,
            radius,
            width,
            64,
            4,
            true
        );
        var i = 0;
        trackGeometry.faces.forEach(face => {
            if (i % 16 < 8){
                face.materialIndex = 0;
            } else {
                face.materialIndex = 1;
            }
            i++;
        });
        this.trackMaterial = new THREE.MeshFaceMaterial(this.trackMaterials);    
        const mesh = new THREE.Mesh( trackGeometry, this.trackMaterial);
        mesh.receiveShadow = true;
        mesh.rotateZ(Math.PI/2)
        this.add(mesh)
        //this.obj = new THREE.()
        //this.obj.add(mesh)
        this.coinMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
        this.obstacleMaterial = new THREE.MeshLambertMaterial( { color: 0xff00ff } ); 
        this.bodies = []
    }

    generateObstacles(world){
        // Bad things
        for(var a =0; a < 360; a+= 10){
            const p = new THREE.Vector3(0,this.radius - 1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            p.x = (this.width/2) - Math.random() * this.width
            this.spawnObstacle( world, p )
        }

        // Good things
        for(var a =0; a < 360; a+= 15){
            const p = new THREE.Vector3(0,this.radius - 1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            p.x = (this.width/2) - Math.random() * this.width
            this.spawnCoin( world, p )
        }

    }

    dispatchCoinEvt() {
        var idx = Math.floor(pickup_sounds.length * Math.random());
        var whichSound = pickup_sounds[idx];
        console.log(whichSound, idx);
        window.dispatchEvent(new CustomEvent("coinPickup", {
            detail: {
                sound: whichSound
            }
        }));
    }

    collect(v){
        this.dispatchCoinEvt();
        
        this.collected += v;
        if(this.collected > this.required){
            const event = new CustomEvent("trackComplete", {
                detail: {
                    track: this
                }
            })
            window.dispatchEvent( event )
        }
    }

    deactivate(){
        // TODO Tween opacity
        new TWEEN.Tween(this.rotation).to({
            z: Math.PI/2
        },3000).start().onComplete( e => { this.visible = false; } )
        new TWEEN.Tween(this.trackMaterials[0]).to({
            opacity: 0 
        },3000).start()
        new TWEEN.Tween(this.trackMaterials[1]).to({
            opacity: 0 
        },3000).start()
        //this.visible = false
        this.bodies.forEach( b => {
            b.remove = true 
        })
    }

    spawnCoin(world, pos){
        var geometry = new THREE.ConeBufferGeometry();
        var cube = new THREE.Mesh( geometry, this.coinMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
        })
        body.value = 5; //maybe double value coins some point?
        this.required += 1;
        world.addBody( body );
        body.mesh = cube;
        this.bodies.push(body)
    }


    spawnObstacle(world, pos){
        var geometry = new THREE.SphereGeometry();
        var cube = new THREE.Mesh( geometry, this.obstacleMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
        });
        body.damage = 10;
        world.addBody( body );
        body.mesh = cube;
        body.free = false;
        this.bodies.push(body)
    }

    spin(delta){
        this.rotateX(-this.speed*delta)
    }
}