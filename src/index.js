import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";

import { Mesh, Vector3 } from "three";

import Controls from "./controls.js";
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
    light.position.set(2,3,0);
    light.castShadow = true;
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
            if(track.active){
                console.log("HIT",e)
                e.body.free = true
                e.body.life = 10
            }
        })
        controls.scheme_one(ship);
        world.add(playerBod)
        ship.add(camera);
        scene.add( ship );
    } );

    const tracks = [];

    for(var i=0; i<3; i++){
        var track = new Track(100 + 10*i,0.5,18 + 4*i);
        track.generateObstacles(world);
        track.position.set(0,100,0);
        console.log(track)
        scene.add(track)
        tracks.push(track)
    }

    camera.position.set(0,4,8);
    camera.lookAt(new THREE.Vector3(0,3,-1000));
    //camera.lookAt(new THREE.Vector3(0,0,0));

    var controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 500;

    console.log(world.bodies)
    function update(delta){
        if(ship == null){ return }

        tracks.forEach( t => {
            t.spin(delta)
        })

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
                    const pos = new THREE.Vector3()
                    const quat = new THREE.Quaternion()
                    b.mesh.getWorldPosition(pos)
                    b.mesh.getWorldQuaternion(quat)
                    b.position.copy(pos)
                    b.quaternion.copy(quat)
                }
            }
        })
        tracks.forEach( t=> {
            t.active = true
        })
    }

    function animate() {
        requestAnimationFrame( animate );            
        const delta = clock.getDelta();
        track.uniforms[ "time" ].value += 0.2 * delta;
        update(delta);
        renderer.render( scene, camera );
    }

    controls = new Controls();
    animate();
}


init();
