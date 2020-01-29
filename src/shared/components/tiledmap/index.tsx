import React, { useRef, useEffect } from 'react';
import { TiledMapManager } from './core/manager';
import './index.less';
import { ImageToken } from './layer/token';

export const TiledMap: React.FC = React.memo((props) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const manager = useRef<TiledMapManager>(null);

  useEffect(() => {
    const tiledMapManager = new TiledMapManager(canvasRef.current, {
      size: {
        width: 20,
        height: 15,
      },
      gridSize: {
        width: 40,
        height: 40,
      },
    });

    // ------------ test ------------
    const layer = tiledMapManager.addLayer('人物');
    const image = new Image();
    image.src =
      'https://dss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=2807058697,2434741312&fm=58';
    image.onload = function() {
      const testToken = new ImageToken('测试人物', image);
      testToken.position = {
        x: 110,
        y: 110,
      };
      tiledMapManager.addToken('人物', testToken);
    };

    const layer2 = tiledMapManager.addLayer('背景');
    layer2.index = -1; // 应在人物下面
    const image2 = new Image();
    image2.src = 'https://www.dytt8.net/images/m.jpg';
    image2.onload = function() {
      const testToken = new ImageToken('测试背景', image2);
      testToken.position = {
        x: 50,
        y: 50,
      };
      tiledMapManager.addToken('背景', testToken);
    };

    // ------------ test ------------

    manager.current = tiledMapManager;
  }, []);

  return (
    <div className="tiledmap">
      <canvas ref={canvasRef}>请使用现代浏览器打开本页面</canvas>
    </div>
  );
});
TiledMap.displayName = 'TiledMap';
