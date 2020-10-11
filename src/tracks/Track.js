import * as THREE from "three";
import * as CANNON from "cannon";
import TWEEN, { Tween } from "@tweenjs/tween.js";

const colorPairs = [
    [0x804060, 0x202030],
    [0x408060, 0x203020],
    [0x406080, 0x302020],
    [0x603030, 0x302020],
    [0x603060, 0x100010],
    [0x606030, 0x101000],
];

export default class AbstractTrack extends THREE.Group {
    constructor( radius, speed, width, idx){
        super();
        this.radius = radius;
        this.speed = speed;
        this.width = width;
        this.extent = 5.5;
        this.colorPair = colorPairs[idx]
        this.collected = 0
        this.required = 0
        this.colorPair = colorPairs[idx]

        this.coinMaterial = new THREE.MeshLambertMaterial( { color: 0x66ff44 } );
        this.obstacleMaterial = new THREE.MeshLambertMaterial( { color: 0xff44ff } ); 
        this.coin_geometry = new THREE.ConeBufferGeometry(0.5,0.5,0.5);
        this.obstacle_geometry = new THREE.BoxGeometry(1.0,1.0,3.0)
        this.bodies = []
        // contain track and obstacles in a container we can easier manipulate
        this.pivot = new THREE.Group()
        this.add(this.pivot)
    }

    setOffset(r){
        this.offset = r;
        this.pivot.position.set(0,r,0)
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

    spawnCoin(world, pos, normal){
        var cube = new THREE.Mesh( this.coin_geometry, this.coinMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        cube.lookAt(pos.clone().add(normal.multiplyScalar(50)));
        this.pivot.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(1.0),
        })
        body.value = 5; //maybe double value coins some point?
        this.required += 1;
        world.addBody( body );
        this.bodyMeshes.push(cube)
        body.mesh = cube;
        this.bodies.push(body)
    }


    spawnObstacle(world, pos, normal){
        var cube = new THREE.Mesh( this.obstacle_geometry, this.obstacleMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        cube.lookAt(pos.clone().add(normal.multiplyScalar(50)));
        this.pivot.add(cube);
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.75),
        });
        body.damage = 33 + Math.random();
        world.addBody( body );
        body.mesh = cube;
        body.free = false;
        this.bodyMeshes.push(cube)
        this.bodies.push(body)
    }

    deactivate(){
        // TODO Tween opacity
        new TWEEN.Tween(this.rotation).to({
            z: Math.PI/2
        },1000).start().onComplete( e => { this.visible = false; } )
        new TWEEN.Tween(this.trackMaterials[0]).to({
            opacity: 0 
        },1000).start()
        new TWEEN.Tween(this.trackMaterials[1]).to({
            opacity: 0 
        },1000).start()
        //this.visible = false
        this.bodies.forEach( b => {
            b.remove = true 
        })
    }

    handleCrash() {
        var oldspeed = this.speed;
        var stopCar = new TWEEN.Tween(this).to({speed: -this.speed/2}, 100).easing(TWEEN.Easing.Quadratic.Out);
        stopCar.chain(new TWEEN.Tween(this).to({speed: oldspeed}, 500));
        stopCar.start();
    }
    
    /** Abstrct Methods to override **/

    generateObstacles(world){
    }

    spin(delta){
    }
}

