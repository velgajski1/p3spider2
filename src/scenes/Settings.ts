import Phaser from 'phaser';
import Button from '../ui/ButtonWithColorBackground';
import { SettingsToggle } from '../ui/SettingsToggle';
import { LanguageConfig } from '../config/Language';
import { Language } from '../utils/Language';
import { BaseMenuScene } from './BaseMenuScene';
import { RIGHT_HANDED_MODE_ACTIVE, SOUND_ACTIVE, toggleRightHandedActive, toggleSoundActive } from '../config/Config';

export class Settings extends BaseMenuScene {
    private menuContainer!: Phaser.GameObjects.Container;
    private whiteBg!: Phaser.GameObjects.Graphics;
    prompt_close: Phaser.GameObjects.Image;
    soundToggle: SettingsToggle;
    rightHandedToggle: SettingsToggle;

    constructor() {
        super('Settings');
    }

    create(): void {
        super.create();
        this.createMenuContainer();
        this.createWhiteBackground();
        this.createTitle();
        this.createToggles();
        this.createCloseButton();
        this.createXButton();
        this.scaleMenuContainer();

        this.scale.on('resize', this.scaleMenuContainer, this);
    }

    update(): void {
        toggleSoundActive(this.soundToggle.isOn);
        toggleRightHandedActive(this.rightHandedToggle.isOn);
    }

    private createMenuContainer(): void {
        this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
    }

    private createWhiteBackground(): void {
        this.whiteBg = this.add.graphics({ fillStyle: { color: 0xf8f5f0, alpha: 1 } });
        // Modal: 565 wide x 309 tall (klondike's minus the removed AutoFinish row)
        this.whiteBg.fillRect(-282, -154, 565, 309);
        this.menuContainer.add(this.whiteBg);
    }

    private createTitle(): void {
        const titleTxt = this.add.text(-210, -125, Language.getTranslation(LanguageConfig.Settings), {
            fontFamily: 'Inter', fontSize: '30px', color: '#000000', align: 'left'
        }).setOrigin(0, 0).setFontStyle('bold');
        this.menuContainer.add(titleTxt);
    }

    private createXButton(): void {
        this.prompt_close = this.add.image(251, -122, 'prompt_close').setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.prompt_close.on('pointerdown', () => this.remove());
        this.menuContainer.add(this.prompt_close);
    }

    private createToggles(): void {
        const rowWidth = 505;
        const rowX = -242;

        this.soundToggle = new SettingsToggle(this, rowX, -50, Language.getTranslation(LanguageConfig.SoundOnOff), SOUND_ACTIVE, {
            parentContainer: this.menuContainer,
            rowWidth,
        });

        this.rightHandedToggle = new SettingsToggle(this, rowX, 5, Language.getTranslation(LanguageConfig.RightHanded), RIGHT_HANDED_MODE_ACTIVE, {
            parentContainer: this.menuContainer,
            rowWidth,
        });

        addEventListener('radioToggle', () => {
            setTimeout(() => dispatchEvent(new Event('rightHandedEvent')), 100);
            this.update();
        });
    }

    private createCloseButton(): void {
        new Button(this, 0, 82, Language.getTranslation(LanguageConfig.SaveExit), () => {
            this.remove();
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
