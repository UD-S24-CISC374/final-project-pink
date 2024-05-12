import Phaser from "phaser";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import Chort from "../objects/chort";
import { gameState } from "../objects/gameState";
import ConsoleScene from "./consoleScene";
import { Bullet } from "../objects/bullet";
import { KeyboardManager } from "../util/keyboardManager";
import { sceneEvents } from "../util/eventCenter";
import { Fireball } from "../objects/fireball";
import { Gun } from "../objects/gun";

class room01Scene extends Phaser.Scene {
    private gameState: gameState;
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private keyboardManager: KeyboardManager;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group;
    private chest: Phaser.Physics.Arcade.Sprite;
    private chestZone: Phaser.GameObjects.Zone;
    private chestOpened: boolean = false;
    private gunHitBox?: Phaser.GameObjects.Rectangle;
    private defaultGunBig?: Gun;
    constructor() {
        super({ key: "room01Scene" });
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
        this.chestOpened = false;
        this.scene.stop("MessgaeScene");
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
            this.gameState.player.player = this.player; //absolutely need this

            this.characterMovement = new CharacterMovement(
                this.gameState.player.player,
                this,
                100,
                this.gameState
            );
            this.keyboardManager = new KeyboardManager(this.characterMovement);

            this.chest = this.physics.add.sprite(700, 1025, "wood_chest");
            this.chest.setImmovable(true);
            this.chest.anims.play("wood_chest_closed");
            this.chestZone = this.add.zone(700, 1025, 50, 40);
            this.physics.world.enable(this.chestZone);

            this.chorts = this.physics.add.group({
                classType: Chort,
                createCallback: (go) => {
                    const chortGo = go as Chort;
                    if (chortGo.body) {
                        chortGo.body.onCollide = true;
                    }
                },
            });

            const chort1 = this.chorts.get(800, 700, "chort");
            chort1.setProperties(27, 30, 200);
            const chort2 = this.chorts.get(800, 500, "chort");
            chort2.setProperties(27, 50, 250); //health, speed, bulletSpeed
            const chort3 = this.chorts.get(1000, 700, "chort");
            chort3.setProperties(27, 50, 200);
            const chort4 = this.chorts.get(800, 1000, "chort");
            chort4.setProperties(27, 30, 200);

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

            const defaultGun = new Gun(
                this,
                this.gameState,
                this.player,
                this.bullets, //bullet group (has to have same texture in this function (below), as the texture used in creating this.bullets)
                "gun_default", //gun texture
                "bullet_blue", //bullet texture (same as from this.bullets)
                500, //bullet speed
                8, //bullet damage
                5, //shots per round
                600, //miliseconds between shots
                true
            );
            defaultGun.addToScene();
            this.gameState.player.addGun(defaultGun);
            defaultGun.reload();

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
                    (chort as Chort).takeDamage(
                        this.gameState.player.getCurrentGunDamage()
                    ); // damages chorts with current guns damage
                    // Destroy the bullet
                    bullet.destroy();
                }
            );
            // Collision between chort bullets and player
            this.chorts.children.iterate((chort) => {
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

            this.physics.add.collider(this.player, this.chest); //collider for player and chest
            this.physics.add.collider(this.chorts, this.chest); //collider for chorts and chest
            this.chorts.children.iterate((chort) => {
                const currentChort = chort as Chort; // Cast to Chort type
                // Check if fireballs group exists
                this.physics.add.collider(
                    this.chest as Phaser.GameObjects.Sprite,
                    currentChort.fireballs, // Collider between chest sprite and fireballs
                    (chest, fireball) => {
                        this.handleSpriteEnemyFireballCollision(
                            this.chest as
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
            //collider for player bullets and chest
            this.physics.add.collider(
                //player bullets
                this.bullets,
                this.chest,
                (object1, object2) => {
                    this.handleBulletTileCollision(object1, object2);
                }
            );
            //camera follows player
            this.scene.run("game-ui", { gameState: this.gameState });
            this.scene.bringToTop("game-ui");
            this.scene.bringToTop("HelpButton");
            this.cameras.main.startFollow(this.player, true);

            //decreases player hitbox size
            this.player.body?.setSize(
                this.player.width * 0.85,
                this.player.height * 0.8
            );
        }
        //starting console scene
        const tabKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.TAB
        );
        tabKey?.on("down", this.switchScene, this);

        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-E", () => {
                //opens chest and creates gun on e press
                // Check if the player is overlapping with the collision area
                if (
                    !this.chestOpened &&
                    !this.gameState.eButtonPressed &&
                    this.player &&
                    Phaser.Geom.Intersects.RectangleToRectangle(
                        this.player.getBounds(),
                        this.chestZone.getBounds()
                    )
                ) {
                    this.chestOpened = true;
                    this.gameState.eButtonPressed = true;
                    setTimeout(() => {
                        this.gameState.eButtonPressed = false;
                    }, 500);

                    this.chest.anims.play("wood_chest_open");
                    this.defaultGunBig = new Gun(
                        this,
                        this.gameState,
                        this.player,
                        this.bullets!, //bullet group (has to have same texture in this function (below), as the texture used in creating this.bullets)
                        "gun_default_big", //gun texture
                        "bullet_blue", //bullet texture (same as from this.bullets)
                        400, //bullet speed
                        3, //bullet damage
                        20, //shots per round
                        100, //miliseconds between shots
                        false
                    );
                    this.defaultGunBig.addToScene();
                    this.defaultGunBig.setVisible();
                    this.gunHitBox = this.add.rectangle(
                        this.defaultGunBig.gunImage.x,
                        this.defaultGunBig.gunImage.y,
                        this.defaultGunBig.gunImage.width,
                        this.defaultGunBig.gunImage.height
                    );
                    this.physics.add.existing(this.gunHitBox);
                    this.gunHitBox.setOrigin(0.5, 0.5);
                    this.gunHitBox.setVisible(false); // Hide the hitbox
                    const tip1 = ["Press 'e' on the gun to pick it up!"];
                    this.scene.bringToTop("MessageScene");
                    this.scene.run("MessageScene", {
                        messages: tip1, // Pass the messages array to the message scene
                        gameState: this.gameState,
                    });
                }
            });
            this.input.keyboard.on("keydown-E", () => {
                //adds gun to inventory when pressing e on it
                if (this.gunHitBox) {
                    // Check if the player is overlapping with the collision area
                    if (
                        this.gameState.player.guns.length == 1 &&
                        this.chestOpened &&
                        !this.gameState.eButtonPressed &&
                        this.player &&
                        Phaser.Geom.Intersects.RectangleToRectangle(
                            this.player.getBounds(),
                            this.gunHitBox.getBounds()
                        )
                    ) {
                        this.gameState.eButtonPressed = true;
                        setTimeout(() => {
                            this.gameState.eButtonPressed = false;
                        }, 500);

                        // Destroy the hitbox after a short delay
                        setTimeout(() => {
                            this.gunHitBox?.destroy();
                        }, 1000);
                        if (this.defaultGunBig) {
                            this.gameState.player.addGun(this.defaultGunBig);
                            this.defaultGunBig.reload();
                        }

                        this.gameState.player.setAllGunsInvisibleExceptCurrent();
                        const tip2 = [
                            "Your new gun has been added to your inventory.",
                            "New guns always come fully loaded, give it a shoot!",
                            "Use the scroll wheel or arrow keys to switch to your other guns.",
                            "Press Tab to open your command prompt, and backslash \\ to close it.",
                            "To get to the next room, type 'mv player room02' and hit enter",
                            "Change the room # for access to other rooms!",
                        ];
                        this.scene.run("MessageScene", {
                            messages: tip2, // Pass the messages array to the message scene
                            gameState: this.gameState,
                        });
                    }
                }
            });
        }
        //changes current gun displayed and stops shooting on mouse wheel scroll
        this.input.on(
            "wheel",
            (
                _pointer: Phaser.Input.Pointer,
                _gameObjects: Phaser.GameObjects.GameObject[],
                deltaX: number,
                deltaY: number
            ) => {
                // Check for mouse wheel up event to switch to the next gun
                if (deltaY < 0) {
                    this.gameState.player.changeGunIndex(1); // Move to the next gun
                }
                // Check for mouse wheel down event to switch to the previous gun
                else if (deltaY > 0) {
                    this.gameState.player.changeGunIndex(-1); // Move to the previous gun
                }
            }
        );
        //also allows for gun changing on left and right arrow keys
        this.input.keyboard?.on("keydown-RIGHT", () => {
            if (
                this.gameState.player.currentGun &&
                this.gameState.player.guns.length > 1
            ) {
                this.gameState.player.changeGunIndex(1); // Move to the next gun
            }
        });

        this.input.keyboard?.on("keydown-LEFT", () => {
            if (
                this.gameState.player.currentGun &&
                this.gameState.player.guns.length > 1
            ) {
                this.gameState.player.changeGunIndex(-1); // Move to the previous gun
            }
        });
    }
    private switchScene() {
        console.log("it worked");
        //this.characterMovement.stopX();
        //this.characterMovement.stopY();
        this.scene.setVisible(true, "ConsoleScene");
        const consoleScene = this.scene.get("ConsoleScene") as ConsoleScene;
        this.scene.bringToTop("ConsoleScene");
        consoleScene.makeVisible();
        this.gameState.resetValuesOnSceneSwitch();
        this.scene.run("ConsoleScene", {
            gameState: this.gameState,
        });
        this.scene.pause("room01Scene");
        this.scene.setVisible(false, "MessageScene");
        this.scene.pause("MessageScene");
        sceneEvents.emit("player-opened-console");
        this.characterMovement.stopX();
        this.characterMovement.stopY();
    }

    //helper functions for colliders methods, need to make a seperate util file eventually

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

    //basically the same as the one above, but player takes no damage
    private handleSpriteEnemyFireballCollision(
        sprite:
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
        // Check for keyboard input and move the player accordingly
        if (this.gameState.player.health <= 0) {
            this.gameState.player.die();

            // Player is dead, trigger death animation
            this.tweens.add({
                targets: this.player,
                alpha: 0,
                duration: 2500,
                ease: "Quad",
                onComplete: () => {
                    // Transition to the next scene after a delay
                    this.scene.stop;
                    this.scene.start("GameOverScene", {
                        gameState: this.gameState,
                    });
                },
            });
        } else {
            if (this.input.activePointer.leftButtonDown()) {
                this.gameState.leftButtonPressed = true;
            } else if (
                this.gameState.leftButtonPressed &&
                this.input.activePointer.leftButtonReleased() &&
                !this.gameState.isDodging
            ) {
                this.gameState.player.currentGun?.shoot();
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
            this.gameState.player.currentGun?.updatePosition(
                this.keyboardManager.lastHorizontalDirection,
                this.keyboardManager.lastVerticalDirection
            );
        }
    }
}
export default room01Scene;
