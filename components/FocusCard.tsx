import { StyleSheet, View } from "react-native";
import AppText from "./ui/AppText";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Task } from "@/models/task.model";
import { useEffect } from "react";
import { colors } from "@/utils/theme";

export default function FocusCard({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : completed / total;
  const tasksToComplete = tasks.filter((t) => t.status === "TODO");

  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withSpring(progress, {
      damping: 100,
      stiffness: 150,
    });
  }, [progress, progressAnim]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value * 100}%`,
    };
  });

  return (
    <View style={styles.focusCard}>
      <View style={styles.decorativeCircle} />
      <AppText weight="medium" color={colors.primary}>
        Today&apos;s Focus
      </AppText>
      <AppText weight="bold" variant="h2">
        {tasksToComplete.length > 0
          ? `You've got ${tasksToComplete.length} tasks to complete today.`
          : `You have no tasks to complete today.`}
      </AppText>
      <View style={styles.progressMeta}>
        <AppText variant="caption" color={colors.gray}>
          {completed} of {total} completed
        </AppText>
        <AppText variant="caption" color={colors.gray} weight="medium">
          {Math.round(progress * 100)}%
        </AppText>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            progressStyle,
            {
              backgroundColor: progress === 1 ? colors.green : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  focusCard: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    gap: 8,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  decorativeCircle: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryForeground,
    borderRadius: 99,
    position: "absolute",
    top: -6,
    right: -12,
    zIndex: -1,
  },
});
