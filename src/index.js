import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import { Mesh } from "three";

function init(){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    // Scene Lighting
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );
    var ambient = new THREE.AmbientLight( 0xeeeeee );
    scene.add( ambient );
    var light = new THREE.PointLight( 0xffffff, 1, 100 );
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

    var clock = new THREE.Clock()

   // Load Model
    var loader = new GLTFLoader();
    var ship = null;
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

        scene.add( ship );
            
    } );



    const R = 100;
    //var trackMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_shader_lava.html

    var trackUniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.lights);
    trackUniforms.time = {value:1.0};

    var trackMaterial = new THREE.ShaderMaterial( {
        uniforms: trackUniforms,
        lights: true,
		fragmentShader: document.getElementById( 'trackFragmentShader' ).textContent,
		vertexShader: document.getElementById( 'trackVertexShader' ).textContent
    } );
    trackMaterial.side = THREE.DoubleSide;
    var trackGeometry = new THREE.CylinderGeometry(R,R,20,128,32,true);
    var track = new THREE.Mesh( trackGeometry, trackMaterial);
    track.rotateZ(Math.PI/2);
    track.position.set(0,R,0); 
    track.receiveShadow = true;
    scene.add(track);

    camera.position.set(0,4,8);
    camera.lookAt(new THREE.Vector3(0,3,-1000));
    //camera.lookAt(new THREE.Vector3(0,0,0));

    
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 500;
    

    function update(delta){
        if(ship == null){ return }
        track.rotateY(0.01)
        ship.position.y = 0.25 + ( 0.25 * Math.sin(clock.elapsedTime) )
        ship.rotateZ((0.001 * Math.sin(clock.elapsedTime)));
    }

    function animate() {
        requestAnimationFrame( animate );            
        const delta = clock.getDelta();
        trackUniforms[ "time" ].value += 0.2 * delta;
        update(delta);
        renderer.render( scene, camera );
    }
    animate();
}

init();
