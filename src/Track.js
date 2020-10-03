import * as THREE from "three";
import * as CANNON from "cannon";

export default class Track extends THREE.Group {
    constructor( radius, speed, width ){ 
        super();
        this.radius = radius;
        this.speed = speed;
        this.width = width;
        this.active = false; // activated after first "step" of physics engine
        this.axis = new THREE.Vector3(1,0,0) 
        this.trackMaterials = [
            new THREE.MeshPhongMaterial({color: 0x000020}),
            new THREE.MeshPhongMaterial({color: 0x000040})
        ]
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
        this.coinMaterial = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    }

    generateObstacles(world){
        for(var a =0; a < 360; a+= 5){
            const p = new THREE.Vector3(0,this.radius - 1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            p.x = (this.width/2) - Math.random() * this.width
            this.spawnObstacle( world, p )
        }
    }

    spawnObstacle(world, pos){
        var geometry = new THREE.BoxGeometry();
        var cube = new THREE.Mesh( geometry, this.coinMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
        })
        body.damage = 5;
        world.addBody( body );
        body.mesh = cube;
        body.free = false;
     
    }

    spin(delta){
        this.rotateX(-this.speed*delta)
    }
}