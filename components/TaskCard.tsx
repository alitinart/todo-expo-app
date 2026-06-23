import { Task } from "@/models/task.model";
import { StyleSheet, View, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import AppText from "./ui/AppText";
import { colors } from "@/utils/theme";
import * as ICONS from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

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
  const accent = color;
  const isCompleted = status === "COMPLETED";

  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0.5);
  const checkOpacity = useSharedValue(isCompleted ? 1 : 0);
  const progress = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    const value = isCompleted ? 1 : 0;

    progress.value = withTiming(value, { duration: 250 });
    checkScale.value = withSpring(value, {
      damping: 100,
      stiffness: 500,
    });
    checkOpacity.value = withTiming(value, { duration: 150 });
  }, [status]);

  const handlePress = () => {
    scale.value = withTiming(0.98, { duration: 80 }, () => {
      scale.value = withTiming(1, { duration: 120 });
    });

    const next = isCompleted ? 0 : 1;

    progress.value = withTiming(next, { duration: 250 });
    checkScale.value = withSpring(next, {
      damping: 100,
      stiffness: 500,
    });
    checkOpacity.value = withTiming(next, { duration: 150 });

    onToggleComplete?.(id);
  };

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", colors.green],
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.muted, colors.green],
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, wrapperStyle]}>
      <View style={styles.infoWrapper}>
        <View style={[styles.iconWrapper, { backgroundColor: accent }]}>
          <Icon color={colors.white} size={30} />
        </View>

        <View style={{ gap: 2 }}>
          <AppText weight="medium">{title}</AppText>
          <AppText variant="caption" color={colors.gray}>
            Created {formatDistanceToNow(createdAt, { addSuffix: true })}
          </AppText>
        </View>
      </View>

      <Pressable onPress={handlePress} hitSlop={8}>
        <Animated.View style={[styles.statusIndicatorWrapper, indicatorStyle]}>
          <Animated.View style={checkStyle}>
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
