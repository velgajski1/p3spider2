export class TimerManager
{
  private static activeTimer?: Phaser.Time.TimerEvent;
  private static sceneRef?: Phaser.Scene;

  /**
   * Initialize the TimerManager with a scene reference.
   * Call this once during the scene setup.
   */
  public static initialize(scene: Phaser.Scene): void
  {
    TimerManager.sceneRef = scene;
  }

  /**
   * Sets a new timer, canceling any existing timer.
   * @param delay - Delay in milliseconds.
   * @param callback - The callback function to execute.
   * @param context - The context (`this`) for the callback function.
   */
  public static setTimer(delay: number, callback: () => void, context: any): void
  {
    if (!TimerManager.sceneRef)
    {
      console.warn("TimerManager is not initialized with a scene.");
      return;
    }

    // Cancel the existing timer, if any
    if (TimerManager.activeTimer)
    {
      TimerManager.activeTimer.remove(false);
    }

    // Set a new timer
    TimerManager.activeTimer = TimerManager.sceneRef.time.delayedCall(
      delay,
      callback,
      undefined,
      context
    );
  }

  /**
   * Cancels the active timer.
   */
  public static cancelTimer(): void
  {
    if (TimerManager.activeTimer)
    {
      TimerManager.activeTimer.remove(false);
      TimerManager.activeTimer = undefined;
    }
  }
}
