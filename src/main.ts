import { Boot } from './scenes/Boot';
import { GameplayScene } from './scenes/GameplayScene';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";
import { UIScene } from './scenes/UIScene';
import { Settings } from './scenes/Settings';
import { Statistics } from './scenes/Statistics';
import { WonScene } from './scenes/WonScene';
import { NewGameConfirmScene } from './scenes/NewGameConfirmScene';
import { SystemNoticeScene } from './scenes/SystemNoticeScene';

declare global {
    interface Window {
        __spiderGame?: Game;
    }
}

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    transparent: true, // canvas is transparent so the CSS body background can show through when needed
    roundPixels: true,
    input: {
        mouse: {
            preventDefaultWheel: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'app'
    },
    scene: [
        Boot,
        Preloader,
        Settings,
        Statistics,
        GameplayScene,
        UIScene,
        WonScene,
        NewGameConfirmScene,
        SystemNoticeScene
    ]
};

window.__spiderGame?.destroy(true);
window.__spiderGame = new Game(config);

export default window.__spiderGame;
