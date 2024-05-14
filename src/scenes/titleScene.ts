import Phaser from "phaser";
import { gameState } from "../objects/gameState";
import Player from "../objects/player";

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: "TitleScene" });
    }

    preload() {
        this.load.image("logo", "assets/bashTheDungeonTextLogo.png");
        this.load.image("playButton", "assets/playButton.png");
        this.load.image(
            "titleScreenBackground",
            "assets/titleScreenBackground.png"
        );
        this.load.image("titleSceneCreators", "assets/titleSceneCreators.png");
    }

    create() {
        const player = new Player(5, 5);
        const initialGameState = new gameState(
            player,
            0, //level
            0, //tutorial level
            false,
            "LobbyScene"
        );
        // Add background image
        const background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "titleScreenBackground"
        );
        background.setOrigin(0.5);
        background.setScale(0.45);

        // Add other elements with alpha set to 0 (fully transparent)
        const logo = this.add
            .image(this.cameras.main.width / 2, 80, "logo")
            .setAlpha(0);
        logo.setScale(0.46);
        const creatorText = this.add
            .image(this.cameras.main.width / 2, 166, "titleSceneCreators")
            .setAlpha(0);
        creatorText.setOrigin(0.5);
        creatorText.setScale(0.3125);
        const playButton = this.add
            .image(this.cameras.main.width / 2, 220, "playButton")
            .setAlpha(0);
        playButton.setScale(0.23);
        playButton.setOrigin(0.5);
        playButton.setInteractive();
        console.log(this.cameras.main);

        playButton.on("pointerover", () => {
            playButton.setTint(243725);
        });

        playButton.on("pointerout", () => {
            playButton.setTint(130909);
        });

        playButton.on("pointerdown", () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, () => {
                console.log("camera fade");
                this.sound.play("button_sound");
                this.scene.start("LobbyScene", {
                    gameState: initialGameState,
                });
            });
        });

        // Fade in all elements gradually
        this.tweens.add({
            targets: [background, logo, creatorText, playButton],
            alpha: 1,
            duration: 2000,
            ease: "Linear",
        });
    }
}

export default TitleScene;
