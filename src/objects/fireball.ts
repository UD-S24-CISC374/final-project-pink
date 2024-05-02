import Phaser from "phaser";

export class Fireball extends Phaser.Physics.Arcade.Sprite {
    public speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.setScale(0.75);
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    // Method to fire the fireball towards a target position
    fire(targetX: number, targetY: number) {
        this.body?.setSize(10, 10);
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );
        this.setAngle(Phaser.Math.RAD_TO_DEG * angle + 90);
        if (this.body) {
            this.scene.physics.velocityFromRotation(
                angle,
                this.speed,
                this.body.velocity
            );
        }
        // Play shoot animation
        this.play("fireball_shoot");
    }
}
