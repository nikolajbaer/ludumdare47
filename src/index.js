import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";

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
        ship = glb.scenes[0];
        console.log(ship)
        /*ship.children.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );*/

        scene.add( ship );
            
    } );

    camera.position.set(5,10,-10);
    camera.lookAt(new THREE.Vector3(0,0,0));

    var controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 10;
    controls.maxDistance = 100;

    function updatePhysics(delta){
    }

    function animate() {
        requestAnimationFrame( animate );            
        const delta = clock.getDelta();

        updatePhysics(delta);
   	    renderer.render( scene, camera );
    }
    animate();
}

init();
