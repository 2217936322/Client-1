import React from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  Button,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { Icon, Carousel, Modal } from '@ant-design/react-native';
import sb from 'react-native-style-block';
import ImagePicker from 'react-native-image-picker';
import Emoji from 'react-native-emoji';
import FastImage from 'react-native-fast-image';
import { TInput, TIcon } from '../components/TComponent';
import config from '../../../config/project.config';
import {
  sendMsg,
  addUserEmotionCatalogWithSecretSignal,
} from '../../redux/actions/chat';
import { getUserInfoCache } from '../../shared/utils/cacheHelper';
import dateHelper from '../../shared/utils/dateHelper';
import ExtraPanelItem from '../components/ExtraPanelItem';
import { toNetwork } from '../../shared/utils/imageUploader';
import { toTemporary } from '../../shared/utils/uploadHelper';
import { emojiMap, emojiCatalog, unemojify } from '../utils/emoji';
import _get from 'lodash/get';
import _chunk from 'lodash/chunk';

import MessageHandler from '../components/messageTypes/__all__';

import styled from 'styled-components/native';

const EXTRA_PANEL_HEIGHT = 220; // 额外面板高度
const EMOJI_PANEL_HEIGHT = 190; // 表情面板高度

const ActionBtn = styled.TouchableOpacity`
  align-self: stretch;
  justify-content: center;
  margin-horizontal: 3;
`;

const EmoticonPanel = styled.View`
  height: ${EMOJI_PANEL_HEIGHT};
  background-color: white;
  border-top-width: 1px;
  border-top-color: #ccc;
`;

const ExtraPanel = styled.View`
  height: ${EXTRA_PANEL_HEIGHT};
  background-color: white;
  border-top-width: 1px;
  border-top-color: #ccc;
`;

const EmotionCarousel = styled(Carousel)`
  height: ${EMOJI_PANEL_HEIGHT - 35};
`;

const EmoticonCatalog = styled.View`
  height: 35px;
  flex-direction: row;
  border-top-width: 0.5;
  border-top-color: #eee;
  padding: 0 10px;
`;

const EmoticonCatalogItem = styled.TouchableOpacity`
  padding: 0 10px;
  border-right-width: 0.5px;
  border-right-color: #eee;
  background-color: ${(props) => (props.isSelected ? '#ccc' : 'white')};
  justify-content: center;
`;

const EmotionPageView = styled.View`
  flex-direction: column;
  height: ${EMOJI_PANEL_HEIGHT - 35 - 30};
`;

const EmojiPageRow = styled.View`
  flex-direction: row;
  padding: 0 10px;
  height: ${100 / 3}%;
`;

const EmojiItem = styled.TouchableOpacity`
  width: ${100 / 7}%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const EmojiText = styled.Text`
  text-align: center;
  font-size: 18;
  color: #333;
`;

const EmotionPageRow = styled.View`
  flex-direction: row;
  padding: 0 10px;
  height: ${100 / 2}%;
`;

const EmotionItem = styled.TouchableOpacity`
  width: ${100 / 4}%;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding: 2px;
`;

const EmotionItemImage = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

class ChatScreen extends React.Component {
  static navigationOptions = (props) => {
    const navigation = props.navigation;
    const { state, setParams } = navigation;
    const { params } = state;
    return {
      headerRight: (
        <View style={{ marginRight: 10 }}>
          <TIcon
            icon="&#xe607;"
            style={{ fontSize: 26 }}
            onPress={() => params.headerRightFunc && params.headerRightFunc()}
          />
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      inputMsg: '',
      showExtraPanel: false,
      showEmoticonPanel: false,
      isKeyboardShow: false,
      selectedEmotionCatalog: emojiCatalog[0],
    };
  }

  componentDidMount() {
    const converseType = this.props.navigation.getParam('type', 'user');
    this.props.navigation.setParams({
      headerRightFunc: () => {
        if (converseType === 'user') {
          this.props.navigation.navigate(
            'Profile',
            this.props.navigation.state.params
          );
        } else {
          this.props.navigation.navigate(
            'GroupProfile',
            this.props.navigation.state.params
          );
        }
      },
    });
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        this.setState({ isKeyboardShow: true });
        this._scrollToBottom.bind(this);
      }
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        this.setState({ isKeyboardShow: false });
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.msgList.size !== this.props.msgList.size) {
      this._scrollToBottom();
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  dismissAll() {
    Keyboard.dismiss();
    this.setState({
      showExtraPanel: false,
      showEmoticonPanel: false,
    });
  }

  /**
   * 向服务器发送信息
   * @param {string} message 要发送的文本
   */
  sendMsg(message) {
    const uuid = this.props.navigation.getParam('uuid', '');
    const converseType = this.props.navigation.getParam('type', 'user');
    if (!!message) {
      // this.props.onSendMsg(message, type);
      if (!!uuid) {
        message = unemojify(message); // 转成标准文本

        let payload = {
          message,
          type: 'normal',
          is_public: false,
          is_group: false,
        };

        if (converseType === 'user' || converseType === 'system') {
          this.props.dispatch(sendMsg(uuid, payload));
        } else if (converseType === 'group') {
          payload.converse_uuid = uuid;
          payload.is_public = true;
          payload.is_group = true;
          this.props.dispatch(sendMsg(null, payload));
        }
      }
    } else {
      console.warn('require message to send');
    }
  }

  _scrollToBottom() {
    setTimeout(() => {
      this.refs.list && this.refs.list.scrollToIndex({ index: 0 }); // 因为使用了inverted属性因此滚到底部对于list的逻辑是滚到顶部
    }, 130);
  }

  _handleFocus() {
    // 输入框focus时收起所有面板
    this.setState({
      showExtraPanel: false,
      showEmoticonPanel: false,
    });
  }

  _handleSendMsg() {
    let message = this.state.inputMsg.trim();
    if (!!message) {
      this.sendMsg(message);
      this.setState({ inputMsg: '' });
    }
  }

  // 显示表情面板
  _handleShowEmoticonPanel() {
    if (this.state.showEmoticonPanel === true) {
      this.setState({ showEmoticonPanel: false, showExtraPanel: false });
      this.refs['input'].focus();
    } else {
      this.setState({ showEmoticonPanel: true, showExtraPanel: false });
      this.refs['input'].blur();
    }
  }

  // 显示额外面板
  _handleShowExtraPanel() {
    if (this.state.showExtraPanel === true) {
      this.setState({ showExtraPanel: false, showEmoticonPanel: false });
      this.refs['input'].focus();
    } else {
      this.setState({ showExtraPanel: true, showEmoticonPanel: false });
      this.refs['input'].blur();
    }
  }

  /**
   * 额外面板的发送图片功能
   */
  _handleSendImage() {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        allowsEditing: true,
        maxWidth: 1200,
        maxHeight: 1200,
      },
      (response) => {
        this.dismissAll();

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          const selfUUID = this.props.selfUUID;
          const file = {
            uri: response.uri,
            type: response.type,
            name: response.fileName,
          };

          // TODO: 上传到sm.ms
          // toNetwork(this.props.selfUUID, file).then((res) => {
          //   console.log('res', res);
          // });

          // TODO: 暂时先放在服务器上，看看为什么smms不能正常上传(会返回403)
          toTemporary(selfUUID, file, {
            onProgress: (percent) => {
              console.log('percent', percent);
            },
            onCompleted: (res) => {
              // TODO: 待完善: 在聊天界面显示loading
              // 上传完毕。发送图片
              const upload_url = res.upload_url;
              const imageUrl = config.file.getAbsolutePath(upload_url);
              const message = `[img]${imageUrl}[/img]`;

              console.log('message', message);
              this.sendMsg(message);
            },
          });
        }
      }
    );
  }

  /**
   * 点击增加表情包功能
   */
  _handleAddEmotionCatalog() {
    Modal.operation([
      {
        text: '暗号',
        onPress: () => {
          // 打开输入框
          Modal.prompt('表情包暗号', '请输入暗号，大小写任意', (message) => {
            this.props.dispatch(addUserEmotionCatalogWithSecretSignal(message));
          });
        },
      },
    ]);
  }

  // 表情面板的渲染函数
  getEmotionPanel() {
    const selectedEmotionCatalog = this.state.selectedEmotionCatalog;
    const isEmoji = Object.keys(emojiMap).includes(selectedEmotionCatalog); // 监测是否为emoji表情

    // 返回当前页的emoji表情列表
    const getEmojiPage = () => {
      const emojis = _get(emojiMap, selectedEmotionCatalog, []).map(
        ({ name, code }, index) => {
          return (
            <EmojiItem
              key={name + index}
              onPress={() => {
                // 增加到输入框
                const newMsg = this.state.inputMsg + code;
                this.setState({ inputMsg: newMsg });
              }}
            >
              <EmojiText>
                <Emoji name={name} />
              </EmojiText>
            </EmojiItem>
          );
        }
      );

      const rowNum = 3;
      const colNum = 7;
      const emojiPages = _chunk(emojis, rowNum * colNum);

      return emojiPages.map((emojiPage, index) => {
        const rows = _chunk(emojiPage, colNum);

        return (
          <EmotionPageView key={selectedEmotionCatalog + index}>
            {rows.map((emojis, i) => (
              <EmojiPageRow key={i}>{emojis}</EmojiPageRow>
            ))}
          </EmotionPageView>
        );
      });
    };

    // 返回当前页的表情包
    const getEmotionPage = () => {
      // 该表情包下所有表情
      const items = this.props.emotionCatalog
        .find((catalog) => catalog.get('uuid') === selectedEmotionCatalog)
        .get('items')
        .toJS();

      const rowNum = 2;
      const colNum = 4;
      const pages = _chunk(items, rowNum * colNum);

      return pages.map((page, index) => {
        const rows = _chunk(page, colNum);

        return (
          <EmotionPageView key={selectedEmotionCatalog + index}>
            {rows.map((items, i) => (
              <EmotionPageRow key={i}>
                {items.map((item, _i) => {
                  const imageUrl = config.file.getAbsolutePath(item.url);

                  return (
                    <EmotionItem
                      key={_i}
                      onPress={() => this.sendMsg(`[img]${imageUrl}[/img]`)}
                    >
                      <EmotionItemImage
                        source={{ uri: imageUrl }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    </EmotionItem>
                  );
                })}
              </EmotionPageRow>
            ))}
          </EmotionPageView>
        );
      });
    };

    return (
      <EmoticonPanel>
        <EmotionCarousel>
          {isEmoji ? getEmojiPage() : getEmotionPage()}
        </EmotionCarousel>
        <EmoticonCatalog>
          <EmoticonCatalogItem onPress={() => this._handleAddEmotionCatalog()}>
            <EmojiText>
              <Text>+</Text>
            </EmojiText>
          </EmoticonCatalogItem>
          {/* emoji表情包 */}
          {emojiCatalog.map((catalog) => {
            const { name, code } = _get(emojiMap, [catalog, 0]); // 取目录第一个表情作为目录图标

            return (
              <EmoticonCatalogItem
                key={catalog + name}
                isSelected={this.state.selectedEmotionCatalog === catalog}
                onPress={() =>
                  this.setState({ selectedEmotionCatalog: catalog })
                }
              >
                <EmojiText>
                  <Emoji name={name} />
                </EmojiText>
              </EmoticonCatalogItem>
            );
          })}
          {/* 自定义表情包 */}
          {this.props.emotionCatalog.map((catalog) => {
            const catalogUUID = catalog.get('uuid');

            return (
              <EmoticonCatalogItem
                key={catalogUUID}
                isSelected={this.state.selectedEmotionCatalog === catalogUUID}
                onPress={() =>
                  this.setState({ selectedEmotionCatalog: catalogUUID })
                }
              >
                <Icon name="star" color="#999" />
              </EmoticonCatalogItem>
            );
          })}
        </EmoticonCatalog>
      </EmoticonPanel>
    );
  }

  // 额外面板的渲染函数
  getExtraPanel() {
    return (
      <ExtraPanel>
        <ExtraPanelItem
          text="发送图片"
          icon="&#xe621;"
          onPress={() => this._handleSendImage()}
        />
      </ExtraPanel>
    );
  }

  render() {
    if (this.props.msgList) {
      let msgList = this.props.msgList.reverse().toJS();

      return (
        <View style={styles.container}>
          <FlatList
            style={styles.list}
            ref="list"
            data={msgList}
            inverted={true}
            keyExtractor={(item, index) => item.uuid + '#' + index}
            onTouchStart={() => this.dismissAll()}
            renderItem={({ item, index }) => {
              // 因为列表是倒转的。所以第一条数据是最下面那条
              // UI中的上一条数据应为msgList的下一条
              const prevDate =
                index < msgList.length - 1
                  ? _get(msgList, [index + 1, 'date'])
                  : 0;
              let isMe = item.sender_uuid === this.props.selfInfo.get('uuid');
              let senderInfo = isMe
                ? this.props.selfInfo
                : getUserInfoCache(item.sender_uuid);
              let name =
                senderInfo.get('nickname') || senderInfo.get('username');
              let avatar = senderInfo.get('avatar');
              let defaultAvatar =
                item.sender_uuid === 'trpgsystem'
                  ? config.defaultImg.trpgsystem
                  : config.defaultImg.getUser(name);
              let date = item.date;

              let diffTime = dateHelper.getDateDiff(prevDate, date);
              let emphasizeTime = diffTime / 1000 / 60 >= 10; // 超过10分钟

              return (
                <MessageHandler
                  key={item.uuid}
                  type={item.type}
                  me={isMe}
                  name={name}
                  avatar={avatar || defaultAvatar}
                  emphasizeTime={emphasizeTime}
                  info={item}
                />
              );
            }}
          />
          <View style={styles.msgBox}>
            <TInput
              ref="input"
              style={styles.msgInput}
              onChangeText={(inputMsg) => this.setState({ inputMsg })}
              onFocus={() => this._handleFocus()}
              multiline={true}
              maxLength={100}
              value={this.state.inputMsg}
            />
            <ActionBtn onPress={() => this._handleShowEmoticonPanel()}>
              <Icon name="smile" size={26} />
            </ActionBtn>
            {this.state.inputMsg ? (
              <ActionBtn onPress={() => this._handleSendMsg()}>
                <Text style={{ textAlign: 'center' }}>{'发送'}</Text>
              </ActionBtn>
            ) : (
              <ActionBtn onPress={() => this._handleShowExtraPanel()}>
                <Icon name="plus-circle" size={26} />
              </ActionBtn>
            )}
          </View>
          {this.state.showEmoticonPanel &&
            !this.state.showExtraPanel &&
            !this.state.isKeyboardShow &&
            this.getEmotionPanel()}
          {this.state.showExtraPanel &&
            !this.state.showEmoticonPanel &&
            !this.state.isKeyboardShow &&
            this.getExtraPanel()}
        </View>
      );
    } else {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }
  }
}

const styles = {
  container: [sb.flex()],
  list: [sb.flex()],
  msgBox: [sb.padding(6, 12), sb.bgColor(), sb.direction()],
  msgInput: [
    sb.size(null, 35),
    sb.padding(4, 6),
    // sb.border('Bottom', 1, '#ccc'),
    sb.flex(),
    { marginRight: 4 },
  ],
  extraPanel: [sb.size(null, 265), sb.bgColor(), sb.border('Top', 0.5, '#ccc')],
};

export default connect((state) => {
  let selectedConversesUUID = state.getIn(['chat', 'selectedConversesUUID']);
  let msgList = state.getIn([
    'chat',
    'converses',
    selectedConversesUUID,
    'msgList',
  ]);

  return {
    selectedConversesUUID,
    selfInfo: state.getIn(['user', 'info']),
    selfUUID: state.getIn(['user', 'info', 'uuid']),
    msgList: msgList && msgList.sortBy((item) => item.get('date')),
    usercache: state.getIn(['cache', 'user']),
    emotionCatalog: state.getIn(['chat', 'emotions', 'catalogs'], []),
  };
})(ChatScreen);
