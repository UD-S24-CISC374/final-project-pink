import Phaser from "phaser";
import { Fireball } from "./fireball"; // Import the Fireball class

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

const randomDirection = (exclude: Direction) => {
    let newDirection = Phaser.Math.Between(0, 3);
    while (newDirection === exclude) {
        newDirection = Phaser.Math.Between(0, 3);
    }
    return newDirection;
};

export default class Demon extends Phaser.Physics.Arcade.Sprite {
    private direction = randomDirection(Direction.RIGHT);
    private moveEvent: Phaser.Time.TimerEvent;
    private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    public fireballs: Phaser.Physics.Arcade.Group; // Remove the initialization

    private health: number = 50; //default values... can be changed with the setter
    private speed: number = 75;
    private bulletSpeed: number = 200;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
        scene.physics.world.on(
            Phaser.Physics.Arcade.Events.TILE_COLLIDE,
            this.handleTileCollision,
            this
        );

        this.anims.play("demon_idle", true);

        this.moveEvent = scene.time.addEvent({
            delay: 3000,
            callback: () => {
                this.direction = randomDirection(this.direction);
            },
            loop: true,
        });

        scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: this.shootFireball,
            callbackScope: this,
            loop: true,
        });

        // Create the fireball group with Fireball class
        this.fireballs = this.scene.physics.add.group({
            classType: Fireball,
            maxSize: 10, // Set the maximum size of the fireball group
            runChildUpdate: true,
        });
    }

    public setProperties(health: number, speed: number, bulletSpeed: number) {
        this.health = health;
        this.speed = speed;
        this.bulletSpeed = bulletSpeed;
    }

    destroy(fromScene?: boolean) {
        this.moveEvent.destroy();
        super.destroy(fromScene);
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject) {
        if (go !== this) {
            return;
        }
        this.direction = randomDirection(this.direction);
    }

    setTargetPosition(x: number, y: number) {
        this.targetPosition.set(x, y);
    }

    shootFireball() {
        if (!this.active || !this.body || !this.body.enable) {
            return;
        }
        // Get a fireball instance from the group
        let fireball = this.fireballs.get(
            this.x,
            this.y,
            "fireball_shoot" // Use the appropriate texture key for the fireball
        ) as Fireball;
        fireball.setSpeed(this.bulletSpeed);

        // Fire the fireball towards the player
        fireball.fire(this.targetPosition.x, this.targetPosition.y);
    }

    public takeDamage(damage: number) {
        this.playDamageAnimation();
        this.health -= damage;
        if (this.health <= 0) {
            this.disableBody(true, true);
            const explosion = this.scene.add
                .sprite(this.x, this.y, "fireball_explode")
                .play("fireball_explode");
            explosion.once("animationcomplete", () => {
                explosion.destroy(); // Destroy the explosion sprite when animation completes
                this.destroy();
            });
        }
    }
    private playDamageAnimation() {
        // Red tint animation
        this.setTint(0xff0001); // Set player to red tint

        // Set a timeout to revert player appearance after a short duration
        setTimeout(() => {
            // Revert player appearance to normal
            this.clearTint();
        }, 111); // Red tint duration
    }

    preUpdate(t: number, dt: number) {
        this.body?.setSize(this.width * 0.8, this.height * 0.8);
        super.preUpdate(t, dt);

        switch (this.direction) {
            case Direction.UP:
                this.setVelocity(0, -this.speed);
                this.anims.play("demon_idle", true);
                break;

            case Direction.DOWN:
                this.setVelocity(0, this.speed);
                this.anims.play("demon_idle", true);
                break;

            case Direction.LEFT:
                this.setVelocity(-this.speed, 0);
                this.anims.play("demon_walkLeft", true);
                break;

            case Direction.RIGHT:
                this.setVelocity(this.speed, 0);
                this.anims.play("demon_walkRight", true);
                break;
        }
    }
}
