import { useEffect, useLayoutEffect } from "react";

export const useEffectAsync = (asyncEffect, deps) => {
  useEffect(createAsyncEffectCallback(asyncEffect), deps);
};

export const useLayoutEffectAsync = (asyncEffect, deps) => {
  useLayoutEffect(createAsyncEffectCallback(asyncEffect), deps);
};

export const useIIFE = (callback) => {
  return iife(callback);
};

const iife = (callback) => callback();

const createAsyncEffectCallback = (asyncEffect) => () => {
  const destructor = iife(asyncEffect);
  return () => {
    if (!destructor) return;

    if (destructor instanceof Promise) {
      iife(async () => {
        const awaitedDestructor = await destructor;
        if (awaitedDestructor) awaitedDestructor();
      });
    } else {
      iife(destructor);
    }
  };
};
