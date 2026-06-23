import { Task } from "@/models/task.model";
import { colors } from "@/utils/theme";
import { CheckCircle, CalendarDays, Trash2 } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "./AppButton";
import AppText from "./AppText";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
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

  if (!task) return null;

  const isDone = task.status === "COMPLETED";

  const formattedDate = task.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const accentColor = (colors[task.color] as string) ?? colors.primary;

  const handleMarkDone = () => {
    onMarkDone(task.id);
  };

  const handleDelete = () => {
    onDelete(task.id);
    requestAnimationFrame(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <AppText weight="bold">Task Details</AppText>
            <View style={{ width: 68 }} />
          </View>

          <View style={styles.content}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: accentColor + "18",
                },
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  {
                    backgroundColor: accentColor,
                  },
                ]}
              />

              <AppText weight="bold" style={[{ color: accentColor }]}>
                {isDone ? "Completed" : "To Do"}
              </AppText>
            </View>

            <AppText weight="bold" style={styles.taskTitle}>
              {task.title}
            </AppText>

            <View style={styles.metaItem}>
              <CalendarDays size={14} color={colors.gray} />
              <AppText style={styles.metaText}>Created {formattedDate}</AppText>
            </View>

            <View style={styles.divider} />

            <AppText weight="bold" style={styles.descHeading}>
              Description
            </AppText>
            <ScrollView
              showsVerticalScrollIndicator
              style={{
                maxHeight: 300,
              }}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,30,39,0.4)",
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
