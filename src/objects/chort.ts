import Phaser from "phaser";
import { Bullet } from "./bullet";

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

const randomDirection = (exclude: Direction) => {
    //basically just ensures the next dierction is different than the previous direction
    let newDirection = Phaser.Math.Between(0, 3);
    while (newDirection === exclude) {
        newDirection = Phaser.Math.Between(0, 3);
    }

    return newDirection;
};

export default class Chort extends Phaser.Physics.Arcade.Sprite {
    private direction = randomDirection(Direction.RIGHT);
    private moveEvent: Phaser.Time.TimerEvent;
    private targetPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    public fireballs: Phaser.Physics.Arcade.Group =
        this.scene.physics.add.group({
            classType: Bullet,
            key: "bullet_blue",
            maxSize: 0,
            runChildUpdate: true,
        });
    private health: number = 40; // Initial health for Chort

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        scene.physics.world.on(
            //allows collisions
            Phaser.Physics.Arcade.Events.TILE_COLLIDE,
            this.handleTileCollision,
            this
        );

        this.anims.play("chort_idle", true);

        this.moveEvent = scene.time.addEvent({
            //randomly changes directions every 3 seconds
            delay: 3000,
            callback: () => {
                this.direction = randomDirection(this.direction);
            },
            loop: true,
        });

        scene.time.addEvent({
            //randomly shoots every 3-6 seconds
            delay: Phaser.Math.Between(3000, 6000), // Random delay between 3 to 6 seconds
            callback: this.shootFireball,
            callbackScope: this,
            loop: true,
        });
    }

    destroy(fromScene?: boolean) {
        //dont worry about this but its necessary
        this.moveEvent.destroy();

        super.destroy(fromScene);
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject) {
        if (go !== this) {
            return;
        }
        //if the gameobject is a chort and there is a tile collision, switch directions
        this.direction = randomDirection(this.direction);
    }

    setTargetPosition(x: number, y: number) {
        // to update target position on player-move event
        this.targetPosition.set(x, y);
    }

    shootFireball() {
        if (!this.active || !this.body || !this.body.enable) {
            return; // Don't shoot if the Chort is destroyed
        }
        //shoots fireballs
        // Create a new fireball at the Chort's position
        this.fireballs.maxSize = 10;
        let fireball = this.fireballs.get(
            this.x,
            this.y,
            "bullet_blue"
        ) as Bullet;

        // Fire the fireball towards the player
        fireball.fire(this.targetPosition.x, this.targetPosition.y);
    }

    public takeDamage(damage: number) {
        // Reduce Chort health
        this.health -= damage;

        // Check if Chort health is zero or less
        if (this.health <= 0) {
            // Destroy the Chort if health is zero or less
            this.destroy();
        }
    }

    preUpdate(t: number, dt: number) {
        this.body?.setSize(this.width * 0.8, this.height * 0.8);
        super.preUpdate(t, dt);

        const speed = 75;

        switch (
            this.direction //constantly looks for this.direction to change and changes the chorts direction on that change
        ) {
            case Direction.UP:
                this.setVelocity(0, -speed);
                this.anims.play("chort_idle", true);
                break;

            case Direction.DOWN:
                this.setVelocity(0, speed);
                this.anims.play("chort_idle", true);
                break;

            case Direction.LEFT:
                this.setVelocity(-speed, 0);
                this.anims.play("chort_walkLeft", true);
                break;

            case Direction.RIGHT:
                this.setVelocity(speed, 0);
                this.anims.play("chort_walkRight", true);
                break;
        }
    }
}
