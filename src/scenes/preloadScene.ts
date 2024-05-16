import Phaser from "phaser";
import { createChortAnims } from "../anims/createChortAnims";
import { createDemonAnims } from "../anims/createDemonAnims";
import { createNpcAnims } from "../anims/createNpcAnims";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.load.audio("lobby_music", "assets/sound/lobby_music.mp3");
        this.load.audio("room_music", "assets/sound/room_music.mp3");
        this.load.audio("boss_music", "assets/sound/boss_music.mp3");
        this.load.audio("smg_sound", "assets/sound/pistol.mp3");
        this.load.audio("pistol_sound", "assets/sound/smg.mp3");
        this.load.audio("sniper_sound", "assets/sound/sniper.mp3");
        this.load.audio("reload_sound", "assets/sound/reload_sound.mp3");
        this.load.audio("enemy_death_sound", "assets/sound/enemy_death.mp3");
        this.load.audio("enemy_hit_sound", "assets/sound/enemy_hit.wav");
        this.load.audio("player_death_sound", "assets/sound/death.mp3");
        this.load.audio("player_hit_sound", "assets/sound/player_hit.wav");
        this.load.audio("npc_talking_sound", "assets/sound/npc_talking.mp3");
        this.load.audio("fireball_sound", "assets/sound/fireball.mp3");
        this.load.audio("walking_sound", "assets/sound/walking.mp3"); //still not added
        this.load.audio("roll_sound", "assets/sound/roll.wav");
        this.load.audio("chest_open_sound", "assets/sound/chest_open.mp3");
        this.load.audio("button_sound", "assets/sound/click_button.mp3");
        this.load.image("advance_button", "assets/advance_button.png");
        this.load.image("message_border", "assets/message_border.png");
        this.load.image("bullet_blue", "assets/bullets/bullet_blue.png");
        this.load.image("bullet_white", "assets/bullets/bullet_white.png");
        this.load.image(
            "bullet_blue_small",
            "assets/bullets/bullet_blue_small.png"
        );
        this.load.image("gun_default", "assets/weapons/gun_default.png");
        this.load.image(
            "gun_default_big",
            "assets/weapons/gun_default_big.png"
        );
        this.load.image("gun_sniper", "assets/weapons/gun_sniper.png");

        this.load.image("ui-heart-full", "assets/ui_heart_full.png");
        this.load.image("ui-heart-empty", "assets/ui_heart_empty.png");
        this.load.spritesheet("lobby_npc", "assets/sprites/lobby_npc.png", {
            frameWidth: 28,
            frameHeight: 49,
        });
        this.load.spritesheet("game_npc", "assets/sprites/game_npc.png", {
            frameWidth: 37,
            frameHeight: 32,
        });
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
            "robot_roll_D",
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
        this.load.spritesheet(
            "fireball_idle",
            "assets/attacks/fireball_idle.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );
        this.load.spritesheet(
            "fireball_shoot",
            "assets/attacks/fireball_shoot.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );
        this.load.spritesheet(
            "fireball_spawn",
            "assets/attacks/fireball_spawn.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );
        this.load.spritesheet(
            "fireball_target",
            "assets/attacks/fireball_target.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );
        this.load.spritesheet(
            "fireball_explode",
            "assets/attacks/fireball_explode.png",
            {
                frameWidth: 64,
                frameHeight: 64,
            }
        );
        this.load.spritesheet("wood_chest", "assets/chests/chest_1_wide.png", {
            frameWidth: 32,
            frameHeight: 24,
        });

        this.load.image("tiles", "assets/tiles/tilemap.png");
        this.load.tilemapTiledJSON(
            "lobby",
            "assets/tilemaps/lobby_room_new.json"
        );
        this.load.tilemapTiledJSON("room01", "assets/tilemaps/room01.json");
        this.load.tilemapTiledJSON("room02", "assets/tilemaps/room02.json");
        this.load.tilemapTiledJSON("room03", "assets/tilemaps/room03.json");
        this.load.tilemapTiledJSON("room04", "assets/tilemaps/room04.json");
        this.load.tilemapTiledJSON("bossRoom", "assets/tilemaps/bossRoom.json");
        this.load.image("console", "assets/consoleTemp.png");
        this.load.image("eToInteractBubble", "assets/bubble_etointeract.png");
        this.load.image("talkingBubble", "assets/bubble_talking.png");
        this.load.image("help_button", "assets/helpButton.png");
    }

    create() {
        createChortAnims(this.anims);
        createDemonAnims(this.anims);
        createNpcAnims(this.anims);
        this.scene.start("TitleScene");
    }
}
