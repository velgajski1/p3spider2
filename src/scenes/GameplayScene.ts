import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import Registry from '../config/Registry';
import { TABLEU_COORDS_DELTA, STOCK_COORDS, getCardScale, STOCK_FOUNDATION_SCALE } from '../config/Consts';
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
    private visibilityHandler?: () => void;

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
        // Returning to the app (tab switch, background -> foreground, bfcache restore) can leave
        // iPad Chrome scrolled with the HTML top bar pushed off-screen and the game shifted up —
        // run the same refresh/relayout path (which re-pins the scroll) when we become visible.
        this.visibilityHandler = () =>
        {
            if (document.visibilityState === 'visible') this.orientationRecoveryHandler?.();
        };
        window.addEventListener('orientationchange', this.orientationRecoveryHandler);
        window.addEventListener('resize', this.orientationRecoveryHandler);
        document.addEventListener('fullscreenchange', this.orientationRecoveryHandler);
        // Visual Viewport reports post-settle dimensions reliably on mobile browsers.
        window.visualViewport?.addEventListener('resize', this.orientationRecoveryHandler);
        window.addEventListener('pageshow', this.orientationRecoveryHandler);
        window.addEventListener('focus', this.orientationRecoveryHandler);
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    private teardownOrientationRecovery(): void
    {
        if (this.orientationRecoveryHandler)
        {
            window.removeEventListener('orientationchange', this.orientationRecoveryHandler);
            window.removeEventListener('resize', this.orientationRecoveryHandler);
            document.removeEventListener('fullscreenchange', this.orientationRecoveryHandler);
            window.visualViewport?.removeEventListener('resize', this.orientationRecoveryHandler);
            window.removeEventListener('pageshow', this.orientationRecoveryHandler);
            window.removeEventListener('focus', this.orientationRecoveryHandler);
            this.orientationRecoveryHandler = undefined;
        }
        if (this.visibilityHandler)
        {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = undefined;
        }
        this.orientationRecoveryTimers.forEach(t => clearTimeout(t));
        this.orientationRecoveryTimers = [];
    }

    private refreshScaleAndResize(): void
    {
        // iPad Chrome can return from the background with the page scrolled down, pushing the
        // absolute HTML top bar off-screen and shifting the game up. Re-pin to the top first.
        // The game never scrolls itself, and embedded it runs in an iframe, so this can't fight
        // host-page scrolling (e.g. the help anchor).
        if (this.game.device.os.iOS) window.scrollTo(0, 0);
        this.scale.refresh();
        this.doResize(this.scale.gameSize as Phaser.Structs.Size);
    }

    private resize(gameSize: Phaser.Structs.Size): void
    {
        this.doResize(gameSize);
        // Re-run after the viewport settles, reading the LATEST size from this.scale each time
        // (not the stale gameSize from the initial event). Samsung S26 reports the rotation's
        // intermediate dimensions first and settles a frame later; reusing that first gameSize
        // locked in the wrong dims and displaced the layout (S23/tablets report correct dims up
        // front, so they were unaffected). Matches the German Klondike build.
        setTimeout(() =>
        {
            this.doResize(this.scale.gameSize as Phaser.Structs.Size);
        }, 10);
        setTimeout(() =>
        {
            this.doResize(this.scale.gameSize as Phaser.Structs.Size);
        }, 90);
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
            // NOTE: do NOT call this.scale.stopFullscreen() here. It only fired in mobile
            // fullscreen + portrait, so every rotate-to-portrait exited fullscreen, and rotating
            // repeatedly toggled fullscreen on/off mid-rotation — on the S26 that left the canvas
            // mis-measured and pushed both scenes off-screen with no recovery. Klondike omits it.
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
            // iPad landscape: scale the board so the 10-pile tableau fills ~82% of screen width
            // (leaving room for the edge-pinned button columns), capped by height as a safety so
            // cards never get absurd on very short windows. The post-resize fixTableuYDeltaAll()
            // re-folds columns for the new scale, so tall columns still fit vertically.
            const CARD_AREA_FRAC = 0.82;   // cards span ~9%..91% of width
            const TABLEAU_LOCAL_W = 1055;  // tableau visual local width (10 piles, 106 stride, 100.8px card)
            const sWidth = CARD_AREA_FRAC * width / TABLEAU_LOCAL_W;
            const sHeight = 0.25 * height / (253 * 0.56); // card height <= ~25% of screen height
            const S = Math.min(sWidth, sHeight);
            this.gameplayContainer.setScale(S);
            this.gameplayContainer.setPosition(width / 2, 2.2 * top);

            // Publish the on-screen Y of the top edge of the stock/foundation card row so the UIScene
            // can align the side button columns' tops with it. Cards sit at local y=STOCK_COORDS.y,
            // sprite-scaled by getCardScale()*STOCK_FOUNDATION_SCALE, centered origin.
            const stockTopLocal = STOCK_COORDS.y - (253 * getCardScale() * STOCK_FOUNDATION_SCALE) / 2;
            this.registry.set('ipadStockTopY', 2.2 * top + stockTopLocal * S);
        }

        // Mobile phone landscape: the board anchored at a fixed small top, and since the top row of
        // cards is centered on its anchor (so it overhangs upward), it slid under the HTML top bar.
        // Seat the anchor just below the live bar height so the board is always clear of the bar.
        if (GameManager.isMobile && !this.isTablet() && this.scale.isGameLandscape)
        {
            const barH = (document.querySelector('.top-bar') as HTMLElement | null)?.offsetHeight ?? 44;
            this.gameplayContainer.setPosition(width / 2, barH + 15);
        }

        // Mobile portrait: the board was anchored at uiBottomPx and sat too low. Pull it up to just
        // below the live bar height so it hugs the top bar instead of floating low down the screen.
        if (GameManager.isMobile && (this.scale.isPortrait || window.innerHeight > window.innerWidth))
        {
            const barH = (document.querySelector('.top-bar') as HTMLElement | null)?.offsetHeight ?? 36;
            this.gameplayContainer.setPosition(width / 2, barH + 20);
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
