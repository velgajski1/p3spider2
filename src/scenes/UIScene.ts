import Phaser, { GameObjects } from 'phaser';
import { LanguageConfig } from '../config/Language';
import { GameManager } from '../managers/GameManager';
import { translate } from '../utils/Language';
import { formatTime } from '../utils/Utils';

import Registry from '../config/Registry';
import ImageButton from '../ui/ImageButton';
import { DRAG_ACTIVE, getSuitMode, setSuitMode, SUIT_MODE } from '../config/Config';
import CardLayoutManager from '../managers/CardLayoutManager';
import UndoManager from '../managers/UndoManager';
import { MainMenu } from './MainMenu';
import HintManager from '../managers/HintManager';
import ControlManager from '../managers/ControlManager';
import { SuitSelectionControl } from '../ui/SuitSelectionControl';

export class UIScene extends Phaser.Scene
{
    textContainer: Phaser.GameObjects.Container;
    textContainerDeltaX: number = 0;
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private gameManager: GameManager; // Reference to the GameManager
    movesText: Phaser.GameObjects.Text;
    elementsContainer: Phaser.GameObjects.Container;
    menuBut: ImageButton;
    settingsBut: ImageButton;
    hintBut: ImageButton;
    undoBut: ImageButton;
    inputEnabled: boolean = true;
    skipClicks: boolean = false;
    allInteractive: [ImageButton];
    elementsContainer2: GameObjects.Container;
    elementsContainer3: GameObjects.Container;


    static myRef: UIScene;
    restartBut: ImageButton;

    constructor()
    {
        super('UIScene');
        UIScene.myRef = this;
    }



    create(): void
    {
        // Create UI elements here
        this.textContainer = this.add.container(0, 0);
        this.elementsContainer = this.add.container(0, 0);
        this.elementsContainer2 = this.add.container(0, 0);
        this.elementsContainer3 = this.add.container(0, 0);
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '18px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };


        this.createTextElements();
        this.createUIElements()
        this.createUIElementsMobile()
        this.gameManager = this.registry.get('gameManager');


        this.scale.on('resize', this.resize, this);
        this.resize(this.scale.gameSize as unknown as Phaser.Structs.Size);
    }
    createUIElements()
    {
        // Instantiate the ToggleSwitch
        let deltaX = -460 + 5 - 1


        const suitControl = new SuitSelectionControl(this, -111 + deltaX, 18, getSuitMode()); // Adjust position (x, y) as needed
        this.elementsContainer.add(suitControl);

        suitControl.events.on("suitSelected", (mode: number) =>
        {


            const gamemanager: GameManager = this.registry.get("gameManager");
            gamemanager.updateStats();
            setSuitMode(mode);
            gamemanager.restart();

        });


        this.restartBut = new ImageButton(this, 100 + deltaX, 0, 'spider_restart', 'spider_restart', () =>
        {

            const state = UndoManager.getInstance().undoFully();

            const gManager: GameManager = this.registry.get('gameManager');
            gManager.reset()

            if (state)
            {
                gManager.pileManager.setToGameState(state);
            }
            // this.remove();

        })
        this.elementsContainer.add(this.restartBut)
        this.restartBut.setOrigin(0, 0);

        this.menuBut = new ImageButton(this, 160 + deltaX, 0, 'menu', 'menu', () =>
        {


            if (!this.inputEnabled || this.skipClicks) return;
            if (this.scene.getIndex('MainMenu') > -1)
            {
                this.scene.launch("MainMenu").bringToTop("MainMenu");
            }
            else if (this.scene)
            {
                this.scene.start("MainMenu").bringToTop("MainMenu");
            }

            this.input.setDefaultCursor('default');

        })
        this.elementsContainer.add(this.menuBut)
        this.menuBut.setOrigin(0, 0);

        this.settingsBut = new ImageButton(this, 220 + deltaX, 0, 'settings', 'settings', () =>
        {
            if (!this.inputEnabled || this.skipClicks) return;
            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        })
        this.settingsBut.setDepth(50000)
        this.elementsContainer.add(this.settingsBut)
        this.settingsBut.setOrigin(0, 0);

        this.hintBut = new ImageButton(this, 280 + deltaX, 0, 'hint', 'hint', () =>
        {
            if (!this.inputEnabled || this.skipClicks) return;
            let gamemanager: GameManager = this.registry.get('gameManager')
            HintManager.getInstance().getHint(gamemanager.pileManager)

        })
        this.hintBut.skipClickSound = true;
        this.elementsContainer.add(this.hintBut)
        this.hintBut.setOrigin(0, 0);

        this.undoBut = new ImageButton(this, 360 + deltaX, 0, 'undo', 'undo', () =>
        {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager")
            this.gameManager.controlManager.handleUKey()
        })
        this.elementsContainer.add(this.undoBut)
        this.undoBut.setOrigin(0, 0);
        this.undoBut.skipClickSound = true



    }

    createUIElementsMobile()
    {
        let deltaX = -80
        let deltaXLeft = 20;




        this.menuBut = new ImageButton(this, deltaXLeft, 0 + 6, 'menu', 'menu', () =>
        {


            if (!this.inputEnabled || this.skipClicks) return;
            if (this.scene.getIndex('MainMenu') > -1)
            {
                this.scene.launch("MainMenu").bringToTop("MainMenu");
            }
            else if (this.scene)
            {
                this.scene.start("MainMenu").bringToTop("MainMenu");
            }

            this.input.setDefaultCursor('default');

        })
        this.elementsContainer3.add(this.menuBut)
        this.menuBut.setOrigin(0, 0);

        this.settingsBut = new ImageButton(this, deltaXLeft, 55 + 6, 'settings', 'settings', () =>
        {


            if (!this.inputEnabled || this.skipClicks) return;

            this.scene.launch("Settings").bringToTop("Settings");
            this.input.setDefaultCursor('default');
        })
        this.settingsBut.setDepth(50000)
        this.elementsContainer3.add(this.settingsBut)
        this.settingsBut.setOrigin(0, 0);

        this.hintBut = new ImageButton(this, deltaX, 0 + 6, 'hint', 'hint', () =>
        {
            if (!this.inputEnabled || this.skipClicks) return;
            let gamemanager: GameManager = this.registry.get('gameManager')
            HintManager.getInstance().getHint(gamemanager.pileManager)

        })
        this.hintBut.skipClickSound = true;
        this.elementsContainer2.add(this.hintBut)
        this.hintBut.setOrigin(0, 0);

        this.undoBut = new ImageButton(this, deltaX, 55 + 6, 'undo', 'undo', () =>
        {
            if (!this.inputEnabled || this.skipClicks) return;
            this.gameManager = this.registry.get("gameManager")
            this.gameManager.controlManager.handleUKey()
        })
        this.elementsContainer2.add(this.undoBut)
        this.undoBut.setOrigin(0, 0);
        this.undoBut.skipClickSound = true

        const suitControl = new SuitSelectionControl(this, deltaX + 32, 30, getSuitMode(), 0, 50); // Adjust position (x, y) as needed
        // this.elementsContainer2.add(suitControl);

        suitControl.events.on("suitSelected", (mode: number) =>
        {


            const gamemanager: GameManager = this.registry.get("gameManager");
            gamemanager.updateStats();
            setSuitMode(mode);
            gamemanager.restart();

        });


        this.elementsContainer2.visible = this.elementsContainer3.visible = false

    }

    update(time: number, delta: number): void
    {
        this.elementsContainer3.visible = this.elementsContainer2.visible
        this.elementsContainer3.setScale(this.elementsContainer2.scale)
        //
        this.scoreText.text = "" + translate(LanguageConfig.Score) + this.gameManager.getCurrentScore()
        this.timeText.text = " | " + translate(LanguageConfig.Time) + formatTime(this.gameManager.getElapsedTime())
        // this.movesText.text = " | " + translate(LanguageConfig.Moves) + this.gameManager.getMoves()
        this.updateTextPos()

        this.inputEnabled = true

        if (DRAG_ACTIVE)
        {
            this.hintBut.disableInteractive()
            this.menuBut.disableInteractive()
            this.undoBut.disableInteractive()
            this.settingsBut.disableInteractive()

        } else
        {
            this.hintBut.setInteractive()
            this.menuBut.setInteractive()
            this.undoBut.setInteractive()
            this.settingsBut.setInteractive()
        }

        if (this.scene.isActive("Settings") || this.scene.isActive("MainMenu") || this.scene.isActive("Statistics") || this.scene.isActive("WonScene")) this.inputEnabled = false
    }

    private createTextElements(): void
    {
        // Text style
        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '19px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        // Score text
        this.scoreText = this.add.text(-350 + 385 - 3, 7, '', textStyle);

        // Time text
        this.timeText = this.add.text(-275 + 385 - 3, 7, '', textStyle);

        // Time text
        this.movesText = this.add.text(-150 + 380, 7, '', textStyle);

        this.textContainer.add(this.scoreText)
        this.textContainer.add(this.timeText)
        this.textContainer.add(this.movesText)

    }

    private resize(gameSize: Phaser.Structs.Size): void
    {

        const { width, height } = gameSize;

        let textStartX = Registry.uiTextStartX;
        let elementsStartX = Registry.uiElemStartX;

        this.textContainer.setPosition(textStartX, 0);
        this.elementsContainer.setPosition(elementsStartX, 0);
        let scale = Math.min(1, Math.min(width / 1600, height / 900));
        //
        let fontsize = Math.max(6, Math.ceil(20 * Math.sqrt(scale)));
        this.elementsContainer.x = elementsStartX;
        this.elementsContainer.setScale(scale)

        this.elementsContainer2.setPosition(elementsStartX, 0)
        this.elementsContainer2.x = elementsStartX;
        this.elementsContainer2.setScale(scale)



        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: fontsize + 'px',
            color: '#FFFFFF',
            fontFamily: 'Open Sans',
        };

        this.scoreText.setStyle(textStyle)
        this.timeText.setStyle(textStyle)
        this.movesText.setStyle(textStyle)
        this.calculateContainerHeightPercentage(height)
        this.updateTextPos()



        if (this.game.device.os.android || this.game.device.os.iOS)
        {
            if (innerWidth > innerHeight)
            {
                GameManager.isPotrait = false;
                this.handleMobileLandscape()
            } else
            {
                GameManager.isPotrait = true;
                this.handleMobilePortrait()
            }
        }

    }
    handleMobileLandscape()
    {

        if (this.scale.isFullscreen || !this.isTablet() || (this.game.device.os.iOS && this.isTablet() && this.scale.isGameLandscape))
        {


            this.elementsContainer.scale *= 2
            this.elementsContainer2.scale *= 2
            this.textContainer.scale = 1.2


            this.elementsContainer.x = window.innerWidth
            this.elementsContainer2.x = window.innerWidth
            this.textContainer.x = 10
            this.movesText.setFontSize(19)
            this.scoreText.setFontSize(19)
            this.timeText.setFontSize(19)
            this.movesText.visible = false;

            this.elementsContainer.visible = false;
            this.elementsContainer2.visible = true;
            this.elementsContainer3.visible = this.elementsContainer2.visible


        } else
        {
            this.elementsContainer.visible = true;
            this.elementsContainer2.visible = false;
        }

    }
    handleMobilePortrait()
    {

        this.elementsContainer2.visible = false;
        this.elementsContainer.visible = true;

        this.elementsContainer.scale *= 2.5;
        // this.textContainer.scale *= 1.3
        this.movesText.setFontSize(22)
        this.scoreText.setFontSize(22)
        this.timeText.setFontSize(22)

        this.elementsContainer.x = window.innerWidth - 3
        this.elementsContainer.y = window.innerHeight
        this.movesText.visible = false;

    }

    private calculateContainerHeightPercentage(screenHeight: number): void
    {
        // Assuming original dimensions of the gameplay container (for example purposes)
        // @ts-ignore

        // @ts-ignore
        const originalContainerHeight = this.textContainer.y + window.topBarBottomPosition; // Adjust this to your container's original height

        // Get the current scale applied to the container
        const currentScale = this.textContainer.scaleY;


        // Calculate the scaled height of the container
        const scaledContainerHeight = originalContainerHeight * currentScale;

        // Calculate the percentage of the screen height taken by the container
        const heightPercentage = (scaledContainerHeight / screenHeight) * 100;

        // Log the percentage

        this.registry.set('topUiWidthPercentage', 1.5 * heightPercentage / 100)
    }
    updateTextPos()
    {

        this.timeText.x = this.scoreText.x + this.scoreText.width
        this.movesText.x = this.timeText.x + this.timeText.width

        let topUI = this.registry.get("topUiWidthPercentage");
        if (topUI == undefined) topUI = 0.01;




        this.elementsContainer.y = topUI * this.scale.height
        this.elementsContainer2.y = topUI * this.scale.height
        this.elementsContainer3.y = topUI * this.scale.height
        this.textContainer.y = topUI * this.scale.height


        this.registry.set("uiBottomPx", this.elementsContainer.y + this.scoreText.height)

        if ((this.scale.isGameLandscape && this.game.device.os.iOS && this.isTablet()) || this.registry.get("isFullscreen") || (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape))
        {

            this.elementsContainer.y = this.scale.height * 0.925
            this.elementsContainer2.y = this.scale.height * 0.925
            this.elementsContainer2.y = this.scale.height * 0.025
            this.textContainer.y = this.scale.height * 0.925





            if (this.game.device.os.android || this.game.device.os.iOS)
            {
                this.elementsContainer.y = this.scale.height * 0.9
                this.elementsContainer2.y = this.scale.height * 0.07
                this.elementsContainer3.y = this.scale.height * 0.07
                if (!this.game.device.os.desktop && !this.isTablet() && this.scale.isGameLandscape && !this.registry.get("isFullscreen"))
                {
                    this.elementsContainer2.y = this.scale.height * 0.09
                    this.elementsContainer3.y = this.scale.height * 0.09
                }
                this.textContainer.y = this.scale.height * 0.9
                // this.textContainer.y = this.scale.height * 0.525
                if (this.game.device.os.iPad)
                {
                    this.textContainer.y = this.scale.height * 0.86
                }
            }
        }
        else
        {

            var deltaHeight = 900 - this.scale.height;

            let extraY = 0;
            if (deltaHeight > 0 && !this.game.device.os.android && !this.game.device.os.iOS)
            {
                extraY = Math.sqrt(Math.sqrt(deltaHeight));
            }
            let textStartX = Registry.uiTextStartX;


            this.textContainer.y = topUI * this.scale.height - extraY
            this.textContainer.x = textStartX - 3 * extraY

            if (this.game.device.os.android || this.game.device.os.iOS)
            {
                this.textContainer.y -= 5;
                this.textContainer.y -= 3;
                this.textContainer.x -= 7;

                if (window.innerHeight / window.innerWidth > 1.4)
                {
                    this.textContainer.x -= 7;
                    this.textContainer.y -= 3;

                }

                // this.textContainer.x = 10
                // this.textContainer.x=10


                if (!this.game.device.os.iPad)
                {
                    this.elementsContainer.y = this.scale.height * 0.86
                    this.elementsContainer.y = window.innerHeight * 0.86

                } else if (this.game.device.os.iPad && innerHeight > innerWidth)
                {
                    // this.textContainer.y = this.scale.height * 0.78
                    // this.textContainer.x = this.scale.width * 0.3
                    this.elementsContainer.y = this.scale.height * 0.89
                    this.elementsContainer.y = window.innerHeight * 0.89

                }

                // this.textContainer.y = this.scale.height * 0.78
                // this.textContainer.x = this.scale.width * 0.3
                this.elementsContainer.y = this.scale.height * 0.89
                this.elementsContainer.y = window.innerHeight * 0.89


            }
        }

        if (this.scale.isLandscape && !this.game.device.os.android && !this.game.device.os.iOS)
        {
            this.registry.set("uiBottomPx", this.elementsContainer.y + this.scoreText.height)
        }



    }


    private isTablet(): boolean
    {
        // Tablets generally have an aspect ratio between 1 and 1.6
        const aspectRatio = window.innerWidth / window.innerHeight;
        // Screen diagonal size in inches (e.g., diagonal of a 10.1" tablet)
        // const screenDiagonalInches = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) / window.devicePixelRatio;

        // Typically, tablets have a screen size between 7 and 13 inches
        const isTabletAspectRatio = aspectRatio > 1 && aspectRatio < 1.6;
        // const isTabletSize = screenDiagonalInches > 7 && screenDiagonalInches < 13;



        return isTabletAspectRatio && (this.game.device.os.android || this.game.device.os.iOS);
    }

    public setTime(time: number): void
    {

    }
}
