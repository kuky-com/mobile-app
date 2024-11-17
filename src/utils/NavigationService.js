import * as React from "react";
import { StackActions, CommonActions } from "@react-navigation/native";
import { SendbirdCalls } from "@sendbird/calls-react-native";

export const isReadyRef = React.createRef();

export const navigationRef = React.createRef();

function navigate(name, params) {
  if (isReadyRef.current) {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute?.name === name) {
      navigationRef.current?.dispatch(StackActions.replace(name, params));
    } else {
      navigationRef.current?.navigate(name, params);
    }
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
      routes: [{ name: name, params: params }],
    }),
  );
}

const nav = {
  navigate,
  reset,
  push,
  goBack,
  replace,
  resetRaw,
};

function resetRaw(routes) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: routes.length - 1,
      key: null,
      routes: routes,
    }),
  );
}

export const RunAfterAppReady = (
  callback, //: (navigation: StaticNavigation<Routes, RouteWithParams>) => void,
) => {
  const id = setInterval(async () => {
    if (isReadyRef.current && SendbirdCalls.currentUser) {
      clearInterval(id);
      callback(nav);
    }
  }, 250);
};

export default nav;
