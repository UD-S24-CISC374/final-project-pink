import Phaser from "phaser";
import { sceneEvents } from "../util/eventCenter";
import { gameState } from "../objects/gameState";

export default class GameUI extends Phaser.Scene {
    private hearts!: Phaser.GameObjects.Group;
    private gunImage!: Phaser.GameObjects.Image;
    private bulletImages: Phaser.GameObjects.Image[] = [];
    private gameState: gameState;

    constructor() {
        super({ key: "game-ui" });
    }

    init(data: { gameState: gameState }) {
        this.gameState = data.gameState;
    }

    create() {
        // Create hearts based on the player's health
        const playerHealth = this.gameState.player.health;
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image,
        });

        for (let i = 0; i < playerHealth; i++) {
            this.hearts.add(
                this.add.image(10 + i * 16, 10, "ui-heart-full").setDepth(100)
            );
        }

        for (let i = playerHealth; i < this.gameState.player.hearts; i++) {
            this.hearts.add(
                this.add.image(10 + i * 16, 10, "ui-heart-empty").setDepth(100)
            );
        }

        // Create the gun image
        if (this.gameState.player.currentGun) {
            this.gunImage = this.add
                .image(
                    10,
                    this.cameras.main.height - 10,
                    this.gameState.player.currentGun.texture
                )
                .setDepth(100);
        }

        // Subscribe to events
        sceneEvents.on(
            "player-health-changed",
            this.handlePlayerHealthChanged,
            this
        );
        sceneEvents.on("gun-changed", this.handleGunChanged, this);
        sceneEvents.on("bullets-changed", this.handleBulletsChanged, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(
                "player-health-changed",
                this.handlePlayerHealthChanged,
                this
            );
            sceneEvents.off("gun-changed", this.handleGunChanged, this);
            sceneEvents.off("bullets-changed", this.handleBulletsChanged, this);
        });
    }

    private handlePlayerHealthChanged(health: number) {
        // Update the textures of hearts based on the current player health
        this.hearts.children.each((go, idx) => {
            const heart = go as Phaser.GameObjects.Image;
            if (idx < health) {
                heart.setTexture("ui-heart-full");
            } else {
                heart.setTexture("ui-heart-empty");
            }
            return true;
        });
    }

    private handleGunChanged(texture: string) {
        // Update the gun image
        if (this.gameState.player.currentGun) this.gunImage.setTexture(texture);
    }

    private handleBulletsChanged(data: {
        numBullets: number;
        bulletTexture: string;
    }) {
        // Clear existing bullet images
        this.bulletImages.forEach((image) => {
            image.destroy();
        });
        this.bulletImages = [];

        // Create new bullet images based on the number of bullets
        if (this.gameState.player.currentGun) {
            if (this.gameState.player.currentGun.shotsFired == 0) {
                data.numBullets =
                    this.gameState.player.currentGun.shotsPerRound;
            }
            for (let i = 0; i < data.numBullets; i++) {
                const bulletImage = this.add
                    .image(10, this.cameras.main.height - 30 - i * 5, "")
                    .setDepth(100);
                // Set texture for the bullet image
                // Assuming bulletTexture is the texture for the bullet image
                bulletImage.setTexture(data.bulletTexture);
                this.bulletImages.push(bulletImage);
            }
        }
    }
}
