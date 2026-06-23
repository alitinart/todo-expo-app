import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";

import AppText from "./AppText";
import { colors } from "@/utils/theme";

type Variant = "primary" | "secondary" | "inverted" | "outlined";

type Props = {
  title: string;
  onPress?: () => void;

  variant?: Variant;

  loading?: boolean;
  disabled?: boolean;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  fullWidth?: boolean;

  style?: StyleProp<ViewStyle>;
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
}: Props) {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      textColor: "#FFFFFF",
    },

    secondary: {
      backgroundColor: "#E8F0F2",
      borderColor: "#E8F0F2",
      textColor: colors.neutral,
    },

    inverted: {
      backgroundColor: colors.neutral,
      borderColor: colors.neutral,
      textColor: "#FFFFFF",
    },

    outlined: {
      backgroundColor: "transparent",
      borderColor: "#A7B0B7",
      textColor: colors.neutral,
    },
  };

  const current = variants[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: 8,

          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",

          borderWidth: 1.5,
          borderColor: current.borderColor,

          backgroundColor: current.backgroundColor,

          paddingHorizontal: 20,
          paddingVertical: 15,

          opacity: disabled ? 0.5 : 1,

          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={current.textColor} />
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {leftIcon && (
            <View
              style={{
                marginRight: 8,
              }}
            >
              {leftIcon}
            </View>
          )}

          <AppText
            weight="medium"
            style={{
              color: current.textColor,
            }}
          >
            {title}
          </AppText>

          {rightIcon && (
            <View
              style={{
                marginLeft: 8,
              }}
            >
              {rightIcon}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
