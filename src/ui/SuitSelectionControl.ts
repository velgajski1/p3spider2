import Phaser from "phaser";

export class SuitSelectionControl extends Phaser.GameObjects.Container
{
  private buttons: Phaser.GameObjects.Image[] = [];
  private selectedIndex: number = -1;
  public readonly events: Phaser.Events.EventEmitter;

  /**
   * @param scene The Phaser Scene.
   * @param x The x coordinate for the container.
   * @param y The y coordinate for the container.
   * @param currentSuitMode The currently selected suit mode.
   * @param horizontalSpacing The spacing between buttons horizontally (default: 81).
   * @param verticalSpacing The spacing between buttons vertically (default: 0).
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    currentSuitMode: number,
    horizontalSpacing: number = 81,
    verticalSpacing: number = 0
  )
  {
    super(scene, x, y);

    this.events = new Phaser.Events.EventEmitter();

    // Define the button keys.
    const buttonKeys = [
      { mode: 1, normal: "spider_1_suit", selected: "spider_1_suit_selected" },
      { mode: 2, normal: "spider_2_suits", selected: "spider_2_suits_selected" },
      { mode: 4, normal: "spider_4_suits", selected: "spider_4_suits_selected" },
    ];

    // Create buttons with the provided spacing.
    buttonKeys.forEach((key, index) =>
    {
      const posX = index * horizontalSpacing;
      const posY = index * verticalSpacing;
      const button = this.scene.add.image(posX, posY, key.normal);
      button.setInteractive({ useHandCursor: true });
      button.setData("index", index);
      button.setData("mode", key.mode);
      button.on("pointerdown", () => this.selectButton(index));
      this.add(button);
      this.buttons.push(button);
    });

    // Select the initial button if it exists.
    const initialIndex = buttonKeys.findIndex((key) => key.mode === currentSuitMode);
    if (initialIndex !== -1)
    {
      this.selectButton(initialIndex);
    }

    scene.add.existing(this);
  }

  private selectButton(index: number): void
  {
    // Reset the previously selected button, if any.
    if (this.selectedIndex !== -1)
    {
      const prevButton = this.buttons[this.selectedIndex];
      const prevKey = prevButton.texture.key.replace("_selected", "");
      prevButton.setTexture(prevKey);
    }

    // Set the newly selected button.
    const selectedButton = this.buttons[index];
    const selectedKey = selectedButton.texture.key + "_selected";
    selectedButton.setTexture(selectedKey);
    this.selectedIndex = index;

    const selectedMode = selectedButton.getData("mode");

    // Emit the "suitSelected" event.
    this.events.emit("suitSelected", selectedMode);
  }
}
