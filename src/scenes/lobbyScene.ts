import Phaser from "phaser";
import Player from "../objects/player";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";

import { gameState } from "../objects/gameState";

import Chort from "../objects/chort";

import { shootBullets } from "../util/shootBullets";
import { Bullet } from "../objects/bullet";

import { sceneEvents } from "../util/eventCenter";

class LobbyScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group; // Group to store bullets
    private gameState: gameState;
    private npc: Phaser.Physics.Arcade.Sprite;
    private tutorialLevel: number = 0;

    constructor() {
        super({ key: "LobbyScene" });
    }

    preload() {}

    create() {
        //setting up crosshair
        this.input.mouse?.disableContextMenu();
        this.input.setDefaultCursor("crosshair");
        //setting up tilemap
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

            //setting up player after layers are created
            this.player = this.physics.add.sprite(176, 315, "robot_idle");
            const player = new Player(this.player, 5, 5);
            const initialLevel = 0;
            this.gameState = new gameState(
                player,
                initialLevel,
                false,
                "lobbyScene"
            );
            //sets up util for character movement
            this.characterMovement = new CharacterMovement(
                this.player, //player
                this, //current scene
                100, //speed
                this.gameState //for anim check (doesnt re-initialize anims more than once)
            );

            this.npc = this.physics.add.sprite(450, 300, "lobby_npc");
            this.npc.anims.play("npc_idle", true);

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
            this.events.on("player-moved", (x: number, y: number) => {
                //allows chorts to track player
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

            // Colliders for walls
            if (walls) {
                this.physics.add.collider(this.player, walls);
                this.physics.add.collider(this.chorts, walls);
                this.physics.add.collider(this.npc, walls);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    walls,
                    (object1, object2) => {
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
            }
            // Colliders for structs
            if (structs) {
                this.physics.add.collider(this.player, structs);
                this.physics.add.collider(this.chorts, structs);
                this.physics.add.collider(this.npc, structs);
                this.physics.add.collider(
                    this.bullets,
                    structs,
                    (object1, object2) => {
                        //player bullets
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
            }
            // Colliders for decor
            if (decor) {
                this.physics.add.collider(this.player, decor);
                this.physics.add.collider(this.chorts, decor);
                this.physics.add.collider(this.npc, decor);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    decor,
                    (object1, object2) => {
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
            }
            // Colliders for floor
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
            // Collision between player and chorts
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
            this.physics.add.collider(
                this.bullets,
                this.chorts,
                (bullet, chort) => {
                    // Decrease chort health when hit by player bullets
                    (chort as Chort).takeDamage(10); // Assuming each bullet does 10 damage
                    // Destroy the bullet
                    bullet.destroy();
                }
            );

            // NPC interaction

            const npcCollisionArea = this.add.zone(450, 300, 100, 100);
            this.physics.world.enable(npcCollisionArea); // Enable physics for the collision area

            const messages1: string[] = [
                "Hello there, you seem to be lost. (click to continue)",
                "I can help you navigate this place.",
                "We are within the walls of the Operating System itself.",
                "An abstraction of what some people call the terminal...",
            ];
            const messages2: string[] = [
                "To exit, you must travel to all the floors and defeat all the enemies.",
                "Notice in the top left, how you now have 5 hearts.",
            ];
            const messages3: string[] = [
                "You can also shoot, now clicking will also shoot the whole round of your gun.",
            ];
            const messages4: string[] = [
                "Now I have spawned an enemy in the room above.",
                "Go shoot it 4 times and eliminiate it.",
                "But be careful they can get feisty.",
            ];
            const messages5: string[] = [
                "Upon taking damage you get invincible frames.",
                "You will flash blue for this duration.",
            ];

            // Event listener for 'e' key press to interact with NPC
            if (this.input.keyboard) {
                this.input.keyboard.on("keydown-E", () => {
                    // Check if the player is overlapping with the collision area
                    if (
                        this.player &&
                        Phaser.Geom.Intersects.RectangleToRectangle(
                            this.player.getBounds(),
                            npcCollisionArea.getBounds()
                        )
                    ) {
                        // Start the message scene when 'e' key is pressed and player is overlapping with NPC
                        if (this.tutorialLevel == 0) {
                            this.scene.run("MessageScene", {
                                messages: messages1, // Pass the messages array to the message scene
                            });
                        }
                        if (this.tutorialLevel == 1) {
                            //loads ui (hearts, etc)
                            this.scene.run("game-ui", {
                                gameState: this.gameState,
                            });
                            this.scene.run("MessageScene", {
                                messages: messages2,
                            });
                        }
                        if (this.tutorialLevel == 2) {
                            this.scene.run("MessageScene", {
                                messages: messages3, // Pass the messages array to the message scene
                            });
                        }
                        if (this.tutorialLevel == 3) {
                            this.scene.run("MessageScene", {
                                messages: messages4, // Pass the messages array to the message scene
                            });
                            this.chorts?.get(600, 50, "chort"); //spawns a chort
                            // Collision between chort bullets and player
                            this.chorts?.children.iterate((chort) => {
                                const currentChort = chort as Chort; // Cast to Chort type
                                // Check if fireballs group exists
                                this.physics.add.collider(
                                    this.player as Phaser.GameObjects.Sprite,
                                    currentChort.fireballs, // Collider between player and fireballs
                                    (player, fireball) => {
                                        this.handlePlayerEnemyBulletCollision(
                                            this.player as
                                                | Phaser.Types.Physics.Arcade.GameObjectWithBody
                                                | Phaser.Tilemaps.Tile, //for type resolution...
                                            fireball
                                        );
                                    },
                                    undefined,
                                    this
                                );

                                return true;
                            });
                            if (walls)
                                this.chorts?.children.iterate(
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
                            if (structs)
                                this.chorts?.children.iterate(
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
                            if (decor)
                                this.chorts?.children.iterate(
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
                        if (this.tutorialLevel == 4) {
                            this.scene.run("MessageScene", {
                                messages: messages5, // Pass the messages array to the message scene
                            });
                        }

                        this.tutorialLevel++;
                    }
                });
            }
            //npc and player collider
            this.npc.setImmovable(true);

            this.physics.add.collider(this.npc, this.player);

            this.npc.body?.setSize(
                this.npc.width * 0.65,
                this.npc.height * 0.7
            );
            this.npc.body?.setOffset(5, 14);

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
        //gives player 'i' frames set in player.ts
        if (!this.gameState.player.isInvincible) {
            this.gameState.player.takeDamage(1);

            sceneEvents.emit(
                "player-health-changed",
                this.gameState.player.health
            );
        }
    }

    private handlePlayerEnemyCollision() {
        //gives player 'i' frames set in player.ts
        if (!this.gameState.player.isInvincible) {
            this.gameState.player.takeDamage(1);
            sceneEvents.emit(
                "player-health-changed",
                this.gameState.player.health
            );
        }
    }

    update() {
        if (this.gameState.player.health <= 0) {
            // Player is dead, trigger death animation
            this.gameState.player.die();
            // You may also want to perform other actions, like respawning the player or ending the game
        } else {
            // Player is not dead, can move
            // Check for keyboard input and move the player accordingly
            const keyboard = this.input.keyboard;

            if (this.input.activePointer.isDown && this.tutorialLevel >= 3) {
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
                    if (
                        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown
                    ) {
                        this.characterMovement.moveUp();
                    } else if (
                        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown
                    ) {
                        this.characterMovement.moveDown();
                    } else {
                        this.characterMovement.stopY(); // Stop vertical movement if no up/down keys are pressed
                    }
                    if (
                        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown
                    ) {
                        this.characterMovement.moveLeft();
                    } else if (
                        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown
                    ) {
                        this.characterMovement.moveRight();
                    } else {
                        this.characterMovement.stopX(); // Stop horizontal movement if no left/right keys are pressed
                    }
                }
                this.events.emit(
                    "player-moved",
                    this.player!.x,
                    this.player!.y
                ); //emits the player movement event for enemies to track player
            }
        }
    }
}
export default LobbyScene;
