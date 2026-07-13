// Web stand-in for react-native-maps, which has no web implementation.
// Renders a flat panel so map-based screens stay browsable in the browser.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = ({ children, style, onMapReady, ...rest }) => {
  useEffect(() => {
    if (onMapReady) onMapReady();
  }, []);
  return (
    <View style={[styles.map, style]} {...rest}>
      <Text style={styles.label}>Map preview unavailable on web</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#dfe8df',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  label: {
    color: '#5f6f63',
    fontSize: 12,
  },
});

export default MapView;
export const Marker = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
