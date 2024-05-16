import Phaser from "phaser";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import { gameState } from "../objects/gameState";
import ConsoleScene from "./consoleScene";
import Demon from "../objects/demon";
import { Bullet } from "../objects/bullet";
import { KeyboardManager } from "../util/keyboardManager";
import { sceneEvents } from "../util/eventCenter";
import { Fireball } from "../objects/fireball";

class bossRoomScene extends Phaser.Scene {
    private gameState: gameState;
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private keyboardManager: KeyboardManager;
    private bullets?: Phaser.Physics.Arcade.Group;
    private demons?: Phaser.Physics.Arcade.Group;
    private demonCount: number = 2;
    constructor() {
        super({ key: "bossRoomScene" });
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
        this.scene.stop("MessgaeScene");
    }
    preload() {}

    create() {
        this.scene.bringToTop("bossRoomScene");
        const map = this.make.tilemap({ key: "bossRoom" });
        const tileset = map.addTilesetImage("tilemap", "tiles"); //name of tilemap ON TILED, then name of key in preloader scene
        if (tileset) {
            const ground = map.createLayer("ground", tileset);
            const walls = map.createLayer("walls", tileset);
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
            this.player = this.physics.add.sprite(400, 725, "robot_idle");
            this.demons = this.physics.add.group({
                classType: Demon,
                createCallback: (go) => {
                    const demonGo = go as Demon;
                    if (demonGo.body) {
                        demonGo.body.onCollide = true;
                    }
                },
            });

            const demon1 = this.demons.get(400, 200, "demon");
            demon1.setProperties(150, 20, 250);
            const demon2 = this.demons.get(400, 150, "demon");
            demon2.setProperties(150, 20, 250);

            this.events.on("player-moved", (x: number, y: number) => {
                //on player movement, the demons target x and y change
                if (this.demons)
                    this.demons.children.iterate(
                        (c: Phaser.GameObjects.GameObject) => {
                            const child = c as Demon;
                            child.setTargetPosition(x, y);
                            return true;
                        }
                    );
            });

            this.gameState.player.player = this.player; //absolutely need this
            this.characterMovement = new CharacterMovement(
                this.player,
                this,
                100,
                this.gameState
            );
            this.keyboardManager = new KeyboardManager(this.characterMovement);

            this.bullets = this.physics.add.group({
                classType: Bullet,
                key: "bullet_blue",
                maxSize: 100,
                runChildUpdate: true,
            });

            //all of this to load the guns back onto the scene
            this.gameState.player.changeGunPlayer(this.player);
            this.gameState.player.changeBulletsGroup(this.bullets);
            this.gameState.player.changeGunScenes(this);
            this.gameState.player.addAllGunsToScene();
            this.gameState.player.setAllGunsInvisibleExceptCurrent();

            if (walls) {
                this.physics.add.collider(this.player, walls);
                this.physics.add.collider(this.demons, walls);
                this.physics.add.collider(
                    //player bullets
                    this.bullets,
                    walls,
                    (object1, object2) => {
                        this.handleBulletTileCollision(object1, object2);
                    }
                );
                this.demons.children.iterate(
                    //demon bullets
                    (demon: Phaser.GameObjects.GameObject) => {
                        //iterates through our demon group
                        const currentDemon = demon as Demon;

                        this.physics.add.collider(
                            //for each it adds a collider
                            currentDemon.fireballs, //fireball group stored in each demon instance
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
            // collision between player and demons
            this.physics.add.collider(
                this.player,
                this.demons,
                () => {
                    // Decrease player health when colliding with demon
                    this.handlePlayerEnemyCollision();
                },
                undefined,
                this
            );

            // Collision between player bullets and demons
            this.physics.add.collider(
                this.bullets,
                this.demons,
                (bullet, demon) => {
                    // Decrease demon health when hit by player bullets
                    if (
                        (demon as Demon).getHealth() <=
                        this.gameState.player.getCurrentGunDamage()
                    ) {
                        this.demonCount--; // Removes a demon from count if it will die from hit
                    }
                    (demon as Demon).takeDamage(
                        this.gameState.player.getCurrentGunDamage()
                    );
                    bullet.destroy(); // Destroy the bullet
                }
            );

            // Collision between demon bullets and player
            this.demons.children.iterate((demon) => {
                const currentDemon = demon as Demon; // Cast to Demon type
                // Check if fireballs group exists
                this.physics.add.collider(
                    this.player as Phaser.GameObjects.Sprite,
                    currentDemon.fireballs, // Collider between player and fireballs
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
        const tabKey = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.TAB
        );
        tabKey?.on("up", this.switchScene, this);

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
        this.scene.setVisible(true, "ConsoleScene");
        const consoleScene = this.scene.get("ConsoleScene") as ConsoleScene;
        this.scene.bringToTop("ConsoleScene");
        consoleScene.makeVisible();
        this.gameState.resetValuesOnSceneSwitch();
        this.scene.run("ConsoleScene", {
            gameState: this.gameState,
        });
        this.scene.pause("bossRoomScene");
        this.scene.setVisible(false, "MessageScene");
        this.scene.pause("MessageScene");
        sceneEvents.emit("player-opened-console");
        this.characterMovement.stopX();
        this.characterMovement.stopY();
        document.getElementById("consoleInput")?.focus();
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
                    this.scene.start("WinScene", {
                        gameState: this.gameState,
                    });
                },
            });
        } else if (this.demonCount == 0) {
            this.scene.stop;
            this.scene.start("WinScene", {
                gameState: this.gameState,
            });
        } else {
            // Player is not dead, can move
            // Check for keyboard input and move the player accordingly

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
export default bossRoomScene;
