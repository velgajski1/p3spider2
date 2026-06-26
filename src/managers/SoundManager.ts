export class SoundManager
{
    private static _instance: SoundManager;
    private static _scene: Phaser.Scene;

    public cardToFoundation: Phaser.Sound.BaseSound;
    public cardsToTableau: Phaser.Sound.BaseSound;
    public clearSequence: Phaser.Sound.BaseSound;
    public hint: Phaser.Sound.BaseSound;
    public invalid: Phaser.Sound.BaseSound;
    public noHint: Phaser.Sound.BaseSound;
    public prompt: Phaser.Sound.BaseSound;
    public silence: Phaser.Sound.BaseSound;
    public undo: Phaser.Sound.BaseSound;
    public valid: Phaser.Sound.BaseSound;
    public won: Phaser.Sound.BaseSound;

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
        this.cardsToTableau = SoundManager._scene.sound.add('cards_to_tableau');
        this.clearSequence = SoundManager._scene.sound.add('clear_sequence');
        this.hint = SoundManager._scene.sound.add('hint');
        this.invalid = SoundManager._scene.sound.add('invalid');
        this.noHint = SoundManager._scene.sound.add('no_hint');
        this.prompt = SoundManager._scene.sound.add('prompt');
        this.silence = SoundManager._scene.sound.add('silence', {
            loop: true
        });
        this.undo = SoundManager._scene.sound.add('undo');
        this.valid = SoundManager._scene.sound.add('valid');
        this.won = SoundManager._scene.sound.add('won');
    }
}
