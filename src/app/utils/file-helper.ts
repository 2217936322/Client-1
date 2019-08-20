import { Platform } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { downloadFile, DocumentDirectoryPath } from 'react-native-fs';
import _last from 'lodash/last';
import { requestExternalStoragePermission } from './android-permission-helper';

/**
 * 保存图片到本地相册
 * @param imageUrl 图片远程地址
 */
export async function saveImageToLocal(imageUrl: string): Promise<string> {
  console.log(`save image to local in ${Platform.OS}: ${imageUrl}`);
  if (Platform.OS === 'ios') {
    // TODO: 待实现。暂时不支持ios
    // https://reactnative.cn/docs/cameraroll.html
    console.warn('Not Support IOS yet');
    throw new Error('Not Support IOS yet');
  } else if (Platform.OS === 'android') {
    const pathname = _last(imageUrl.split('/'));
    const downloadDest = `${DocumentDirectoryPath}/${pathname}`;

    const res = await downloadFile({
      fromUrl: imageUrl,
      toFile: downloadDest,
      progress: (res) => {
        console.log(res.bytesWritten, res.contentLength);
      },
    }).promise;

    console.log('res', res);

    if (res && res.statusCode === 200) {
      const grant = await requestExternalStoragePermission();
      if (!grant) {
        throw new Error('Require External Storage Permission');
      }
      console.log('downloadDest', downloadDest);
      const uri = await CameraRoll.saveToCameraRoll('file://' + downloadDest);
      console.log('save to local', uri);
      return uri;
    } else {
      throw new Error('Download Image Failed');
    }
  } else {
    console.warn('Not Support OS Type');
    throw new Error('Not Support OS Type');
  }
}
