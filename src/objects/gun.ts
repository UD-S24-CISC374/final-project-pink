import Phaser from "phaser";
import { Bullet } from "./bullet";
import { gameState } from "./gameState";

export class Gun {
    private scene: Phaser.Scene;
    private gameState: gameState;
    private player: Phaser.Physics.Arcade.Sprite;
    private bullets: Phaser.Physics.Arcade.Group;
    private texture: string;
    private bulletTexture: string;
    private bulletSpeed: number;
    public bulletDamage: number;
    private shotsPerRound: number;
    private millisecondsBetweenShots: number;
    public gunImage: Phaser.GameObjects.Image;
    private shootingInProgress: boolean = false; //to stop shooting when ammo clip is used
    public isReloaded: boolean = true; //use this for the reload command, and to check if current gun is reloaded anywhere where gameState is accessible

    constructor(
        scene: Phaser.Scene,
        gameState: gameState,
        player: Phaser.Physics.Arcade.Sprite,
        bullets: Phaser.Physics.Arcade.Group,
        texture: string,
        bulletTexture: string,
        bulletSpeed: number,
        bulletDamage: number,
        shotsPerRound: number,
        millisecondsBetweenShots: number
    ) {
        this.scene = scene;
        this.gameState = gameState;
        this.player = player;
        this.bullets = bullets;
        this.texture = texture;
        this.bulletTexture = bulletTexture;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.shotsPerRound = shotsPerRound;
        this.millisecondsBetweenShots = millisecondsBetweenShots;
    }

    public reload() {
        //Jacob call this for the reload command, would be this.gameState.player.currentGun.reload() to do it
        this.isReloaded = true;
    }

    public addToScene() {
        // Create the gun image using the texture name
        this.gunImage = this.scene.add.image(
            this.player.x,
            this.player.y,
            this.texture
        );
        this.gunImage.setScale(0.85);
    }

    // Method to handle shooting bullets
    // Method to handle shooting bullets
    public shoot() {
        // Fire the bullet towards the target
        this.shootBullets(
            this.scene, // Scene where shoot() was called from
            this.bullets!, // Bullets group
            this.gunImage, // Gun image
            this.bulletSpeed, // Bullet speed
            this.shotsPerRound, // Shots per round
            this.millisecondsBetweenShots, // Milliseconds between shots
            this.bulletTexture // Image texture for bullet
        );
    }

    private shootBullets(
        scene: Phaser.Scene,
        bullets: Phaser.Physics.Arcade.Group,
        gunImage: Phaser.GameObjects.Image,
        speed: number,
        numShots: number,
        shotDelay: number,
        texture: string
    ) {
        if (this.shootingInProgress) {
            return;
        }

        this.shootingInProgress = true;

        let shotsFired = 0;

        this.reload(); //for now just let the player shoot all the time until the command works, then use this to update and remove here
        let totalDelay = numShots * shotDelay;
        for (let i = 0; i < numShots; i++) {
            // Calculate the delay for this shot
            let delay = i * shotDelay;

            // Use setTimeout to delay each shot
            setTimeout(() => {
                if (this.scene.scene.isActive()) {
                    if (this.isReloaded) {
                        // only fires bullets if gun is reloaded, also used to stop shooting when switching guns
                        // Ensure no errors if player is shooting while switching scenes
                        const worldPosition =
                            scene.input.activePointer.positionToCamera(
                                scene.cameras.main
                            ) as Phaser.Math.Vector2;

                        // Get new bullet
                        let bullet = bullets.get(
                            gunImage.x,
                            gunImage.y,
                            texture
                        ) as Bullet;
                        bullet.setBulletSpeed(speed);

                        // Fire the bullet towards the target
                        bullet.fire(worldPosition.x, worldPosition.y);

                        shotsFired++;

                        if (shotsFired === numShots) {
                            this.shootingInProgress = false;
                        }
                    } else {
                        this.shootingInProgress = false;
                        return;
                    }
                } else {
                    this.shootingInProgress = false;
                    return;
                }
            }, delay);
        }
    }

    public setInvisible() {
        this.gunImage.setVisible(false);
    }

    // Method to set the gun visible
    public setVisible() {
        this.gunImage.setVisible(true);
    }

    // Method to update gun position
    public updatePosition(
        lastHorizontalDirection: string,
        lastVerticalDirection: string
    ) {
        if (!this.scene.scene.isActive()) {
            //error prevention
            return;
        }
        const worldPosition = this.scene.input.activePointer.positionToCamera(
            this.scene.cameras.main
        ) as Phaser.Math.Vector2;

        // Calculate angle from player to cursor
        const angleToPointer = Phaser.Math.Angle.BetweenPoints(
            this.player,
            worldPosition
        );

        // Convert angle to degrees for easier understanding
        const angleDegrees = Phaser.Math.RadToDeg(angleToPointer);

        // Rotate the gun towards the mouse cursor
        this.gunImage.rotation = angleToPointer;

        // Flip the gun vertically only when the player is facing left (angle between 90 and 270 degrees)
        // Note: We need to consider the full 360-degree range and account for negative angles
        const isFacingLeft =
            (angleDegrees >= 90 && angleDegrees <= 270) ||
            (angleDegrees >= -270 && angleDegrees <= -90);

        this.gunImage.setFlipY(isFacingLeft);

        if (lastVerticalDirection === "up") {
            // Make the gun partially transparent
            if (lastHorizontalDirection === "right" && isFacingLeft) {
                this.gunImage.alpha = 0.5;
            } else if (lastHorizontalDirection === "right" && !isFacingLeft) {
                this.gunImage.alpha = 1;
            }
            if (lastHorizontalDirection === "left" && !isFacingLeft) {
                this.gunImage.alpha = 0.5;
            } else if (lastHorizontalDirection === "left" && isFacingLeft) {
                this.gunImage.alpha = 1;
            }
            if (lastHorizontalDirection === "") {
                this.gunImage.alpha = 0.5;
            }
        } else {
            // Reset the gun's transparency
            this.gunImage.alpha = 1;
        }

        if (this.player.body) {
            const offsetX = this.player.body.width / 2;
            const offsetY = this.player.body.height / 2;
            let setX = this.player.body.x + offsetX;
            let setY = this.player.body.y + offsetY;
            const directionOffset = 5;
            const isFacingUp = worldPosition.y < setY; // Check if cursor is above the player
            if (
                lastHorizontalDirection === "left" &&
                lastVerticalDirection === "up"
            ) {
                if (isFacingLeft) {
                    setX = setX - directionOffset;
                }
                if (isFacingUp) {
                    setY = setY - directionOffset;
                }
            } else if (
                lastHorizontalDirection === "left" &&
                lastVerticalDirection === "down"
            ) {
                if (isFacingLeft) {
                    setX = setX - directionOffset;
                }
            }
            if (
                lastHorizontalDirection === "right" &&
                lastVerticalDirection === "up"
            ) {
                if (!isFacingLeft) {
                    setX = setX + directionOffset;
                }
                if (isFacingUp) {
                    setY = setY - directionOffset;
                }
            } else if (
                lastHorizontalDirection === "right" &&
                lastVerticalDirection === "down"
            ) {
                if (!isFacingLeft) {
                    setX = setX + directionOffset;
                }
            }
            if (
                lastHorizontalDirection === "left" &&
                lastVerticalDirection === ""
            ) {
                if (isFacingLeft) {
                    setX = setX - directionOffset;
                } else {
                    setX = setX + directionOffset;
                }
            } else if (
                lastHorizontalDirection === "right" &&
                lastVerticalDirection === ""
            ) {
                if (!isFacingLeft) {
                    setX = setX + directionOffset;
                } else {
                    setX = setX - directionOffset;
                }
            }
            if (
                lastVerticalDirection === "up" &&
                lastHorizontalDirection === ""
            ) {
                if (!isFacingUp) {
                    setY = setY + directionOffset;
                }
            } else if (
                lastVerticalDirection === "down" &&
                lastHorizontalDirection === ""
            ) {
                setY = setY + directionOffset;
            } else {
                setY = setY + directionOffset;
            }
            this.gunImage.setPosition(setX, setY);
        }
    }
}
