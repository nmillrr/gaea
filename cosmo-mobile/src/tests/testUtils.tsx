import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import authReducer from '../store/slices/authSlice';
import feedReducer from '../store/slices/feedSlice';
import captureReducer from '../store/slices/captureSlice';
import photosReducer from '../store/slices/photosSlice';
import guessesReducer from '../store/slices/guessesSlice';
import userReducer from '../store/slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  feed: feedReducer,
  capture: captureReducer,
  photos: photosReducer,
  guesses: guessesReducer,
  user: userReducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;

/** Per-slice partial state, merged over each slice's real initial state. */
export type PreloadedSlices = {
  [K in keyof TestRootState]?: Partial<TestRootState[K]>;
};

export function makeTestStore(preloaded: PreloadedSlices = {}) {
  const initial = rootReducer(undefined, { type: '@@INIT' });
  const preloadedState = Object.fromEntries(
    (Object.keys(initial) as Array<keyof TestRootState>).map((key) => [
      key,
      { ...initial[key], ...(preloaded[key] ?? {}) },
    ])
  ) as TestRootState;

  return configureStore({ reducer: rootReducer, preloadedState });
}

/** Render a screen wrapped in the redux Provider and a NavigationContainer. */
export function renderWithProviders(
  ui: React.ReactElement,
  preloaded: PreloadedSlices = {}
) {
  const store = makeTestStore(preloaded);
  return render(
    <Provider store={store}>
      <NavigationContainer>{ui}</NavigationContainer>
    </Provider>
  );
}

/** Minimal navigation prop for screens rendered outside a real navigator. */
export const createMockNavigation = (): any => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
});

export const createMockRoute = (name: string, params: object = {}): any => ({
  key: `${name}-test`,
  name,
  params,
});
