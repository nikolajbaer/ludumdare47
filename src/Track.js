import * as THREE from "three";
import * as CANNON from "cannon";

export default class Track extends THREE.Group {
    constructor( radius, speed, width ){ 
        super();
        this.radius = radius;
        this.speed = speed;
        this.width = width;
        this.axis = new THREE.Vector3(1,0,0) 
   
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shader_lava.html
        this.uniforms = {
            time: { value: -1.0 },
        };
        this.trackMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
    		fragmentShader: document.getElementById( 'trackFragmentShader' ).textContent,
    		vertexShader: document.getElementById( 'trackVertexShader' ).textContent
        } );
        this.trackMaterial.side = THREE.DoubleSide;
        //this.trackMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee })
        const trackGeometry = new THREE.CylinderGeometry(radius,radius,width,128,32,true);
        const mesh = new THREE.Mesh( trackGeometry, this.trackMaterial);
        mesh.rotateZ(Math.PI/2)
        this.add(mesh)
        //this.obj = new THREE.()
        //this.obj.add(mesh)
        this.coinMaterial = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    }

    generateObstacles(world){
        for(var a =0; a < 360; a+= 15){
            const p = new THREE.Vector3(0,this.radius,0); 
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
            mass: 5,
            position: new CANNON.Vec3(pos.x,pos.y,pos.z),
            shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
        })
        world.addBody( body );
        body.mesh = cube;
        body.free = true; //false
     
    }

    spin(delta){
        this.rotateX(-this.speed*delta)
    }
}