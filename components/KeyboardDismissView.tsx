import React from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from "react-native";

export default function KeyboardDismissView({ children, ...props }: ViewProps) {
  return (
    <TouchableWithoutFeedback
      style={{ zIndex: 0 }}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <View style={{ flex: 1 }} {...props}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}
