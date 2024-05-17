// playerMovement.ts

import Phaser from "phaser";
import { gameState } from "../objects/gameState";
import { sceneEvents } from "../util/eventCenter";

export class CharacterMovement {
    public player: Phaser.Physics.Arcade.Sprite;
    public scene: Phaser.Scene;
    private xstop: boolean = true;
    private ystop: boolean = true;
    public speed: number;
    public diagonalSpeed: number;
    public gameState: gameState;
    private damageTime: 0;
    public factor = 1.33;

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        scene: Phaser.Scene,
        speed: number,
        gameState: gameState
    ) {
        this.player = player;
        this.scene = scene;
        this.speed = speed;
        this.gameState = gameState;
        this.diagonalSpeed = this.speed / Math.sqrt(2);
        this.damageTime = 0;
        if (!this.gameState.hasAnims) {
            this.initAnimations();
        }
    }

    private initAnimations() {
        this.gameState.hasAnims = true;
        // Define animations for walking in different directions
        this.scene.anims.create({
            key: "walkDown",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_D", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "walkUp",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_U", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "walkUpLeft",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_UL", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "walkUpRight",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_UR", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "walkDownLeft",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_DL", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "walkDownRight",
            frames: this.scene.anims.generateFrameNumbers("robot_walk_DR", {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "idle",
            frames: this.scene.anims.generateFrameNumbers("robot_idle", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.scene.anims.create({
            key: "dodgeU",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_U", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
        this.scene.anims.create({
            key: "dodgeUR",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_UR", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
        this.scene.anims.create({
            key: "dodgeUL",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_UL", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
        this.scene.anims.create({
            key: "dodgeD",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_D", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
        this.scene.anims.create({
            key: "dodgeDR",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_DR", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
        this.scene.anims.create({
            key: "dodgeDL",
            frames: this.scene.anims.generateFrameNumbers("robot_roll_DL", {
                start: 0,
                end: 8,
            }),
            frameRate: 15,
        });
    }

    moveUp() {
        this.ystop = false;
        this.player.setVelocityY(-this.speed); // Adjust velocity as needed
        this.player.setVelocityX(0); // Adjust velocity as needed

        this.player.anims.play("walkUp", true); // Play walk animation
    }

    moveDown() {
        this.ystop = false;
        this.player.setVelocityY(this.speed); // Adjust velocity as needed
        this.player.setVelocityX(0); // Adjust velocity as needed
        this.player.anims.play("walkDown", true); // Play walk animation
    }

    moveLeft() {
        this.xstop = false;
        this.player.setVelocityY(0); // Adjust velocity as needed
        this.player.setVelocityX(-this.speed); // Adjust velocity as needed
        this.player.anims.play("walkDownLeft", true); // Play walk animation
    }

    moveRight() {
        this.xstop = false;
        this.player.setVelocityY(0); // Adjust velocity as needed
        this.player.setVelocityX(this.speed); // Adjust velocity as needed
        this.player.anims.play("walkDownRight", true); // Play walk animation
    }
    moveUpRight() {
        this.ystop = false;
        this.xstop = false;
        this.player.setVelocityY(-this.diagonalSpeed); // Adjust velocity as needed
        this.player.setVelocityX(this.diagonalSpeed); // Adjust velocity as needed
        this.player.anims.play("walkUpRight", true); // Play walk animation
    }
    moveUpLeft() {
        this.ystop = false;
        this.xstop = false;
        this.player.setVelocityY(-this.diagonalSpeed); // Adjust velocity as needed
        this.player.setVelocityX(-this.diagonalSpeed); // Adjust velocity as needed
        this.player.anims.play("walkUpLeft", true); // Play walk animation
    }
    moveDownLeft() {
        this.ystop = false;
        this.xstop = false;
        this.player.setVelocityY(this.diagonalSpeed); // Adjust velocity as needed
        this.player.setVelocityX(-this.diagonalSpeed); // Adjust velocity as needed
        this.player.anims.play("walkDownLeft", true); // Play walk animation
    }
    moveDownRight() {
        this.xstop = false;
        this.player.setVelocityY(this.diagonalSpeed); // Adjust velocity as needed
        this.player.setVelocityX(this.diagonalSpeed); // Adjust velocity as needed
        this.player.anims.play("walkDownRight", true); // Play walk animation
    }

    idle() {
        if (this.ystop && this.xstop) {
            this.player.anims.play("idle", true);
        } else {
            return;
        }
    }

    stopX() {
        this.xstop = true;
        this.player.setVelocityX(0); // Stop movement

        if (this.ystop) {
            this.idle();
        }
    }
    stopY() {
        this.ystop = true;
        this.player.setVelocityY(0); // Stop movement

        if (this.xstop) {
            this.idle();
        }
    }

    performDodgeRoll(
        lastHorizontalDirection: string,
        lastVerticalDirection: string
    ) {
        if (
            !this.gameState.isDodging &&
            (lastHorizontalDirection || lastVerticalDirection)
        ) {
            this.gameState.isDodging = true;
            this.gameState.invulnerable = true;

            // Determine dodge roll direction based on last movement direction
            let dodgeDirection = "";
            let animationKey = "";
            if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "left"
            ) {
                dodgeDirection = "UL";
                animationKey = "dodgeUL";
            } else if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "right"
            ) {
                dodgeDirection = "UR";
                animationKey = "dodgeUR";
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "left"
            ) {
                dodgeDirection = "DL";
                animationKey = "dodgeDL";
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "right"
            ) {
                dodgeDirection = "DR";
                animationKey = "dodgeDR";
            } else if (
                lastVerticalDirection === "up" &&
                !lastHorizontalDirection
            ) {
                dodgeDirection = "U";
                animationKey = "dodgeU";
            } else if (
                lastVerticalDirection === "down" &&
                !lastHorizontalDirection
            ) {
                dodgeDirection = "D";
                animationKey = "dodgeD";
            } else if (
                lastHorizontalDirection === "left" &&
                !lastVerticalDirection
            ) {
                dodgeDirection = "L";
                animationKey = "dodgeDL"; // Use diagonal animation for left dodge
            } else if (
                lastHorizontalDirection === "right" &&
                !lastVerticalDirection
            ) {
                dodgeDirection = "R";
                animationKey = "dodgeDR"; // Use diagonal animation for right dodge
            } else {
                return;
            }

            // Play dodge animation based on direction
            this.player.anims.play(animationKey, true);

            // Adjust velocity for dodge roll
            let dodgeVelocityX = 0;
            let dodgeVelocityY = 0;
            switch (dodgeDirection) {
                case "U":
                    dodgeVelocityY = -this.speed * this.factor;
                    break;
                case "D":
                    dodgeVelocityY = this.speed * this.factor;
                    break;
                case "L":
                    dodgeVelocityX = -this.speed * this.factor;
                    break;
                case "R":
                    dodgeVelocityX = this.speed * this.factor;
                    break;
                case "DL":
                    dodgeVelocityX = -this.diagonalSpeed * this.factor;
                    dodgeVelocityY = this.diagonalSpeed * this.factor;
                    break;
                case "DR":
                    dodgeVelocityX = this.diagonalSpeed * this.factor;
                    dodgeVelocityY = this.diagonalSpeed * this.factor;
                    break;
                case "UL":
                    dodgeVelocityX = -this.diagonalSpeed * this.factor;
                    dodgeVelocityY = -this.diagonalSpeed * this.factor;
                    break;
                case "UR":
                    dodgeVelocityX = this.diagonalSpeed * this.factor;
                    dodgeVelocityY = -this.diagonalSpeed * this.factor;
                    break;
            }

            // Apply velocity for dodge roll
            this.player.setVelocity(dodgeVelocityX, dodgeVelocityY);
            this.scene.sound.play("roll_sound");

            // Set a timer to end the dodge roll animation
            this.scene.time.delayedCall(660, () => {
                // Stop player movement
                // Restore player movement state
                this.gameState.isDodging = false;
                this.gameState.invulnerable = false;

                sceneEvents.emit("player-finished-dodge");
            });
        }
    }
}
