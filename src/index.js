import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import Controls from "./controls.js";
import Track from "./Track.js"
import Ship from "./Ship.js"
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import TWEEN from "@tweenjs/tween.js"
import './style.css';
import HUD from "./HUD.js";
import MAIN_MUSIC from "./assets/sounds/circle-play-music.mp3";

function setupLights(scene) {
    var ambient = new THREE.AmbientLight( 0xffffff, 1.0 );
    scene.add( ambient );
    var light = new THREE.PointLight( 0xffffff, 1, 500 );
    light.position.set( 10, 30, 20 );
    light.castShadow = true;
    scene.add( light );

    var light = new THREE.PointLight( 'white', 1, 100);
    light.position.set(2,3,0);
    light.castShadow = false;
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

    const hud = new HUD(
        document.getElementById("healthbar"),
        document.getElementById("flash"),
        document.getElementById("score")
    )
    console.log(hud)

   // Load Model
    var ship = new Ship(SHIP_GLB,400, 5.5);
    ship.load(world, scene);
    ship.setControlScheme(new Controls().schemes[0]);
    ship.setCamera(camera);
    const health = document.getElementById("healthbar");
    window.addEventListener("damageTaken", e => {
        hud.update_health(e.detail.health)
    })
    window.addEventListener("coinCollected", e => {
        console.log("Collected!", e.detail.value)
        tracks[currentTrack].collect(e.detail.value)
        hud.update_score(tracks.length - currentTrack, tracks[currentTrack])
    })
    window.addEventListener("gameOver", e => {
        hud.flash("Game Over",10000)
    })
    scene.add(ship)
    ship.position.y = 50
    new TWEEN.Tween(ship.position).to({
        y: 0 
    },2000).start().onComplete( e => {
        hud.update_score(tracks.length, tracks[currentTrack])
    })
    hud.flash("You are Stuck in the Loop!",2000)
      

    const tracks = [];
    var currentTrack = 0;
    const INNER_TRACK_RADIUS = 100
    for(var i=0; i<5; i++){
        var track = new Track(INNER_TRACK_RADIUS + 10*i,0.5 + (i / 10),18 + 4*i);
        track.generateObstacles(world);
        track.position.set(0,INNER_TRACK_RADIUS,0);
        if(i > 0){
            track.visible = false;
        }
        console.log(track)
        scene.add(track)
        tracks.push(track)
    }

    var trackTween = null;
    function setTrack(track,transition_time){
        track.visible = true;
        ship.extent = track.extent;
        console.log("tweening to track raidus", track.radius, "from ", track.position.y)
        trackTween = new TWEEN.Tween(track.position).to({
            y: track.radius
        },transition_time).start()
    }

    window.addEventListener("trackComplete", ev => {
        const track = ev.detail.track;
        track.deactivate()
        currentTrack += 1 
        if( currentTrack >= tracks.length){
            hud.flash("Loop Escaped!",2000)
        }else{
            const nextTrack = tracks[currentTrack];
            setTrack(nextTrack,1500)
            const remaining = tracks.length - currentTrack
            hud.flash(`${remaining} Loop${ (remaining > 1)?"s":"" } Left!`,2000)
        }
     })

    camera.position.set(0,4,8);
    camera.lookAt(new THREE.Vector3(0,3,-1000));
    //camera.lookAt(new THREE.Vector3(0,0,0));

     /*
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 500;
     */

    function update(delta,time){
        TWEEN.update(time)

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

    function animate(time) {
        requestAnimationFrame( animate );            
        const delta = clock.getDelta();
        update(delta,time);
        renderer.render( scene, camera );
    }

    var cameraListener = new THREE.AudioListener();
    camera.add(cameraListener);        
    var audioLoader = new THREE.AudioLoader();
    function startMusic() {
        var sound = new THREE.Audio(cameraListener);
        audioLoader.load(MAIN_MUSIC, buffer => {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.3);
            sound.play(); 
        });
    }

    window.addEventListener('coinPickup', ev => {
        console.log(ev.detail.sound);
        var sound = new THREE.Audio(cameraListener);

        audioLoader.load(ev.detail.sound, buffer => {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.6);
            sound.play(); 
        });

    });

    animate();
    startMusic();
}


init();
