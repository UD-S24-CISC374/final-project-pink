import Phaser from "phaser";
import { gameState } from "../objects/gameState";

export default class MessageScene extends Phaser.Scene {
    private messages: string[]; // Array to hold tutorial messages
    private gameState: gameState;
    private currentMessageIndex: number; // Index of the current message being displayed
    private messageText: Phaser.GameObjects.Text; // Text object to display messages
    private delayBetweenLetters: number = 20; // Delay between displaying each letter in milliseconds
    private letterTimer?: Phaser.Time.TimerEvent; // Timer to control letter-by-letter display

    constructor() {
        super({ key: "MessageScene" });
    }

    init(data: { messages: string[]; gameState: gameState }) {
        this.messages = data.messages;
        this.gameState = data.gameState;
        this.currentMessageIndex = 0;
    }

    create() {
        // Display initial message
        this.showMessage(this.messages[this.currentMessageIndex]);
        this.input.on("pointerdown", this.advanceMessage, this);
    }

    update() {
        // Listen for input to advance to the next message
        // For testing purposes, you can trigger this with any input event (e.g., mouse click or keyboard press)
    }

    showMessage(message: string) {
        message = message += " (click)";
        // Disable pointer input during message display
        this.input.enabled = false;

        // Create text object to display message
        this.messageText = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 100,
                "",
                {
                    fontSize: "12px",
                    color: "#ffffff",
                    fontFamily: "Arial",
                }
            )
            .setOrigin(0.5, 0.5); // Set origin to center the text

        // Start timer to display message letter by letter
        this.letterTimer = this.time.addEvent({
            delay: this.delayBetweenLetters,
            callback: () => {
                // Ensure message exists before attempting to display
                if (message) {
                    // Append next letter to message text
                    this.messageText.text +=
                        message[this.messageText.text.length];

                    // Check if message is fully displayed
                    if (this.messageText.text.length === message.length) {
                        // Re-enable pointer input once message is fully displayed
                        this.input.enabled = true;

                        // Stop the timer if message is complete
                        if (this.letterTimer) {
                            this.letterTimer.destroy();
                        }
                    }
                }
            },
            loop: true,
        });
        console.log("Showing message:", message);
    }

    advanceMessage() {
        // Check if there are more messages to display
        this.gameState.player.player.scene.sound.play("button_sound");
        if (this.currentMessageIndex < this.messages.length - 1) {
            // Move to the next message
            this.currentMessageIndex++;

            // Clear current message text
            this.messageText.destroy();

            // Display the next message
            this.showMessage(this.messages[this.currentMessageIndex]);
        } else {
            // For now, just stop the scene
            this.gameState.interactingWithNpc = false;
            this.scene.stop();
        }
    }
}
