import { BackgroundScene } from './scenes/BackgroundScene';
import { Boot } from './scenes/Boot';
import { GameplayScene } from './scenes/GameplayScene';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { UIScene } from './scenes/UIScene';
import { Settings } from './scenes/Settings';
import { Statistics } from './scenes/Statistics';
import { WonScene } from './scenes/WonScene';
import InversePipelinePlugin from 'phaser3-rex-plugins/plugins/inversepipeline-plugin.js';
import { loadSettings } from './config/Config';
import { SystemNoticeScene } from './scenes/SystemNoticeScene';

//  Find out more information about the Game Config at:dd
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#3b3b3b',
    roundPixels: true,
    input: {
        mouse: {
            preventDefaultWheel: false // Allows default scroll behavior in the browser
        }
    },
    // plugins: {
    //     global: [{
    //         key: 'rexInversePipeline',
    //         plugin: InversePipelinePlugin,
    //         start: true
    //     },
    //     // ...
    //     ]
    // },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        BackgroundScene,
        Preloader,
        MainMenu,
        Settings,
        Statistics,
        GameplayScene,
        UIScene,
        WonScene,
        SystemNoticeScene,
        GameOver
    ]
};




export default new Game(config);
