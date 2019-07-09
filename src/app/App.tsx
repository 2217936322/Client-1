import React from 'react';
import configureStore from '../redux/configureStore';
import navReducer from './redux/reducers/nav';
const store = configureStore({
  additionReducer: {
    nav: navReducer,
  },
} as any);
import { AppWithNavigationState } from './router';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { injectLoginSuccessCallback } from '../shared/utils/inject';
import { init as initNotify, bindInfo, tryLocalNotify } from './notify';
import codePush from 'react-native-code-push';
import appConfig from './config.app';

require('../shared/utils/cacheHelper').attachStore(store);

import * as trpgApi from '../api/trpg.api';
const api = trpgApi.getInstance();
trpgApi.bindEventFunc.call(api, store, {
  onReceiveMessage(messageData) {
    tryLocalNotify(messageData);
  },
});

initNotify();
injectLoginSuccessCallback(() => {
  // 登录成功
  const userUUID = store.getState().getIn(['user', 'info', 'uuid']);
  bindInfo(userUUID);
});

// token登录
import rnStorage from '../api/rn-storage.api';
(async () => {
  console.log('读取本地存储的token...');
  let uuid = await rnStorage.get('uuid');
  let token = await rnStorage.get('token');
  console.log('uuid:', uuid, 'token:', token);
  if (!!token && !!uuid) {
    console.log('尝试登陆uuid:', uuid);
    store.dispatch(
      require('../redux/actions/user').loginWithToken(uuid, token)
    );
  }
})();

class App extends React.Component {
  render() {
    return (
      <ReduxProvider store={store}>
        <AntdProvider>
          <AppWithNavigationState />
        </AntdProvider>
      </ReduxProvider>
    );
  }
}

let out = App;
if (appConfig.codePush.enabled) {
  out = codePush(appConfig.codePush.options)(App);
}

export default out;