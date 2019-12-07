import BaseCard from './BaseCard';
import { connect, DispatchProp } from 'react-redux';
import {
  agreeGroupRequest,
  refuseGroupRequest,
} from '@shared/redux/actions/group';
import { TRPGState } from '@redux/types/__all__';
import { MessageProps } from '@shared/components/MessageHandler';
import _isNil from 'lodash';

interface Props extends MessageProps, DispatchProp<any> {
  groups: any;
}

// 入团申请
class GroupRequest extends BaseCard<Props> {
  getCardBtn() {
    let info = this.props.info;
    let data = info.data;
    let chatlogUUID = info.uuid;
    let requestUUID = data.requestUUID;
    let groupUUID = data.groupUUID;
    let fromUUID = data.fromUUID;
    let group = this.props.groups.find((g) => g.get('uuid') === groupUUID);
    if (!_isNil(group)) {
      if (group.get('group_members', []).includes(fromUUID)) {
        return [{ label: '已同意' }];
      } else if (data.is_processed) {
        return [{ label: '已处理' }]; // TODO: 需要服务端主动更新
      } else {
        return [
          {
            label: '同意',
            onClick: () =>
              this.props.dispatch(
                agreeGroupRequest(chatlogUUID, requestUUID, fromUUID)
              ),
          },
          {
            label: '拒绝',
            onClick: () =>
              this.props.dispatch(refuseGroupRequest(chatlogUUID, requestUUID)),
          },
        ];
      }
    } else {
      return [{ label: '数据异常' }];
    }
  }
}

export default connect((state: TRPGState) => ({
  groups: state.getIn(['group', 'groups']),
}))(GroupRequest);
