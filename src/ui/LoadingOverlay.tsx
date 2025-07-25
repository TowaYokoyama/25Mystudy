// src/components/ui/LoadingOverlay.tsx

import React from 'react';
import { View, ActivityIndicator, Modal, Text } from 'react-native';
import tw from 'twrnc';

interface Props {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = '読み込み中...' }: Props) {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-60`}>
        <View style={tw`bg-gray-900 p-8 rounded-2xl items-center`}>
          <ActivityIndicator size="large" color={tw.color('orange-500')} />
          <Text style={[tw`text-white mt-4`, { fontFamily: 'RobotoSlab-Regular' }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}