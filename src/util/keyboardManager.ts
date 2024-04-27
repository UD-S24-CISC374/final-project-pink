import { CharacterMovement } from "./playerMovement";

export class KeyboardManager {
    private characterMovement: CharacterMovement;
    private movementKeys: Record<string, boolean> = {};
    private onConsole: boolean = false;
    private diagonalKeys: Record<string, boolean> = {
        upLeft: false,
        upRight: false,
        downLeft: false,
        downRight: false,
    };

    constructor(characterMovement: CharacterMovement) {
        this.characterMovement = characterMovement;
        this.setupKeys();
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

    public handleInput() {
        const keyboard = this.characterMovement.scene.input.keyboard;

        if (keyboard && !this.onConsole) {
            // Handle movement
            keyboard.on("keydown-W", () => {
                this.movementKeys.W = true;
                this.updateMovement();
            });

            keyboard.on("keydown-A", () => {
                this.movementKeys.A = true;
                this.updateMovement();
            });

            keyboard.on("keydown-S", () => {
                this.movementKeys.S = true;
                this.updateMovement();
            });

            keyboard.on("keydown-D", () => {
                this.movementKeys.D = true;
                this.updateMovement();
            });

            // Stop movement on key release
            keyboard.on("keyup-W", () => {
                this.movementKeys.W = false;
                this.updateMovement();
            });

            keyboard.on("keyup-A", () => {
                this.movementKeys.A = false;
                this.updateMovement();
            });

            keyboard.on("keyup-S", () => {
                this.movementKeys.S = false;
                this.updateMovement();
            });

            keyboard.on("keyup-D", () => {
                this.movementKeys.D = false;
                this.updateMovement();
            });
        }
    }

    private updateMovement() {
        const { W, A, S, D } = this.movementKeys;
        this.emitPlayerMoved();
        if (W && A) {
            this.characterMovement.moveUpLeft();
        } else if (W && D) {
            this.characterMovement.moveUpRight();
        } else if (S && A) {
            this.characterMovement.moveDownLeft();
        } else if (S && D) {
            this.characterMovement.moveDownRight();
        } else if (W) {
            this.characterMovement.moveUp();
        } else if (S) {
            this.characterMovement.moveDown();
        } else if (A) {
            this.characterMovement.moveLeft();
        } else if (D) {
            this.characterMovement.moveRight();
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
