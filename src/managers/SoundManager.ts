export class SoundManager
{
    private static _instance: SoundManager;
    private static _scene: Phaser.Scene;

    public cardToFoundation: Phaser.Sound.BaseSound;
    public click: Phaser.Sound.BaseSound;
    public dealCards: Phaser.Sound.BaseSound;
    public end3: Phaser.Sound.BaseSound;
    public flipBackToStock: Phaser.Sound.BaseSound;
    public grabCard: Phaser.Sound.BaseSound;
    public hint: Phaser.Sound.BaseSound;
    public invalid: Phaser.Sound.BaseSound;
    public noHint: Phaser.Sound.BaseSound;
    public silence: Phaser.Sound.BaseSound;
    public undo: Phaser.Sound.BaseSound;
    public valid: Phaser.Sound.BaseSound;
    public won: Phaser.Sound.BaseSound;
    test: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    dealMultiple: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    private constructor() { }

    public static init(scene: Phaser.Scene): void
    {
        if (!SoundManager._instance)
        {
            SoundManager._instance = new SoundManager();
            SoundManager._scene = scene;
            SoundManager._instance.loadSounds();
        }
    }

    public static get instance(): SoundManager
    {
        if (!SoundManager._instance)
        {
            throw new Error("SoundManager is not initialized. Call SoundManager.init(scene) first.");
        }
        return SoundManager._instance;
    }

    private loadSounds(): void
    {
        this.cardToFoundation = SoundManager._scene.sound.add('card_to_foundation');
        this.click = SoundManager._scene.sound.add('click');
        this.dealCards = SoundManager._scene.sound.add('deal_cards');
        this.end3 = SoundManager._scene.sound.add('end_3');
        this.flipBackToStock = SoundManager._scene.sound.add('flip_back_to_stock');
        this.grabCard = SoundManager._scene.sound.add('grab_card');
        this.hint = SoundManager._scene.sound.add('hint');
        this.invalid = SoundManager._scene.sound.add('invalid');
        this.noHint = SoundManager._scene.sound.add('no_hint');
        this.silence = SoundManager._scene.sound.add('silence', {
            loop: true
        });
        // this.test = SoundManager._scene.sound.add('test', {
        //     loop:true
        // });
        this.undo = SoundManager._scene.sound.add('undo');
        this.valid = SoundManager._scene.sound.add('valid');
        this.won = SoundManager._scene.sound.add('won');
        this.dealMultiple = SoundManager._scene.sound.add('deal-multiple-cards');
    }
}
