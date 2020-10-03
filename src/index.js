import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import Controls from "./controls.js";
import Track from "./Track.js"
import Ship from "./Ship.js"
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";

function setupLights(scene) {
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
}

function setupRenderer(scene) {
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    return renderer;
}

function init(){
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    // Scene Lighting
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );

    setupLights(scene);
    var renderer = setupRenderer(scene);
    document.body.appendChild( renderer.domElement );

    var world = new CANNON.World();

    var clock = new THREE.Clock();

   // Load Model
    var ship = new Ship(SHIP_GLB);
    ship.load(world, scene);
    ship.setControlScheme(new Controls().schemes[0]);
    ship.setCamera(camera);
    const health = document.getElementById("healthbar");
    window.addEventListener("damageTaken", e => {
        console.log("Damaged!", e)
        health.textContent = `${e.detail.health.toFixed(0)}%`
        health.style.width = `${e.detail.health.toFixed(0)}%`
    })
    window.addEventListener("gameOver", e => {
        const el = document.getElementById("flash")
        el.textContent = "Game Over"
        el.style.display = "block"
    })
    scene.add(ship)

    const tracks = [];

    for(var i=0; i<2; i++){
        var track = new Track(100 + 10*i,0.5,18 + 4*i);
        track.generateObstacles(world);
        track.position.set(0,100,0);
        if(i > 0){
            track.visible = false;
        }
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

    function update(delta){
        if(ship == null){ return }

        tracks.forEach( t => {
            t.spin(delta)
        })

        ship.update(delta,clock.elapsedTime);

        world.step(delta);
        world.bodies.forEach( b => {
            if(b.mesh != undefined){
                if(b.remove){
                    world.remove(b)
                    b.mesh.parent.remove(b.mesh)
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

    animate();
}


init();
