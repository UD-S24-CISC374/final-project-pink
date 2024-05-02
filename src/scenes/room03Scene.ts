import Phaser from "phaser";

import { CONFIG } from "../config";
import { CharacterMovement } from "../util/playerMovement";
import Chort from "../objects/chort";
import { gameState } from "../objects/gameState";
import ConsoleScene from "./consoleScene";
import { Bullet } from "../objects/bullet";
import { shootBullets } from "../util/shootBullets";
import { KeyboardManager } from "../util/keyboardManager";
import { sceneEvents } from "../util/eventCenter";
import { Fireball } from "../objects/fireball";

class room03Scene extends Phaser.Scene {
    private gameState: gameState;
    private player?: Phaser.Physics.Arcade.Sprite;
    private characterMovement: CharacterMovement;
    private keyboardManager: KeyboardManager;
    private chorts?: Phaser.Physics.Arcade.Group;
    private bullets?: Phaser.Physics.Arcade.Group;
    constructor() {
        super({ key: "room03Scene" });
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
    }
    preload() {}

    create() {
        this.scene.bringToTop("room03Scene");
        const map = this.make.tilemap({ key: "room03" });
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
            this.player = this.physics.add.sprite(725, 400, "robot_idle");
            this.gameState.player.player = this.player; //absolutely need this
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

            const chort1 = this.chorts.get(550, 400, "chort");
            chort1.setProperties(30, 50, 200);
            const chort2 = this.chorts.get(400, 400, "chort");
            chort2.setProperties(30, 75, 250);
            const chort3 = this.chorts.get(300, 500, "chort");
            chort3.setProperties(30, 100, 200);
            const chort4 = this.chorts.get(400, 200, "chort");
            chort4.setProperties(30, 30, 300);
            const chort5 = this.chorts.get(400, 600, "chort");
            chort5.setProperties(30, 30, 300);

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
                    (chort as Chort).takeDamage(10); // Assuming each bullet does 10 damage
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
            //camera follows player
            this.scene.run("game-ui", { gameState: this.gameState });
            this.scene.bringToTop("game-ui");
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
        this.scene.pause("room03Scene");
        sceneEvents.emit("player-opened-console");
        this.characterMovement.stopX();
        this.characterMovement.stopY();
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
            // Player is dead, trigger death animation
            this.gameState.player.die();
            // You may also want to perform other actions, like respawning the player or ending the game
        } else {
            // Player is not dead, can move
            // Check for keyboard input and move the player accordingly

            if (this.input.activePointer.leftButtonDown()) {
                this.gameState.leftButtonPressed = true;
            } else if (
                this.gameState.leftButtonPressed &&
                this.input.activePointer.leftButtonReleased()
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
            if (this.gameState.player.health > 0)
                this.keyboardManager.handleInput();
        }
    }
}
export default room03Scene;
