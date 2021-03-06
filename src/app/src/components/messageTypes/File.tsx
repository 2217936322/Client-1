import React from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { TButton } from '../TComponent';
import sb from 'react-native-style-block';
import Base from './Base';
import filesize from 'filesize';
import config from '../../../../shared/project.config';
import appConfig from '../../config.app';

class File extends Base {
  handlePreview() {
    const data = this.props.info.data;
    const fileuuid = data.fileuuid;
    // TODO: 等待实现
  }

  handleDownload() {
    const data = this.props.info.data;
    const fileuuid = data.fileuuid;
    // TODO: 等待实现
  }

  handleClick() {
    const data = this.props.info.data;
    const fileuuid = data.fileuuid;
    // TODO: 等待实现
    alert('打开文件页');
  }

  getContent() {
    const info = this.props.info;
    const data = info.data;
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => this.handleClick()}
      >
        <View style={styles.fileInfo}>
          <Image
            style={styles.fileImage}
            source={appConfig.file.getFileImage(data.ext)}
          />
          <View style={styles.fileProps}>
            <Text style={styles.fileName} numberOfLines={1}>
              {data.originalname}
            </Text>
            <Text style={styles.fileSize}>{filesize(data.size)}</Text>
          </View>
        </View>
        {data.progress !== 1 ? (
          <View style={{ width: data.progress * 100 + '%' }} />
        ) : null}
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: [{ width: 180 }, sb.padding(4, 2)],
  fileInfo: [sb.direction()],
  fileImage: [sb.size(50, 50), sb.radius(3), { marginRight: 8 }],
  fileProps: [sb.flex()],
  fileName: [{ marginBottom: 10, marginTop: 2 }],
  fileSize: [sb.font(14), sb.color('#ccc')],
};

export default connect()(File as any);
