import AbstractTrack from "./Track.js";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import * as THREE from "three";
import { IntType } from "three";

function mobius_point(u,v,vec,s){
    vec.z = (s + (v/2 * Math.cos(u/2))) * Math.cos(u)
    vec.y = (s + (v/2 * Math.cos(u/2))) * Math.sin(u)
    vec.x = v/2 * Math.sin(u/2)
    return vec
}

function mobius_normal(u,s){
    const p0 = mobius_point(u,0,new THREE.Vector3(),s)
    const p1 = mobius_point(u,0.1,new THREE.Vector3(),s)
    const p2 = mobius_point(u+0.1,0,new THREE.Vector3(),s)
    const v0 = p1.sub(p0) 
    const v1 = p2.sub(p0)
    const normal = v1.cross(v0)
    normal.normalize()
    return normal
} 

function mobius_forward(u,s){
    const p0 = mobius_point(u,0,new THREE.Vector3(),s)
    const p2 = mobius_point(u+0.1,0,new THREE.Vector3(),s)
    const fwd = p0.sub(p2) 
    fwd.normalize()
    return fwd 
}

export default class MobiusTrack extends AbstractTrack {

    constructor( radius, speed, width, idx ){ 
        super(radius, speed, width, idx);
        this.required = 1000
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
        //this.trackMesh.rotation.y = Math.PI/2
        this.pivot.add(this.trackMesh)
    }

    point_and_normal(a,x){
        const u = THREE.MathUtils.degToRad(a)
        const p = new THREE.Vector3()
        mobius_point(u, x, p, this.radius); 
        const n = mobius_normal(u,this.radius)
        return {p:p,n:n}
    }

    generateObstacles(world){
        // Bad things
        for(var a =0; a < 360; a+= 10){
            const r = Math.random();
            const v = r < 0.333 ? -this.extent : r > 0.666666 ? this.extent : 0;  
            const xl = this.point_and_normal(a,-v*2)
            //this.spawnObstacle( world, xl.p, xl.n )
        }

        // Good things
        for(var a =2.5; a < 360; a+= 15){
            const xl = this.point_and_normal(a,-this.extent*2)
            this.spawnCoin( world, xl.p, xl.n )
            const xm = this.point_and_normal(a,0)
            this.spawnCoin( world, xm.p, xm.n )
            const xr = this.point_and_normal(a,this.extent*2)
            this.spawnCoin( world, xr.p, xr.n )
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
        this.theta -= this.speed * delta
        
        // obj coords
        const p = new THREE.Vector3()
        mobius_point( this.theta, 0, p, this.radius )            
        const normal = mobius_normal(this.theta, this.radius)
        const forward = mobius_forward(this.theta, this.radius)

        // place track and obstacles in correct spot
        this.pivot.position.set(-p.x,-p.y,-p.z)

        // rotate this to look along the track
        const mx = new THREE.Matrix4().lookAt(
            new THREE.Vector3(),
            forward,
            normal            
        )
        const qt = new THREE.Quaternion().setFromRotationMatrix(mx)
        const rmx = new THREE.Matrix4().getInverse( mx )            
        const rqt = new THREE.Quaternion().setFromRotationMatrix( rmx )
        this.quaternion.copy( rqt )
    }
}
