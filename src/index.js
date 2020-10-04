import * as THREE from "three";
import * as CANNON from "cannon";
import './style.css';
import Game from "./Game.js"
import CheatCodes from "./CheatCodes.js"
import TWEEN from "@tweenjs/tween.js"
import StarField from "./Starfield";

var game = null;

function start(){
    game = new Game()
    const cheats = new CheatCodes(game)
    game.init();
    cheats.init();
    document.body.appendChild( game.renderer.domElement )
    game.startGame()
    window.GAME = game;
}

function onWindowResize(e){
    if(game != null){
        game.handleResize()
    }
}

function main(){
    // Start Game Button
    var g = null;
    var interval = null;
    document.getElementById("startGame").addEventListener("click", e =>{
        g.sounds.stopTitleMusic();
        document.body.removeChild(g.renderer.domElement);
        window.clearInterval(interval);
        g = null;
        
        document.getElementById("title").style.display = "none"
        document.getElementById("overlay").style.display = "block"
        start();
    });
    // track resize events
    window.addEventListener( 'resize', onWindowResize, false );

    // Prevent default touch drag behaviour
    function preventBehavior(e) {
        e.preventDefault(); 
    };    
    document.addEventListener("touchmove", preventBehavior, {passive: false});

    if(typeof(gtag) != 'undefined'){
        console.log("connecting google analytics event handlers with ",ga_measurement_id)
        window.addEventListener( 'gameOver', e => {
            gtag('event', 'page_view', {
                page_title: 'Game Over',
                page_location: '/game-over/',
                send_to: ga_measurement_id
             });
        })
        window.addEventListener( 'loopEscaped', e => {
            gtag('event', 'page_view', {
                page_title: 'Loop Escaped',
                page_location: '/loop-escaped/',
                send_to: ga_measurement_id
             });
        })
    }
    var g = new Game();
    g.initScene();
    g.starfield = new StarField(10000, {x: 1000, y: 1000, z: 1000});
    g.starfield.renderOrder = 1
    g.scene.add(g.starfield)
    
    g.initTracks(5);
    g.initAudio();
    g.initShip();
    g.sounds.playTitleMusic();
    g.animate();

    interval = window.setInterval(function() {
        if (g.camera.position.x < 400)
            g.camera.position.x += 0.10;
        if (g.camera.position.y < 100) 
            g.camera.position.y += 0.025;
        g.camera.lookAt(0,0,0);
    }, 10)

    
    window.g = g;
    document.body.appendChild(g.renderer.domElement);
    
    console.log(g);
}
main();
