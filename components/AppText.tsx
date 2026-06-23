import React from "react";
import { Text, TextProps } from "react-native";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "bodySmall"
  | "caption";

type Weight = "regular" | "medium" | "bold";

type Props = TextProps & {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  center?: boolean;
  children: React.ReactNode;
};

export default function AppText({
  variant = "body",
  weight = "regular",
  color = "#000",
  center = false,
  style,
  children,
  ...props
}: Props) {
  const fontSize = {
    display: 40,
    h1: 32,
    h2: 28,
    h3: 24,

    title: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
    overline: 10,
  };

  const fontFamily = {
    regular: "regular",
    medium: "medium",
    bold: "bold",
  };

  return (
    <Text
      {...props}
      style={[
        {
          fontSize: fontSize[variant],
          fontFamily: fontFamily[weight],
          color,
          textAlign: center ? "center" : "left",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
