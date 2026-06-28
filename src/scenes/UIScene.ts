import Phaser, { GameObjects } from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';
import SuitToggleSwitch from '../ui/SuitToggleSwitch';
import Registry from '../config/Registry';
import ImageButton from '../ui/ImageButton';
import ButtonWithColorBackground from '../ui/ButtonWithColorBackground';
import { cycleNightMode, DRAG_ACTIVE, getSuitMode, NIGHT_MODE_ACTIVE, setSuitMode, VERSION } from '../config/Config';
import HintManager from '../managers/HintManager';

export class UIScene extends Phaser.Scene {
    textContainer: Phaser.GameObjects.Container;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;
    elementsContainer: Phaser.GameObjects.Container;
    elementsContainer2: GameObjects.Container;
    elementsContainer3: GameObjects.Container;
    inputEnabled: boolean = true;
    skipClicks: boolean = false;

    private htmlScore: HTMLElement | null = null;
    private htmlTime: HTMLElement | null = null;

    desktopUI: {
        toggle: SuitToggleSwitch;
        neustart: ButtonWithColorBackground;
        settings: ImageButton;
        help: ImageButton;
        stats: ImageButton;
        night: ImageButton;
        hint: ImageButton;
        undo: ImageButton;
    };
    mobileUI: {
        toggle: SuitToggleSwitch;
        neustart: ButtonWithColorBackground;
        settings: ImageButton;
        help: ImageButton;
        stats: ImageButton;
        night: ImageButton;
        hint: ImageButton;
        undo: ImageButton;
    };


    static myRef: UIScene;

    constructor() {
        super('UIScene');
        UIScene.myRef = this;
    }



    create(): void {
        // Create UI elements here
        this.textContainer = this.add.container(0, 0);
        this.elementsContainer = this.add.container(0, 0);
        this.elementsContainer2 = this.add.container(0, 0);
        this.elementsContainer3 = this.add.container(0, 0);
        this.createTextElements();
        this.textContainer.setVisible(false);
        this.htmlScore = document.querySelector('.stat-score');
        this.htmlTime = document.querySelector('.stat-time');
        this.createUIElements()
        this.createUIElementsMobile()
        this.gameManager = this.registry.get('gameManager');


        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
    }
    createUIElements()
    {
        this.desktopUI = {} as any;

        // Centered horizontal toolbar. Order left→right: undo, hint, suit selector (1/2/4), night, stats, help, settings.
        // 16px gaps everywhere, EXCEPT: the three suit segments are flush (110 stride), and selector→night is 36.
        // Spans −551..551 (klondike rhythm, widened by the extra 110px segment).
        this.desktopUI.undo = new ImageButton(this, -551, 0, 'btn-undo', 'btn-undo-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager");
            this.gameManager.controlManager.handleUKey();
        });
        this.desktopUI.undo.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.undo);

        this.desktopUI.hint = new ImageButton(this, -315, 0, 'btn-hint', 'btn-hint-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gamemanager: GameManager = this.registry.get('gameManager');
            HintManager.getInstance().getHint(gamemanager.pileManager);
        });
        this.desktopUI.hint.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.hint);

        this.desktopUI.toggle = new SuitToggleSwitch(
            this,
            -79,
            0,
            [
                { mode: 1, offTexture: 'btn-spider-1-card-off', onTexture: 'btn-spider-1-card-on' },
                { mode: 2, offTexture: 'btn-spider-2-card-off', onTexture: 'btn-spider-2-card-on' },
                { mode: 4, offTexture: 'btn-spider-4-card-off', onTexture: 'btn-spider-4-card-on' },
            ],
            110,
            0,
            (mode: number) => this.handleSuitModeSelect(mode),
            getSuitMode()
        );
        // Close the 1px seam between the NEU 2 and NEU 4 segments by nudging NEU 4 left.
        this.desktopUI.toggle.icons[2].x -= 1;
        this.elementsContainer.add(this.desktopUI.toggle);

        // NEUSTART occupies the same slot as the suit selector; visibility-swapped while a modal is open.
        this.desktopUI.neustart = new ButtonWithColorBackground(this, 86, 27, '↺ ' + translate(LanguageConfig.Neustart), () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gm: GameManager = this.registry.get('gameManager');
            gm.updateStats();
            gm.restart();
        }, {
            color: 0x618b3c,
            textColor: '#ffffff',
            width: 330,
            height: 54,
            fontSize: '20px',
            fontStyle: 'bold',
            cornerRadius: 8,
            parentContainer: this.elementsContainer,
        });
        this.desktopUI.neustart.setVisible(false);

        this.desktopUI.night = new ImageButton(this, 287, 0, 'icon-night', 'icon-night-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.toggleNightMode();
        });
        this.desktopUI.night.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.night);

        this.desktopUI.stats = new ImageButton(this, 357, 0, 'icon-stats', 'icon-stats-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Statistics").bringToTop("Statistics");
        });
        this.desktopUI.stats.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.stats);

        this.desktopUI.help = new ImageButton(this, 427, 0, 'icon-help', 'icon-help-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.openHelpAnchor();
        });
        this.desktopUI.help.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.help);

        this.desktopUI.settings = new ImageButton(this, 497, 0, 'icon-settings', 'icon-settings-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        });
        this.desktopUI.settings.setDepth(50000);
        this.desktopUI.settings.setOrigin(0, 0);
        this.elementsContainer.add(this.desktopUI.settings);
    }

    createUIElementsMobile() {
        this.mobileUI = {} as any;
        const colRightX = -80;
        const colLeftX = 20;

        // ec2: right cluster (suit selector + hint + undo) using mobile-* art
        this.mobileUI.toggle = new SuitToggleSwitch(
            this,
            colRightX,
            0,
            [
                { mode: 1, offTexture: 'mobile-spider-btn-1-card-off', onTexture: 'mobile-spider-btn-1-card-on' },
                { mode: 2, offTexture: 'mobile-spider-btn-2-card-off', onTexture: 'mobile-spider-btn-2-card-on' },
                { mode: 4, offTexture: 'mobile-spider-btn-4-card-off', onTexture: 'mobile-spider-btn-4-card-on' },
            ],
            0,
            54,
            (mode: number) => this.handleSuitModeSelect(mode),
            getSuitMode()
        );
        this.elementsContainer2.add(this.mobileUI.toggle);

        // Mobile NEUSTART overlays the selector position (visibility-swapped when a modal is open)
        this.mobileUI.neustart = new ButtonWithColorBackground(this, colRightX + 27, 81, '↺', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gm: GameManager = this.registry.get('gameManager');
            gm.updateStats();
            gm.restart();
        }, {
            color: 0x618b3c,
            textColor: '#ffffff',
            width: 54,
            height: 162,
            fontSize: '28px',
            fontStyle: 'bold',
            cornerRadius: 8,
            parentContainer: this.elementsContainer2,
        });
        this.mobileUI.neustart.setVisible(false);

        this.mobileUI.hint = new ImageButton(this, colRightX, 183, 'mobile-btn-hint', 'mobile-btn-hint', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            const gamemanager: GameManager = this.registry.get('gameManager');
            HintManager.getInstance().getHint(gamemanager.pileManager);
        });
        this.mobileUI.hint.setOrigin(0, 0);
        this.elementsContainer2.add(this.mobileUI.hint);

        this.mobileUI.undo = new ImageButton(this, colRightX, 258, 'mobile-btn-undo', 'mobile-btn-undo', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager");
            this.gameManager.controlManager.handleUKey();
        });
        this.mobileUI.undo.setOrigin(0, 0);
        this.elementsContainer2.add(this.mobileUI.undo);

        // ec3: left cluster (settings/help/stats/night) using icon-* art
        this.mobileUI.settings = new ImageButton(this, colLeftX, 0, 'icon-settings', 'icon-settings-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        });
        this.mobileUI.settings.setDepth(50000);
        this.mobileUI.settings.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.settings);

        this.mobileUI.help = new ImageButton(this, colLeftX, 55, 'icon-help', 'icon-help-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.openHelpAnchor();
        });
        this.mobileUI.help.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.help);

        this.mobileUI.stats = new ImageButton(this, colLeftX, 110, 'icon-stats', 'icon-stats-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Statistics").bringToTop("Statistics");
        });
        this.mobileUI.stats.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.stats);

        this.mobileUI.night = new ImageButton(this, colLeftX, 165, 'icon-night', 'icon-night-hover', () => {
            if (!this.inputEnabled || this.skipClicks) return;
            this.toggleNightMode();
        });
        this.mobileUI.night.setOrigin(0, 0);
        this.elementsContainer3.add(this.mobileUI.night);

        this.elementsContainer2.visible = this.elementsContainer3.visible = false;
    }

    update(): void
    {
        this.elementsContainer3.visible = this.elementsContainer2.visible
        this.elementsContainer3.setScale(this.elementsContainer2.scale)

        this.updateVersionTag();

        const currentGameManager = this.registry.get('gameManager') as GameManager | undefined;
        if (currentGameManager) {
            this.gameManager = currentGameManager;
        }
        if (!this.gameManager) return;

        const scoreStr = translate(LanguageConfig.Score) + this.gameManager.getCurrentScore();
        const timeStr = formatTime(this.gameManager.getElapsedTime());
        this.scoreText.text = scoreStr;
        this.timeText.text = ' | ' + timeStr;
        this.movesText.text = '';
        if (!this.htmlScore || !this.htmlScore.isConnected) this.htmlScore = document.querySelector('.stat-score');
        if (!this.htmlTime || !this.htmlTime.isConnected) this.htmlTime = document.querySelector('.stat-time');
        if (this.htmlScore) this.htmlScore.textContent = scoreStr;
        if (this.htmlTime) this.htmlTime.textContent = '| ' + timeStr;
        this.updateTextPos()

        this.inputEnabled = true

        const modalOpen = this.scene.isActive('Settings') || this.scene.isActive('Statistics') || this.scene.isActive('WonScene') || this.scene.isActive('NewGameConfirm') || this.scene.isActive('SystemNoticeScene');
        if (modalOpen) this.inputEnabled = false;

        const ui = this.elementsContainer.visible ? this.desktopUI : this.mobileUI;
        const buttons: ImageButton[] = [ui.settings, ui.help, ui.stats, ui.night, ui.hint, ui.undo];
        if (DRAG_ACTIVE) {
            buttons.forEach(b => b.disableInteractive());
            ui.toggle.icons.forEach(icon => icon.disableInteractive());
        } else {
            buttons.forEach(b => b.setInteractive());
            ui.toggle.icons.forEach(icon => icon.setInteractive());
        }
    }

    private createTextElements(): void {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Inter',
        };

        // Score text
        this.scoreText = this.add.text(-350+350, 7, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275+350, 7, '', textStyle);

        // Time text
        this.movesText = this.add.text(-150+350, 7, '', textStyle);

        this.textContainer.add(this.scoreText)
        this.textContainer.add(this.timeText)
        this.textContainer.add(this.movesText)

    }

    private resize(gameSize: Phaser.Structs.Size): void {

        const { width, height } = gameSize;

        let textStartX = Registry.uiTextStartX;
        let elementsStartX = Registry.uiElemStartX;

        this.textContainer.setPosition(textStartX, 0);
        let scale = Math.min(1, Math.min(width / 1600, height / 900));
        let fontsize = Math.max(12, Math.ceil(20 * Math.sqrt(scale)));
        // Desktop toolbar: centered horizontally
        this.elementsContainer.x = width / 2;
        this.elementsContainer.setScale(scale)

        this.elementsContainer2.setPosition(elementsStartX, 0)
        this.elementsContainer2.x = elementsStartX;
        this.elementsContainer2.setScale(scale)



        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: fontsize+'px',
            color: '#FFFFFF',
            fontFamily: 'Inter',
        };

        this.scoreText.setStyle(textStyle)
        this.timeText.setStyle(textStyle)
        this.movesText.setStyle(textStyle)
        this.calculateContainerHeightPercentage(height)
        this.updateTextPos()



        if (this.game.device.os.android || this.game.device.os.iOS) {
            if (innerWidth > innerHeight) {
                GameManager.isPotrait = false;
                this.handleMobileLandscape()
            } else {
                GameManager.isPotrait = true;
                this.handleMobilePortrait()
            }
        }

    }
    handleMobileLandscape()
    {
        if(this.scale.isFullscreen || !this.isTablet() || (this.game.device.os.iOS && this.isTablet() && this.scale.isGameLandscape)) {
            this.applyMobileLandscapeLayout();

            this.elementsContainer.scale *= 2
            this.elementsContainer2.scale *= 2
            this.textContainer.scale = 1.2

            this.elementsContainer.x = window.innerWidth
            this.elementsContainer2.x = window.innerWidth
            this.elementsContainer3.x = 0
            this.textContainer.x = 10
            this.movesText.setFontSize(19)
            this.scoreText.setFontSize(19)
            this.timeText.setFontSize(19)
            this.movesText.visible = false;

            this.elementsContainer.visible = false;
            this.elementsContainer2.visible = true;
            this.elementsContainer3.visible = this.elementsContainer2.visible

            // iPad landscape: pin the two side button columns hard to the screen edges at ~5% width,
            // so the board can take ~82% of the width. Overrides the x/scale set just above.
            if (this.game.device.os.iOS && this.isTablet() && this.scale.isGameLandscape) {
                const EDGE_MARGIN_FRAC = 0.02; // 2% screen-edge margin
                const BUTTON_WIDTH_FRAC = 0.05; // ~5% column width
                const ICON_PX = 54; // native side-icon width
                const W = window.innerWidth;
                const s = BUTTON_WIDTH_FRAC * W / ICON_PX;
                this.elementsContainer2.setScale(s);
                this.elementsContainer3.setScale(s); // update() also syncs ec3 <- ec2 each frame
                // left column local icon x = 20  -> left icon edge at EDGE_MARGIN_FRAC*W
                this.elementsContainer3.x = EDGE_MARGIN_FRAC * W - 20 * s;
                // right cluster local icon x spans -80..-26 -> right icon edge at (1-EDGE_MARGIN_FRAC)*W
                this.elementsContainer2.x = (1 - EDGE_MARGIN_FRAC) * W + 26 * s;
            }
        } else {
            this.elementsContainer.visible = true;
            this.elementsContainer2.visible = false;
            this.elementsContainer3.visible = false;
        }
    }

    handleMobilePortrait()
    {
        this.applyMobilePortraitLayout();

        this.elementsContainer.visible = false;
        this.elementsContainer2.visible = true;
        this.elementsContainer3.visible = true;

        const scaleFactor = Math.min(2.0, window.innerWidth / 570);
        this.elementsContainer2.scale = scaleFactor;
        this.elementsContainer3.scale = scaleFactor;

        this.movesText.setFontSize(22)
        this.scoreText.setFontSize(22)
        this.timeText.setFontSize(22)
        this.textContainer.scale = 1.2;
        this.movesText.visible = false;

        // ec3 (settings/help/stats/night) anchored at left, ec2 (selector/hint/undo) anchored at right
        this.elementsContainer3.x = 10;
        this.elementsContainer2.x = window.innerWidth - 294 * scaleFactor - 10;
    }

    private applyMobileLandscapeLayout()
    {
        if (!this.mobileUI) return;
        // ec3 left column (settings/help/stats/night at x=20, 75px stride)
        this.mobileUI.settings.setXY(20, 0);
        this.mobileUI.help.setXY(20, 75);
        this.mobileUI.stats.setXY(20, 150);
        this.mobileUI.night.setXY(20, 225);
        // ec2 right column: suit segments flush (54 stride), then hint/undo on the 75px rhythm
        this.mobileUI.toggle.setPosition(-80, 0);
        this.mobileUI.toggle.icons[0].setPosition(0, 0);
        this.mobileUI.toggle.icons[1].setPosition(0, 54);
        this.mobileUI.toggle.icons[2].setPosition(0, 108);
        this.mobileUI.hint.setXY(-80, 183);
        this.mobileUI.undo.setXY(-80, 258);
    }

    private applyMobilePortraitLayout()
    {
        if (!this.mobileUI) return;
        // ec3 row: 4 square icons horizontal (0, 60, 120, 180)
        this.mobileUI.settings.setXY(0, 0);
        this.mobileUI.help.setXY(60, 0);
        this.mobileUI.stats.setXY(120, 0);
        this.mobileUI.night.setXY(180, 0);
        // ec2 row: suit segments flush side-by-side (0, 54, 108), hint at 180, undo at 240
        this.mobileUI.toggle.setPosition(0, 0);
        this.mobileUI.toggle.icons[0].setPosition(0, 0);
        this.mobileUI.toggle.icons[1].setPosition(54, 0);
        // NEU 4 nudged 1px left to close the seam against NEU 2.
        this.mobileUI.toggle.icons[2].setPosition(107, 0);
        this.mobileUI.hint.setXY(180, 0);
        this.mobileUI.undo.setXY(240, 0);
    }

    private calculateContainerHeightPercentage(screenHeight: number): void {
        const topBarHeight = (document.querySelector('.top-bar') as HTMLElement | null)?.offsetHeight ?? 44;
        const originalContainerHeight = this.textContainer.y + topBarHeight;

        // Get the current scale applied to the container
        const currentScale = this.textContainer.scaleY;


        // Calculate the scaled height of the container
        const scaledContainerHeight = originalContainerHeight * currentScale;

        // Calculate the percentage of the screen height taken by the container
        const heightPercentage = (scaledContainerHeight / screenHeight) * 100;

        this.registry.set('topUiWidthPercentage', 1.5*heightPercentage/100)
    }
    updateTextPos(){

        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI==undefined) topUI = 0.01;



        // Desktop default: text at top, button toolbar at bottom. Mobile branches below override these.
        this.textContainer.y = topUI*this.scale.height
        this.elementsContainer.y = this.scale.height * 0.93 - 7
        this.elementsContainer2.y = topUI*this.scale.height
        this.elementsContainer3.y = topUI*this.scale.height

        this.registry.set("uiBottomPx", this.textContainer.y + this.scoreText.height*1.5 - 23)


        if ((this.scale.isGameLandscape && this.game.device.os.iOS && this.isTablet()) || this.registry.get("isFullscreen") || ( !this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape)) {

            this.elementsContainer.y = this.scale.height *0.925
            this.elementsContainer2.y = this.scale.height *0.925
            this.elementsContainer2.y = this.scale.height *0.025
            this.textContainer.y = this.scale.height * 0.925




            if (this.game.device.os.android || this.game.device.os.iOS) {
                this.elementsContainer.y = this.scale.height *0.9
                this.elementsContainer2.y = this.scale.height *0.17
                this.elementsContainer3.y = this.scale.height *0.17
                if (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape && !this.registry.get("isFullscreen")) {
                    this.elementsContainer2.y = this.scale.height *0.19
                    this.elementsContainer3.y = this.scale.height *0.19
                }
                this.textContainer.y = this.scale.height * 0.9
                if (this.game.device.os.iPad) {
                    this.textContainer.y = this.scale.height * 0.86
                }
            }

            // iPad landscape: align the side button-column tops with the top edge of the
            // stock/foundation card row (Y published by GameplayScene's iPad board branch),
            // overriding the height*0.17 set just above.
            if (this.game.device.os.iOS && this.isTablet() && this.scale.isGameLandscape) {
                const y = this.registry.get('ipadStockTopY');
                if (typeof y === 'number') {
                    this.elementsContainer2.y = y;
                    this.elementsContainer3.y = y;
                }
            }
        }
        else {
            this.textContainer.y = topUI*this.scale.height

            if (this.game.device.os.android || this.game.device.os.iOS) {

                if (!this.game.device.os.iPad) {
                    this.elementsContainer.y = window.innerHeight * 0.86
                    this.elementsContainer2.y = window.innerHeight * 0.86
                    this.elementsContainer3.y = window.innerHeight * 0.86
                } else if (this.game.device.os.iPad && innerHeight > innerWidth) {
                    this.elementsContainer.y = window.innerHeight * 0.86
                    this.elementsContainer2.y = window.innerHeight * 0.86
                    this.elementsContainer3.y = window.innerHeight * 0.86
                }
            }
        }

    }


    // Debug: render the device-detection signals next to the version in the bottom-left tag, so
    // the exact gate values (post Preloader override) are visible on-device. Remove before release.
    private updateVersionTag(): void {
        const el = document.getElementById('version-tag');
        if (!el) return;
        const os = this.game.device.os;
        const b = (v: boolean) => v ? '1' : '0';
        const macUA = /Macintosh|Mac OS X/.test(navigator.userAgent);
        const s = `${VERSION}  iOS:${b(os.iOS)} iPad:${b(os.iPad)} and:${b(os.android)} desk:${b(os.desktop)} `
            + `tab:${b(this.isTablet())} land:${b(this.scale.isGameLandscape)} | tp:${navigator.maxTouchPoints} `
            + `plat:${navigator.platform} mac:${b(macUA)}`;
        if (el.textContent !== s) el.textContent = s;
    }

    private isTablet(): boolean {
        // Any iPad is a tablet, regardless of aspect ratio (newer iPads are wider than 4:3 and
        // Chrome's toolbar shrinks innerHeight, pushing the ratio past the 1.6 cutoff below).
        if (this.game.device.os.iPad) return true;
        // Tablets generally have an aspect ratio between 1 and 1.6
        const aspectRatio = window.innerWidth / window.innerHeight;

        const isTabletAspectRatio = aspectRatio > 1 && aspectRatio < 1.6;

        return isTabletAspectRatio && (this.game.device.os.android || this.game.device.os.iOS);
    }

    private handleSuitModeSelect(mode: number): void {
        if (!this.inputEnabled || this.skipClicks) return;
        const gm: GameManager = this.registry.get('gameManager');

        // Snapshot the actual current mode so cancel always reverts the selector visual to where it
        // was before the click — even when the click was on the already-active segment (no real flip).
        const previousMode = getSuitMode();

        const applyMode = () => {
            gm.updateStats();
            setSuitMode(mode);
            gm.restart();
        };

        // Untouched game (no card clicked yet) — switch silently.
        if (!gm || !gm.firstClickDone) {
            applyMode();
            return;
        }

        // Active game in progress — confirm before discarding.
        this.scene.launch('NewGameConfirm', {
            suitMode: mode,
            onConfirm: () => applyMode(),
            onCancel: () => {
                // Revert both selectors' visuals; only one is visible, but keep them in sync.
                this.desktopUI?.toggle?.setSelectedMode(previousMode);
                this.mobileUI?.toggle?.setSelectedMode(previousMode);
            },
        }).bringToTop('NewGameConfirm');
    }

    private openHelpAnchor(): void {
        // Try a manual local scroll first — fixes two issues:
        //   1) Android Chrome (esp. Samsung WebView) sometimes ignores hash-only navigation
        //      that originates from inside the Phaser canvas / fullscreen context.
        //   2) Even on browsers that honor it, the hash stays in the URL after the first
        //      click, so a repeat click is a no-op (browser thinks it's already there).
        const target = document.getElementById('spielanleitung');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            return;
        }
        // Fallback: anchor lives outside this document (embedded build on a host page).
        // Clear an existing hash first so re-setting it fires a real hashchange even on
        // a repeat click, then set it so the host page can react.
        if (window.location.hash === '#spielanleitung') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.location.hash = '#spielanleitung';
    }

    private toggleNightMode(): void {
        cycleNightMode();
        // Background is rendered by CSS; just swap the body class.
        const classes = ['bg-light', 'bg-dark', 'bg-green'];
        document.body.classList.remove(...classes);
        document.body.classList.add(classes[NIGHT_MODE_ACTIVE] || classes[0]);
    }
}
