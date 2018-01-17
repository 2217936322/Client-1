const React = require('react');
const { connect } = require('react-redux');
const {
  View,
  Text,
  ListView,
} = require('react-native');
const { NavigationActions } = require('react-navigation');
const sb = require('react-native-style-block');
const ConvItem = require('../components/ConvItem');

class HomeScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'TRPG',
    headerTitle: 'TRPG',
    tabBarIcon: ({ tintColor }) => (
      <Text style={{fontFamily:'iconfont', fontSize: 26, color: tintColor}}>&#xe648;</Text>
    ),
  };

  render() {
    let arr = [];
    for (var i = 0; i < 100; i++) {
      arr[i] = {
        name: "用户" + Math.random(),
        time: '10:27',
        uuid: '',
        msg: '最近消息',
        avatar: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1881776517,987084327&fm=27&gp=0.jpg',
      }
    }
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let items = ds.cloneWithRows(arr);

    return (
      <View>
        <ListView
          style={styles.convList}
          dataSource={items}
          renderRow={(rowData) => (
            <ConvItem
              name={rowData.name}
              time={rowData.time}
              msg={rowData.msg}
              avatar={rowData.avatar}
              onPress={() => {
                this.props.dispatch(NavigationActions.navigate({ routeName: 'Chat', params: {name: rowData.name} }));
              }}
            />
          )}
        />
      </View>
    )
  }
}

const styles = {
  convList: [
    sb.bgColor(),
    // sb.size('100%', 400),
  ]
}

module.exports = connect()(HomeScreen);
