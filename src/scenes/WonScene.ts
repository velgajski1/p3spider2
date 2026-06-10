import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { formatTime } from '../utils/Utils';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

export class WonScene extends BaseMenuScene
{
    private menuContainer!: Phaser.GameObjects.Container;
    // private modalBackground!: Phaser.GameObjects.Graphics;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private closeButton!: Phaser.GameObjects.Image;
    private newGameButton!: ButtonWithColorBackground;

    constructor(public score: number = 0, public timePlayed: number = 0, public timeBonus: number = 0, public totalScore: number = 0)
    {
        super('WonScene');
    }

    init(data: any)
    {
        // Access passed data
        this.score = data.score;
        this.timePlayed = data.timeplayed;
        this.timeBonus = data.timebonus;
        this.totalScore = data.totalscore;
    }

    create(): void
    {
        super.create()

        statsManager.updateStatsAfterGame(true, this.totalScore, this.timePlayed);

        // this.totalScore

        // this.createModalBackground();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTextElements();
        this.createNewGameButton();
        // this.createCloseButton();
        this.scaleMenuContainer();

        // Listen for resize events
        this.scale.on('resize', this.scaleMenuContainer, this);

        SOUND_ACTIVE && SoundManager.instance.won.play()


    }


    private createMenuContainer(): void
    {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void
    {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-200, -180, 400, 360, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTextElements(): void
    {
        // Title
        const title = this.add.text(-170, -154, translate(LanguageConfig.YouWon), {
            fontFamily: 'Open Sans',
            fontSize: '32px',
            color: '#000000',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0);

        // Each label and value pair will be added to the container separately
        const labels = [
            translate(LanguageConfig.Score),
            translate(LanguageConfig.TimePlayed),
            translate(LanguageConfig.TopScore),
            translate(LanguageConfig.BestTime)
        ];
        const values = [
            this.score, // Example value, replace with actual game data
            formatTime(this.timePlayed, "hh:mm:ss"), // Example value, replace with actual game data
            statsManager.topScore, // Example value, replace with actual game data
            statsManager._formatTime(statsManager.bestTime) // Example value, replace with actual game data
        ];

        const labelStyle = {
            fontFamily: 'Open Sans',
            fontSize: '24px',
            color: '#000000'
        };
        const valueStyle = {
            ...labelStyle,
            fontStyle: 'bold'
        };

        labels.forEach((label, index) =>
        {
            let deltaY = 44;
            const labelElement = this.add.text(-170, 1 - 100 + index * deltaY, label, labelStyle).setOrigin(0);
            const valueElement = this.add.text(-170 + this.measureTextWidth(label, labelStyle) + 4, 1 - 100 + index * deltaY, values[index].toString(), valueStyle).setOrigin(0);
            this.menuContainer.add([labelElement, valueElement]);
        });

        this.menuContainer.add(title);
    }

    // Helper function to measure the width of a given text and style
    private measureTextWidth(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number
    {
        const dummyText = this.add.text(0, 0, text, style);
        const width = dummyText.width;
        dummyText.destroy(); // We don't need to keep it after measuring
        return width;
    }


    private createNewGameButton(): void
    {
        this.newGameButton = new ButtonWithColorBackground(this, 0, 120, translate(LanguageConfig.NewGame), () =>
        {
            this.restartGame(true)
            // New game logic
        }, {
            color: 0x668b9e,
            textColor: '#ffffff',
            width: 338,
            height: 62,
            fontSize: '26px',
            fontStyle: "bold",
            parentContainer: this.menuContainer
        });
        this.menuContainer.add(this.newGameButton);
    }

    private createCloseButton(): void
    {
        this.closeButton = this.add.image(120, -100, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.closeButton.on('pointerdown', () =>
        {
            this.scene.stop('WonScene');
        });
        this.menuContainer.add(this.closeButton);
    }

    // private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
    //     const { width, height } = gameSize || this.scale;
    //     this.menuContainer.setPosition(width / 2, height / 2);

    //     const scaleX = width / 800; // Example base width
    //     const scaleY = height / 800; // Example base height
    //     const scale = Math.min(scaleX, scaleY);

    //     this.menuContainer.setScale(scale);
    //     this.modalBackground.clear().fillRect(0, 0, width, height);
    // }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void
    {
        // Use provided gameSize or current game size
        //
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);

        // Calculate scale based on a 1600x900 design, trying to fill as much as possible
        const scaleX = width / 600;
        const scaleY = height / 600;
        // Use the larger scale factor that maintains aspect ratio without exceeding screen dimensions
        const scale = Math.min(1, Math.max(scaleX, scaleY));

        // Check if scaling exceeds screen dimensions and adjust if necessary
        const effectiveWidth = 600 * scale;
        const effectiveHeight = 600 * scale;
        if (effectiveWidth > width || effectiveHeight > height)
        {
            // If the scaled size exceeds the screen size in either dimension, use the smaller scale factor
            this.menuContainer.setScale(Math.min(scaleX, scaleY));
        } else
        {
            // Otherwise, apply the calculated scale to maximize screen usage
            this.menuContainer.setScale(scale);
        }


    }
}
