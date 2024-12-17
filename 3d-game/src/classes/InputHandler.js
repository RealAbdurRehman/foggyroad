export class InputHandler {
  constructor(camera, elements, init) {
    this.keys = [];
    this.init = init;
    this.camera = camera;
    this.elements = elements;
    window.addEventListener("keydown", ({ code }) => {
      if (
        (code === "KeyW" ||
          code === "KeyS" ||
          code === "KeyA" ||
          code === "KeyD") &&
        !this.keys.includes(code)
      )
        this.keys.push(code);
    });
    window.addEventListener("keyup", ({ code }) => {
      if (
        code === "KeyW" ||
        code === "KeyS" ||
        code === "KeyA" ||
        code === "KeyD"
      )
        this.keys.splice(this.keys.indexOf(code), 1);
    });
    this.elements.startGameBtn.addEventListener("click", () => {
      this.elements.startGameEl.style.display = "none";
      this.elements.stats.style.display = "block";
      this.init();
    });
    this.elements.restartGameBtn.addEventListener("click", () => {
      this.elements.restartGameEl.style.display = "none";
      this.elements.stats.style.display = "block";
      this.init();
    });
  }
}