import { Task } from "@/models/task.model";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TaskService = {
  async getTasks(): Promise<Task[]> {
    const tasks = await AsyncStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await TaskService.getTasks();
    await TaskService.saveTasks([...tasks, task]);
  },

  async toggleComplete(taskId: string): Promise<Task[]> {
    const tasks = await TaskService.getTasks();
    const updatedTasks: Task[] = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: task.status === "COMPLETED" ? "TODO" : "COMPLETED",
          }
        : task,
    );
    await TaskService.saveTasks(updatedTasks);
    return updatedTasks;
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await TaskService.getTasks();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    await TaskService.saveTasks(updatedTasks);
  },
};

export default TaskService;
