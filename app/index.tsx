import AddTaskButton from "@/components/AddTaskButton";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import KeyboardDismissView from "@/components/KeyboardDismissView";
import TaskCard from "@/components/TaskCard";
import TaskDetailModal from "@/components/TaskDetailModal";
import { Task } from "@/models/task.model";
import { colors, taskColors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Filter = "ALL" | "COMPLETED" | "TODO";

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    icon: "ChefHat",
    title: "Finish Dishes",
    color: "primary",
    description: "Finish the dishes before the meal is served.",
    status: "TODO",
    createdAt: new Date(),
  },
  {
    id: "2",
    icon: "Footprints",
    color: "tertiary",
    title: "Go for a walk",
    description: "Take a walk to clear your mind and relax your body.",
    status: "COMPLETED",
    createdAt: new Date(),
  },
];

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Todo", value: "TODO" },
];

const EMPTY_MESSAGES: Record<Filter, string> = {
  ALL: "No tasks yet. Add one to get started!",
  COMPLETED: "No completed tasks yet. Keep going!",
  TODO: "Nothing left to do. You're all caught up!",
};

export default function Index() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : completed / total;
  const tasksToComplete = tasks.filter((t) => t.status === "TODO");

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const handleOpenModal = (task: Task) => setSelectedTaskId(task.id);
  const handleCloseModal = () => setSelectedTaskId(null);
  const handleOnDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    handleCloseModal();
  };
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "COMPLETED" ? "TODO" : "COMPLETED",
            }
          : task,
      ),
    );
    if (selectedTaskId === id) handleCloseModal();
  };

  const statusFiltered =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statusFiltered;
    return statusFiltered.filter((t) => {
      const title = t.title?.toLowerCase() || "";
      const desc = t.description?.toLowerCase() || "";
      return title.includes(q) || desc.includes(q);
    });
  }, [statusFiltered, query]);

  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withSpring(progress, {
      damping: 100,
      stiffness: 150,
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value * 100}%`,
    };
  });

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <KeyboardDismissView>
        <SafeAreaView style={styles.wrapper}>
          <AppText color={colors.primary} variant="title" weight="bold">
            Welcome back!
          </AppText>
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
                    backgroundColor:
                      progress === 1 ? colors.green : colors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.taskWrapper}>
            <View style={styles.taskHeader}>
              <AppText variant="title" weight="bold">
                Tasks
              </AppText>
              <View style={styles.filterRow}>
                {FILTERS.map(({ label, value }) => (
                  <Pressable
                    key={value}
                    onPress={() => setFilter(value)}
                    style={[
                      styles.filterPill,
                      filter === value && styles.filterPillActive,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      color={filter === value ? colors.primary : colors.gray}
                      weight={filter === value ? "medium" : "regular"}
                    >
                      {label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
            <AppInput
              placeholder="Search tasks..."
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.searchInput}
            />
            {filteredTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <AppText variant="body" weight="bold" color={colors.muted}>
                  {query
                    ? "No tasks match your search."
                    : EMPTY_MESSAGES[filter]}
                </AppText>
              </View>
            ) : (
              filteredTasks.map((task) => (
                <Pressable key={task.id} onPress={() => handleOpenModal(task)}>
                  <TaskCard {...task} onToggleComplete={handleToggleComplete} />
                </Pressable>
              ))
            )}
          </View>
          <AddTaskButton onPress={() => router.push("/add-task")} />
        </SafeAreaView>
      </KeyboardDismissView>
      <TaskDetailModal
        visible={!!selectedTask}
        onClose={handleCloseModal}
        onDelete={handleOnDelete}
        onMarkDone={handleToggleComplete}
        task={
          selectedTask || {
            status: "COMPLETED",
            createdAt: new Date(),
            id: "",
            color: taskColors[0],
            icon: "Plus",
            description: "",
            title: "",
          }
        }
      />
    </>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    gap: 32,
    flex: 1,
  },
  taskWrapper: {
    gap: 16,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
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
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryForeground,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  filterPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryForeground,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.muted,
    marginBottom: 10,
  },
});
