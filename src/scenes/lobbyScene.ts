import Phaser from "phaser";
import Player from "../objects/player";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import { shootBullets } from "../util/shootBullets";

import { gameState } from "../objects/gameState";
import Chort from "../objects/chort";
import { Bullet } from "../objects/bullet";

import { sceneEvents } from "../util/eventCenter";

class LobbyScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group; // Group to store bullets
    private gameState: gameState;

    constructor() {
        super({ key: "LobbyScene" });
    }

    preload() {}

    create() {
        //setting up crosshair
        this.input.mouse?.disableContextMenu();
        this.input.setDefaultCursor("crosshair");

        const player = new Player(5, 4);
        const initialLevel = 0;
        this.gameState = new gameState(
            player,
            initialLevel,
            false,
            "lobbyScene"
        );

        this.scene.run("game-ui", {
            gameState: this.gameState,
        });

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
                this.gameState //for anim check (doesnt re-initialize anims more than once)
            );

            //enemies
            this.chorts = this.physics.add.group({
                //group to store multiple chorts
                classType: Chort,
                createCallback: (go) => {
                    const chortGo = go as Chort;
                    if (chortGo.body) {
                        chortGo.body.onCollide = true;
                    }
                },
            });
            this.chorts.get(600, 50, "chort"); //spawns a chort
            this.chorts.get(600, 50, "chort");
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

            //bullets group
            this.bullets = this.physics.add.group({
                classType: Bullet,
                key: "bullet_blue",
                maxSize: 0,
                runChildUpdate: true,
            });
            this.bullets.maxSize = 100; //need to declare maxsize outside the group scope so it doesnt spawn an initial bullet in the top left

            //declaring colliders
            if (walls) {
                this.physics.add.collider(this.player, walls);
                this.physics.add.collider(this.chorts, walls);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    walls,
                    (object1, object2) => {
                        this.handleBulletTileCollision(object1, object2);
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
                                this.handleBulletTileCollision(
                                    object1,
                                    object2
                                );
                            }
                        );
                        return true;
                    }
                );
            }
            if (structs) {
                this.physics.add.collider(this.player, structs);
                this.physics.add.collider(this.chorts, structs);
                this.physics.add.collider(
                    this.bullets,
                    structs,
                    (object1, object2) => {
                        //player bullets
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
                this.chorts.children.iterate(
                    //chort bullets
                    (chort: Phaser.GameObjects.GameObject) => {
                        const currentChort = chort as Chort;

                        this.physics.add.collider(
                            currentChort.fireballs,
                            structs,
                            (object1, object2) => {
                                this.handleBulletTileCollision(
                                    object1,
                                    object2
                                );
                            }
                        );
                        return true;
                    }
                );
            }
            if (decor) {
                this.physics.add.collider(this.player, decor);
                this.physics.add.collider(this.chorts, decor);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    decor,
                    (object1, object2) => {
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
                this.chorts.children.iterate(
                    //chort bullets
                    (chort: Phaser.GameObjects.GameObject) => {
                        const currentChort = chort as Chort;

                        this.physics.add.collider(
                            currentChort.fireballs,
                            decor,
                            (object1, object2) => {
                                this.handleBulletTileCollision(
                                    object1,
                                    object2
                                );
                            }
                        );
                        return true;
                    }
                );
            }
            if (floor) {
                this.physics.add.collider(this.chorts, floor);
                this.physics.add.collider(this.player, floor, () => {
                    // Transition to room01Scene.ts when collision occurs
                    this.gameState.curRoom = "room01Scene";
                    this.scene.start("room01Scene", {
                        gameState: this.gameState,
                    });
                });
            }

            this.physics.add.collider(
                this.player,
                this.chorts,
                () => {
                    // Decrease player health when colliding with chorts
                    this.handlePlayerEnemyCollision();
                },
                undefined,
                this
            );

            // Collision between player bullets and chorts
            this.physics.add.collider(this.bullets, this.chorts, (bullet) => {
                // Decrease chort health when hit by player bullets
                this.handleBulletEnemyCollision(bullet);
            });

            // Collision between chort bullets and player
            // Add collider between player and chorts' fireballs
            this.chorts.children.iterate((chort) => {
                const currentChort = chort as Chort; // Cast to Chort type
                // Check if fireballs group exists
                this.physics.add.collider(
                    this.player as Phaser.GameObjects.Sprite,
                    currentChort.fireballs, // Collider between player and fireballs
                    (player, fireball) => {
                        this.handlePlayerEnemyBulletCollision(
                            this.player as
                                | Phaser.Types.Physics.Arcade.GameObjectWithBody
                                | Phaser.Tilemaps.Tile,
                            fireball
                        );
                    }, // Collision callback function
                    undefined,
                    this
                );

                return true;
            });

            //camera follows player
            this.cameras.main.startFollow(this.player, true);

            //decreases player hitbox size
            this.player.body?.setSize(
                this.player.width * 0.85,
                this.player.height * 0.8
            );
        }
    }
    private handleBulletTileCollision(
        obj1:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        obj2:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        if (obj1 instanceof Bullet) {
            obj1.destroy();
        } else if (obj2 instanceof Bullet) {
            obj2.destroy();
        }
    }

    private handleBulletEnemyCollision(
        bullet:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        if (bullet instanceof Bullet) {
            bullet.destroy(); // Destroy the bullet
            // Decrease chort health
            // chort.damage(); // Example: You may need to implement a method to handle chort damage
        }
    }

    private handlePlayerEnemyBulletCollision(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        fireball:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        if (fireball instanceof Bullet) {
            fireball.destroy();
        }
        this.gameState.player.takeDamage(1);

        sceneEvents.emit("player-health-changed", this.gameState.player.health);
    }

    private handlePlayerEnemyCollision() {
        this.gameState.player.takeDamage(1);

        sceneEvents.emit("player-health-changed", this.gameState.player.health);
    }

    update() {
        // Check for keyboard input and move the player accordingly
        const keyboard = this.input.keyboard;

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
            this.events.emit("player-moved", this.player!.x, this.player!.y); //emits the player movement event for enemies to track player
        }
    }
}
export default LobbyScene;
