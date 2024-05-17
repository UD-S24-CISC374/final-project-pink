import Phaser from "phaser";

export default class HelpButton extends Phaser.Scene {
    constructor() {
        super("HelpButton");
    }

    create() {
        // Add the help button
        const helpButton = this.add
            .image(this.cameras.main.width - 1, 0, "help_button")
            .setOrigin(1, 0)
            .setInteractive();
        helpButton.setScale(0.1);

        // Create the help menu container
        const helpMenuContainer = this.add.container(0, 0);
        helpMenuContainer.setVisible(false);

        // Add background for the help menu
        const helpMenuBackground = this.add
            .rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                300,
                400,
                0x000000,
                0.7
            )
            .setInteractive()
            .setOrigin(0.5);
        helpMenuContainer.add(helpMenuBackground);

        // Add text for displaying controls
        const controlsText = `
        WASD to move

        'E' to interact (open chests, talk to npcs)

        Right mouse click (while moving) to dodge roll

        Use mouse to aim and left click to shoot

        'Tab' opens and closes the command prompt

        'Enter' to execute a command

        Scroll or LR arrow keys to switch guns
    `;
        const controlsTextObject = this.add
            .text(
                helpMenuBackground.x - 20,
                helpMenuBackground.y,
                controlsText,
                {
                    fontSize: "12px",
                    align: "center",
                }
            )
            .setOrigin(0.5)
            .setWordWrapWidth(helpMenuBackground.width); // Adjust width based on container size
        helpMenuContainer.add(controlsTextObject);

        // Toggle help menu visibility when help button is clicked
        helpButton.on("pointerdown", () => {
            this.sound.play("button_sound");
            helpMenuContainer.setVisible(!helpMenuContainer.visible);
        });

        // Close help menu when background is clicked
        helpMenuBackground.on("pointerdown", () => {
            helpMenuContainer.setVisible(false);
        });
    }
}
