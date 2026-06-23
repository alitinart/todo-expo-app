import { Task } from "@/models/task.model";
import { StyleSheet, View, Pressable, Animated } from "react-native";
import { Check } from "lucide-react-native";
import AppText from "./AppText";
import { colors } from "@/utils/theme";
import * as ICONS from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { useRef } from "react";

interface TaskCardProps extends Task {
  onToggleComplete?: (id: string) => void;
}

export default function TaskCard({
  id,
  icon,
  title,
  color,
  status,
  createdAt,
  onToggleComplete,
}: TaskCardProps) {
  const Icon: any = { ...ICONS }[icon] || ICONS.LayoutList;
  const accent = colors[color] || colors.primary;
  const isCompleted = status === "COMPLETED";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(isCompleted ? 1 : 0.01)).current;
  const checkOpacity = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const bgColorAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }),
    ]).start();

    if (!isCompleted) {
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 15,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bgColorAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 0,
        }),
        Animated.timing(checkOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bgColorAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }

    onToggleComplete?.(id);
  };

  const interpolatedBg = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.green],
  });

  const interpolatedBorder = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted, colors.green],
  });

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles.infoWrapper}>
        <View style={[styles.iconWrapper, { backgroundColor: accent }]}>
          <Icon color={colors.white} size={30} />
        </View>
        <View style={{ gap: 2 }}>
          <AppText>{title}</AppText>
          <AppText variant="caption" color={colors.gray}>
            Created {formatDistanceToNow(createdAt, { addSuffix: true })}
          </AppText>
        </View>
      </View>

      <Pressable onPress={handlePress} hitSlop={8}>
        <Animated.View
          style={[
            styles.statusIndicatorWrapper,
            {
              backgroundColor: interpolatedBg,
              borderColor: interpolatedBorder,
            },
          ]}
        >
          <Animated.View
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            style={{
              transform: [{ scale: checkScale }],
              opacity: checkOpacity,
            }}
          >
            <Check size={16} strokeWidth={3} color={colors.white} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  infoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    padding: 24,
    borderRadius: 12,
  },
  statusIndicatorWrapper: {
    borderWidth: 2,
    borderRadius: 100,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
