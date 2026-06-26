import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import { TABLEU_COORDS_DELTA } from '../config/Consts';
import BaseScene from './BaseScene';
import { SoundManager } from '../managers/SoundManager';
import { TimerManager } from '../managers/TimerManager';

export class GameplayScene extends BaseScene
{
    private gameplayContainer!: Phaser.GameObjects.Container;
    gameManager: GameManager;
    soundManager: SoundManager;
    private orientationRecoveryTimers: ReturnType<typeof setTimeout>[] = [];
    private orientationRecoveryHandler?: () => void;

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

        this.wireOrientationRecovery();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardownOrientationRecovery, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.teardownOrientationRecovery, this);
    }

    private wireOrientationRecovery(): void
    {
        // Mobile browsers can stabilize at intermediate viewport dimensions during
        // rotation. Android Chrome also refuses fullscreen until the next user gesture,
        // so the eventual fullscreenchange needs the same refresh/relayout path.
        this.orientationRecoveryHandler = () =>
        {
            // Cancel any pending relayouts from a previous rotation so we don't pile up.
            this.orientationRecoveryTimers.forEach(t => clearTimeout(t));
            this.orientationRecoveryTimers = [];
            [0, 100].forEach(ms =>
            {
                this.orientationRecoveryTimers.push(
                    setTimeout(() => this.refreshScaleAndResize(), ms)
                );
            });
        };
        window.addEventListener('orientationchange', this.orientationRecoveryHandler);
        window.addEventListener('resize', this.orientationRecoveryHandler);
        document.addEventListener('fullscreenchange', this.orientationRecoveryHandler);
        // Visual Viewport reports post-settle dimensions reliably on mobile browsers.
        window.visualViewport?.addEventListener('resize', this.orientationRecoveryHandler);
    }

    private teardownOrientationRecovery(): void
    {
        if (this.orientationRecoveryHandler)
        {
            window.removeEventListener('orientationchange', this.orientationRecoveryHandler);
            window.removeEventListener('resize', this.orientationRecoveryHandler);
            document.removeEventListener('fullscreenchange', this.orientationRecoveryHandler);
            window.visualViewport?.removeEventListener('resize', this.orientationRecoveryHandler);
            this.orientationRecoveryHandler = undefined;
        }
        this.orientationRecoveryTimers.forEach(t => clearTimeout(t));
        this.orientationRecoveryTimers = [];
    }

    private refreshScaleAndResize(): void
    {
        this.scale.refresh();
        this.doResize(this.scale.gameSize as Phaser.Structs.Size);
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

            // Raise the board to use the free space at the top (match the Klondike layout height).
            top -= 45;
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
