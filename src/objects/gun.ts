import Phaser from "phaser";
import { Bullet } from "./bullet";
import { gameState } from "./gameState";
import { sceneEvents } from "../util/eventCenter";

export class Gun {
    public scene: Phaser.Scene;
    private gameState: gameState;
    private player: Phaser.Physics.Arcade.Sprite;
    private bullets: Phaser.Physics.Arcade.Group;
    public texture: string;
    public bulletTexture: string;
    private bulletSpeed: number;
    public bulletDamage: number;
    public shotsPerRound: number;
    public shotsFired: number = 0;
    private millisecondsBetweenShots: number;
    private timeoutIds: globalThis.NodeJS.Timeout[] = []; // Initialize list to store timeout IDs

    public gunImage: Phaser.GameObjects.Image;
    public shootingInProgress: boolean = false; //to stop shooting when ammo clip is used
    public isSingleShot: boolean = false;
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
        millisecondsBetweenShots: number,
        isSingleShot: boolean
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
        this.shotsFired = 0;
        this.millisecondsBetweenShots = millisecondsBetweenShots;
        this.isSingleShot = isSingleShot;
    }
    public setPlayer(player: Phaser.Physics.Arcade.Sprite) {
        this.player = player;
    }
    public setBullets(bullets: Phaser.Physics.Arcade.Group) {
        this.bullets = bullets;
    }

    public reload() {
        //Jacob call this for the reload command, would be this.gameState.player.currentGun.reload() to do it
        this.isReloaded = true;
        this.shotsFired = 0;
        if (this.gameState.player.currentGun) {
            sceneEvents.emit("bullets-changed", {
                numBullets: this.shotsPerRound - this.shotsFired,
                bulletTexture: this.bulletTexture,
            });
        }
    }

    public addToScene() {
        this.scene;
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
        // Call either shootBullets or shootSingle based on the isSingleShot property
        if (this.isSingleShot) {
            this.shootSingle();
        } else {
            this.shootBullets();
        }
    }
    // Method to handle shooting single bullets
    public shootSingle() {
        // Ensure the gun is reloaded and shooting is not in progress
        if (this.gameState.isDodging) {
            return;
        }
        if (this.isReloaded) {
            // Check if there are still available shots in the round
            if (this.shotsFired < this.shotsPerRound) {
                const worldPosition =
                    this.scene.input.activePointer.positionToCamera(
                        this.scene.cameras.main
                    ) as Phaser.Math.Vector2;

                // Get a new bullet
                let bullet = this.bullets.get(
                    this.gunImage.x,
                    this.gunImage.y,
                    this.bulletTexture
                ) as Bullet;
                bullet.setBulletSpeed(this.bulletSpeed);

                // Fire the bullet towards the target
                bullet.fire(worldPosition.x, worldPosition.y);

                // Increment the number of shots fired
                this.shotsFired++;
                if (this.gameState.player.currentGun) {
                    sceneEvents.emit("bullets-changed", {
                        numBullets: this.shotsPerRound - this.shotsFired,
                        bulletTexture: this.bulletTexture,
                    });
                }

                // Check if this is the last shot in the round
                if (this.shotsFired >= this.shotsPerRound) {
                    // Update reloading status after the last shot
                    this.isReloaded = false;
                    //this.reload(); //gives infinite reloads for now
                }
            } else {
                // Prevent shooting if the round is empty
                this.isReloaded = false;
            }
        }
    }

    private shootBullets() {
        if (this != this.gameState.player.currentGun) {
            return;
        }
        if (this.shootingInProgress) {
            return;
        }
        this.shootingInProgress = true;

        let x = 0; // Initialize x outside the loop

        for (let i = this.shotsFired; i < this.shotsPerRound; i++) {
            // Calculate the delay for this shot
            let delay = x * this.millisecondsBetweenShots;

            // Use setTimeout to delay each shot
            const timeoutId = setTimeout(() => {
                if (this.scene.scene.isActive()) {
                    if (this.isReloaded) {
                        if (this.gameState.isDodging) {
                            delay += 660;
                        }
                        if (
                            this != this.gameState.player.currentGun ||
                            this.scene != this.gameState.player.currentGun.scene
                        ) {
                            this.clearTimeouts();
                            this.shootingInProgress = false;
                            this.isReloaded = true;
                            return;
                        }
                        // only fires bullets if gun is reloaded, also used to stop shooting when switching guns
                        // Ensure no errors if player is shooting while switching scenes
                        if (!this.gameState.player.currentGun.isSingleShot) {
                            const worldPosition =
                                this.scene.input.activePointer.positionToCamera(
                                    this.scene.cameras.main
                                ) as Phaser.Math.Vector2;

                            // Get new bullet
                            let bullet = this.bullets.get(
                                this.gunImage.x,
                                this.gunImage.y,
                                this.bulletTexture
                            ) as Bullet;
                            bullet.setBulletSpeed(this.bulletSpeed);

                            // Fire the bullet towards the target
                            bullet.fire(worldPosition.x, worldPosition.y);

                            this.shotsFired++;
                            sceneEvents.emit("bullets-changed", {
                                numBullets:
                                    this.shotsPerRound - this.shotsFired,
                                bulletTexture: this.bulletTexture,
                            });

                            if (this.shotsFired >= this.shotsPerRound) {
                                this.shootingInProgress = false;
                                this.isReloaded = false;
                                //this.reload(); //remove later gives infinite reloads
                            }
                        } else {
                            this.shootingInProgress = false;
                            this.isReloaded = true;
                            return;
                        }
                    } else {
                        this.shootingInProgress = false;
                        this.isReloaded = false;

                        return;
                    }
                } else {
                    this.shootingInProgress = false;
                    this.isReloaded = false;
                    return;
                }
            }, delay);
            this.timeoutIds.push(timeoutId);
            x++; // Increment x inside the loop
        }
    }
    public clearTimeouts() {
        // Iterate through the list of timeout IDs and clear each timeout
        this.timeoutIds.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });

        // Clear the list of timeout IDs
        this.timeoutIds = [];

        // Reset any relevant variables or flags
        this.shootingInProgress = false;
        this.isReloaded = true;
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
