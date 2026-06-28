import { Scene } from 'phaser';
import { CardNameManager } from '../managers/CardNameManager';
import { loadDefaultSettings, loadSettings } from '../config/Config';
import { GameManager } from '../managers/GameManager';

export class Preloader extends Scene
{
    cardManager: CardNameManager;
    errorMessage: Phaser.GameObjects.Text;

    constructor()
    {
        super('Preloader');

    }

    isMobile()
    {
        const ua = navigator.userAgent;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    }

    enterFullscreen()
    {
        if (!this.scale.isFullscreen)
        {
            this.scale.startFullscreen();
        }
    }

    maintainFullscreen()
    {
        if (this.isMobile() && !this.scale.isFullscreen)
        {
            this.scale.startFullscreen();
        }
    }

    init()
    {
        // Add tap/click event listener to enter fullscreen mode
        this.input.on('pointerup', () =>
        {
            if (this.isMobile())
            {
                this.enterFullscreen();
            }
        });

        this.createProgressBar();
        this.createErrorMessage();

        // Add global error handling
        window.onerror = (message, source, lineno, colno, error) =>
        {
            this.displayErrorMessage(`Error: ${message} at ${source}:${lineno}:${colno}`);
            console.error('Global Error: ', error);
            return true; // Prevent the default browser error handling
        };

        this.sys.game.events.on('error', (error: Error) =>
        {
            this.displayErrorMessage(`Phaser Error: ${error.message}`);
            console.error('Phaser Error: ', error);
        });
    }

    createProgressBar()
    {
        // Create a simple progress bar
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Outline of the progress bar
        this.add.rectangle(centerX, centerY, 468, 32).setStrokeStyle(1, 0xffffff);

        // Progress bar itself
        const bar = this.add.rectangle(centerX - 230, centerY, 4, 28, 0xffffff).setOrigin(0, 0.5);

        // Update the progress bar based on the percentage of loading completed
        this.load.on('progress', (progress: number) =>
        {
            bar.width = 4 + (460 * progress);
        });
    }

    createErrorMessage()
    {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.errorMessage = this.add.text(centerX, centerY + 50, '', {
            fontFamily: 'Inter', fontSize: '32px', color: '#ff0000', align: 'center'
        }).setOrigin(0.5, 0.5);
    }

    displayErrorMessage(message: string)
    {
        if (this.errorMessage)
        {
            this.errorMessage.setText(message);
        } else
        {
            console.error('Error Message:', message);
        }
    }

    preload()
    {
        // All assets are self-contained under this game's /assets/ folder.
        // Both localhost and production deployments load from the same relative paths.
        this.load.setPath('assets');

        this.load.atlas('placeholders', 'cards/placeholders/placeholders.png', 'cards/placeholders/placeholders.json');
        this.load.image('prompt_close', 'prompts/icon-close.png');
        this.load.image('toggle-on', 'prompts/toggle-on.png');
        this.load.image('toggle-off', 'prompts/toggle-off.png');

        // Wood/green backgrounds are rendered by CSS on the <body> — no Phaser preload needed.

        // Toolbar buttons — desktop art
        this.load.image('btn-spider-1-card-off', 'menu/btn-spider-1-card-off.png');
        this.load.image('btn-spider-1-card-off-hover', 'menu/btn-spider-1-card-off-hover.png');
        this.load.image('btn-spider-1-card-on', 'menu/btn-spider-1-card-on.png');
        this.load.image('btn-spider-1-card-on-hover', 'menu/btn-spider-1-card-on-hover.png');
        this.load.image('btn-spider-2-card-off', 'menu/btn-spider-2-card-off.png');
        this.load.image('btn-spider-2-card-off-hover', 'menu/btn-spider-2-card-off-hover.png');
        this.load.image('btn-spider-2-card-on', 'menu/btn-spider-2-card-on.png');
        this.load.image('btn-spider-2-card-on-hover', 'menu/btn-spider-2-card-on-hover.png');
        this.load.image('btn-spider-4-card-off', 'menu/btn-spider-4-card-off.png');
        this.load.image('btn-spider-4-card-off-hover', 'menu/btn-spider-4-card-off-hover.png');
        this.load.image('btn-spider-4-card-on', 'menu/btn-spider-4-card-on.png');
        this.load.image('btn-spider-4-card-on-hover', 'menu/btn-spider-4-card-on-hover.png');
        this.load.image('btn-hint', 'menu/btn-hint.png');
        this.load.image('btn-hint-hover', 'menu/btn-hint-hover.png');
        this.load.image('btn-undo', 'menu/btn-undo.png');
        this.load.image('btn-undo-hover', 'menu/btn-undo-hover.png');
        this.load.image('icon-settings', 'menu/icon-settings.png');
        this.load.image('icon-settings-hover', 'menu/icon-settings-hover.png');
        this.load.image('icon-help', 'menu/icon-help.png');
        this.load.image('icon-help-hover', 'menu/icon-help-hover.png');
        this.load.image('icon-stats', 'menu/icon-stats.png');
        this.load.image('icon-stats-hover', 'menu/icon-stats-hover.png');
        this.load.image('icon-night', 'menu/icon-night.png');
        this.load.image('icon-night-hover', 'menu/icon-night-hover.png');

        // Toolbar buttons — mobile art (always loaded; UIScene builds both UIs unconditionally)
        this.load.image('mobile-spider-btn-1-card-off', 'menu/mobile-spider-btn-1-card-off.png');
        this.load.image('mobile-spider-btn-1-card-on', 'menu/mobile-spider-btn-1-card-on.png');
        this.load.image('mobile-spider-btn-2-card-off', 'menu/mobile-spider-btn-2-card-off.png');
        this.load.image('mobile-spider-btn-2-card-on', 'menu/mobile-spider-btn-2-card-on.png');
        this.load.image('mobile-spider-btn-4-card-off', 'menu/mobile-spider-btn-4-card-off.png');
        this.load.image('mobile-spider-btn-4-card-on', 'menu/mobile-spider-btn-4-card-on.png');
        this.load.image('mobile-btn-hint', 'menu/mobile-btn-hint.png');
        this.load.image('mobile-btn-undo', 'menu/mobile-btn-undo.png');



        // iPadOS 13+ defaults Safari/Chrome to a desktop ("Macintosh") user-agent, so Phaser's
        // UA-based device.os.iOS/iPad come back false and the iPad gets the desktop layout. A real
        // Mac has no touch; a "Mac" reporting touch points is actually an iPad — correct the flags
        // here (before anything reads them) so every iOS/iPad/!desktop layout branch fires.
        if (navigator.maxTouchPoints > 1 && /Macintosh|Mac OS X/.test(navigator.userAgent))
        {
            const os = this.game.device.os as any;
            os.iOS = true;
            os.iPad = true;
            os.desktop = false;
        }

        const isMobile = this.game.device.os.android || this.game.device.os.iOS;

        GameManager.isMobile = isMobile;

        // Card atlases (shared art with the German Klondike game)
        this.load.json('cardData', 'cards/desktop/newassets_desktop.json');
        if (isMobile)
        {
            this.load.multiatlas('cards', 'cards/mobile/newassets_mobile.json', 'assets/cards/mobile');
        } else
        {
            this.load.multiatlas('cards', 'cards/desktop/newassets_desktop.json', 'assets/cards/desktop');
        }

        this.load.audio('card_to_foundation', 'sounds/card-to-foundation.mp3');
        this.load.audio('cards_to_tableau', 'sounds/cards-to-tableau.mp3');
        this.load.audio('clear_sequence', 'sounds/clear-sequence.mp3');
        this.load.audio('hint', 'sounds/hint.mp3');
        this.load.audio('invalid', 'sounds/invalid.mp3');
        this.load.audio('no_hint', 'sounds/no-hint.mp3');
        this.load.audio('prompt', 'sounds/prompt.mp3');
        this.load.audio('silence', 'sounds/silence.mp3');
        this.load.audio('undo', 'sounds/undo.mp3');
        this.load.audio('valid', 'sounds/valid.mp3');
        this.load.audio('won', 'sounds/won.mp3');
    }

    create()
    {
        loadDefaultSettings(this.game.device.os.android || this.game.device.os.iOS)
        loadSettings()

        const cardData = this.cache.json.get('cardData');

        if (cardData && cardData.textures)
        {
            const frames = cardData.textures[0].frames;

            this.cardManager = CardNameManager.Instance;
            this.cardManager.loadCardData(frames);

            this.scene.start('GameplayScene');
        } else
        {
            this.displayErrorMessage('Error: Invalid card data.');
        }
    }

    resize()
    {
        this.createProgressBar();
    }
}

export default Preloader;
