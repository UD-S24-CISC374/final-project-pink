import Phaser from "phaser";
import { createChortAnims } from "../anims/createChortAnims";
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.load.image("bullet_blue", "assets/bullet_blue.png");
        this.load.image("ui-heart-full", "assets/ui_heart_full.png");
        this.load.image("ui-heart-empty", "assets/ui_heart_empty.png");
        this.load.spritesheet("robot_idle", "assets/sprites/robot_idle.png", {
            //all robot sprites from the game Enter the Gungeon. Accessed from https://www.spriters-resource.com/pc_computer/enterthegungeon/sheet/155565/
            frameWidth: 18,
            frameHeight: 22,
        });
        this.load.spritesheet(
            "robot_walk_DR",
            "assets/sprites/robot_walk_down_right.png",
            {
                //also use this for straight right
                frameWidth: 18,
                frameHeight: 22,
            }
        );
        this.load.spritesheet(
            "robot_walk_DL",
            "assets/sprites/robot_walk_down_left.png",
            {
                //also use this for straight left
                frameWidth: 18,
                frameHeight: 22,
            }
        );
        this.load.spritesheet(
            "robot_walk_D",
            "assets/sprites/robot_walk_down.png",
            {
                frameWidth: 18,
                frameHeight: 22,
            }
        );
        this.load.spritesheet(
            "robot_walk_UR",
            "assets/sprites/robot_walk_up_right.png",
            {
                frameWidth: 18,
                frameHeight: 22,
            }
        );
        this.load.spritesheet(
            "robot_walk_UL",
            "assets/sprites/robot_walk_up_left.png",
            {
                frameWidth: 18,
                frameHeight: 22,
            }
        );
        this.load.spritesheet(
            "robot_walk_U",
            "assets/sprites/robot_walk_up.png",
            { frameWidth: 18, frameHeight: 22 }
        );

        this.load.spritesheet(
            "robot_roll_DR",
            "assets/sprites/robot_roll_down_right.png",
            {
                //also use this for straight right
                frameWidth: 20,
                frameHeight: 26,
            }
        );
        this.load.spritesheet(
            "robot_roll_DL",
            "assets/sprites/robot_roll_down_left.png",
            {
                //also use this for straight left
                frameWidth: 20,
                frameHeight: 26,
            }
        );
        this.load.spritesheet(
            "robot_walk_D",
            "assets/sprites/robot_roll_down.png",
            {
                frameWidth: 18,
                frameHeight: 26,
            }
        );
        this.load.spritesheet(
            "robot_roll_UR",
            "assets/sprites/robot_roll_up_right.png",
            {
                frameWidth: 20,
                frameHeight: 26,
            }
        );
        this.load.spritesheet(
            "robot_roll_UL",
            "assets/sprites/robot_roll_up_left.png",
            {
                frameWidth: 20,
                frameHeight: 26,
            }
        );
        this.load.spritesheet(
            "robot_roll_U",
            "assets/sprites/robot_roll_up.png",
            {
                frameWidth: 18,
                frameHeight: 26,
            }
        );

        this.load.spritesheet("demon_idle", "assets/sprites/demon_idle.png", {
            frameWidth: 32,
            frameHeight: 36,
        });
        this.load.spritesheet(
            "demon_walk_R",
            "assets/sprites/demon_walk_right.png",
            {
                frameWidth: 32,
                frameHeight: 36,
            }
        );
        this.load.spritesheet(
            "demon_walk_L",
            "assets/sprites/demon_walk_left.png",
            {
                frameWidth: 32,
                frameHeight: 36,
            }
        );
        this.load.spritesheet("chort_idle", "assets/sprites/chort_idle.png", {
            frameWidth: 16,
            frameHeight: 23,
        });
        this.load.spritesheet(
            "chort_walk_R",
            "assets/sprites/chort_walk_right.png",
            {
                frameWidth: 16,
                frameHeight: 23,
            }
        );
        this.load.spritesheet(
            "chort_walk_L",
            "assets/sprites/chort_walk_left.png",
            {
                frameWidth: 16,
                frameHeight: 23,
            }
        );
        this.load.image("tiles", "assets/tiles/tilemap.png");
        this.load.tilemapTiledJSON(
            "lobby",
            "assets/tilemaps/lobby_room_new.json"
        );
        this.load.tilemapTiledJSON("room01", "assets/tilemaps/room01.json");
        this.load.image("console", "assets/consoleTemp.png");
    }

    create() {
        createChortAnims(this.anims);
        this.scene.start("TitleScene");
    }
}
