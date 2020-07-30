import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

export const Button = styled.span<{
  active?: boolean;
  reversed?: boolean;
}>`
  cursor: pointer;
  color: ${(props) =>
    props.reversed
      ? props.active
        ? 'white'
        : '#aaa'
      : props.active
      ? 'black'
      : '#ccc'};
`;

export const Menu = styled.div`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 1px 18px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`;