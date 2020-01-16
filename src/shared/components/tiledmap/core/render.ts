import { Size, Position, TiledMapOptions } from './types';

export class TiledMapRender {
  private ctx: CanvasRenderingContext2D;
  public position: Position = { x: 0, y: 0 };
  private _originOptions?: TiledMapOptions;

  constructor(private el: HTMLCanvasElement, public options: TiledMapOptions) {
    this.ctx = el.getContext('2d');

    this.init();
    this.draw();
  }

  getCanvasSize(): Size {
    const options = this.options;
    return {
      width: options.size.width * options.gridSize.width,
      height: options.size.height * options.gridSize.height,
    };
  }

  /**
   * 初始化元素的一些基本信息与全局配置
   */
  init() {
    const el = this.el;
    const options = this.options;
    const ratio = options.ratio;

    el.style.cursor = 'all-scroll';
    this.ctx.scale(ratio, ratio);

    const canvasSize = this.getCanvasSize();
    el.width = canvasSize.width * ratio;
    el.height = canvasSize.height * ratio;

    // 设置canvas实际尺寸为渲染面积一半大小
    // el.style.transform = `scale(${1 / ratio})`;
    // el.style.transformOrigin = '0 0';
    el.style.width = canvasSize.width + 'px';
    el.style.height = canvasSize.height + 'px';

    this.resetOptionSize();
  }

  /**
   * 将options的数据根据ratio进行缩放
   */
  resetOptionSize() {
    const options = this.options;
    this._originOptions = options;
    const { ratio, size, gridSize, axis } = options;

    this.options = {
      ...this.options,
      size: {
        width: size.width,
        height: size.height,
      },
      gridSize: {
        width: gridSize.width * ratio,
        height: gridSize.height * ratio,
      },
      axis: {
        padding: {
          x: axis.padding.x * ratio,
          y: axis.padding.y * ratio,
        },
      },
    };
  }

  /**
   * 渲染所有的图形
   */
  draw() {
    this.clear();
    this.resetTranslate();

    this.drawGrid();
    this.drawAxis();
  }

  /**
   * 绘制网格
   */
  drawGrid() {
    const ctx = this.ctx;
    const interval = this.options.gridSize;
    const { width, height } = this.options.size;
    const canvasSize = this.getCanvasSize();

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0, xi = 0; xi <= width; x = x + interval.width, xi++) {
      if (xi === width) {
        // 使绘制的最后一条线往前走1px使其能在屏幕内
        x--;
      }

      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }

    for (let y = 0, yi = 0; yi <= height; y = y + interval.height, yi++) {
      if (yi === height) {
        // 使绘制的最后一条线往前走1px使其能在屏幕内
        y--;
      }

      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  }

  /**
   * 绘制坐标轴标识
   */
  drawAxis() {
    const ctx = this.ctx;
    const interval = this.options.gridSize;
    const { width, height } = this.options.size;
    const padding = this.options.axis.padding;

    const fontSize = 18;

    ctx.font = `${fontSize}px '微软雅黑'`;
    ctx.fillStyle = '#cccccc';
    ctx.lineWidth = 1;

    const windowRelativePos = this.getWindowRelativePosition();

    for (let x = 0, xi = 1; xi <= width; x = x + interval.width, xi++) {
      // x轴
      const text = String(xi);
      const { width: textWidth } = ctx.measureText(text);
      const offsetX = -textWidth / 2 + interval.width / 2; // 左边相对移动距离

      ctx.fillText(
        text,
        x + offsetX,
        windowRelativePos.y < -padding.y
          ? 0 - padding.y
          : windowRelativePos.y + fontSize
      );
    }

    for (let y = 0, yi = 1; yi <= height; y = y + interval.height, yi++) {
      // y轴
      const text = String(yi);
      const { width: textWidth } = ctx.measureText(text);
      const offsetY = fontSize / 2 + interval.height / 2; // 上下相对移动距离

      ctx.fillText(
        text,
        windowRelativePos.x < -padding.x
          ? -textWidth - padding.x
          : windowRelativePos.x,
        y + offsetY
      );
    }
  }

  /**
   * 获取在实际窗口上左上角的坐标
   */
  getWindowRelativePosition(): Position {
    const pos = this.position;
    return {
      x: -pos.x,
      y: -pos.y,
    };
  }

  setPosition(pos: Position) {
    this.position = pos;
  }

  // 设置变换为程序定义的(0, 0)坐标
  resetTranslate() {
    const { x, y } = this.position;
    this.ctx.resetTransform();
    this.ctx.translate(x + 0.5, y + 0.5); // 增加0.5以保证线绘制点不在边上
  }

  // 清除画布
  clear() {
    this.el.width = this.el.width; // 使用触发dom重绘来清除画布。更加暴力
  }
}