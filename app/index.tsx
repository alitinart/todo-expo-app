import AddTaskButton from "@/components/AddTaskButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import KeyboardDismissView from "@/components/ui/KeyboardDismissView";
import TaskCard from "@/components/TaskCard";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { Task } from "@/models/task.model";
import TaskService from "@/utils/services/task.service";
import { colors, taskColors } from "@/utils/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeatherCard from "@/components/WeatherCard";
import FocusCard from "@/components/FocusCard";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Filter = "ALL" | "COMPLETED" | "TODO";

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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const handleOpenModal = (task: Task) => setSelectedTaskId(task.id);
  const handleCloseModal = () => setSelectedTaskId(null);

  const handleOnDelete = (id: string) => {
    TaskService.deleteTask(id).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
    handleCloseModal();
  };

  const handleToggleComplete = (id: string) => {
    TaskService.toggleComplete(id).then((updatedTasks) => {
      if (updatedTasks) setTasks(updatedTasks);
    });
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

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        setLoading(true);
        const savedTasks = await TaskService.getTasks();

        if (savedTasks) {
          setTasks(savedTasks);
        }

        setLoading(false);
      };

      fetchTasks();
    }, []),
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <KeyboardDismissView>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            extraScrollHeight={40}
            enableOnAndroid
            contentContainerStyle={styles.wrapper}
          >
            <AppText color={colors.primary} variant="title" weight="bold">
              Welcome back!
            </AppText>

            <FocusCard tasks={tasks} />
            <WeatherCard />

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
              {!loading ? (
                <>
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
                      <AppText
                        variant="body"
                        weight="bold"
                        color={colors.muted}
                      >
                        {query
                          ? "No tasks match your search."
                          : EMPTY_MESSAGES[filter]}
                      </AppText>
                    </View>
                  ) : (
                    filteredTasks.map((task) => (
                      <Pressable
                        key={task.id}
                        onPress={() => handleOpenModal(task)}
                      >
                        <TaskCard
                          {...task}
                          onToggleComplete={handleToggleComplete}
                        />
                      </Pressable>
                    ))
                  )}
                </>
              ) : (
                <View style={styles.loading}>
                  <AppText variant="body" weight="bold" color={colors.primary}>
                    Loading...
                  </AppText>
                </View>
              )}
            </View>
          </KeyboardAwareScrollView>
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
    flexGrow: 1,
    paddingBottom: 120,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
