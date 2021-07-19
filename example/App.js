import React, {Component} from 'react';
import {View, FlatList, Text, TouchableOpacity} from 'react-native';
import NestedScroll from 'react-native-nestedScroll';
import _ from 'lodash';

export default class App extends Component {
  state = {
    data: _.range(20),
  };

  componentDidMount() {
    setTimeout(() => {
      console.info('dcm');
      this._nestedScroll.show();
    }, 3000);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <NestedScroll ref={sef => (this._nestedScroll = sef)} spaceTop={100}>
          <View
            style={{
              width: '100%',
              height: 100,
              backgroundColor: 'gray',
            }}
          />

          <View
            style={{
              width: '100%',
              height: 1000,
              backgroundColor: 'red',
            }}
            isScroll>
            <TouchableOpacity
              onPress={() => this._nestedScroll.hide()}
              style={{width: '100%', flex: 1}}
            />
          </View>

          <View
            style={{
              width: '100%',
              flex: 1,
            }}
            isNested>
            <FlatList
              data={this.state.data}
              renderItem={({item}) => (
                <View
                  style={{
                    width: '100%',
                    height: 50,
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>{item}</Text>
                </View>
              )}></FlatList>
          </View>
        </NestedScroll>
      </View>
    );
  }
}
