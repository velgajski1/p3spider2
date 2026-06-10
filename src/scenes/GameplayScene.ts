import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import Card from '../elements/Card';
import { CardNameManager, Rank, Suit } from '../managers/CardNameManager';
import { PileType, TABLEU_COORDS_DELTA } from '../config/Consts';
import BaseScene from './BaseScene';
import { SoundManager } from '../managers/SoundManager';
import { getBGINDEX, loadDefaultSettings, loadSettings } from '../config/Config';
import { TimerManager } from '../managers/TimerManager';
import { SuitSelectionControl } from '../ui/SuitSelectionControl';

export class GameplayScene extends BaseScene
{
    private gameplayContainer!: Phaser.GameObjects.Container;
    gameManager: GameManager;
    soundManager: SoundManager;

    constructor()
    {
        super('GameplayScene');



    }



    create(): void
    {
        super.create()
        this.gameplayContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);


        // Initialize the GameManager with this scene and the UIScene
        this.gameManager = GameManager.getInstance(this, this.gameplayContainer);
        this.registry.set('gameManager', this.gameManager);

        TimerManager.initialize(this);

        // Start the game
        this.gameManager.startGame();

        // Listen for resize events to dynamically adjust the container
        this.scale.on('resize', this.resize, this);


        this.scene.launch("UIScene");
        this.scene.bringToTop("UIScene");


        this.game.canvas.addEventListener('contextmenu', function (event)
        {
            event.preventDefault();
        })

        // Listen for the custom event
        this.events.once('restartScene', this.restartScene, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);


        SoundManager.init(this);
        SoundManager.instance.silence.play()
        // SoundManager.instance.test.play()


    }

    private resize(gameSize: Phaser.Structs.Size): void
    {
        this.doResize(gameSize);
        setTimeout(() =>
        {
            this.doResize(gameSize);
        }, 10);
        setTimeout(() =>
        {
            this.doResize(gameSize);
        }, 100);
        setTimeout(() =>
        {
            this.doResize(gameSize);
        }, 1000);

    }

    private isFirefox()
    {
        return navigator.userAgent.toLowerCase().includes("firefox");
    }

    private doResize(gameSize: Phaser.Structs.Size): void
    {
        const { width, height } = gameSize;
        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI == undefined) topUI = 0.04;
        let scale = Math.min(width / 1200, height / 900) * 1.125;
        // let scale = Math.min(width / 1200, height / 900);
        this.gameplayContainer.setScale(scale);
        let top = this.registry.get("uiBottomPx")




        if ((this.scale.isFullscreen || this.game.device.os.iOS) && this.isLandscape())
        {
            top = 20;
            let delta = Math.max(0, 2 - this.scale.gameSize.aspectRatio)


            scale *= (1 + 0.2 - delta);
            this.gameplayContainer.setScale(scale);
            // this.scene.launch("UIScene");
            this.registry.set("isFullscreen", true);
        } else
        {
            this.registry.set("isFullscreen", false);

            if (this.scale.isFullscreen)
            {
                this.scale.stopFullscreen()
            }
        }

        if (this.game.device.os.desktop)
        {
            //
            let extraY = (900 - height) / 1300 * 50 + 3;

            top += extraY;


        }


        this.gameplayContainer.setPosition(width / 2, top);
        if (this.scale.isPortrait || window.innerHeight > window.innerWidth)
        {
            this.gameplayContainer.setPosition(0.50 * width, this.registry.get("uiBottomPx"));



        }
        if (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape && !this.registry.get("isFullscreen"))
        {
            this.gameplayContainer.setPosition(width / 2, top * 0.7);
        }
        if (this.scale.isGameLandscape && this.game.device.os.iOS && this.isTablet())
        {

            this.gameplayContainer.setScale(scale * 1.3);
            if (this.isFirefox())
            {
                this.gameplayContainer.setScale(scale * 1.2);
            }
            this.gameplayContainer.setPosition(width / 2, 2.2 * top);
        }

        const adjustedStartX = (width / 2) + -554 * scale;
        Registry.uiTextStartX = adjustedStartX
        // Registry.uiElemStartX = adjustedStartX + 1500
        Registry.uiElemStartX = width / 2 + 552 * scale;

        setTimeout(() =>
        {

            this.gameManager.pileManager.tableuPilesYDelta = Array.from({ length: 10 }, () => TABLEU_COORDS_DELTA.y)
            this.gameManager.pileManager.fixTableuYDeltaAll()

            this.gameManager.layoutManager.update()
            this.gameManager.layoutManager.layoutTableauPiles(this.gameManager.pileManager.getTableauPiles())
            this.gameManager.layoutManager.updateTabIndicators()
        }, 300);


    }


    private restartScene(): void
    {
        // Stop the UIScene if it needs to be stopped
        this.scene.stop("UIScene");
        this.scene.stop("GameplayScene");

        // Restart the GameplayScene
        this.scene.restart();
    }

}
