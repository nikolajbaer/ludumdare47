import * as THREE from "three";
import * as CANNON from "cannon";
import './style.css';
import Game from "./Game.js"
import CheatCodes from "./CheatCodes.js"

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
    document.getElementById("startGame").addEventListener("click", e =>{
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
            document.getElementById("newGame").addEventListener("click", e=> {
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
