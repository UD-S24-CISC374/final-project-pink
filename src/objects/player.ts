import Phaser from "phaser";
import { Gun } from "./gun";
class Player {
    hearts: number;
    health: number;
    isInvincible: boolean;
    player: Phaser.Physics.Arcade.Sprite;
    currentGun?: Gun;
    currentGunIndex: number = 0;
    guns: Gun[];

    constructor(
        player: Phaser.Physics.Arcade.Sprite,
        hearts: number,
        health: number
    ) {
        this.hearts = hearts;
        this.health = health;
        this.isInvincible = false;
        this.player = player;
        this.guns = [];
    }

    changeGunScenes(newScene: Phaser.Scene) {
        this.guns.forEach((gun) => {
            gun.scene = newScene;
        });
    }

    changeGunPlayer(player: Phaser.Physics.Arcade.Sprite) {
        this.guns.forEach((gun) => {
            gun.setPlayer(player);
        });
    }

    changeBulletsGroup(bullets: Phaser.Physics.Arcade.Group) {
        this.guns.forEach((gun) => {
            gun.setBullets(bullets);
        });
    }

    addAllGunsToScene() {
        this.guns.forEach((gun) => {
            gun.addToScene();
        });
    }

    getCurrentGunDamage(): number {
        if (this.currentGun) {
            return this.currentGun.bulletDamage;
        } else {
            return 0;
        }
    }

    addGun(gun: Gun) {
        this.guns.push(gun); // Add the provided gun instance to the guns array
        // If the current gun is null, set the current gun to the newly added gun
        this.currentGun = gun;
        if (this.guns.length >= 1) {
            this.changeGunIndex(1);
        }
    }

    changeGunIndex(delta: number) {
        // Increment or decrement the current gun index by the provided delta
        this.currentGunIndex += delta;

        // Ensure the current gun index stays within bounds of the guns array
        if (this.currentGunIndex < 0) {
            this.currentGunIndex = this.guns.length - 1;
        } else if (this.currentGunIndex >= this.guns.length) {
            this.currentGunIndex = 0;
        }

        // Set the current gun to the gun at the updated current gun index
        this.currentGun = this.guns[this.currentGunIndex];
        this.setAllGunsInvisibleExceptCurrent();
    }

    setAllGunsInvisibleExceptCurrent() {
        // Loop through all guns in the player's inventory
        for (let i = 0; i < this.guns.length; i++) {
            // Check if the current gun index matches the index of the current gun in the inventory
            if (i === this.currentGunIndex) {
                // Set the current gun visible
                this.guns[i].setVisible();
            } else {
                // Set all other guns invisible
                this.guns[i].setInvisible();
            }
        }
    }

    healToAmount(healTo: number) {
        this.hearts = healTo;
        this.health = healTo;
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
    die() {
        // Play death animation
        this.playDeathAnimation();
        // Stop the player from moving
        this.player.setVelocity(0, 0);
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
    playDeathAnimation() {
        // Change player appearance (e.g., tint it red)
        this.player.setTint(0xff0000); // Set player to red tint
    }
}

export default Player;
