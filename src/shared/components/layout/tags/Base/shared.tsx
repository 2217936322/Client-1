import React from 'react';
import { TagComponent } from '../type';
import { useLayoutChildren } from '../../hooks/useLayoutChildren';
import { normalizeTagName } from '../utils';
import styled from 'styled-components';
import { Row } from 'antd';

// defined from facebook/react/packages/react-dom/src/shared/voidElementTags.js
// https://github.com/facebook/react/blob/b0657fde6a/packages/react-dom/src/shared/voidElementTags.js
export const voidElementTags = [
  'menuitem',
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export const blacklistTags = [
  'script',
  'style',
  'meta',
  'head',
  'body',
  'html',
];

export const TagBaseShared: TagComponent = React.memo((props) => {
  const tagName = props._name;
  let childrens = useLayoutChildren(props);

  if (blacklistTags.includes(tagName)) {
    return null;
  }

  if (voidElementTags.includes(tagName)) {
    childrens = undefined;
  }

  const Tag = normalizeTagName(tagName);

  if (Tag === React.Fragment) {
    return React.createElement(Tag, { key: props.key }, childrens);
  }
  return React.createElement(Tag, props, childrens);
});
TagBaseShared.displayName = 'TagBaseShared';

export const BaseTypeRow = styled(Row)`
  margin-bottom: 0.5rem;

  /* &:last-child {
    margin-bottom: 0;
  } */
`;
