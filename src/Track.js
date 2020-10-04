import * as THREE from "three";
import * as CANNON from "cannon";
import TWEEN, { Tween } from "@tweenjs/tween.js";

export default class Track extends THREE.Group {
    constructor( radius, speed, width ){ 
        super();
        this.radius = radius;
        this.speed = speed;
        this.width = width;
        this.extent = 5.5;
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
            128,
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
            var r = Math.random();
            p.x = r < 0.333 ? -this.extent : r > 0.666666 ? this.extent : 0;  
            this.spawnObstacle( world, p )
        }

        // Good things
        for(var a =0; a < 360; a+= 15){
            const p = new THREE.Vector3(0,this.radius - 1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            var r = Math.random();
            p.x = r < 0.333 ? -this.extent : r > 0.66666 ? this.extent : 0;  
            this.spawnCoin( world, p )
        }

    }

    collect(v){        
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
        this.add(cube);
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
        });
        body.damage = 33 + Math.random();
        world.addBody( body );
        body.mesh = cube;
        body.free = false;
        this.bodies.push(body)
    }

    handleCrash() {
        var oldspeed = this.speed;
        var stopCar = new TWEEN.Tween(this).to({speed: -this.speed/2}, 250).easing(TWEEN.Easing.Quadratic.Out);
        stopCar.chain(new TWEEN.Tween(this).to({speed: oldspeed}, 1000));
        stopCar.start();
    }

    spin(delta){
        this.rotateX(-this.speed*delta)
    }
}