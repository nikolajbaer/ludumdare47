import * as THREE from "three";
import * as CANNON from "cannon";

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
        this.coin_geometry = new THREE.ConeBufferGeometry();
        this.obstacle_geometry = new THREE.BoxGeometry();
        this.bodies = []

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
    }

    handleCrash() {
    }

    spawnCoin(world, pos){
        var cube = new THREE.Mesh( this.coin_geometry, this.coinMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
        })
        body.value = 5; //maybe double value coins some point?
        this.required += 1;
        world.addBody( body );
        this.bodyMeshes.push(cube)
        body.mesh = cube;
        this.bodies.push(body)
    }


    spawnObstacle(world, pos){
        var cube = new THREE.Mesh( this.obstacle_geometry, this.obstacleMaterial );
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
        this.bodyMeshes.push(cube)
        this.bodies.push(body)
    }

    spin(delta){
        // Abstract
    }
}

