// GameOverScene.js
import Phaser from "phaser";
import { gameState } from "../objects/gameState";
import { sceneEvents } from "../util/eventCenter";
import ConsoleScene from "./consoleScene";

export default class WinScene extends Phaser.Scene {
    private gameState: gameState;
    constructor() {
        super("WinScene");
    }
    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
        this.gameState.player.isDead = false;
        this.gameState.curRoom = "LobbyScene";
        this.events.off("player-moved");
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
        this.load.image("win_background", "assets/win_background.png");
        this.load.image("win_text", "assets/wintext.png");
        this.load.image("you_win", "assets/you_win.png");
        this.load.image("redo_button", "assets/restart_button.png");
        this.load.audio("win_sound", "assets/sound/win.mp3");
    }

    create() {
        // Add a black rectangle to cover the entire screen
        this.sound.stopAll();
        this.sound.play("win_sound");
        const background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "win_background"
        );
        background.setOrigin(0.5);
        background.setAlpha(0);
        background.setScale(0.6);

        const youWin = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 75,
            "you_win"
        );
        youWin.setAlpha(0);
        const winText = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 30,
            "win_text"
        );
        winText.setScale(0.5);
        winText.setAlpha(0);
        const redoButton = this.add
            .image(this.cameras.main.width / 2 + 150, 220, "redo_button")
            .setAlpha(0);
        redoButton.setInteractive();
        redoButton.setScale(0.05);

        redoButton.on("pointerover", () => {
            redoButton.setTint(0xffc300);
        });

        redoButton.on("pointerout", () => {
            redoButton.clearTint();
        });

        redoButton.on("pointerdown", () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, () => {
                this.tweens.add({
                    targets: [background, redoButton, youWin, winText],
                    alpha: 0,
                    duration: 1300,
                    onComplete: () => {
                        (
                            this.scene.get("ConsoleScene") as ConsoleScene
                        ).resetConsole();
                        // Transition to the next scene after a delay
                        this.time.delayedCall(1300, () => {
                            this.scene.start("LobbyScene", {
                                gameState: this.gameState,
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
            targets: [background, redoButton, youWin, winText],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Transition to the next scene after a delay
                this.time.delayedCall(4000, () => {});
            },
        });
    }
}
