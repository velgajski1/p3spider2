import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { LanguageConfig } from '../config/Language';
import { translate } from '../utils/Language';
import { BaseMenuScene } from './BaseMenuScene';

export type NewGameConfirmData = {
    suitMode: 1 | 2 | 4;
    onConfirm: () => void;
    onCancel: () => void;
};

export class NewGameConfirmScene extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    private suitMode: 1 | 2 | 4 = 1;
    private onConfirm: () => void = () => {};
    private onCancel: () => void = () => {};
    private resolved: boolean = false;

    constructor() {
        super('NewGameConfirm');
    }

    init(data: NewGameConfirmData): void {
        this.suitMode = data.suitMode;
        this.onConfirm = data.onConfirm;
        this.onCancel = data.onCancel;
        this.resolved = false;
    }

    create(): void {
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitle();
        this.createBody();
        this.createButtons();
        this.createXButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
        this.events.on(Phaser.Scenes.Events.SLEEP, this.handleSleep, this);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.handleSleep, this);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xf8f5f0, alpha: 1 } });
        this.whiteBg.fillRect(-282, -190, 565, 368);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitle(): void {
        const title = this.add.text(0, -161, translate(LanguageConfig.ConfirmNewGameTitle), {
            fontFamily: 'Inter', fontSize: '30px', color: '#000000', align: 'center', fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.menuContainer.add(title);
    }

    private createBody(): void {
        let bodyKey = LanguageConfig.ConfirmNewGameBody1;
        if (this.suitMode === 2) bodyKey = LanguageConfig.ConfirmNewGameBody2;
        if (this.suitMode === 4) bodyKey = LanguageConfig.ConfirmNewGameBody4;
        const line1 = translate(bodyKey);
        const line2 = translate(LanguageConfig.ConfirmNewGameNote);
        const body = this.add.text(
            0,
            -104,
            `${line1}\n${line2}`,
            {
                fontFamily: 'Inter',
                fontSize: '26px',
                color: '#000000',
                align: 'center',
                fontStyle: '400',
                lineSpacing: 6,
            }
        ).setOrigin(0.5, 0);
        this.menuContainer.add(body);
    }

    private createXButton(): void {
        const closeBtn = this.add
            .image(251, -158, 'prompt_close')
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.resolveCancel());
        this.menuContainer.add(closeBtn);
    }

    private createButtons(): void {
        new ButtonWithColorBackground(this, 0, 105, translate(LanguageConfig.ConfirmNewGameBack), () => {
            this.resolveCancel();
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

        new ButtonWithColorBackground(this, 0, 25, translate(LanguageConfig.ConfirmNewGameConfirm), () => {
            this.resolveConfirm();
        }, {
            color: 0xaa4c4d,
            textColor: '#ffffff',
            width: 417,
            height: 61,
            fontSize: '26px',
            fontStyle: 'bold',
            cornerRadius: 0,
            parentContainer: this.menuContainer,
        });
    }

    private resolveConfirm(): void {
        if (this.resolved) return;
        this.resolved = true;
        const cb = this.onConfirm;
        this.remove();
        cb();
    }

    private resolveCancel(): void {
        if (this.resolved) return;
        this.resolved = true;
        const cb = this.onCancel;
        this.remove();
        cb();
    }

    private handleSleep(): void {
        // If the scene is dismissed without picking a button (e.g. by external code),
        // treat it as a cancel so the selector visual gets reverted.
        if (this.resolved) return;
        this.resolved = true;
        const cb = this.onCancel;
        cb();
    }

    private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scale;
        this.menuContainer.setPosition(width / 2, height / 2);

        const scaleXDivider = 700;
        const scaleYDivider = 600;
        const scaleX = width / scaleXDivider;
        const scaleY = height / scaleYDivider;
        const scale = Math.min(1, Math.max(scaleX, scaleY));

        const effectiveWidth = scaleXDivider * scale;
        const effectiveHeight = scaleYDivider * scale;
        const responsive = this.getResponsiveModalScale();
        if (effectiveWidth > width || effectiveHeight > height) {
            this.menuContainer.setScale(Math.min(scaleX, scaleY) * responsive);
        } else {
            this.menuContainer.setScale(scale * responsive);
        }
    }
}

export default NewGameConfirmScene;
