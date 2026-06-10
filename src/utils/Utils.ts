// utils.ts
export function formatTime(seconds: number, format: 'hh:mm:ss' | 'mm:ss' = 'mm:ss'): string
{
    const pad = (num: number, size: number) => num.toString().padStart(size, '0');

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (format === 'hh:mm:ss')
    {
        return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}`;
    } else
    {
        // If the total time is more than 1 hour, include hours in mm:ss format.
        const totalMinutes = minutes + hours * 60;
        return `${pad(totalMinutes, 2)}:${pad(secs, 2)}`;
    }
}

export function getTweensForObject(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): Phaser.Tweens.Tween[]
{
    if (scene)
    {
        const tweenManager = scene.tweens;
        return tweenManager.getTweensOf(target)
    } else
    {
        return [];
    }

}
