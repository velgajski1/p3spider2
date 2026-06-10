import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { BaseMenuScene } from './BaseMenuScene';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { setShowSytemNotice, SOUND_ACTIVE } from '../config/Config';
import { SoundManager } from '../managers/SoundManager';

export class SystemNoticeScene extends BaseMenuScene
{
  private menuContainer!: Phaser.GameObjects.Container;
  private whiteBg!: Phaser.GameObjects.Graphics;
  private okButton!: ButtonWithColorBackground;
  private dontShowAgainButton!: ButtonWithColorBackground;

  constructor()
  {
    super('SystemNoticeScene');
  }

  create(): void
  {
    super.create();
    this.createMenuContainer();
    this.createWhiteBackground();
    this.createTextElements();
    this.createButtons();
    this.scaleMenuContainer();

    // Listen for resize events
    this.scale.on('resize', this.scaleMenuContainer, this);

    // The system prompt is the only prompt with a sound.
    SOUND_ACTIVE && SoundManager.instance.prompt.play();
  }

  private createMenuContainer(): void
  {
    this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
  }

  private createWhiteBackground(): void
  {
    // 565 wide x 398 tall, top-left at (-282, -199)
    this.whiteBg = this.add.graphics({ fillStyle: { color: 0xf8f5f0, alpha: 1 } });
    this.whiteBg.fillRect(-282, -199, 565, 398);
    this.menuContainer.add(this.whiteBg);
  }

  private createTextElements(): void
  {
    // Title
    const title = this.add.text(0, -170, translate(LanguageConfig.SystemNotice), {
      fontFamily: 'Inter',
      fontSize: '30px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Main text
    const mainText = this.add.text(0, -110, translate(LanguageConfig.EveryColumnMustContain), {
      fontFamily: 'Inter',
      fontSize: '26px',
      color: '#000000',
      align: 'center',
      fontStyle: '400',
      wordWrap: { width: 470 },
    }).setOrigin(0.5, 0);

    mainText.setLineSpacing(6);

    this.menuContainer.add([title, mainText]);
  }

  private createButtons(): void
  {
    // OK button
    this.okButton = new ButtonWithColorBackground(
      this,
      0,
      30,
      translate(LanguageConfig.OK),
      () =>
      {
        setShowSytemNotice(true)
        this.scene.stop('SystemNoticeScene');
      },
      {
        color: 0x3d96a5,
        textColor: '#ffffff',
        width: 417,
        height: 61,
        fontSize: '26px',
        fontStyle: 'bold',
        cornerRadius: 0,
        parentContainer: this.menuContainer,
      }
    );

    // OK, don't show again button
    this.dontShowAgainButton = new ButtonWithColorBackground(
      this,
      0,
      110,
      translate(LanguageConfig.DontShowAgain),
      () =>
      {
        setShowSytemNotice(false)

        this.scene.stop('SystemNoticeScene');
      },
      {
        color: 0x3d96a5,
        textColor: '#ffffff',
        width: 417,
        height: 61,
        fontSize: '26px',
        fontStyle: 'bold',
        cornerRadius: 0,
        parentContainer: this.menuContainer,
      }
    );

    this.menuContainer.add([this.okButton, this.dontShowAgainButton]);
  }

  private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void
  {
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
    if (effectiveWidth > width || effectiveHeight > height)
    {
      this.menuContainer.setScale(Math.min(scaleX, scaleY) * responsive);
    } else
    {
      this.menuContainer.setScale(scale * responsive);
    }
  }
}
