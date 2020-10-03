import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import { Mesh } from "three";

import Track from "./Track.js"

function init(){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    // Scene Lighting
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );
    var ambient = new THREE.AmbientLight( 0xffffff, 1.0 );
    scene.add( ambient );
    var light = new THREE.PointLight( 0xffffff, 1, 500 );
    light.position.set( 10, 30, 20 );
    light.castShadow = true;
    scene.add( light );

    var light = new THREE.PointLight( 'white', 1, 100);
    light.position.set(0,2,0);
    light.caseShadow = true;
    scene.add(light);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var world = new CANNON.World();

    var clock = new THREE.Clock()

   // Load Model
    var loader = new GLTFLoader();
    var ship = null;
    var playerBod = null;
    loader.load( SHIP_GLB, function ( glb ) {
        ship = glb.scenes[0].children[0];
        ship.position.set(0,0.5,0);
        console.log(ship)
        ship.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );

        playerBod = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(0,0.5,0),
            shape: new CANNON.Box(new CANNON.Vec3(0.5,3,0.5)),
            type: CANNON.Body.KINEMATIC,
            name: 'ship'
        })
        playerBod.mesh = ship 
        playerBod.addEventListener("collide", function(e){
            console.log("HIT")
            //body.free = true
            //body.life = 10
        })
        world.add(playerBod)
        ship.add(camera);
        scene.add( ship );
            
    } );

    var track = new Track(100,0.5,18);
    track.generateObstacles(world);
    track.position.set(0,track.radius,0);
    console.log(track)
    scene.add(track)

    camera.position.set(0,4,8);
    camera.lookAt(new THREE.Vector3(0,3,-1000));
    //camera.lookAt(new THREE.Vector3(0,0,0));

    var controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 500;

    function update(delta){
        if(ship == null){ return }
        track.spin(delta)

        function updatePhysics(delta){
            world.step(delta);
            world.bodies.forEach( b => {
                if(b.mesh != undefined){
                    if(b.free){
                        b.mesh.position.copy(b.position)
                        b.mesh.quaternion.copy(b.quaternion)
                        b.life -= delta
                        if(b.life <= 0){                            
                            world.remove(b)
                            b.mesh.parent.remove(b.mesh)
                        }
                    }else{
                        b.position.copy(b.mesh.position)
                        b.quaternion.copy(b.mesh.quaternion)
                    }
                }
            })
        }
    }

    function animate() {
        requestAnimationFrame( animate );            
        const delta = clock.getDelta();
        track.uniforms[ "time" ].value += 0.2 * delta;
        update(delta);
        renderer.render( scene, camera );
    }
    animate();
}

init();
