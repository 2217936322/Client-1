import React from 'react';
import { connect } from 'react-redux';
import { List, WingBlank, WhiteSpace } from '@ant-design/react-native';
import { View, ScrollView } from 'react-native';
import { TButton } from '../components/TComponent';
import { TRPGState, TRPGDispatchProp } from '@src/shared/redux/types/__all__';
import {
  showAlert,
  hideAlert,
  showModal,
  hideModal,
} from '@src/shared/redux/actions/ui';
import {
  switchSelectGroup,
  quitGroup,
  changeSelectGroupActor,
  dismissGroup,
  sendGroupInviteBatch,
} from '@src/shared/redux/actions/group';
import { getCachedUserName } from '@src/shared/utils/cache-helper';
import _get from 'lodash/get';
import _without from 'lodash/without';
import _isEmpty from 'lodash/isEmpty';
import TModalPanel from '../components/TComponent/TModalPanel';
import TPicker from '../components/TComponent/TPicker';
import {
  selectUser,
  backToTop,
  switchNav,
  navPortal,
} from '../redux/actions/nav';
import { GroupStateGroupsItem } from '@src/shared/redux/types/group';
import { Map } from 'immutable';
import { NavigationScreenProps } from 'react-navigation';
import { GroupDataParams } from '../types/params';

const ListItem = List.Item;

interface Props
  extends TRPGDispatchProp,
    NavigationScreenProps<GroupDataParams> {
  userUUID: string;
  groupInfo: GroupStateGroupsItem;
  selfGroupActors: any;
  selectedGroupActorUUID: string;
  selectedGroupUUID: string;
  friendList: string[];
}
class GroupDataScreen extends React.Component<Props> {
  state = {
    isMsgTop: false,
  };

  get isGroupOwner(): boolean {
    const { userUUID, groupInfo } = this.props;
    return userUUID === groupInfo.get('owner_uuid');
  }

  /**
   * 查看历史消息
   */
  handleViewHistory = () => {
    // TODO: 待实现
    alert('未实现');
  };

  /**
   * 显示团角色列表
   */
  handleShowGroupActor = () => {
    const { dispatch, selectedGroupUUID } = this.props;

    dispatch(navPortal(`/group/${selectedGroupUUID}/actor/list`));
  };

  /**
   * 切换选中角色
   */
  handleSelectGroupActor = () => {
    const {
      dispatch,
      selectedGroupUUID,
      selfGroupActors,
      selectedGroupActorUUID,
    } = this.props;
    let actorUUID = selectedGroupActorUUID;

    const options = [
      {
        value: null,
        label: '不选择',
      },
    ];
    if (selfGroupActors && selfGroupActors.size > 0) {
      options.push(
        ...selfGroupActors
          .map((item, index) => ({
            value: item.get('uuid'),
            label: item.getIn(['actor', 'name']),
          }))
          .toJS()
      );
    }

    dispatch(
      showModal(
        <TModalPanel
          onOk={() => {
            dispatch(changeSelectGroupActor(selectedGroupUUID, actorUUID));
            dispatch(hideModal());
          }}
        >
          <TPicker
            items={options}
            defaultValue={actorUUID}
            onValueChange={(val) => {
              actorUUID = val;
            }}
          />
        </TModalPanel>
      )
    );
  };

  /**
   * 切换是否消息置顶
   */
  handleSwitchMsgTop = (val: boolean) => {
    // TODO: 待实现
    this.setState({
      isMsgTop: val,
    });
  };

  /**
   * 显示团成员
   */
  handleShowMember = () => {
    this.props.dispatch(
      switchNav('GroupMember', {
        uuid: this.props.navigation.getParam('uuid'),
      })
    );
  };

  /**
   * 发送团邀请
   */
  handleGroupInvite = () => {
    // 选择好友
    const { friendList, groupInfo, dispatch } = this.props;
    const groupMembersList: string[] = groupInfo.get('group_members').toJS();
    const groupManagerList: string[] = groupInfo.get('managers_uuid').toJS();

    const target = _without(
      friendList,
      ...groupMembersList,
      ...groupManagerList
    );

    dispatch(
      selectUser(target, (uuids) => {
        dispatch(sendGroupInviteBatch(groupInfo.get('uuid'), uuids));
      })
    );
  };

  /**
   * 退出团
   */
  handleQuitGroup = () => {
    const { dispatch, groupInfo } = this.props;

    if (this.isGroupOwner) {
      // 解散团
      dispatch(
        showAlert({
          title: '是否要解散群',
          content: '一旦确定无法撤销',
          onConfirm: () => {
            dispatch(hideAlert());
            let groupUUID = groupInfo.get('uuid');
            dispatch(switchSelectGroup(''));
            dispatch(dismissGroup(groupUUID));
            dispatch(backToTop());
          },
        })
      );
    } else {
      dispatch(
        showAlert({
          title: '是否要退出群',
          content: '一旦确定无法撤销',
          onConfirm: () => {
            dispatch(hideAlert());
            let groupUUID = groupInfo.get('uuid');
            dispatch(switchSelectGroup(''));
            dispatch(quitGroup(groupUUID));
            dispatch(backToTop());
          },
        })
      );
    }
  };

  render() {
    const { isMsgTop } = this.state;
    const { groupInfo } = this.props;

    if (_isEmpty(groupInfo.toObject())) {
      return null;
    }

    const groupOwnerName = getCachedUserName(groupInfo.get('owner_uuid'));

    return (
      <ScrollView>
        <List renderHeader={'基本'}>
          <ListItem extra={groupOwnerName}>团主持人</ListItem>
          <ListItem extra={groupInfo.get('managers_uuid').size + '人'}>
            团管理
          </ListItem>
          <ListItem
            arrow="horizontal"
            extra={groupInfo.get('group_members').size + '人'}
            onPress={this.handleShowMember}
          >
            团成员
          </ListItem>
          <ListItem extra={groupInfo.get('group_actors').size + '张'}>
            团人物卡
          </ListItem>
          <ListItem extra={groupInfo.get('maps_uuid').size + '张'}>
            团地图
          </ListItem>
          <ListItem multipleLine extra={groupInfo.get('desc')}>
            简介
          </ListItem>

          {/* <ListItem onPress={this.handleViewHistory} arrow="horizontal">
            历史消息
          </ListItem> */}
        </List>
        <List renderHeader={'成员'}>
          <ListItem onPress={this.handleGroupInvite} arrow="horizontal">
            邀请好友
          </ListItem>
        </List>
        <List renderHeader={'角色'}>
          <ListItem onPress={this.handleShowGroupActor} arrow="horizontal">
            角色列表
          </ListItem>
          <ListItem onPress={this.handleSelectGroupActor} arrow="horizontal">
            选择角色
          </ListItem>
        </List>
        {/* <List renderHeader={'设置'}>
          <ListItem
            extra={
              <Switch
                value={isMsgTop}
                onValueChange={this.handleSwitchMsgTop}
              />
            }
          >
            消息置顶
          </ListItem>
          <ListItem
            extra={
              <Switch
                value={isMsgTop}
                onValueChange={this.handleSwitchMsgTop}
              />
            }
          >
            免打扰
          </ListItem>
        </List> */}
        <WhiteSpace size="lg" />
        <WingBlank>
          <TButton type="error" onPress={this.handleQuitGroup}>
            {this.isGroupOwner ? '解散本团' : '退出本团'}
          </TButton>
        </WingBlank>
      </ScrollView>
    );
  }
}

export default connect((state: TRPGState, ownProps: Props) => {
  const selectedGroupUUID = ownProps.navigation.getParam('uuid', '');

  const groupInfo =
    state
      .getIn(['group', 'groups'])
      .find((group) => group.get('uuid') === selectedGroupUUID) || Map();

  const selfActors = state
    .getIn(['actor', 'selfActors'])
    .map((i) => i.get('uuid'));

  const selfGroupActors = groupInfo
    .get('group_actors', [])
    .filter(
      (i) => i.get('enabled') && selfActors.indexOf(i.get('actor_uuid')) >= 0
    );

  const selectedGroupActorUUID = groupInfo.getIn([
    'extra',
    'selected_group_actor_uuid',
  ]);

  return {
    userUUID: state.getIn(['user', 'info', 'uuid']),
    usercache: state.getIn(['cache', 'user']),
    selectedGroupUUID,
    selfGroupActors,
    selectedGroupActorUUID,
    groupInfo,
    friendList: state.getIn(['user', 'friendList']).toJS(),
  };
})(GroupDataScreen);
