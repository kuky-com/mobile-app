import * as React from 'react';
import {StackActions, CommonActions} from '@react-navigation/native';

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

function navigate(name, params) {
  if (isReadyRef.current && navigationRef.current) {
    // Perform navigation if the app has mounted
    navigationRef.current.navigate(name, params);
  } else {
    // You can decide what to do if the app hasn't mounted
    // You can ignore this, or add these actions to a queue you can call later
  }
}

function push(...args) {
  navigationRef.current?.dispatch(StackActions.push(...args));
}

function replace(...args) {
  navigationRef.current?.dispatch(StackActions.replace(...args));
}

function goBack() {
  navigationRef.current?.dispatch(StackActions.pop());
}

function reset(name, params) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      key: null,
      routes: [{name: name, params: params}],
    }),
  );
}

export default {
  navigate,
  reset,
  push,
  goBack,
  replace
};
