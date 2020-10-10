import * as THREE from "three";
import PICKUP_SOUND1 from "./assets/sounds/pickup.mp3"
import PICKUP_SOUND2 from "./assets/sounds/pickup-001.mp3"
import PICKUP_SOUND3 from "./assets/sounds/pickup-002.mp3"
import PICKUP_SOUND4 from "./assets/sounds/pickup-003.mp3"
import PICKUP_SOUND5 from "./assets/sounds/pickup-004.mp3"
import PICKUP_SOUND6 from "./assets/sounds/pickup-005.mp3"
import PICKUP_SOUND7 from "./assets/sounds/pickup-006.mp3"
import PICKUP_SOUND8 from "./assets/sounds/pickup-007.mp3"
import COLLISION_SOUND from "./assets/sounds/circle-collide-glitch.mp3"
import MAIN_MUSIC from "./assets/sounds/circle-play-music-001.mp3"
import TITLE_MUSIC from "./assets/sounds/the-circle.mp3"
import LOOP_TXN from "./assets/sounds/the-circle-loop-txn-005.mp3"

const SOUNDS = [
    ["pickup1",PICKUP_SOUND1],
    ["pickup2",PICKUP_SOUND2],
    ["pickup3",PICKUP_SOUND3],
    ["pickup4",PICKUP_SOUND4],
    ["pickup5",PICKUP_SOUND5],
    ["pickup6",PICKUP_SOUND6],
    ["pickup7",PICKUP_SOUND7],
    ["pickup8",PICKUP_SOUND8],
    ["collide1", COLLISION_SOUND],
    ["changeloop", LOOP_TXN]
]

export default class Sounds {
    constructor(scene,camera){
        this.scene = scene
        this.camera = camera
        this.music = null
        this.sounds = {}
        this.audioLoader = new THREE.AudioLoader();
        this.cameraListener = new THREE.AudioListener();
    }

    loadSounds(){
        this.camera.add(this.cameraListener); 
        this.loadMusic()
        this.loadTitleMusic()
        this.loadEffects()
    }

    triggerSound(name){
        this.sounds[name].play()
    }

    playMusic(){
        if(!this.music.loaded){
            this.music.autoplay = true
        } else {
            this.music.play()
        }
    }

    stopMusic() {
        if (this.music.loaded) {
            this.music.stop();
        }
    }

    loadEffects(){
        SOUNDS.forEach( sound_def => {
            var sound = new THREE.Audio(this.cameraListener);
            this.audioLoader.load(sound_def[1], buffer => {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.6);
            });
            this.sounds[sound_def[0]] = sound
        })
    }

    loadTitleMusic() {
        this.titleMusic = new THREE.Audio(this.cameraListener);
        this.titleMusic.loaded = false
        this.audioLoader.load(TITLE_MUSIC, buffer => {
            this.titleMusic.setBuffer(buffer);
            this.titleMusic.setLoop(true);
            this.titleMusic.setVolume(0.3);
            this.titleMusic.loaded = true
        });
    }

    playTitleMusic(){
        if(!this.titleMusic.loaded){
            this.titleMusic.autoplay = true
        }else{
            this.titleMusic.play()
        }
    }

    stopTitleMusic() {
        if (this.titleMusic.loaded) {
            this.titleMusic.stop();
        }
    }

    loadMusic(){
        this.music = new THREE.Audio(this.cameraListener);
        this.music.loaded = false
        this.audioLoader.load(MAIN_MUSIC, buffer => {
            this.music.setBuffer(buffer);
            this.music.setLoop(true);
            this.music.setVolume(0.3);
            this.music.loaded = true
        });
    }
}