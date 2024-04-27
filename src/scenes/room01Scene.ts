import Phaser from "phaser";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import Chort from "../objects/chort";
import { gameState } from "../objects/gameState";
import ConsoleScene from "./consoleScene";
import { Bullet } from "../objects/bullet";
import { shootBullets } from "../util/shootBullets";
import { KeyboardManager } from "../util/keyboardManager";

class room01Scene extends Phaser.Scene {
    private gameState: gameState;
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private keyboardManager: KeyboardManager;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group;
    constructor() {
        super({ key: "room01Scene" });
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
    }
    preload() {}

    create() {
        this.scene.bringToTop("room01Scene");
        const map = this.make.tilemap({ key: "room01" });
        const tileset = map.addTilesetImage("tilemap", "tiles"); //name of tilemap ON TILED, then name of key in preloader scene
        if (tileset) {
            const ground = map.createLayer("ground1", tileset);
            const walls = map.createLayer("walls1", tileset);
            walls?.setCollisionByProperty({ collides: true });
            walls?.setScale(1);
            ground?.setScale(1);

            const debugGraphics = this.add.graphics().setAlpha(0.7);
            if (CONFIG.physics.arcade.debug) {
                walls?.renderDebug(debugGraphics, {
                    tileColor: null,
                    collidingTileColor: new Phaser.Display.Color(
                        243,
                        234,
                        48,
                        255
                    ),
                    faceColor: new Phaser.Display.Color(30, 39, 37, 255),
                });
            }
            this.player = this.physics.add.sprite(800, 900, "robot_idle");
            this.characterMovement = new CharacterMovement(
                this.player,
                this,
                100,
                this.gameState
            );
            this.keyboardManager = new KeyboardManager(this.characterMovement);

            this.chorts = this.physics.add.group({
                classType: Chort,
                createCallback: (go) => {
                    const chortGo = go as Chort;
                    if (chortGo.body) {
                        chortGo.body.onCollide = true;
                    }
                },
            });

            this.chorts.get(800, 700, "chort");
            this.chorts.get(800, 500, "chort");
            this.chorts.get(1000, 700, "chort");
            this.chorts.get(800, 1000, "chort");

            this.events.on("player-moved", (x: number, y: number) => {
                //on player movement, the chorts target x and y change
                if (this.chorts)
                    this.chorts.children.iterate(
                        (c: Phaser.GameObjects.GameObject) => {
                            const child = c as Chort;
                            child.setTargetPosition(x, y);
                            return true;
                        }
                    );
            });

            this.bullets = this.physics.add.group({
                classType: Bullet,
                key: "bullet_blue",
                maxSize: 100,
                runChildUpdate: true,
            });

            if (walls) {
                this.physics.add.collider(this.player, walls);
                this.physics.add.collider(this.chorts, walls);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    walls,
                    (object1, object2) => {
                        //need this setup for collisions on groups for some reason
                        if (object1 instanceof Bullet) {
                            object1.destroy(); // Destroy the bullet when it hits the walls
                        } else if (object2 instanceof Bullet) {
                            object2.destroy(); // Destroy the bullet when it hits the walls
                        }
                    }
                );
                this.chorts.children.iterate(
                    //chort bullets
                    (chort: Phaser.GameObjects.GameObject) => {
                        //iterates through our chort group
                        const currentChort = chort as Chort;

                        this.physics.add.collider(
                            //for each it adds a collider
                            currentChort.fireballs, //fireball group stored in each chort instance
                            walls,
                            (object1, object2) => {
                                if (object1 instanceof Bullet) {
                                    object1.destroy(); // Destroy the bullet when it hits the walls
                                } else if (object2 instanceof Bullet) {
                                    object2.destroy(); // Destroy the bullet when it hits the walls
                                }
                            }
                        );
                        return true;
                    }
                );
            }
            //camera follows player
            this.cameras.main.startFollow(this.player, true);

            //decreases player hitbox size
            this.player.body?.setSize(
                this.player.width * 0.85,
                this.player.height * 0.8
            );
        }
        const slashKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH
        );
        slashKey?.on("down", this.switchScene, this);
    }
    private switchScene() {
        console.log("it worked");
        this.scene.setVisible(true, "ConsoleScene");
        const consoleScene = this.scene.get("ConsoleScene") as ConsoleScene;
        this.scene.bringToTop("ConsoleScene");
        consoleScene.makeVisible();
        this.scene.run("ConsoleScene", {
            gameState: this.gameState,
        });

        this.scene.pause("room01Scene");
    }
    update() {
        // Check for keyboard input and move the player accordingly
        if (this.input.activePointer.isDown) {
            // Shoot a bullet from the player towards the mouse cursor
            shootBullets(
                this,
                this.bullets!,
                this.player!,
                6, //shots per round
                500, //milliseconds between shots
                "bullet_blue" //image texture for bullet
            );
        }
        this.keyboardManager.handleInput(); //updating player movement with new implementation
    }
}
export default room01Scene;
