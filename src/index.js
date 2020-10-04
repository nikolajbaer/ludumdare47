import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import Game from "./Game.js"

const cheatCodes = [
    "idfreecamera",
    "idkfa",
    "idnloop"    
]

function init(){
<<<<<<< HEAD
    const game = new Game()
    game.init()
    document.body.appendChild( game.renderer.domElement )
=======
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var cheatString = "";
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
   
    const starfield = new Starfield(10000);
    starfield.renderOrder = 1
    scene.add(starfield)

    // Load Model
    var ship = new Ship(SHIP_GLB, 250, 5.5);
    ship.load(world, scene);
    const shipControls = new Controls()
    shipControls.connect(ship);
    ship.setCamera(camera);
    const health = document.getElementById("healthbar");
    window.addEventListener("damageTaken", e => {
        hud.update_health(e.detail.health)
        shipControls.forceFeedback(150);
        ship.explode(3,150,false)
    })
    window.addEventListener("coinCollected", e => {
        tracks[currentTrack].collect(e.detail.value)
        hud.update_score(tracks.length - currentTrack, tracks[currentTrack])
    })
    window.addEventListener("gameOver", e => {
        hud.flash("Game Over",10000)
        // TODO ship explosion
        ship.recenter()
        shipControls.disconnect()
        ship.explode(20,1000,true);
        shipControls.forceFeedback(1000);
        tracks[currentTrack].deactivate()
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
        var track = new Track(INNER_TRACK_RADIUS + 10*i,0.5 + (i / 10), 22);
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
        //ship.extent = track.extent;
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
            hud.flash("Loop Escaped!",10000)
            setTimeout( e=> {
                starfield.warp_speed();
            },1200)
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
>>>>>>> 41771cc10b0630f3c668d4c121939560a6d51a2a

    var cheatString = "";
  
    window.addEventListener("idfreecamera", _e => {
        var controls = new OrbitControls( camera, renderer.domElement );
        controls.minDistance = 10;
        controls.maxDistance = 500;
    });

    window.addEventListener("idnloop", _e => {
        window.dispatchEvent(
            new CustomEvent('trackComplete', 
                {detail: {track: tracks[currentTrack]}}
            )
        );

    });
     
    window.addEventListener('keypress', ev => {
        cheatString += ev.key;
        var stillGood = false;
        cheatCodes.forEach(cheat => {
            if (cheat.indexOf(cheatString) !== -1) {
                if (cheat == cheatString) {
                    window.dispatchEvent(new Event(cheat));
                }
                stillGood = true;
                return;
            }
        });
        if (!stillGood) {
            console.log("restting cheat string");
            cheatString = "";
        }
    });

    game.startGame()
}


init();
