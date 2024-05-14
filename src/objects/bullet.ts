import Phaser from "phaser";
export class Bullet extends Phaser.Physics.Arcade.Image {
    public bulletSpeed: number = 300; //default
    public firstCollision = true;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.setScale(0.75);
    }

    public setBulletSpeed(bulletSpeed: number) {
        this.bulletSpeed = bulletSpeed;
    }

    // Method to fire the bullet towards a target position
    fire(targetX: number, targetY: number) {
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );
        this.setImmovable(true);
        this.setAngle(Phaser.Math.RAD_TO_DEG * angle);
        if (this.body) {
            this.scene.physics.velocityFromRotation(
                angle,
                this.bulletSpeed,
                this.body.velocity
            );
        }
        setTimeout(() => {
            this.firstCollision = true;
        }, 100);
    }
}
