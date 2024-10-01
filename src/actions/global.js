import { atom, createStore } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAtom = createStore();

export const deviceIdAtom = atom(null)

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
