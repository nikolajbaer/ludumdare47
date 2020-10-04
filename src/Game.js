import * as THREE from "three";
import * as CANNON from "cannon";
import Controls from "./controls.js";
import Track from "./Track.js"
import Ship from "./Ship.js"
import SHIP_GLB from "./assets/kenney/craft_speederA.glb";
import TWEEN from "@tweenjs/tween.js"
import HUD from "./HUD.js";
import Starfield from "./Starfield.js"
import Sounds from "./Sounds.js"

export default class Game {
    constructor(){
        this.tracks = [];
        this.currentTrack = 0;
        this.destroyed = false
    }

    setupLights(scene) {
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

    setupRenderer(scene) {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setSize( window.innerWidth, window.innerHeight );
        return renderer;
    }

    setupHud(){
        this.hud = new HUD(
            document.getElementById("healthbar"),
            document.getElementById("flash"),
            document.getElementById("score")
        )
    }

    init(){
        this.initScene() 
        this.initShip()
        this.initTracks(5)
        this.initAudio()
        this.setupHud()
        this.connectEvents()
    }

    initScene(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.setupLights(this.scene);
        this.renderer = this.setupRenderer(this.scene);

        this.world = new CANNON.World();

        this.clock = new THREE.Clock();
       
        this.starfield = new Starfield(10000);
        this.starfield.renderOrder = 1
        this.scene.add(this.starfield)

        this.camera.position.set(0,4,8);
        this.camera.lookAt(new THREE.Vector3(0,3,-1000));
    }

    initShip(){
        // Load Model
        this.ship = new Ship(SHIP_GLB,400, 5.5);
        this.ship.load(this.world, this.scene);
        this.shipControls = new Controls()
        this.shipControls.connect(this.ship);
        this.ship.setCamera(this.camera);
        this.scene.add(this.ship)
        this.ship.position.y = 50
    }

    initTracks(n){
        const INNER_TRACK_RADIUS = 100
        for(var i=0; i<n; i++){
            var track = new Track(INNER_TRACK_RADIUS + 10*i,0.5 + (i / 10),18 + 4*i);
            track.generateObstacles(this.world);
            track.position.set(0,INNER_TRACK_RADIUS,0);
            if(i > 0){
                track.visible = false;
            }
            console.log(track)
            this.scene.add(track)
            this.tracks.push(track)
        }
    }

    initAudio(){
        this.sounds = new Sounds(this.scene,this.camera)
        this.sounds.loadSounds()
    }

    connectEvents(){
        window.addEventListener("trackComplete", ev => {
            const track = ev.detail.track;
            track.deactivate()
            this.currentTrack += 1 
            if( this.currentTrack >= this.tracks.length){
                this.hud.flash("Loop Escaped!",10000)
                setTimeout( e=> {
                    this.starfield.warp_speed();
                },1200)
            }else{
                const nextTrack = this.getCurrentTrack()
                this.setTrack(nextTrack,1500)
                const remaining = this.getTracksRemaining()
                this.hud.flash(`${remaining} Loop${ (remaining > 1)?"s":"" } Left!`,2000)
            }
        })
        window.addEventListener("damageTaken", e => {
            this.hud.update_health(e.detail.health)
            this.shipControls.forceFeedback(150);
            this.ship.explode(3,150,false)
        })
        window.addEventListener("coinCollected", e => {
            this.getCurrentTrack().collect(e.detail.value)
            this.hud.update_score(this.getTracksRemaining(), this.getCurrentTrack())
            this.sounds.triggerSound(`pickup${Math.floor(Math.random() * 8) + 1}`)

        })
        window.addEventListener("gameOver", e => {
            this.hud.update_health(e.detail.health)
            this.hud.flash("Game Over",10000)
            // TODO ship explosion
            this.ship.recenter()
            this.shipControls.disconnect()
            this.ship.explode(20,1000,true);
            this.shipControls.forceFeedback(1000);
            this.getCurrentTrack().deactivate()
        })
    }

    disconnectEvents(){
        // TODO
    }
 
    startGame(){
        new TWEEN.Tween(this.ship.position).to({
            y: 0 
        },2000).start().onComplete( e => {
            this.hud.update_score(this.tracks.length, this.getCurrentTrack())
        })
        this.hud.flash("You are Stuck in the Loop!",2000)
        this.animate()
        this.sounds.playMusic()
    }

    destroy(){
        // cleanup
        this.music.stop()
        this.disconnectEvents()
        this.destroyed = true
    }

    setTrack(track,transition_time){
        track.visible = true;
        this.ship.extent = track.extent;
        new TWEEN.Tween(track.position).to({
            y: track.radius
        },transition_time).start()
    }

    update(delta,time){
        TWEEN.update(time)

        if(this.ship == null){ return }

        if( this.shipControls.gp != null){
            this.shipControls.checkAxis(this.ship);
        }

        this.tracks.forEach( t => {
            t.spin(delta)
        })

        this.ship.update(delta,this.clock.elapsedTime);

        this.world.step(delta);
        this.world.bodies.forEach( b => {
            if(b.mesh != undefined){
                if(b.remove){
                    this.world.remove(b)
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
        this.tracks.forEach( t=> {
            t.active = true
        })
        this.starfield.update(delta)
    }

    animate(time) {
        if(this.destroyed){return}

        requestAnimationFrame( () => { this.animate() } );            
        const delta = this.clock.getDelta();
        this.update(delta,time);
        this.renderer.render( this.scene, this.camera );
    }

    getCurrentTrack(){
        if(this.currentTrack < this.tracks.length){
            return this.tracks[this.currentTrack]
        }
        return null;
    }

    getTracksRemaining(){
        return this.tracks.length - this.currentTrack
    }

    handleResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

    }
}
