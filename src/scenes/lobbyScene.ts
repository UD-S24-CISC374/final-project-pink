import Phaser from "phaser";
import Player from "../objects/player";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
// import { ChortMovement } from "../util/chortMovement";

import { gameState } from "../objects/gameState";
import Chort from "../objects/chort";
import { Bullet } from "../objects/bullet";

class LobbyScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group; // Group to store bullets
    private shootingInProgress: boolean = false;

    constructor() {
        super({ key: "LobbyScene" });
    }

    preload() {}

    create() {
        //setting up crosshair
        this.input.mouse?.disableContextMenu();
        this.input.setDefaultCursor("crosshair");

        const player = new Player(
            "Player 1",
            5,
            2,
            ["Sword", "Bow"],
            ["Potion", "Key"]
        );
        const initialLevel = 0;
        const initialGameState = new gameState(
            player,
            initialLevel,
            false,
            "lobbyScene"
        );

        const map = this.make.tilemap({ key: "lobby" });
        const tileset = map.addTilesetImage("tilemap", "tiles"); //name of tilemap ON TILED, then name of key in preloader scene
        if (tileset) {
            //loads in the layers of the tilemap
            const floor = map.createLayer("Floor", tileset);
            const walls = map.createLayer("Walls", tileset);
            const structs = map.createLayer("Structs", tileset);
            const aboveFloor = map.createLayer("AboveFloor", tileset);
            const decor = map.createLayer("Decor", tileset);

            //allows collision with tiles that have the collides key
            walls?.setCollisionByProperty({ collides: true });
            structs?.setCollisionByProperty({ collides: true });
            decor?.setCollisionByProperty({ collides: true });
            floor?.setCollisionByProperty({ gameStart: true });

            walls?.setScale(1);
            floor?.setScale(1);
            structs?.setScale(1);
            aboveFloor?.setScale(1);
            decor?.setScale(1);

            //to see walls highlighted on debugging
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

            //player
            this.player = this.physics.add.sprite(176, 315, "robot_idle");
            this.characterMovement = new CharacterMovement(
                this.player, //player
                this, //current scene
                100, //speed
                initialGameState //for anim check (doesnt re-initialize anims more than once)
            );

            //enemies
            this.chorts = this.physics.add.group({
                classType: Chort,
                createCallback: (go) => {
                    const chortGo = go as Chort;
                    if (chortGo.body) {
                        chortGo.body.onCollide = true;
                    }
                },
            });
            this.chorts.get(600, 50, "chort");

            //bullets group
            this.bullets = this.physics.add.group({
                classType: Bullet,
                key: "bullet",
                maxSize: 100,
                runChildUpdate: true,
            });

            //declaring colliders
            if (walls) {
                this.physics.add.collider(this.player, walls);
                this.physics.add.collider(this.chorts, walls);
            }
            if (structs) {
                this.physics.add.collider(this.player, structs);
                this.physics.add.collider(this.chorts, structs);
            }
            if (decor) {
                this.physics.add.collider(this.player, decor);
                this.physics.add.collider(this.chorts, decor);
            }
            if (floor) {
                this.physics.add.collider(this.player, floor, () => {
                    // Transition to room01Scene.ts when collision occurs
                    initialGameState.curRoom = "room01Scene";
                    this.scene.start("room01Scene", {
                        gameState: initialGameState,
                    });
                });
            }

            //camera follows player
            this.cameras.main.startFollow(this.player, true);

            //decreases player hitbox size
            this.player.body?.setSize(
                this.player.width * 0.85,
                this.player.height * 0.8
            );
        }
    }
    private shootBullet(numShots: number, shotDelay: number) {
        if (this.shootingInProgress) {
            return;
        }
        this.shootingInProgress = true;
        let shotsFired = 0;

        for (let i = 0; i < numShots; i++) {
            // Calculate the delay for this shot
            const delay = i * shotDelay;

            // Use setTimeout to delay each shot
            setTimeout(() => {
                const worldPosition = this.input.activePointer.positionToCamera(
                    this.cameras.main
                ) as Phaser.Math.Vector2;

                // Try to get an existing bullet instance
                let bullet = this.bullets!.get(
                    this.player!.x,
                    this.player!.y
                ) as Bullet;

                // Fire the bullet towards the target
                bullet.fire(worldPosition.x, worldPosition.y);
                shotsFired++;

                if (shotsFired === numShots) {
                    this.shootingInProgress = false;
                }
            }, delay);
        }
    }

    update() {
        // Check for keyboard input and move the player accordingly
        const keyboard = this.input.keyboard;

        if (this.input.activePointer.isDown) {
            // Shoot a bullet from the player towards the mouse cursor
            this.shootBullet(6, 500);
        }

        if (keyboard) {
            // Handle diagonal movement
            if (
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown &&
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown
            ) {
                this.characterMovement.moveUpLeft();
            } else if (
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown &&
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown
            ) {
                this.characterMovement.moveUpRight();
            } else if (
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown &&
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown
            ) {
                this.characterMovement.moveDownLeft();
            } else if (
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown &&
                keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown
            ) {
                this.characterMovement.moveDownRight();
            } else {
                // Handle individual directions
                if (keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
                    this.characterMovement.moveUp();
                } else if (
                    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown
                ) {
                    this.characterMovement.moveDown();
                } else {
                    this.characterMovement.stopY(); // Stop vertical movement if no up/down keys are pressed
                }
                if (keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
                    this.characterMovement.moveLeft();
                } else if (
                    keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown
                ) {
                    this.characterMovement.moveRight();
                } else {
                    this.characterMovement.stopX(); // Stop horizontal movement if no left/right keys are pressed
                }
            }
        }
    }
}
export default LobbyScene;
