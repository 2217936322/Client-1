import { Position, Size } from '../core/types';
import { DrawContext } from '../core/render';
import _isNumber from 'lodash/isNumber';
import _inRange from 'lodash/inRange';

/**
 * 棋子
 * 原则上来说棋子在画布上的大小必须为网格整数倍
 */
export class Token {
  gridPosition: Position = { x: 0, y: 0 }; // 网格坐标, 0 0 表示网格左上角
  gridAreaSize: Size = { width: 1, height: 1 }; // 当前Token所占据的网格数 所有的Token默认都是1x1 不得为0或负数

  constructor(public name: string) {}

  /**
   * 准备
   * 当外层增加token时会检查token是否准备完毕
   */
  async prepare(): Promise<void> {}

  draw(ctx: DrawContext) {
    throw new Error('Should be Implement');
  }

  /**
   * 判定一个网格点是否在当前Token内部
   */
  checkPosInside(gridPos: Position): boolean {
    return false;
  }
}

export class ImageToken extends Token {
  imageSize: Size; // 图片的实际大小
  private _image: HTMLImageElement;
  private _promise: Promise<HTMLImageElement>;
  loaded: boolean = false;

  constructor(name: string, public imageSrc: string) {
    super(name);

    this._promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        this.imageSize = {
          width: _isNumber(image.width) ? image.width : 100,
          height: _isNumber(image.height) ? image.height : 100,
        };
        this.loaded = true;

        resolve(image);
      };
      image.onerror = () => {
        console.error('[ImageToken]', '加载失败:', this.imageSrc);

        reject();
      };
      this._image = image;
    });
  }

  get promise() {
    return this._promise;
  }

  async prepare(): Promise<void> {
    await Promise.resolve(this._promise);
  }

  draw(ctx: DrawContext) {
    if (!this.loaded) {
      return;
    }

    const { gridSize } = ctx;

    ctx.render.canvas.drawImage(
      this._image,
      this.gridPosition.x * gridSize.width,
      this.gridPosition.y * gridSize.height,
      this.gridAreaSize.width * gridSize.width,
      this.gridAreaSize.height * gridSize.height
    );
  }

  checkPosInside(gridPos: Position): boolean {
    if (this.gridAreaSize.width === 0 || this.gridAreaSize.height === 0) {
      // 如果占用面积不存在则直接返回false
      return false;
    }

    if (
      _inRange(
        gridPos.x,
        this.gridPosition.x,
        this.gridPosition.x + this.gridAreaSize.width
      ) &&
      _inRange(
        gridPos.y,
        this.gridPosition.y,
        this.gridPosition.y + this.gridAreaSize.height
      )
    ) {
      return true;
    }

    return false;
  }
}