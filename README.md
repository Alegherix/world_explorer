<img width="800" alt="Screenshot 2021-05-25 at 12 57 58" src="https://user-images.githubusercontent.com/70512255/119489741-4a880080-bd5c-11eb-8150-ec53c57f72fe.png">

# [World Explorer](https://worldexploration.netlify.app/)

In this exciting 3D platformer, you are in control of a sphere visiting three different planets with their own unique twist and turns!

Two planets are single-player only where you collect as many coins as possible, whilst racing against the clock. Challenge your friends and make it to the top of the leaderboard.
The third planet is online multiplayer where you can enjoy together with your friends and race to the finish line!

This game was created using:

- [three.js](https://threejs.org/)
- [cannon-es](https://github.com/pmndrs/cannon-es)
- [TypeScript](https://www.typescriptlang.org/)
- [Svelte](https://svelte.dev/)
- [Firebase](https://firebase.google.com/)
- [Socket.IO](https://socket.io/)

# Installation

1. Clone this repository through the terminal: `git clone https://github.com/Alegherix/world_explorer.git`.
2. Change your current directory to the repository: `cd world_explorer/`.
3. Type `yarn` or `npm install` to install all necessary dependencies.
4. Run `yarn dev` or `npm run dev` and wait for the application to finish building.
5. The link to your localhost should now be displayed. The default is: [http://localhost:3000](http://localhost:3000).

# Changelog

<details><summary>Toggle pull request list</summary>

- [#1 - Testing the pull request function.](https://github.com/Alegherix/world_explorer/pull/1)
- [#2 - Updated the first failed README.md](https://github.com/Alegherix/world_explorer/pull/2)
- [#3 - Added the initial configuration for our project.](https://github.com/Alegherix/world_explorer/pull/3)
- [#4 - Migrated application to TypeScript & Svelte.](https://github.com/Alegherix/world_explorer/pull/4)
- [#5 - Merge to TypeScript & Svelte.](https://github.com/Alegherix/world_explorer/pull/5)
- [#6 - Update to singletons.](https://github.com/Alegherix/world_explorer/pull/6)
- [#7 - Addition of a third person camera follwing our game character.](https://github.com/Alegherix/world_explorer/pull/7)
- [#8 - Getting controllers to work.](https://github.com/Alegherix/world_explorer/pull/8)
- [#9 - Added Sign-in screen and fixes to materials and meshes.](https://github.com/Alegherix/world_explorer/pull/9)
- [#10 - 'Choose your map'-screen and project structure changes.](https://github.com/Alegherix/world_explorer/pull/10)
- [#11 - Got abstract game classes working, allowing multiple maps with a shared interface.](https://github.com/Alegherix/world_explorer/pull/11)
- [#12 - The addition of a platform component to be reused in maps.](https://github.com/Alegherix/world_explorer/pull/12)
- [#13 - Update from cannon.js to cannon-es for easier debugging.](https://github.com/Alegherix/world_explorer/pull/13)
- [#14 - Update to controllers. Starting with networking and the first map 'Velknaz'.](https://github.com/Alegherix/world_explorer/pull/14)
- [#15 - Addition of the new map 'Morghol'. Update and fixes to components.](https://github.com/Alegherix/world_explorer/pull/15)
- [#16 - Working on the Socket Multiplayer Map 'Zetxaru', and the UI.](https://github.com/Alegherix/world_explorer/pull/16)
- [#17 - Update and fixes to the second map 'Morghol'. Added new textures.](https://github.com/Alegherix/world_explorer/pull/17)
- [#18 - Quality of life updates to UI, player, controllers.](https://github.com/Alegherix/world_explorer/pull/18)
- [#19 - Addition to restart/play functionality.](https://github.com/Alegherix/world_explorer/pull/19)
- [#20 - Finishing the Multiplayer Map 'Zetxaru.](https://github.com/Alegherix/world_explorer/pull/20)
- [#21 - Rework of 'Morghol' to fit new controllers. Bugfixes to texture loading and updates to 'Zetxaru'.](https://github.com/Alegherix/world_explorer/pull/21)
- [#22 - Addition of a Highscore. Fixed issue with textures always reloading when changing maps.](https://github.com/Alegherix/world_explorer/pull/22)
- [#23 - Highscore is finished and updates.](https://github.com/Alegherix/world_explorer/pull/23)
- [#24 - Added the remaning textures to the new texture loader. Small fixes to map and intructions added.](https://github.com/Alegherix/world_explorer/pull/24)
- [#25 - Bug fixes with menu and sprites.](https://github.com/Alegherix/world_explorer/pull/25)
- [#26 - Fixed an issue with disconnect being called on undefined client.](https://github.com/Alegherix/world_explorer/pull/26)
- [#27 - Removed debugger DatGUI and updated README.](https://github.com/Alegherix/world_explorer/pull/27)
</details>

<br>

# Code Review

1. `example.js:10-15` - Remember to think about X and this could be refactored using the amazing Y function.

# Creators

- [Martin Hansson](https://github.com/Alegherix)
- [Jakob Gustafsson](https://github.com/gusjak)

# Testers

Tested by the following people:

1. [Jonathan Larsson](https://github.com/Icarium2)
2. [Evelyn Fredin](https://github.com/evelynfredin)
3. [Hugo Sundberg](https://github.com/Hugocsundberg)
4. [Daniel Borgström](https://github.com/danielmedb)

Tested by the following muggles (non-coders):

1. Emil
2. Malte
3. Jessica
4. Fredrik
