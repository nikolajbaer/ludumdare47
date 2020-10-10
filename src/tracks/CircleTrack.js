import AbstractTrack from "./Track.js";
import TWEEN, { Tween } from "@tweenjs/tween.js";
import * as THREE from "three";

export default class CircleTrack extends AbstractTrack {
    constructor( radius, speed, width, idx ){ 
        super(radius, speed, width, idx);
        this.axis = new THREE.Vector3(1,0,0) 
        this.allRotations = false;
        this.bodyMeshes = [];
        this.trackMaterials = [
            new THREE.MeshPhysicalMaterial({transparent: true, clearcoat: 1.0, metalness: 0.9, color: this.colorPair[0] }),
            new THREE.MeshPhysicalMaterial({transparent: true, color: this.colorPair[1], clearcoat: 1.0, metalness: 0.9})
        ];
        this.trackMaterials.forEach( trackMaterial => {
            trackMaterial.side = THREE.DoubleSide;            
        })
        const trackGeometry = new THREE.CylinderGeometry(
            radius,
            radius,
            width,
            32,
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
    }

    generateObstacles(world){
        // Bad things
        for(var a =0; a < 360; a+= 10){
            const p = new THREE.Vector3(0,this.radius-1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            var r = Math.random();
            p.x = r < 0.333 ? -this.extent : r > 0.666666 ? this.extent : 0;

            this.spawnObstacle(world, p, a)
        }

        // Good things
        for(var a =2.5; a < 360; a+= 15){
            const p = new THREE.Vector3(0,this.radius - 1.5,0); 
            p.applyAxisAngle(this.axis, THREE.MathUtils.degToRad(a))
            var r = Math.random();
            p.x = r < 0.333 ? -this.extent : r > 0.66666 ? this.extent : 0;
             
            this.spawnCoin( world, p )
        }

    }
  
    spin(delta){
        if(this.allRotations) {
            this.rotateZ(-this.speed*0.25*delta)
            this.rotateY(this.speed*delta);
        }
        if (this.bodyMeshes) {
            this.bodyMeshes.forEach(b => {
                b.rotateZ( Math.random() * 10 * delta);
            });
        }
        this.rotateX(-this.speed*delta)
    }
}
