import React, { useContext, useMemo } from 'react';
import { MsgListType } from '@redux/types/chat';
import bbcodeParser from '@shared/components/bbcode/parser';
import _get from 'lodash/get';
import _invoke from 'lodash/invoke';
import _flatten from 'lodash/flatten';

interface MsgListContextType {
  msgList: MsgListType;
}

export const MsgListContext = React.createContext<MsgListContextType>({
  msgList: [],
});

/**
 * 提供一个上下文管理消息列表
 */
type MsgListContextProviderProps = MsgListContextType;
export const MsgListContextProvider: React.FC<MsgListContextProviderProps> = React.memo(
  (props) => {
    return (
      <MsgListContext.Provider value={props}>
        {props.children}
      </MsgListContext.Provider>
    );
  }
);

/**
 * 获取当前聊天列表所有聊天记录
 */
export const useMsgList = (): MsgListType => {
  const { msgList } = useContext(MsgListContext);

  return msgList ?? [];
};

/**
 * 获取当前聊天列表的所有图片的url列表
 */
export const useMsgListImageUrls = (): string[] => {
  const msgList = useMsgList();

  const imageUrls = useMemo(() => {
    const urls: string[][] = msgList
      .map((item) => bbcodeParser.parse(item.message))
      .filter((nodes) => nodes.find((node) => _get(node, 'tag') === 'img'))
      .map((nodes) => {
        return nodes.map((node) => _invoke(node, 'content.join', ''));
      });
    return _flatten(urls);
  }, [msgList]);

  return imageUrls;
};