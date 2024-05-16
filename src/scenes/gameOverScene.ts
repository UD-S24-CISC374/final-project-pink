// GameOverScene.js
import Phaser from "phaser";
import { gameState } from "../objects/gameState";
import { sceneEvents } from "../util/eventCenter";
import Player from "../objects/player";
import ConsoleScene from "./consoleScene";

const player = new Player(5, 5);
const initialGameState = new gameState(
    player,
    0, //level
    0, //tutorial level
    false,
    "LobbyScene"
);
export default class GameOverScene extends Phaser.Scene {
    private gameState: gameState;
    constructor() {
        super("GameOverScene");
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
        this.gameState.player.isDead = false;
        this.gameState.curRoom = "LobbyScene";
        this.events.off("player-moved");
        sceneEvents.off("player-finished-dodge");
        sceneEvents.removeAllListeners();
        this.scene.stop("game-ui");
        this.scene.stop("HelpButton");
        this.gameState.player.healToAmount(5);
        this.gameState.resetValuesOnSceneSwitch();
        this.gameState.player.currentGunIndex = 0;
        this.gameState.player.guns = [];
        this.gameState.player.currentGun = undefined;
        this.gameState.tutorialLevel = 0;
        this.gameState.interactingWithNpc = false;
        this.scene.resume("MessageScene");
        this.scene.stop("MessageScene");
        this.scene.setVisible(false, "MessageScene");
    }
    preload() {
        this.load.image("game_over", "assets/game_over.png");
        this.load.image("redo_button", "assets/restart_button.png");
    }

    create() {
        // Add a black rectangle to cover the entire screen
        this.sound.stopAll();
        this.sound.play("player_death_sound");
        const background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "game_over"
        );
        background.setOrigin(0.5);
        background.setScale(0.33);
        background.setAlpha(0);

        const redoButton = this.add
            .image(this.cameras.main.width / 2, 220, "redo_button")
            .setAlpha(0);
        redoButton.setScale(0.05);
        redoButton.setOrigin(0.5);
        redoButton.setInteractive();

        redoButton.on("pointerover", () => {
            redoButton.setTint(0xffc300);
        });

        redoButton.on("pointerout", () => {
            redoButton.clearTint();
        });

        redoButton.on("pointerdown", () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, () => {
                this.tweens.add({
                    targets: [background, redoButton],
                    alpha: 0,
                    duration: 1300,
                    onComplete: () => {
                        // Transition to the next scene after a delay
                        this.time.delayedCall(1300, () => {
                            (
                                this.scene.get("ConsoleScene") as ConsoleScene
                            ).resetConsole();
                            this.scene.start("LobbyScene", {
                                gameState: initialGameState,
                            });
                            this.sound.stopAll();
                            this.scene.stop();
                        });
                    },
                });
            });
        });

        // Fade in the game over text and the black rectangle
        this.tweens.add({
            targets: [background, redoButton],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Transition to the next scene after a delay
                this.time.delayedCall(4000, () => {});
            },
        });
    }
}
