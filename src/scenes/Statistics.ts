import Phaser from 'phaser';
import Button, { ButtonWithColorBackground } from '../ui/ButtonWithColorBackground';
import { STAT_LABELS } from '../config/Consts';
import { Language, translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { SUIT_MODE } from '../config/Config';


export class Statistics extends BaseMenuScene
{
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private titleTxt!: Phaser.GameObjects.Text;
    private closeButton: Button;
    private resetButton: Button;
    prompt_close: Phaser.GameObjects.Image;
    totalOffsetY: number;

    constructor()
    {
        super('Statistics');
    }

    create(): void
    {
        statsManager.loadStats(true)
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitleText();
        this.createStatsTextItems();
        this.createButtons();
        this.scaleMenuContainer();
        this.createXButton();

        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    private createMenuContainer(): void
    {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void
    {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
        this.whiteBg.fillRoundedRect(-200, -250, 400, 470 + 12, 8);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitleText(): void
    {
        let statTitle = "";
        let prefix = SUIT_MODE;
        if (prefix == 1) statTitle = translate(LanguageConfig.Stats1)
        if (prefix == 2) statTitle = translate(LanguageConfig.Stats2)
        if (prefix == 4) statTitle = translate(LanguageConfig.Stats4)
        // let statTitle = translate(LanguageConfig.Stats1);
        this.titleTxt = this.add.text(-165, -230, statTitle, {
            fontFamily: 'Open Sans',
            fontSize: '30px',
            color: '#000000',
            align: 'left',
            fontStyle: 'bold'
        }).setOrigin(0);
        this.menuContainer.add(this.titleTxt);
    }

    private createStatsTextItems(): void
    {
        const statsData = [
            { lang: LanguageConfig.GamesPlayed, label: STAT_LABELS.GamesPlayed, value: statsManager.gamesPlayed },
            { lang: LanguageConfig.GamesWon, label: STAT_LABELS.GamesWon, value: statsManager.gamesWon },
            { lang: LanguageConfig.GamesLost, label: STAT_LABELS.GamesLost, value: statsManager.gamesLost },
            { lang: LanguageConfig.WinPercentage, label: STAT_LABELS.WinPercentage, value: statsManager.winPercentage + "%" },
            // { lang: LanguageConfig.CurrentWinStreak, label: STAT_LABELS.CurrentWinStreak, value: statsManager.currentWinStreak },
            // { lang: LanguageConfig.LongestWinStreak, label: STAT_LABELS.LongestWinStreak, value: statsManager.longestWinStreak },
            { lang: LanguageConfig.TopScore, label: STAT_LABELS.TopScore, value: statsManager.topScore },
            { lang: LanguageConfig.BestTime, label: STAT_LABELS.BestTime, value: statsManager._formatTime(statsManager.bestTime) },
            { lang: LanguageConfig.AvgTime, label: STAT_LABELS.AverageTime, value: statsManager._formatTime(statsManager.avgTimePlayed) },
        ];

        statsData.forEach(element =>
        {
            const value = localStorage.getItem(element.label);
            // element.value = parseInt(value !== null ? value : '0');
            element.label = Language.getTranslation(element.lang);
        });

        let offsetY = -185 + 10;
        const labelStyle = { fontFamily: 'Open Sans', fontSize: '25px', color: '#000000' };
        const valueStyle = { ...labelStyle, fontStyle: 'bold' };

        statsData.forEach(stat =>
        {
            const label = this.add.text(-165, offsetY, `${stat.label}: `, labelStyle).setOrigin(0);
            const value = this.add.text(-165 + this.measureTextWidth(stat.label, labelStyle) + 14, offsetY, `${stat.value}`, valueStyle).setOrigin(0);
            this.menuContainer.add([label, value]);
            offsetY += 44; // Adjust vertical spacing as needed
        });

        this.totalOffsetY = offsetY
    }

    private measureTextWidth(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): number
    {
        const dummyText = this.add.text(0, 0, text, style);
        const width = dummyText.width;
        dummyText.destroy(); // We don't need to keep it after measuring
        return width;
    }

    createXButton()
    {
        this.prompt_close = this.add.image(175, -225, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.prompt_close.on('pointerdown', () =>
        {
            this.remove()
        })
        this.menuContainer.add(this.prompt_close)
    }

    private createButtons(): void
    {
        // this.closeButton = new ButtonWithColorBackground(this, 0, 125, Language.getTranslation(LanguageConfig.Close), () => {
        //     this.scene.stop('Statistics');
        // }, {
        //     color: 0x668b9e,
        //     textColor: '#ffffff',
        //     width: 338,
        //     height: 62,
        //     fontSize: '26px',
        //     fontStyle: "bold",
        //     parentContainer: this.menuContainer
        // });

        // this.resetButton = new ButtonWithColorBackground(this, 0, 205, Language.getTranslation(LanguageConfig.ResetStats), () => {
        // this.resetButton = new ButtonWithColorBackground(this, 0, 190, Language.getTranslation(LanguageConfig.ResetStats), () => {
        this.resetButton = new ButtonWithColorBackground(this, 0, this.totalOffsetY + 37, Language.getTranslation(LanguageConfig.ResetStats), () =>
        {
            statsManager.resetStats()
            this.scene.restart()
        }, {
            color: 0x668b9e,
            textColor: '#ffffff',
            width: 338,
            height: 62,
            fontSize: '26px',
            fontStyle: "bold",
            parentContainer: this.menuContainer
        });
    }


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

// Export the class if needed
export default Statistics;
