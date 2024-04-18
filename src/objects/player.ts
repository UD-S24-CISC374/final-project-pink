import Phaser from "phaser";
class Player {
    hearts: number;
    health: number;
    isInvincible: boolean;
    player: Phaser.Physics.Arcade.Sprite;

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        hearts: number,
        health: number
    ) {
        this.hearts = hearts;
        this.health = health;
        this.isInvincible = false;
        this.player = player;
    }

    takeDamage(damage: number) {
        if (!this.isInvincible) {
            this.isInvincible = true;

            // Play damage animation
            this.playDamageAnimation();

            // Set a timeout to disable invincibility after a certain duration
            setTimeout(() => {
                this.isInvincible = false;
                this.player.clearTint();
            }, 1000);
        }

        this.health -= damage;
    }
    playDamageAnimation() {
        // Red tint animation
        this.player.setTint(0xff0001); // Set player to red tint

        // Set a timeout to revert player appearance after a short duration
        setTimeout(() => {
            // Revert player appearance to normal
            this.player.clearTint();

            // Flash animation (white tint)
            const flashDuration = 1000 - 111; // Remaining duration after red tint animation
            let isWhite = false;
            const flashInterval = setInterval(() => {
                if (isWhite) {
                    this.player.clearTint();
                } else {
                    this.player.setTint(0x0fffff); // Set player to white tint
                }
                isWhite = !isWhite;
            }, 100); // Flash interval (every 100 milliseconds)

            // Set a timeout to clear the flash interval after the remaining duration
            setTimeout(() => {
                clearInterval(flashInterval);
                this.player.clearTint(); // Ensure player appearance is reverted to normal
            }, flashDuration);
        }, 111); // Red tint duration
    }
}

export default Player;
