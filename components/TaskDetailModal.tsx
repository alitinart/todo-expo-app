import { Task } from "@/models/task.model";
import { colors } from "@/utils/theme";
import { CheckCircle, CalendarDays, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "./AppButton";
import AppText from "./AppText";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskDetailModal({
  visible,
  task,
  onClose,
  onMarkDone,
  onDelete,
}: TaskDetailModalProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);

  const isDone = task.status === "COMPLETED";
  const formattedDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const accentColor = task.color;

  const translateY = useSharedValue(500);
  const opacity = useSharedValue(0);

  const closeModal = () => {
    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(500, { duration: 220 }, () => {
      runOnJS(setMounted)(false);
      runOnJS(onClose)();
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!mounted) return;

      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (!mounted) return;

      const shouldClose = event.translationY > 120 || event.velocityY > 800;

      if (shouldClose) {
        scheduleOnRN(closeModal);
      } else {
        translateY.value = withSpring(0, {
          damping: 100,
          stiffness: 200,
        });
      }
    });

  useEffect(() => {
    let cancelled = false;

    if (visible) {
      setMounted(true);

      requestAnimationFrame(() => {
        if (cancelled) return;

        opacity.value = withTiming(1, { duration: 220 });
        translateY.value = withSpring(0, {
          damping: 22,
          stiffness: 220,
          mass: 0.9,
        });
      });
    } else if (mounted) {
      closeModal();
    }

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleMarkDone = () => onMarkDone(task.id);

  const handleDelete = () => {
    onDelete(task.id);
    requestAnimationFrame(() => {
      closeModal();
    });
  };

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
      </Animated.View>

      <Animated.View style={[styles.modalContainer, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <AppText weight="bold">Task Details</AppText>
              <View style={{ width: 68 }} />
            </View>

            <View style={styles.content}>
              <View
                style={[styles.badge, { backgroundColor: accentColor + "18" }]}
              >
                <View
                  style={[styles.badgeDot, { backgroundColor: accentColor }]}
                />
                <AppText style={{ color: accentColor }} weight="bold">
                  {isDone ? "Completed" : "To Do"}
                </AppText>
              </View>

              <AppText weight="bold" style={styles.taskTitle}>
                {task.title}
              </AppText>

              <View style={styles.metaItem}>
                <CalendarDays size={14} color={colors.gray} />
                <AppText style={styles.metaText}>
                  Created {formattedDate}
                </AppText>
              </View>

              <View style={styles.divider} />

              <AppText weight="bold" style={styles.descHeading}>
                Description
              </AppText>

              <ScrollView
                showsVerticalScrollIndicator
                style={{ maxHeight: 300 }}
              >
                <AppText>
                  {task.description || "No description provided."}
                </AppText>
              </ScrollView>

              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <AppButton
                    leftIcon={<CheckCircle size={18} color="#fff" />}
                    title={isDone ? "Mark as To Do" : "Mark as Done"}
                    onPress={handleMarkDone}
                    variant={isDone ? "primary" : "success"}
                  />
                </View>

                <Pressable style={styles.deleteIcon} onPress={handleDelete}>
                  <Trash2 size={18} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#f3faff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 20,
    backgroundColor: "#c6c5d3",
    alignSelf: "center",
    marginTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  metaItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  metaText: {
    color: colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.muted,
  },
  descHeading: {
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  deleteIcon: {
    backgroundColor: "#ffdad6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 14,
  },
});
