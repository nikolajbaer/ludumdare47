// Based on https://aberlechiropractic.com/3d/spacewarp.html
import * as THREE from "three";

export default class StarField extends THREE.Object3D {
    constructor(line_count, extents){
        super()
        this.extents = extents || {x: 400, y: 200, z: 500}
        this.line_count = line_count
        this.geom = new THREE.BufferGeometry();
        this.geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6*line_count), 3));
        this.geom.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(2*line_count), 1));
        this.pos = this.geom.getAttribute("position");
        this.pa = this.pos.array;
        this.vel = this.geom.getAttribute("velocity");
        this.va = this.vel.array;

        for (let line_index= 0; line_index < line_count; line_index++) {
            var x = Math.random() * this.extents.x - 200;
            var y = Math.random() * this.extents.y - 100;
            var z = Math.random() * this.extents.z - 100;
            var xx = x;
            var yy = y;
            var zz = z;
            //line start
            this.pa[6*line_index] = x;
            this.pa[6*line_index+1] = y;
            this.pa[6*line_index+2] = z;
            //line end
            this.pa[6*line_index+3] = xx;
            this.pa[6*line_index+4] = yy;
            this.pa[6*line_index+5] = zz;

            this.va[2*line_index] = this.va[2*line_index+1] = 0;
        }

        this.warp = false
        this.iterations = 0

        //debugger;
        let mat = new THREE.LineBasicMaterial({color: 0xffffff, depthTest: false});
        let lines = new THREE.LineSegments(this.geom, mat); 
        this.add(lines);
    }

    warp_speed(){
        this.warp = true
    }

    update(delta){
        if(this.warp || this.iterations < 10){
            this.tick(0.03,0.025)
        }
    } 

    tick(x_accel,y_accel){
        this.iterations++
        for (let line_index= 0; line_index < this.line_count; line_index++) {
            this.va[2*line_index] += x_accel; //0.03; //bump up the velocity by the acceleration amount
            this.va[2*line_index+1] += y_accel; //0.025;

            //pa[6*line_index]++;                       //x Start
            //pa[6*line_index+1]++;                     //y
            this.pa[6*line_index+2] += this.va[2*line_index];     //z
            //pa[6*line_index+3]++;                     //x End
            //pa[6*line_index+4]                        //y
            this.pa[6*line_index+5] += this.va[2*line_index+1];   //z

            if(this.pa[6*line_index+5] > 200) {
                var z= Math.random() * 200 - 100;
                this.pa[6*line_index+2] = z;
                this.pa[6*line_index+5] = z;
                this.va[2*line_index] = 0;
                this.va[2*line_index+1] = 0;
            }
        }
        this.pos.needsUpdate = true;
    }
}