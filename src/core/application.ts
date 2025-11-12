import { Renderer } from "../renderer/renderer";

export class Application {
  label: string;
  renderer: Renderer;
  running: boolean;

  private constructor(label: string, renderer: Renderer) {
    this.label = label;
    this.renderer = renderer;
    this.running = true;
  }

  static async create(label: string): Promise<Application> {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const renderer = await Renderer.create(canvas);
    function resizeCallback() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setViewport(width, height);
    }
    window.addEventListener("resize", resizeCallback)

    return new Application(label, renderer);
  }

  setOnDraw(drawFunc: (deltaTime: number) => void) {
    this.renderer.onDraw = drawFunc;
  }

  run() {
    let lastFameTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;

      const delta = (now - lastFameTime)/ 1000;
      lastFameTime = now;
      this.renderer.onDraw(delta);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
