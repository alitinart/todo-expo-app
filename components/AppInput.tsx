import { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import AppText from "./AppText";
import { colors } from "@/utils/theme";

interface AppInputProps extends TextInputProps {
  label?: string;
  textarea?: boolean;
  numberOfLines?: number;
}

export default function AppInput({
  label,
  style,
  textarea = false,
  numberOfLines = 4,
  ...props
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <AppText style={styles.label}>{label}</AppText>}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          textarea && styles.textarea,
          style,
        ]}
        placeholderTextColor={colors.muted}
        multiline={textarea}
        numberOfLines={textarea ? numberOfLines : undefined}
        textAlignVertical={textarea ? "top" : "center"}
        scrollEnabled={textarea}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontFamily: "medium",
    color: "#1A2332",
  },
  input: {
    backgroundColor: colors.primaryForeground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: "#1A2332",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#A8C4E8",
    backgroundColor: "#E2EDF8",
  },
  textarea: {
    minHeight: 120,
    paddingTop: 14,
  },
});
