import Phaser from "phaser";
import { Bullet } from "../objects/bullet";

let shootingInProgress = false;

//for player shooting
export function shootBullets(
    scene: Phaser.Scene,
    bullets: Phaser.Physics.Arcade.Group,
    player: Phaser.Physics.Arcade.Sprite,
    numShots: number,
    shotDelay: number,
    texture: string
) {
    if (shootingInProgress) {
        return;
    }

    shootingInProgress = true;

    let shotsFired = 0;

    for (let i = 0; i < numShots; i++) {
        // Calculate the delay for this shot
        const delay = i * shotDelay;

        // Use setTimeout to delay each shot
        setTimeout(() => {
            if (scene.scene.isActive()) {
                //ensures no errors if player is shooting while switching scenes
                const worldPosition =
                    scene.input.activePointer.positionToCamera(
                        scene.cameras.main
                    ) as Phaser.Math.Vector2;

                // get new bullet
                let bullet = bullets.get(player.x, player.y, texture) as Bullet;

                // Fire the bullet towards the target
                bullet.fire(worldPosition.x, worldPosition.y);

                shotsFired++;

                if (shotsFired === numShots) {
                    shootingInProgress = false;
                }
            } else {
                shootingInProgress = false;
                return;
            }
        }, delay);
    }
}
