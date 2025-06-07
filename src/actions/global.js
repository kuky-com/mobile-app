import { atom, createStore } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAtom = createStore();

export const deviceIdAtom = atom(null)

export const pushTokenAtom = atom(null)

export const notiCounterAtom = atom(0)

export const totalMessageCounterAtom = atom({})
export const totalMessageUnreadAtom = atom(0)

export const totalOtherMessageCounterAtom = atom({})
export const totalOtherMessageUnreadAtom = atom(0)

export const totalSupportMessageCounterAtom = atom({})
export const totalSupportMessageUnreadAtom = atom(0)

export const sampleProfileViewAtom = atom(0)

export const linkingUrlAtom = atom(null)

export const storage = createJSONStorage(() => AsyncStorage);

export const tokenAtom = atomWithStorage(
    'tokenAtom',
    undefined,
    storage,
);

export const userAtom = atomWithStorage(
    'userAtom',
    undefined,
    storage,
);
