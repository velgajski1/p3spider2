import Phaser from 'phaser';
import Card from '../elements/Card'; // Adjust import path as necessary
import PileManager from './PileManager';
import CardLayoutManager from './CardLayoutManager';
import { Rank, Suit } from './CardNameManager';
import ControlManager from './ControlManager';
import UndoManager from './UndoManager';
import { getSuitMode, setDragActive, SUIT_MODE } from '../config/Config';
import statsManager from './StatsManager';
import { UIScene } from '../scenes/UIScene';

function resumeSoundContext()
{
    const { context } = GameManager.gameScene.game.sound as Phaser.Sound.WebAudioSoundManager;
    if (context.state === "suspended")
    {
        context.resume();
    }

}

export class GameManager
{


    private static instance: GameManager | null = null;
    private score: number = 0;
    private startTime: number;
    private elapsedTime: number = 0;
    public gameScene: Phaser.Scene;
    private moves: number = 0;

    public pileManager: PileManager;
    public layoutManager: CardLayoutManager;
    private deck: Card[] = [];

    private gameplayContainer: Phaser.GameObjects.Container;
    controlManager: ControlManager;
    quickTimeEvent: Phaser.Time.TimerEvent;

    public static gameScene: Phaser.Scene
    static rendererHeight: number;
    static gameplayContainerY: number;
    static gameplayContainerScale: number;
    gameOverFlag: boolean = false
    wonscene: Phaser.Scenes.ScenePlugin;
    firstClickDone: boolean = false;
    static isMobile: boolean = false;
    static isPotrait: boolean = false;
    scaleRefreshing: boolean = false;
    gameBlurred: boolean = false;
    extrascore: number = 0;




    constructor(gameScene: Phaser.Scene, gameplayContainer: Phaser.GameObjects.Container)
    {



        GameManager.instance = this;
        UndoManager.init(gameScene, this)
        UndoManager.getInstance().enableUndo()
        this.gameScene = gameScene;
        this.startTime = Date.now();
        this.gameplayContainer = gameplayContainer;
        GameManager.gameScene = gameScene;

        // Initialize the managers responsible for handling piles and layout
        statsManager.startGame()

        this.pileManager = new PileManager(this.gameplayContainer, this);
        this.layoutManager = this.pileManager.cardLayoutManager;
        this.controlManager = new ControlManager(this.pileManager);

        // Set up a timer event to update the elapsed time in the game loop
        this.gameScene.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        document.body.addEventListener('pointerup', resumeSoundContext);

        this.gameScene.game.events.on('blur', () =>
        {
            this.gameScene.game.scale.refresh();
            this.gameBlurred = true;

        }, this);

        this.gameScene.game.events.on('focus', () =>
        {
            this.gameBlurred = false;
        }, this);


        this.addQuickTimeEvent()

        this.gameScene.time.addEvent({
            delay: 10,
            callback: () =>
            {
                if (this.scaleRefreshing) return;
                if (this.gameBlurred) return;
                this.pileManager.getAllCards().forEach(c => c.update())
                this.gameplayContainer.sort('depth');
                setDragActive(this.controlManager.dragging);
                this.controlManager.update()
                // if (this.gameScene.game.loop.actualFps < 59)
                // if (!this.controlManager.activeCard && !this.gameScene.input.activePointer.isDown) {

                // }

            },
            callbackScope: this,
            loop: true
        });


        // setTimeout(() =>
        // {
        //     this.gameScene.scene.launch("WonScene", { score: this.getCurrentScore(), timeplayed: this.getElapsedTime(), timebonus: 1, totalscore: 501 }).bringToTop("WonScene");
        //     this.controlManager.disableControls()
        //     this.gameOverFlag = true
        // }, 1000);
    }

    public addQuickTimeEvent()
    {
        this.quickTimeEvent = this.gameScene.time.addEvent({
            delay: 200,
            callback: this.updateTimerQuick,
            callbackScope: this,
            loop: true
        });



    }

    setScore(score: number)
    {
        this.score = score;
    }

    public static getInstance(scene: Phaser.Scene, container: Phaser.GameObjects.Container): GameManager
    {
        if (this.instance == null)
        {
            this.instance = new GameManager(scene, container);
        } else
        {

        }

        return this.instance;
    }



    startGame(): void
    {
        this.score = 500;
        this.moves = 0;
        this.startTime = Date.now();
        this.elapsedTime = 0;

        // Reset other game states and initialize the deck
        this.createAndShuffleDeck();
        this.layoutInitialCards();
        this.controlManager.setupControls()
    }

    incrementScore(amount: number): void
    {
        this.score += amount;
    }

    incrementMoves(): void
    {
        this.moves++;
    }
    decrementMoves()
    {
        this.moves--
    }

    updateTimer(): void
    {

        if (this.gameBlurred) return;
        if (this.scaleRefreshing) return;
        if (this.gameOverFlag || !this.firstClickDone)
        {
            if (!this.firstClickDone) { this.startTime = Date.now() }
            return;
        }
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        statsManager.updateCurrentGame(this.score, this.elapsedTime);


    }

    updateTimerQuick(): void
    {

        if (this.gameBlurred) return;
        let g = this.gameScene.game;

        if (g.device.os.iOS && window.innerWidth != g.scale.width && window.innerHeight != g.scale.height)
        {

            if (this.scaleRefreshing) return;
            this.scaleRefreshing = true;
            setTimeout(() =>
            {
                g.scale.refresh();
                this.scaleRefreshing = false;
            }, 200);
            return
        }


        UIScene.myRef.skipClicks = false;

        GameManager.rendererHeight = this.gameScene.renderer.height;
        GameManager.gameplayContainerY = this.gameplayContainer.y
        GameManager.gameplayContainerScale = this.gameplayContainer.scale;

        this.pileManager.fixTableuDepthAndFlipstatus()
        // this.pileManager.checkAndMoveCompletedSequences();

        // let p = this.pileManager.getFoundationPiles()[0];
        // p.forEach(x =>
        // {
        //
        // })

        if (!this.gameOverFlag && this.pileManager.getTableauPiles().every(pile => pile.length == 0) && this.pileManager.allCardsUncovered() && this.pileManager.getStockPile().length == 0)
        {
            this.winGame();
        }





    }

    winGame(): void
    {
        if (this.gameOverFlag) return;

        this.gameScene.scene.launch("WonScene", { score: this.getCurrentScore(), timeplayed: this.getElapsedTime(), timebonus: this.getTimeBonus(), totalscore: this.getTotalScore() }).bringToTop("WonScene");
        this.controlManager.disableControls()
        this.gameOverFlag = true

        const undoManager = UndoManager.getInstance();
        undoManager.disableUndo()
    }

    getTotalScore()
    {
        return this.getCurrentScore() + this.getTimeBonus();
    }
    getTimeBonus()
    {
        return 0
    }

    restart()
    {


        GameManager.removeInstance();
        UndoManager.removeInstance()
        GameManager.instance = null;
        this.gameScene.events.emit('restartScene');
    }

    updateStats()
    {

        if (this.getElapsedTime() > 0)
        {
            statsManager.updateStatsAfterGame(false, this.getCurrentScore(), this.getElapsedTime());
        }

    }

    static removeInstance()
    {
        this.instance = null
    }

    getElapsedTime(): number
    {
        return this.elapsedTime;
    }

    getCurrentScore(): number
    {
        return 500 - this.moves + 100 * this.pileManager.getCompletedFoundationCount() + this.extrascore;
    }

    getMoves(): number
    {
        return this.moves;
    }

    reset()
    {
        this.moves = this.elapsedTime = 0;
        this.score = 500;
        this.startTime = Date.now()
        this.gameOverFlag = false;
        this.firstClickDone = false;
        this.extrascore = 0;
    }

    // Create and shuffle the deck
    // Update the createAndShuffleDeck method to use the Suit and Rank enums
    private createAndShuffleDeck()
    {
        const ranks = [
            Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven,
            Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace
        ];

        // Determine the suits based on SUIT_MODE
        let suits = [];

        switch (getSuitMode())
        {
            case 1: // One suit (e.g., Spades)
                suits = [Suit.Spades];
                break;
            case 2: // Two suits (e.g., Spades and Hearts)
                suits = [Suit.Spades, Suit.Hearts];
                break;
            case 4: // Four suits
                suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];
                break;
            default:
                console.error("Invalid SUIT_MODE:", SUIT_MODE);
                return; // Exit if the suit mode is invalid
        }

        // Clear existing deck
        this.deck = [];

        // Create cards for each suit and rank combination, repeating suits for the Spider Solitaire deck
        const repetitions = 104 / (suits.length * ranks.length); // Ensure 104 cards in total
        for (let rep = 0; rep < repetitions; rep++)
        {
            for (const suit of suits)
            {
                for (const rank of ranks)
                {
                    const card = new Card(this.gameScene, 0, 0, suit, rank, true); // Adjust parameters as needed
                    this.gameplayContainer.add(card);
                    this.deck.push(card);
                }
            }
        }

        // Shuffle the deck
        this.deck = this.shuffleDeck(this.deck);
    }


    // Shuffle the deck (using the Fisher-Yates algorithm)
    private shuffleDeck(deck: Card[]): Card[]
    {
        for (let i = deck.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // Lay out the cards in the initial game arrangement
    private layoutInitialCards()
    {
        this.layoutManager.init(this.pileManager)
        // Use the pile manager to distribute cards and the layout manager to arrange them
        this.layoutManager.addFoundationIndicators(this.gameScene, this.gameplayContainer)
        this.layoutManager.addTableuIndicators(this.gameScene, this.gameplayContainer)

        this.pileManager.distributeCardsToPiles(this.deck);
        // this.pileManager.distributeCardsToPilesEndGame(this.deck)

        this.layoutManager.layoutTableauPiles(this.pileManager.getTableauPiles());
        this.layoutManager.layoutFoundationPiles(this.pileManager.getFoundationPiles());
        this.layoutManager.layoutStockPile(this.pileManager.getStockPile())



        UndoManager.getInstance().saveState(this.pileManager.getState())

    }
}
