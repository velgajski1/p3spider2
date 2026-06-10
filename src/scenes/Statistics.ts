import Phaser from 'phaser';
import { ButtonWithColorBackground } from '../ui/ButtonWithColorBackground';
import { Language, translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { SUIT_MODE } from '../config/Config';

export class Statistics extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private titleTxt!: Phaser.GameObjects.Text;
    prompt_close: Phaser.GameObjects.Image;

    constructor() {
        super('Statistics');
    }

    create(): void {
        statsManager.loadStats(true);
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitleText();
        this.createSections();
        this.createResetButton();
        this.createXButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        // 565 wide x 574 tall, top-left at (-282, -270)
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xf8f5f0, alpha: 1 } });
        this.whiteBg.fillRect(-282, -270, 565, 574);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitleText(): void {
        let statTitle = translate(LanguageConfig.Stats1);
        if (SUIT_MODE == 2) statTitle = translate(LanguageConfig.Stats2);
        if (SUIT_MODE == 4) statTitle = translate(LanguageConfig.Stats4);
        this.titleTxt = this.add.text(0, -241, statTitle, {
            fontFamily: 'Inter',
            fontSize: '30px',
            color: '#000000',
            align: 'center',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.menuContainer.add(this.titleTxt);
    }

    private createXButton(): void {
        this.prompt_close = this.add.image(251, -238, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.prompt_close.on('pointerdown', () => this.remove());
        this.menuContainer.add(this.prompt_close);
    }

    private createSections(): void {
        const labelX = -208;
        const valueX = 208;
        const sectionStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Inter', fontSize: '28px', fontStyle: '600', color: '#000000',
        };
        const rowLabelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Inter', fontSize: '26px', fontStyle: '400', color: '#000000',
        };
        const rowValueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Inter', fontSize: '26px', color: '#000000', fontStyle: '600',
        };

        const rowGap = 53;
        const sectionToRowsGap = 55;
        const betweenSectionsGap = 1;

        const spielen = this.add.text(labelX, -187, Language.getTranslation(LanguageConfig.Spielen), sectionStyle).setOrigin(0, 0);
        this.menuContainer.add(spielen);

        const spielenRows = [
            { label: LanguageConfig.GamesPlayed, value: '' + statsManager.gamesPlayed },
            { label: LanguageConfig.GamesWon, value: '' + statsManager.gamesWon },
            { label: LanguageConfig.WinPercentage, value: statsManager.winPercentage + '%' },
        ];

        let y = -187 + sectionToRowsGap;
        spielenRows.forEach(r => {
            const labelTxt = this.add.text(labelX, y, Language.getTranslation(r.label), rowLabelStyle).setOrigin(0, 0);
            const valueTxt = this.add.text(valueX, y, r.value, rowValueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelTxt, valueTxt]);
            y += rowGap;
        });

        const leistungY = y + betweenSectionsGap;
        const leistung = this.add.text(labelX, leistungY, Language.getTranslation(LanguageConfig.Leistung), sectionStyle).setOrigin(0, 0);
        this.menuContainer.add(leistung);
        y = leistungY + sectionToRowsGap;

        const leistungRows = [
            { label: LanguageConfig.TopScore, value: '' + statsManager.topScore },
            { label: LanguageConfig.BestTime, value: statsManager._formatTime(statsManager.bestTime) },
        ];
        leistungRows.forEach(r => {
            const labelTxt = this.add.text(labelX, y, Language.getTranslation(r.label), rowLabelStyle).setOrigin(0, 0);
            const valueTxt = this.add.text(valueX, y, r.value, rowValueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelTxt, valueTxt]);
            y += rowGap;
        });
    }

    private createResetButton(): void {
        // Green per the spider prompt sheet (klondike's reset is red — an intentional "bottom section" difference).
        new ButtonWithColorBackground(this, 0, 230, Language.getTranslation(LanguageConfig.ResetStats), () => {
            statsManager.resetStats();
            this.scene.restart();
        }, {
            color: 0x618b3c,
            textColor: '#ffffff',
            width: 417,
            height: 61,
            fontSize: '26px',
            fontStyle: 'bold',
            cornerRadius: 0,
            parentContainer: this.menuContainer,
        });
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2 - 15);

        const scaleX = width / 700;
        const scaleY = height / 700;
        const scale = Math.min(1, Math.max(scaleX, scaleY));

        const effectiveWidth = 700 * scale;
        const effectiveHeight = 700 * scale;
        const responsive = this.getResponsiveModalScale();
        if (effectiveWidth > width || effectiveHeight > height) {
            this.menuContainer.setScale(Math.min(scaleX, scaleY) * responsive);
        } else {
            this.menuContainer.setScale(scale * responsive);
        }
    }
}

export default Statistics;
