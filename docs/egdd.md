# Bash the Dungeon

## Elevator Pitch

A top down shooter based on the game Enter the Gungeon, with built in learning of basic bash and git commands that progressively get harder as you get farther into the game. The enemies that you fight will also get progressively harder, with boss fights along the way. In order to successfully fight the enemies you will need to operate your weapon with various commands including running/compiling files, cd, ls, cat, echo, etc. Additionally interacting with the map/objects/items in the game must be done with commands similar to that of the weapon functionality. Ultimately the objective of the game is to escape the dungeon and learn some bash and git commands along the way.

## Influences (Brief)

-   Enter the Gungeon:
    -   Medium: Videogame
    -   Explanation: We are basing our gameplay and visuals on this game.

## Core Gameplay Mechanics (Brief)

-   Players can pause the game by opening a terminal that allows them to interact with the game through git and bash commands.
-   Players can use mv, cd and ls to teleport to different rooms and print the map of rooms respectfully
-   Players will gain weapons and abilities in the form of programs that will need to be compiled and run to shoot/use abilities.
-   Players can execute their compiled weapon/ability compilations and are able to use them for a specified number of times before needing to re-execute
-   Players must use special commands to defeat bosses in addition to fighting them with weapons/abilities
-   Players lose hearts upon taking damage from enemies / environment
-   Players gain hearts upon random floor drops, chests, shop, or boss battles
-   Players can use blanks to clear all the bullets on the screen to avoid taking damage

# Learning Aspects

## Learning Domains

Git and bash Commands.

## Target Audiences

Novice programmers that desire to learn bash and git commands.

## Target Contexts

Free time, Computer labs / special class periods

## Learning Objectives

-   Command recognition: After playing, players will be able to identify git and bash commands and describe what they do.
-   Git/Bash Efficiency: After playing, players will be able to input git/bash commands faster and with less errors than they would have prior to playing.

## Prerequisite Knowledge

Students should be able to understand the purpose of git and bash commands and how to open a command prompt.

## Assessment Measures

Given an objective to complete, students can execute bash commands to perform said objective
Given a time to complete an objective in bash, students can complete the objective in improved time

# What sets this project apart?

-   Our game will be engaging in the fact that entering commands directly correlates to performance in gameplay. This will create a sense of necessity to learn commands in order to beat the game.
-   The learning objective is a core mechanic of the game which will accelerate learning.
-   Our game will function smoothly as both a game, and learning tool. Students will be able to learn while also enjoying their experience

# Player Interaction Patterns and Modes

## Player Interaction Pattern

Our game is a single player game. They control a character with mouse and keyboard and can alter some elements of the game through entering bash commands.

## Player Modes

-   Single-player: You complete various floors and advance to new floors while slaying boss(es) until the Dungeon is Bashed or you die

# Gameplay Objectives

-   Clear rooms:
    -   Description: Players will clear the enemies from a room in the dungeon
    -   Alignment: Players will need to use bash commands to clear rooms and other commands will aid the player in room clearing.
-   Defeat bosses:
    -   Description: At the end of a floor, players will have to defeat a boss to continue to the next floor.
    -   Alignment: Players will need to use bash commands to defeat bosses and other commands will aid the player in defeating bosses.

# Procedures/Actions

The user will use 'w' 'a' 's' 'd' to move, space to roll, 'e' to interact with in-game items, tab to open the terminal, and mouse direction to aim.

# Rules

Health is a limited resource that upon running out will kill the player. Weapons will be scattered throughout the map that players can swap to. Item "power ups" will be scattered throughout the map that upon activation will give the player some kind of performance boost.

# Objects/Entities

There's a player with a set amount of health
There's enemies with set amounts of health, movement, and bullet patterns
There's NPCs with a set purpose and aid for the player
There's bosses with set amounts of health, kill conditions, and bullet patterns
There's a display bar which has the players health, number of blanks, weapons, and items they currently have
There's a command prompt which players can see lists of commands to execute

## Core Gameplay Mechanics (Detailed)

-   Inventory: the player will be able to access their inventory through a terminal system that is accessed by pressing "tab". The player can use commands like ls and cd to see what's in their inventory.
-   floors: The game is made of multiple floors that each have a number of rooms containing enemies or new weapons/items. At the end of each floor there is a boss that must be defeated to move on to the next floor.
-   Weapons: as the player progresses through the dungeon, they will have the opportunity to collect new weapons. Weapons can be viewed as a C programming file that shows the weapons stats. To use a weapon, the player has to compile and run it in the in-game terminal. Weapons have unlimited ammo, but must be re-run to reload.
-   Items: as the player progresses through the dungeon, they will have the opportunity to collect new items. Items can be viewed as a typescript file that shows what it does. To use an item, it has to be compiled and run. Items will have a cooldown.
-   bullet clearing: Twice per floor, the player can "cd" to a directory in their inventory and delete a folder that contains the enemy bullets on the screen, removing them from the screen.

## Feedback

-   Learning Objective: Visual counter to keep track of the number of commands the player has input.
-   Weapons: Audio cue whenever a weapon is fired, from both enemies and the player. Animation displays when new weapons are acquired.
-   Items: Animation displays when new items are acquired.
-   Background music: Music will be playing throughout the duration of the game.

-   Learning Objective: Upon completing the game players will be given a final count of the commands they've learned.
-   Enemies: Upon completing the game players will be given a final count of the enemies they've defeated.
-   Time: Upon completing the game players will be given the total time they spent, giving an incentive to go faster.

# Story and Gameplay

## Presentation of Rules

The player will be able to enter the tutorial room in the lobby of the game if they wish to.
This tutorial room will present the rules of the game in a risk free environment for practice.

## Presentation of Content

Again, the player will be able to enter the tutorial room in the lobby of the game if they wish to.
This tutorial room will present the content of the game in a risk free environment for practice.

## Story (Brief)

You are a programmer who ran the wrong command, and are now stuck in a simulated Dungeon within your computer. You now must clear the different folders (rooms) in your computer to reach the exit and Bash the Dungeon.

## Storyboarding

![A player opening a chest with a pet nearby](/assets/img/storyboard_chest.png "player opening a chest")

Player runs some command to open a chest, and receives a weapon or item file which can be collected by pressing 'e' and later compiled and executed (to be used)

![A player firing their weapon at an enemy, while one enemy shoots back](/assets/img/storyboard_combat.png "player shooting a weapon in combat")

Player fires their weapon after "compiling it" to reload, with the enemies also firing back, after getting hit the player will lose health.

![A player who has paused the game by pressing "tab" to enter a bash command into the in game terminal](/assets/img/storyboard_terminal.png "player typing a command")

Upon hitting tab the player will be able to input commands. The /help command will show a list of commands. The player screen will be tinted with the physics paused to maintain the flow of the game.
![A player talking to an NPC](/assets/img/storyboard_NPC.png "player talking to an NPC")

Player talking to an NPC, NPC is telling the player information and the dialogue bubbles are continued with the press of 'e'. This Github Cat NPC will allow players to unlock and learn git commands (which would be late game, if we have it at all). This will be similar to the tutorial in the lobby too.

![A player fighting a boss](/assets/img/storyboard_boss.png "player fighting a boss")

Player fighting a boss with their beam weapon. Players health is top left, bosses health is on the right side. There will also be a necessary 'kill condition' the player MUST complete in order for the boss to die, which may entail executing certain commands.

![A drawing of the floor layout with an explanation on how map exploration works](/assets/img/storyboard_floor_layout.png "A description of the floor layout and map")

# Assets Needed

## Aesthetics

The aesthetic of our game is pixel art dungeon: dark-colored and weathered bricks, bright colored characters that stand out from the rest of the game.

## Graphical

-   Characters List
-   Player model (possibility of adding a character select screen time permitting)
-   [Robot Player](https://www.spriters-resource.com/pc_computer/enterthegungeon/sheet/155565/)
-   Basic enemy (possibility of adding more variety of enemies based on boss completion time permitting)
-   [Chort, Demon Enemy Sprites](https://0x72.itch.io/dungeontileset-ii)
-   Enemy Attacks
-   [Fireball](https://msfrantz.itch.io/free-fire-ball-pixel-art)
-   Boss enemy (possibility of adding more bosses time permitting)
-   Tutorial NPC - a similar model to the player that will walk to them through the mechanics of the game
    [Tutorial NPC](https://pedrodis.itch.io/theforestcharacterpack2)
-   Git Cat NPC - a cat that will give the player more commands to input that will allow for saving progress. It will spawn after the first boss is defeated.
-   Textures:
    -   [Pixel Art Dungeon Tiles](https://mythic-nemesis.itch.io/pixel-dungeon-assets)
    -   ![A dungeon themed tileset](/assets/tiles/tilemap.png "A description of the floor layout and map")
-   Environment Art/Textures:
    -   Opening screen: a basic start screen with the title and a stone brick background
    -   [DYA Games Dungeon Background](https://www.instagram.com/p/BhUirX5h-K7/)
    -   Tutorial room: a well lit room mimicking the entrance to a dungeon with a single npc that teaches the player the controls
    -   Basic floor: a dungeon-like room made from stone/brick with dim lighting containing enemies
    -   Boss floor: a large room with a boss, excessive flames and other threatening looking items (bones, broken weapons, defeated enemies, etc.) scattered around

## Audio

-   Music List (Ambient sound)

    -   menu music: chill relaxing music
    -   standard floor music: not relaxing, but not really stress inducing.
    -   boss music: faster tempo, more stressful [KENTENSHI - paranoia](https://www.youtube.com/watch?v=VgrnEVnZ4xU)

-   Sound List (SFX)
    -   Weapon SFX: sound of gun shooting
    -   Bullet Clearing SFX: sound of blank being used (to clear bullets)
    -   NPC talking: npc gibberish sounds.
    -   Boss: Special boss sfx for different attacks, or kill conditions.
    -   Boss/Enemy death SFX: death sounds to confirm player has eliminated said enemy/boss

# Metadata

-   Template created by Austin Cory Bart <acbart@udel.edu>, Mark Sheriff, Alec Markarian, and Benjamin Stanley.
-   Version 0.0.3
