import Phaser from "phaser";
import { CharacterMovement } from "./playerMovement";
import { sceneEvents } from "../util/eventCenter";

export class KeyboardManager {
    private characterMovement: CharacterMovement;
    public movementKeys: Record<string, boolean> = {};
    private onConsole: boolean = false;
    public lastHorizontalDirection: string;
    public lastVerticalDirection: string;

    constructor(characterMovement: CharacterMovement) {
        this.characterMovement = characterMovement;
        this.setupKeys();
        this.lastHorizontalDirection = "";
        this.lastVerticalDirection = "";
        sceneEvents.on(
            "player-finished-dodge",
            () => {
                this.handleFinishDodge();
            },
            this
        );

        this.characterMovement.scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                sceneEvents.off(
                    "player-finished-dodge",
                    this.handleFinishDodge,
                    this
                );
            }
        );
        sceneEvents.on(
            "player-opened-console",
            () => {
                this.handleConsoleClosed();
            },
            this
        );

        this.characterMovement.scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                sceneEvents.off(
                    "player-opened-console",
                    this.handleConsoleClosed,
                    this
                );
            }
        );
    }

    private setupKeys() {
        // Initialize all movement keys to false
        this.movementKeys = {
            W: false,
            A: false,
            S: false,
            D: false,
        };
    }

    public setOnConsole(value: boolean) {
        this.onConsole = value;
    }

    public handlePlayerHit() {
        const lastHorizontalDirection = this.lastHorizontalDirection;
        const lastVerticalDirection = this.lastVerticalDirection;
        if (!this.characterMovement.gameState.isDodging) {
            if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "left"
            ) {
                this.characterMovement.moveUpLeft();
            } else if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "right"
            ) {
                this.characterMovement.moveUpRight();
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "left"
            ) {
                this.characterMovement.moveDownLeft();
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "right"
            ) {
                this.characterMovement.moveDownRight();
            } else if (
                lastVerticalDirection === "up" &&
                !lastHorizontalDirection
            ) {
                this.characterMovement.moveUp();
            } else if (
                lastVerticalDirection === "down" &&
                !lastHorizontalDirection
            ) {
                this.characterMovement.moveDown();
            } else if (
                lastHorizontalDirection === "left" &&
                !lastVerticalDirection
            ) {
                this.characterMovement.moveLeft();
            } else if (
                lastHorizontalDirection === "right" &&
                !lastVerticalDirection
            ) {
                this.characterMovement.moveRight();
            } else {
                this.characterMovement.stopX();
                this.characterMovement.stopY();
            }
        } else {
            const dodgeSpeed =
                this.characterMovement.speed * this.characterMovement.factor;
            const dodgeDiagonalSpeed =
                this.characterMovement.diagonalSpeed *
                this.characterMovement.factor;
            if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "left"
            ) {
                this.characterMovement.player.setVelocity(
                    -dodgeDiagonalSpeed,
                    -dodgeDiagonalSpeed
                );
            } else if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === "right"
            ) {
                this.characterMovement.player.setVelocity(
                    dodgeDiagonalSpeed,
                    -dodgeDiagonalSpeed
                );
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "left"
            ) {
                this.characterMovement.player.setVelocity(
                    -dodgeDiagonalSpeed,
                    dodgeDiagonalSpeed
                );
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === "right"
            ) {
                this.characterMovement.player.setVelocity(
                    dodgeDiagonalSpeed,
                    dodgeDiagonalSpeed
                );
            } else if (
                lastVerticalDirection === "up" &&
                !lastHorizontalDirection
            ) {
                this.characterMovement.player.setVelocity(0, -dodgeSpeed);
            } else if (
                lastVerticalDirection === "down" &&
                !lastHorizontalDirection
            ) {
                this.characterMovement.player.setVelocity(0, dodgeSpeed);
            } else if (
                lastHorizontalDirection === "left" &&
                !lastVerticalDirection
            ) {
                this.characterMovement.player.setVelocity(-dodgeSpeed, 0);
            } else if (
                lastHorizontalDirection === "right" &&
                !lastVerticalDirection
            ) {
                this.characterMovement.player.setVelocity(dodgeSpeed, 0);
            } else {
                this.characterMovement.player.setVelocity(0, 0);
            }
        }
    }

    private handleConsoleClosed() {
        this.movementKeys.W = false;
        this.movementKeys.A = false;
        this.movementKeys.S = false;
        this.movementKeys.D = false;
        this.lastVerticalDirection = "";
        this.lastHorizontalDirection = "";
    }

    private handleFinishDodge() {
        this.updateMovement();
    }

    public handleInput() {
        const keyboard = this.characterMovement.scene.input.keyboard;

        if (keyboard) {
            // Handle movement
            keyboard.on("keydown-W", () => {
                this.movementKeys.W = true;
                this.lastVerticalDirection = "up";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keydown-A", () => {
                this.movementKeys.A = true;
                this.lastHorizontalDirection = "left";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keydown-S", () => {
                this.movementKeys.S = true;
                this.lastVerticalDirection = "down";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keydown-D", () => {
                this.movementKeys.D = true;
                this.lastHorizontalDirection = "right";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            // Stop movement on key release
            keyboard.on("keyup-W", () => {
                this.movementKeys.W = false;
                this.lastVerticalDirection = "";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keyup-A", () => {
                this.movementKeys.A = false;
                this.lastHorizontalDirection = "";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keyup-S", () => {
                this.movementKeys.S = false;
                this.lastVerticalDirection = "";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });

            keyboard.on("keyup-D", () => {
                this.movementKeys.D = false;
                this.lastHorizontalDirection = "";
                if (
                    !this.characterMovement.gameState.isDodging &&
                    !this.onConsole
                ) {
                    this.updateMovement();
                }
            });
        }
    }

    private updateMovement() {
        const W = this.movementKeys.W;
        const A = this.movementKeys.A;
        const S = this.movementKeys.S;
        const D = this.movementKeys.D;

        this.emitPlayerMoved();
        if (W && A) {
            this.lastHorizontalDirection = "left";
            this.lastVerticalDirection = "up";
            this.characterMovement.moveUpLeft();
        } else if (W && D) {
            this.lastHorizontalDirection = "right";
            this.lastVerticalDirection = "up";
            this.characterMovement.moveUpRight();
        } else if (S && A) {
            this.lastHorizontalDirection = "left";
            this.lastVerticalDirection = "down";
            this.characterMovement.moveDownLeft();
        } else if (S && D) {
            this.lastHorizontalDirection = "right";
            this.lastVerticalDirection = "down";
            this.characterMovement.moveDownRight();
        } else if (W) {
            this.lastHorizontalDirection = "";
            this.lastVerticalDirection = "up";
            this.characterMovement.moveUp();
        } else if (S) {
            this.lastHorizontalDirection = "";
            this.lastVerticalDirection = "down";
            this.characterMovement.moveDown();
        } else if (A) {
            this.characterMovement.moveLeft();
            this.lastHorizontalDirection = "left";
            this.lastVerticalDirection = "";
        } else if (D) {
            this.characterMovement.moveRight();
            this.lastHorizontalDirection = "right";
            this.lastVerticalDirection = "";
        } else {
            this.characterMovement.stopX();
            this.characterMovement.stopY();
        }
    }

    private emitPlayerMoved() {
        this.characterMovement.scene.events.emit(
            "player-moved",
            this.characterMovement.player.x,
            this.characterMovement.player.y
        );
    }
}
