import * as THREE from "three";
import * as CANNON from "cannon";
import './style.css';
import Game from "./Game.js"
import CheatCodes from "./CheatCodes.js"
import TWEEN from "@tweenjs/tween.js"
import StarField from "./Starfield";

var game = null;

function start(){
    const difficulty = document.getElementById("difficulty").value
    console.log("Starting with difficulty: ",difficulty)
    game = new Game(difficulty)
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

    g = new Game();
    g.initScene();
    g.starfield = new StarField(10000, {x: 1000, y: 1000, z: 1000});
    g.starfield.renderOrder = 1
    g.scene.add(g.starfield)
    
    g.initTracks(5);
    g.initAudio();
    g.initShip();
    g.sounds.playTitleMusic();
    g.clock.start();
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

    document.getElementById("startGame").addEventListener("click", e =>{
        g.sounds.stopTitleMusic();
        document.body.removeChild(g.renderer.domElement);
        window.clearInterval(interval);
        g = null;

        
        document.getElementById("title").style.display = "none"
        document.getElementById("overlay").style.display = "block"
        start()
    })

    // End GameEvent
    window.addEventListener( 'gameOver', e => {
        document.getElementById("gameOver").style.display = "block"
        document.getElementById("newGame").addEventListener("click", e=> {
            location.reload()
        })
        track_pageview("/game-over/","Game Over")
    })

    // win GameEvent
    window.addEventListener( 'loopEscaped', e => {
        setTimeout( e=> {
            document.getElementById("credits").style.display = "block"
            document.getElementById("overlay").style.display = "none"
            document.getElementById("playAgain").addEventListener("click", e=> {
                location.reload()
            })
        },5000)
        track_pageview("/loop-escaped/","Loop Escaped")
    })

    // track resize events
    window.addEventListener( 'resize', onWindowResize, false );

    // Prevent default touch drag behaviour
    function preventBehavior(e) {
        e.preventDefault(); 
    };    
    document.addEventListener("touchmove", preventBehavior, {passive: false});

}

function track_pageview(page,title){
    if(typeof(gtag) != 'undefined'){
        gtag('event', 'page_view', {
            page_title: title,
            page_location: page,
            send_to: ga_measurement_id
            });
    }
}

main();
