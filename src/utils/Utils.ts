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

// Whether to use the "tablet landscape" layout (board fills ~82% width, side button columns
// edge-pinned, their tops aligned with the stock/foundation row). Applies to all iPads in
// landscape, plus FULLSCREEN Android tablets in landscape — an Android UA WITHOUT "Mobile" is a
// tablet, not a phone. Kept separate from isTablet() so we don't disturb the fullscreen-forcing
// (isTablet() must stay false for Android tablets or the game stops forcing them fullscreen).
export function useTabletLandscapeLayout(scene: Phaser.Scene): boolean
{
    if (!scene.scale.isGameLandscape) return false;
    const os: any = scene.game.device.os;
    if (os.iPad) return true;
    if (os.android && scene.scale.isFullscreen && !/Mobile/i.test(navigator.userAgent)) return true;
    return false;
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
