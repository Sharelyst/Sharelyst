import React, { useContext } from 'react';
import { View } from 'react-native';
import { ConnectionStatusContext } from '../contexts/ConnectionStatusContext';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useContext(ConnectionStatusContext);
  const color = isConnected ? '#22c55e' : '#ef4444'; // green or red

  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: color,
        borderWidth: 2,
        borderColor: '#fff',
        position: 'absolute',
        top: 48,
        right: 48,
        zIndex: 100,
      }}
      accessibilityLabel={isConnected ? 'Connected' : 'Disconnected'}
    />
  );
};
