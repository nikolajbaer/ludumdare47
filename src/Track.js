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

        this.collected = 0
        this.required = 0
   
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
        const trackGeometry = new THREE.CylinderGeometry(radius,radius,width,512,32,true);
        const mesh = new THREE.Mesh( trackGeometry, this.trackMaterial);
        mesh.rotateZ(Math.PI/2)
        this.add(mesh)
        //this.obj = new THREE.()
        //this.obj.add(mesh)
        this.coinMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
        this.obstacleMaterial = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
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

    coinColected(v){
        this.collected += v;
        if(this.collected > this.required){
            const event = CustomEvent("trackComplete", {
                details: {
                    track: this
                }
            })
            window.dispatchEvent( event )
        }
    }

    spawnCoin(world, pos){
        var geometry = new THREE.SphereGeometry();
        var cube = new THREE.Mesh( geometry, this.coinMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
        })
        body.value = 1; //maybe double value coins some point?
        this.required += 1;
        world.addBody( body );
        body.mesh = cube;
    }


    spawnObstacle(world, pos){
        var geometry = new THREE.SphereGeometry();
        var cube = new THREE.Mesh( geometry, this.obstacleMaterial );
        cube.position.set(pos.x,pos.y,pos.z)
        this.add( cube )
        var body = new CANNON.Body({
            mass: 50,
            shape: new CANNON.Sphere(0.5),
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