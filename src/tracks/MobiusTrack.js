import AbstractTrack from "./Track.js";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import * as THREE from "three";

function mobius_point(u,v,vec,s){
    vec.x = (s + (v/2 * Math.cos(u/2))) * Math.cos(u)
    vec.y = (s + (v/2 * Math.cos(u/2))) * Math.sin(u)
    vec.z = v/2 * Math.sin(u/2)
    return vec
}

function mobius_normal(u,s){
    const p0 = mobius_point(u,0,new THREE.Vector3(),s)
    const p1 = mobius_point(u,0.01,new THREE.Vector3(),s)
    const p2 = mobius_point(u+0.01,1,new THREE.Vector3(),s)
    const v0 = p1.sub(p0) 
    const v1 = p2.sub(p0)
    const normal = v1.cross(v0)
    normal.normalize()
    return normal
} 

export default class MobiusTrack extends AbstractTrack {

    constructor( radius, speed, width, idx ){ 
        super(radius, speed, width, idx);
        this.axis = new THREE.Vector3(1,0,0) 
        this.theta = 0 // x rotation 
        this.allRotations = false;
        this.bodyMeshes = [];
        var trackGeometry = new THREE.ParametricBufferGeometry( (_u,_v,vec) => {
            const u = _u * (Math.PI*2)
            const v = (width) - (_v * (2*width))
            mobius_point(u,v,vec,this.radius)
        }, 128, 16 )
        trackGeometry = trackGeometry.toNonIndexed()
        this.trackMaterial = new THREE.MeshPhysicalMaterial({clearcoat: 1.0, metalness: 0.9, color: this.colorPair[0] , side: THREE.DoubleSide})
        this.trackMesh = new THREE.Mesh( trackGeometry, this.trackMaterial);
        this.trackMesh.receiveShadow = true;
        this.trackMesh.rotation.y = Math.PI/2
        this.add(this.trackMesh)
        this.up = new THREE.Vector3(0,1,0)

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

    handleCrash() {
        var oldspeed = this.speed;
        var stopCar = new TWEEN.Tween(this).to({speed: -this.speed/2}, 100).easing(TWEEN.Easing.Quadratic.Out);
        stopCar.chain(new TWEEN.Tween(this).to({speed: oldspeed}, 500));
        stopCar.start();
    }

    spin(delta){ 
        this.theta -= this.speed * delta * 0.1
        const normal = mobius_normal(-this.theta,this.radius)
        this.rotation.set(this.theta,0,0)
        this.trackMesh.rotation.set(0,0,0)
        this.trackMesh.rotateY(Math.PI/2)
        this.trackMesh.rotateZ(this.up.angleTo(normal))
    }
}