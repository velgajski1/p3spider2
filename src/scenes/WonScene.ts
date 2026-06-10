import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { formatTime } from '../utils/Utils';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { BaseMenuScene } from './BaseMenuScene';
import statsManager from '../managers/StatsManager';
import { SoundManager } from '../managers/SoundManager';
import { SOUND_ACTIVE } from '../config/Config';

const WIN_TITLE_COUNT = 14;

export class WonScene extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private newGameButton!: ButtonWithColorBackground;
    private titleText: string = '';

    constructor(public score: number = 0, public timePlayed: number = 0, public timeBonus: number = 0, public totalScore: number = 0) {
        super('WonScene');
    }

    init(data: any) {
        this.score = data.score;
        this.timePlayed = data.timeplayed;
        this.timeBonus = data.timebonus;
        this.totalScore = data.totalscore;
        const idx = Math.floor(Math.random() * WIN_TITLE_COUNT) + 1;
        this.titleText = translate('WinTitle' + String(idx).padStart(2, '0'));
    }

    create(): void {
        super.create();

        // Update stats BEFORE building the rows so "Beste Punktzahl"/"Beste Zeit" include this win.
        statsManager.updateStatsAfterGame(true, this.totalScore, this.timePlayed);

        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTextElements();
        this.createNewGameButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
        SOUND_ACTIVE && SoundManager.instance.won.play();
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        // 565 wide x 418 tall, top-left at (-282, -207)
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xf8f5f0, alpha: 1 } });
        this.whiteBg.fillRect(-282, -207, 565, 418);
        this.menuContainer.add(this.whiteBg);
    }

    private createTextElements(): void {
        const title = this.add.text(0, -178, this.titleText, {
            fontFamily: 'Inter',
            fontSize: '30px',
            color: '#547e2f',
            align: 'center',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.menuContainer.add(title);

        // Punkte shows the recorded final score (incl. time bonus) so it is consistent
        // with "Beste Punktzahl", which is tracked from the same value.
        const rows = [
            { label: translate(LanguageConfig.ScoreWon), value: '' + this.totalScore },
            { label: translate(LanguageConfig.Time), value: formatTime(this.timePlayed, 'hh:mm:ss') },
            { label: translate(LanguageConfig.BestScoreWon), value: '' + statsManager.topScore },
            { label: translate(LanguageConfig.BestTime), value: statsManager._formatTime(statsManager.bestTime) },
        ];

        const labelX = -208;
        const valueX = 208;
        let y = -121;
        const rowGap = 53;

        rows.forEach(r => {
            const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontFamily: 'Inter',
                fontSize: '26px',
                color: '#000000',
                fontStyle: '400',
            };
            const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
                fontFamily: 'Inter',
                fontSize: '26px',
                color: '#000000',
                fontStyle: '600',
            };
            const labelEl = this.add.text(labelX, y, r.label, labelStyle).setOrigin(0, 0);
            const valueEl = this.add.text(valueX, y, r.value, valueStyle).setOrigin(1, 0);
            this.menuContainer.add([labelEl, valueEl]);
            y += rowGap;
        });
    }

    private createNewGameButton(): void {
        this.newGameButton = new ButtonWithColorBackground(this, 0, 137, translate(LanguageConfig.NewGame), () => {
            this.restartGame(true);
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
        this.menuContainer.add(this.newGameButton);
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);

        const scaleX = width / 700;
        const scaleY = height / 600;
        const scale = Math.min(1, Math.max(scaleX, scaleY));

        const effectiveWidth = 700 * scale;
        const effectiveHeight = 600 * scale;
        const responsive = this.getResponsiveModalScale();
        if (effectiveWidth > width || effectiveHeight > height) {
            this.menuContainer.setScale(Math.min(scaleX, scaleY) * responsive);
        } else {
            this.menuContainer.setScale(scale * responsive);
        }
    }
}
