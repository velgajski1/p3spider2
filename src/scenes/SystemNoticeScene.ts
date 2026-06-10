import Phaser from 'phaser';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { BaseMenuScene } from './BaseMenuScene';
import { translate } from '../utils/Language';
import { LanguageConfig } from '../config/Language';
import { setShowSytemNotice } from '../config/Config';

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
  }

  private createMenuContainer(): void
  {
    this.menuContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);
  }

  private createWhiteBackground(): void
  {
    this.whiteBg = this.add.graphics({ fillStyle: { color: 0xffffff, alpha: 1 } });
    this.whiteBg.fillRoundedRect(-200, -180, 400, 363, 8);
    this.menuContainer.add(this.whiteBg);
  }

  private createTextElements(): void
  {
    // Title
    const title = this.add.text(-175 + 6, -155 - 2, translate(LanguageConfig.SystemNotice), {
      fontFamily: 'Open Sans',
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0);

    // Main text
    const mainText = this.add.text(-175 + 6, -105 - 2, translate(LanguageConfig.EveryColumnMustContain), {
      fontFamily: 'Open Sans',
      fontSize: '25px',
      color: '#000000',
      align: 'left',
      wordWrap: { width: 338 },
    }).setOrigin(0);

    mainText.setLineSpacing(10);

    this.menuContainer.add([title, mainText]);
  }

  private createButtons(): void
  {
    // OK button
    this.okButton = new ButtonWithColorBackground(
      this,
      0,
      45,
      translate(LanguageConfig.OK),
      () =>
      {
        setShowSytemNotice(true)
        this.scene.stop('SystemNoticeScene');
      },
      {
        color: 0x668b9e,
        textColor: '#ffffff',
        width: 338,
        height: 60,
        fontSize: '26px',
        fontStyle: 'bold',
        parentContainer: this.menuContainer,
      }
    );

    // OK, don't show again button
    this.dontShowAgainButton = new ButtonWithColorBackground(
      this,
      0,
      122,
      translate(LanguageConfig.DontShowAgain),
      () =>
      {
        // Add logic to save the user's preference to not show this again
        setShowSytemNotice(false)

        this.scene.stop('SystemNoticeScene');
      },
      {
        color: 0x668b9e,
        textColor: '#ffffff',
        width: 338,
        height: 60,
        fontSize: '26px',
        fontStyle: 'bold',
        parentContainer: this.menuContainer,
      }
    );

    this.menuContainer.add([this.okButton, this.dontShowAgainButton]);
  }

  private scaleMenuContainer(gameSize?: Phaser.Structs.Size): void
  {
    const { width, height } = gameSize || this.scale;
    this.menuContainer.setPosition(width / 2, height / 2);

    const scaleX = width / 600;
    const scaleY = height / 600;
    const scale = Math.min(1, Math.max(scaleX, scaleY));

    const effectiveWidth = 600 * scale;
    const effectiveHeight = 600 * scale;
    if (effectiveWidth > width || effectiveHeight > height)
    {
      this.menuContainer.setScale(Math.min(scaleX, scaleY));
    } else
    {
      this.menuContainer.setScale(scale);
    }
  }
}
