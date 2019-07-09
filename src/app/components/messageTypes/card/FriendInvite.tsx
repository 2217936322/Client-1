import BaseCard, { BaseCardProps } from './BaseCard';
import { connect, DispatchProp } from 'react-redux';
const {
  agreeFriendInvite,
  refuseFriendInvite,
} = require('../../../../redux/actions/user');

// 好友邀请
interface Props extends BaseCardProps, DispatchProp<any> {
  friendRequests: any;
  friendList: any;
}
class FriendInvite extends BaseCard<Props> {
  getCardBtn() {
    let info = this.props.info;
    let data = info.data;
    let invite = data.invite || {};
    let inviteIndex = this.props.friendRequests.findIndex(
      (item) => item.get('uuid') === invite.uuid
    );
    if (inviteIndex >= 0) {
      // 尚未处理
      return [
        {
          label: '拒绝',
          onClick: () => this.props.dispatch(refuseFriendInvite(invite.uuid)),
        },
        {
          label: '同意',
          onClick: () => this.props.dispatch(agreeFriendInvite(invite.uuid)),
        },
      ];
    } else {
      let friendIndex = this.props.friendList.indexOf(invite.from_uuid);
      if (friendIndex >= 0) {
        // 已同意是好友
        return [{ label: '已同意' }];
      } else {
        // 已拒绝好友邀请
        return [{ label: '已拒绝' }];
      }
    }
  }
}

export default connect((state: any) => ({
  friendList: state.getIn(['user', 'friendList']),
  friendRequests: state.getIn(['user', 'friendRequests']),
}))(FriendInvite);