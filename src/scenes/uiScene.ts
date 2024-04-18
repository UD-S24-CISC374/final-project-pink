import Phaser from "phaser";
import { sceneEvents } from "../util/eventCenter";
import { gameState } from "../objects/gameState";

export default class GameUI extends Phaser.Scene {
    private hearts!: Phaser.GameObjects.Group;
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

        sceneEvents.on(
            "player-health-changed",
            (health: number) => {
                this.handlePlayerHealthChanged(health);
            },
            this
        );

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(
                "player-health-changed",
                this.handlePlayerHealthChanged,
                this
            );
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
}
