// playerMovement.ts

import Phaser from "phaser";
import { gameState } from "../objects/gameState";

export class CharacterMovement {
    private player: Phaser.Physics.Arcade.Sprite;
    private scene: Phaser.Scene;
    private xstop: boolean = true;
    private ystop: boolean = true;
    private speed: number;
    private diagonalSpeed: number;
    private gameState: gameState;
    private damageTime: 0;

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
        this.ystop = false;
        this.xstop = false;
        this.player.setVelocityY(this.diagonalSpeed); // Adjust velocity as needed
        this.player.setVelocityX(this.diagonalSpeed); // Adjust velocity as needed
        this.player.anims.play("walkDownRight", true); // Play walk animation
    }

    idle() {
        if (this.ystop && this.xstop) {
            this.player.anims.play("idle", true);
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
}
