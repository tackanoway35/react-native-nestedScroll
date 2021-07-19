import React, { PureComponent } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const { height: heightDevice } = Dimensions.get("window");

export default class NestedScroll extends PureComponent {
  constructor(props) {
    super(props);
    this._scrollChildTrans = new Animated.Value(heightDevice);
    this._scrollValue = this.props.scrollValue || new Animated.Value(0);
    this.heightNestedChild = "100%";

    this.state = { isOnNested: true, heightContent: 0 };
  }

  // #region define scroll handle

  onTouchNestedChild = this.onTouchNestedChild.bind(this);
  onTouchNestedChild() {
    this.setState({
      isOnNested: true
    });
  }

  onTouchScrollChild = this.onTouchScrollChild.bind(this);
  onTouchScrollChild() {
    this.setState({
      isOnNested: false
    });
  }

  setRef = this.setRef.bind(this);
  setRef(sef) {
    this._scroll = sef;
  }

  // #endregion

  show() {
    this.snapToTop();
    this.setState(
      {
        isOnNested: false
      },
      () => {
        Animated.timing(this._scrollChildTrans, {
          toValue: 0,
          duration: 300,
          easing: Easing.linear
        }).start();
      }
    );
  }
  hide() {
    this.snapToMiddle();
    Animated.timing(this._scrollChildTrans, {
      toValue: heightDevice,
      duration: 300,
      easing: Easing.linear
    }).start();
  }

  getChildren() {
    const children = [];
    const nestedChild = [];
    const scrollChild = [];
    React.Children.forEach(this.props.children, child => {
      if (child.props.isNested) {
        if (child.props.needProps) {
          nestedChild.push(
            React.cloneElement(child, {
              scrollValue: this._scrollValue,
              heightContent: this.state.heightContent,
              scrollChildTrans: this._scrollChildTrans
            })
          );
        } else {
          nestedChild.push(child);
        }
      } else if (child.props.isScroll) {
        if (child.props.needProps) {
          scrollChild.push(
            React.cloneElement(child, {
              scrollValue: this._scrollValue,
              heightContent: this.state.heightContent,
              scrollChildTrans: this._scrollChildTrans
            })
          );
        } else {
          scrollChild.push(child);
        }
      } else if (child.props.needProps) {
        children.push(
          React.cloneElement(child, {
            scrollValue: this._scrollValue,
            heightContent: this.state.heightContent,
            scrollChildTrans: this._scrollChildTrans
          })
        );
      } else {
        children.push(child);
      }
    });

    return { children, nestedChild, scrollChild };
  }

  onContentLayout = this.onContentLayout.bind(this);
  onContentLayout(e) {
    const { height } = e.nativeEvent.layout;
    this.setState({
      heightContent: height
    });
  }

  onScrollEndDrag = this.onScrollEndDrag.bind(this);
  onScrollEndDrag(e) {
    const { y } = e.nativeEvent.contentOffset;
    const midderPoint = this.getMidderPoint();
    if (y >= midderPoint || y <= 0) return;

    const isMoveUp = y > (this.preDrag || 0);
    this.preDrag = y;
    if (isMoveUp) {
      this.snapToTop();
    } else {
      this.snapToMiddle();
    }
  }

  snapToTop() {
    if (this._scroll) {
      const midderPoint = this.state.heightContent / 2;
      this.preDrag = midderPoint;
      this._scroll.getNode().scrollTo({ y: midderPoint });
    }
  }

  snapToMiddle() {
    if (this._scroll) {
      this.preDrag = 0;
      this._scroll.getNode().scrollTo({ y: 0 });
    }
  }

  getMidderPoint() {
    const { spaceTop = 0 } = this.props;
    return this.state.heightContent / 2 + spaceTop;
  }

  getHeightNested() {
    const midderHeight = this.getMidderPoint();
    const isShowed = !this._scrollChildTrans._value;
    return isShowed ? midderHeight : this.state.heightContent;
  }

  render() {
    const { children, nestedChild, scrollChild } = this.getChildren();
    const midderPoint = this.getMidderPoint();
    return (
      <React.Fragment>
        {children}
        <Animated.ScrollView
          onLayout={this.onContentLayout}
          ref={this.setRef}
          scrollEnabled={!this.state.isOnNested}
          onScrollEndDrag={this.onScrollEndDrag}
          showsVerticalScrollIndicator={false}
          style={[styles.container, this.props.style]}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: { y: this._scrollValue }
                }
              }
            ],
            {
              useNativeDriver: true // <- Native Driver used for animated events
            }
          )}
        >
          <Animated.View
            onTouchStart={this.onTouchNestedChild}
            onTouchEnd={this.onTouchScrollChild}
            style={[
              styles.nestedStyle,
              {
                height: this.getHeightNested(),
                transform: [{ translateY: this._scrollValue }]
              }
            ]}
          >
            {nestedChild}
          </Animated.View>

          <Animated.View
            onTouchStart={this.onTouchScrollChild}
            pointerEvents="box-none"
            style={{
              transform: [{ translateY: this._scrollChildTrans }]
            }}
          >
            <View style={{ height: midderPoint }} pointerEvents="none" />
            <View style={{ minHeight: this.state.heightContent }}>
              {scrollChild}
            </View>
          </Animated.View>
        </Animated.ScrollView>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nestedStyle: {
    position: "absolute",
    width: "100%"
  }
});
