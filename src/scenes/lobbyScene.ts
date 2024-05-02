import Phaser from "phaser";
import Player from "../objects/player";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import { KeyboardManager } from "../util/keyboardManager";

import { gameState } from "../objects/gameState";

import Chort from "../objects/chort";

import { shootBullets } from "../util/shootBullets";
import { Bullet } from "../objects/bullet";

import { sceneEvents } from "../util/eventCenter";
import { Fireball } from "../objects/fireball";

class LobbyScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    public keyboardManager: KeyboardManager;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group; // Group to store bullets
    private gameState: gameState;
    private npc: Phaser.Physics.Arcade.Sprite;
    private npcZone: Phaser.GameObjects.Zone;
    private eToInteractBubble: Phaser.GameObjects.Image;
    private talkingBubble: Phaser.GameObjects.Image;

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
            this.gameState = new gameState(
                player,
                0, //level
                0, //tutorial level
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
            this.keyboardManager = new KeyboardManager(this.characterMovement);

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
                    this.gameState.curRoom = "room04Scene";
                    this.events.off("player-moved");
                    sceneEvents.removeAllListeners();
                    this.scene.stop("game-ui");
                    this.gameState.player.healToAmount(5);
                    this.gameState.resetValuesOnSceneSwitch();
                    this.scene.start("room04Scene", {
                        gameState: this.gameState,
                    });
                    this.scene.stop();
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

            this.eToInteractBubble = this.add
                .image(430, 270, "eToInteractBubble")
                .setVisible(false);
            this.talkingBubble = this.add
                .image(435, 282, "talkingBubble")
                .setVisible(false);

            this.npcZone = this.add.zone(450, 300, 100, 100);
            this.physics.world.enable(this.npcZone); // Enable physics for the collision area

            const messages1: string[] = [
                "Hello there, you seem to be lost. (click to continue)",
                "I can help you navigate this place.",
                "We are within the walls of the Operating System itself.",
                "An abstraction of what some people call the terminal...",
            ];
            const messages2: string[] = [
                "To exit, you must travel to all the floors and defeat all the enemies.",
                "Notice in the top left, how you now have 5 hearts.",
                "You can also right click to dodge roll.",
                "During a dodge roll...",
                "you become immune to damage, and move a little faster.",
            ];
            const messages3: string[] = [
                "You can also shoot, now left clicking will shoot your gun.",
                "One click shoots your entire round.",
                "Ammo is infinite too, you just need to worry about reloading.",
                "Your bullets go towards your crosshair when fired.",
            ];
            const messages4: string[] = [
                "I have spawned an abomination in the room above.",
                "Go shoot and kill it now! We don't want to die yet.",
            ];
            const messages5: string[] = [
                "They for sure can get fiesty.",
                "Upon taking damage you get invincible frames.",
                "You will flash blue for this duration.",
            ];
            const end: string[] = [
                "Got nothing left to tell ya, blame the devs",
                "rahhhhhhhh",
            ];

            // Event listener for 'e' key press to interact with NPC
            if (this.input.keyboard) {
                this.input.keyboard.on("keydown-E", () => {
                    // Check if the player is overlapping with the collision area
                    if (
                        this.player &&
                        Phaser.Geom.Intersects.RectangleToRectangle(
                            this.player.getBounds(),
                            this.npcZone.getBounds()
                        )
                    ) {
                        if (!this.gameState.interactingWithNpc) {
                            this.gameState.interactingWithNpc = true;
                            // Start the message scene when 'e' key is pressed and player is overlapping with NPC
                            if (this.gameState.tutorialLevel == 0) {
                                this.scene.run("MessageScene", {
                                    messages: messages1, // Pass the messages array to the message scene
                                    gameState: this.gameState,
                                });
                            } else if (this.gameState.tutorialLevel == 1) {
                                //loads ui (hearts, etc)
                                this.scene.run("game-ui", {
                                    gameState: this.gameState,
                                });
                                this.scene.run("MessageScene", {
                                    messages: messages2,
                                    gameState: this.gameState,
                                });
                            } else if (this.gameState.tutorialLevel == 2) {
                                this.scene.run("MessageScene", {
                                    messages: messages3, // Pass the messages array to the message scene
                                    gameState: this.gameState,
                                });
                            } else if (this.gameState.tutorialLevel == 3) {
                                this.scene.run("MessageScene", {
                                    messages: messages4, // Pass the messages array to the message scene
                                    gameState: this.gameState,
                                });
                                const chort1 = this.chorts?.get(
                                    600,
                                    50,
                                    "chort"
                                ); //spawns a chort
                                chort1.setProperties(40, 75, 200); //sets the health, speed, projectile speed
                                const chort2 = this.chorts?.get(
                                    600,
                                    50,
                                    "chort"
                                ); //spawns a chort
                                chort2.setProperties(20, 150, 500); //sets the health, speed, projectile speed
                                const chort3 = this.chorts?.get(
                                    600,
                                    50,
                                    "chort"
                                ); //spawns a chort
                                chort3.setProperties(20, 30, 30); //sets the health, speed, projectile speed
                            } else if (this.gameState.tutorialLevel == 4) {
                                this.scene.run("MessageScene", {
                                    messages: messages5, // Pass the messages array to the message scene
                                    gameState: this.gameState,
                                });
                            } else {
                                this.scene.run("MessageScene", {
                                    messages: end, // Pass the messages array to the message scene
                                    gameState: this.gameState,
                                });
                                this.gameState.tutorialLevel--; //counteracting the add to tutLevel in message scene, i know this is bad practice blah blah blah
                            }
                            // Collision between chort bullets and player
                            this.chorts?.children.iterate((chort) => {
                                const currentChort = chort as Chort; // Cast to Chort type
                                // Check if fireballs group exists
                                this.physics.add.collider(
                                    this.player as Phaser.GameObjects.Sprite,
                                    currentChort.fireballs, // Collider between player and fireballs
                                    (player, fireball) => {
                                        this.handlePlayerEnemyFireballCollision(
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
                                                this.handleFireballTileCollision(
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
                                                this.handleFireballTileCollision(
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
                                                this.handleFireballTileCollision(
                                                    object1,
                                                    object2
                                                );
                                            }
                                        );
                                        return true;
                                    }
                                );
                        }
                    }
                });
            }
            //npc and player collider/overlap stuff

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

    private handleFireballTileCollision(
        obj1:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        obj2:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        if (obj1 instanceof Fireball) {
            obj1.disableBody(true, true);
            const explosion = this.add
                .sprite(obj1.x, obj1.y, "fireball_explode")
                .play("fireball_explode");
            explosion.once("animationcomplete", () => {
                explosion.destroy(); // Destroy the explosion sprite when animation completes
                obj1.destroy();
            });
        } else if (obj2 instanceof Fireball) {
            obj2.disableBody(true, true);
            const explosion = this.add
                .sprite(obj2.x, obj2.y, "fireball_explode")
                .play("fireball_explode");
            explosion.once("animationcomplete", () => {
                explosion.destroy(); // Destroy the explosion sprite when animation completes
                obj2.destroy();
            });
        }
    }

    private handlePlayerEnemyFireballCollision(
        player:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile,
        fireball:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
    ) {
        if (fireball instanceof Fireball) {
            fireball.disableBody(true, true);
            const explosion = this.add
                .sprite(fireball.x, fireball.y, "fireball_explode")
                .play("fireball_explode");
            explosion.once("animationcomplete", () => {
                explosion.destroy(); // Destroy the explosion sprite when animation completes
                fireball.destroy();
            });
        }
        //checks if i frames are present or if player is dodging (no damage on either case)

        if (
            !this.gameState.invulnerable &&
            !this.gameState.player.isInvincible
        ) {
            this.gameState.player.takeDamage(1);

            sceneEvents.emit(
                "player-health-changed",
                this.gameState.player.health
            );
        }
        this.keyboardManager.handlePlayerHit();
    }

    private handlePlayerEnemyCollision() {
        //checks if i frames are present or if player is dodging (no damage on either case)
        if (
            !this.gameState.player.isInvincible &&
            !this.gameState.invulnerable
        ) {
            this.gameState.player.takeDamage(1);
            sceneEvents.emit(
                "player-health-changed",
                this.gameState.player.health
            );
        }
    }

    update() {
        const playerOverlappingNPC =
            Phaser.Geom.Intersects.RectangleToRectangle(
                this.player!.getBounds(),
                this.npcZone.getBounds()
            );

        // Update visibility of speech bubbles based on player interaction with NPC
        if (playerOverlappingNPC && !this.gameState.interactingWithNpc) {
            // Player is overlapping with NPC but not interacting, show interaction bubble
            this.eToInteractBubble.setVisible(true);
            this.talkingBubble.setVisible(false);
        } else if (this.gameState.interactingWithNpc) {
            // Player is interacting with NPC, hide interaction bubble and show talking bubble
            this.eToInteractBubble.setVisible(false);
            this.talkingBubble.setVisible(true);
        } else {
            // Player is not overlapping with NPC, hide both bubbles
            this.eToInteractBubble.setVisible(false);
            this.talkingBubble.setVisible(false);
        }
        if (this.gameState.player.health <= 0) {
            // Player is dead, trigger death animation
            this.gameState.player.die();
            // You may also want to perform other actions, like respawning the player or ending the game
        } else {
            // Player is not dead, can move
            // Check for keyboard input and move the player accordingly

            if (
                this.input.activePointer.leftButtonDown() &&
                this.gameState.tutorialLevel > 2
            ) {
                this.gameState.leftButtonPressed = true;
            } else if (
                this.gameState.leftButtonPressed &&
                this.input.activePointer.leftButtonReleased() &&
                this.gameState.tutorialLevel > 2
            ) {
                shootBullets(
                    this,
                    this.bullets!,
                    this.player!,
                    6, //shots per round
                    500, //milliseconds between shots
                    "bullet_blue" //image texture for bullet
                );
                this.gameState.leftButtonPressed = false;
            }

            if (
                this.input.activePointer.rightButtonDown() &&
                !this.gameState.isDodging
            ) {
                this.gameState.rightButtonPressed = true;
            } else if (
                this.gameState.rightButtonPressed &&
                this.input.activePointer.rightButtonReleased() &&
                !this.gameState.isDodging
            ) {
                // Start dodge roll animation only if not already dodging
                this.characterMovement.performDodgeRoll(
                    this.keyboardManager.lastHorizontalDirection,
                    this.keyboardManager.lastVerticalDirection
                );
                this.gameState.rightButtonPressed = false;
            }

            // Allow normal player movement only if not dodging
            this.keyboardManager.handleInput();
        }
    }
}
export default LobbyScene;
