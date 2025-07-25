// src/components/ui/CustomAlert.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import tw from 'twrnc';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAlertStore } from '../stores/alertStore'; // 後で作成するストア

export default function CustomAlert() {
  const { isVisible, title, message, buttons, hideAlert } = useAlertStore();

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={hideAlert}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-70`}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={tw`bg-gray-900 p-6 rounded-2xl w-11/12 max-w-sm`}>
          <Text style={[tw`text-white text-xl text-center mb-2`, { fontFamily: 'RobotoSlab-Bold' }]}>
            {title}
          </Text>
          <Text style={[tw`text-gray-400 text-base text-center mb-6`, { fontFamily: 'RobotoSlab-Regular' }]}>
            {message}
          </Text>
          <View style={tw`flex-row justify-end`}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (button.onPress) {
                    button.onPress();
                  }
                  hideAlert();
                }}
                style={[
                  tw`px-4 py-2 rounded-lg ml-2`,
                  button.style === 'destructive' ? tw`bg-red-600` :
                  button.style === 'cancel' ? tw`bg-gray-700` : tw`bg-orange-600`
                ]}
              >
                <Text style={[tw`text-white font-bold`, { fontFamily: 'RobotoSlab-Bold' }]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}