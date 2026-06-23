import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import IconPickerModal, { LucideIconName } from "@/components/IconPickerModal";
import KeyboardDismissView from "@/components/KeyboardDismissView";
import { Task } from "@/models/task.model";
import TaskService from "@/utils/services/task.service";
import { colors, taskColors } from "@/utils/theme";
import { useRouter } from "expo-router";
import { ArrowLeft, PlusCircle } from "lucide-react-native";
import * as ICONS from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View, Pressable, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

export default function AddTaskScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<LucideIconName>("Plus");
  const [activeColor, setActiveColor] = useState(taskColors[0]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const [pickerVisible, setPickerVisible] = useState(false);

  const SelectedIcon: any = { ...ICONS }[iconName];

  const handleSave = () => {
    const newErrors = {
      title: "",
      description: "",
    };

    if (!title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (description.trim().length > 200) {
      newErrors.description = "Description cannot exceed 200 characters";
    }

    setErrors(newErrors);

    if (newErrors.title || newErrors.description) {
      return;
    }

    const newTask: Task = {
      id: Crypto.randomUUID(),
      icon: iconName,
      color: activeColor,
      title: title.trim(),
      description: description.trim(),
      status: "TODO",
      createdAt: new Date(),
    };

    TaskService.addTask(newTask);
    router.back();
  };

  return (
    <KeyboardDismissView>
      <SafeAreaView style={styles.wrapper}>
        <Pressable style={styles.header} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={24} />
          <AppText color={colors.primary} variant="title" weight="medium">
            New Task
          </AppText>
        </Pressable>
        <View style={styles.form}>
          <View style={{ gap: 16 }}>
            <AppText center variant="h1" color={colors.primary} weight="bold">
              What&apos;s on your mind?
            </AppText>
            <AppText center variant="body" color={colors.gray}>
              Capture your thoughts and to-dos here.
            </AppText>
          </View>
          <AppInput
            label="Task Title"
            placeholder="e.g., Design Weekly Sync"
            value={title}
            onChangeText={(text) => {
              setTitle(text);

              if (text.trim()) {
                setErrors((prev) => ({
                  ...prev,
                  title: "",
                }));
              }
            }}
          />

          {errors.title && (
            <AppText color="red" style={styles.error}>
              {errors.title}
            </AppText>
          )}
          <AppInput
            label="Description"
            placeholder="Add a some details about this task..."
            textarea
            value={description}
            onChangeText={(text) => {
              setDescription(text);

              if (text.length <= 200) {
                setErrors((prev) => ({
                  ...prev,
                  description: "",
                }));
              }
            }}
          />

          {errors.description && (
            <AppText color="red" style={styles.error}>
              {errors.description}
            </AppText>
          )}

          <View style={styles.customizeWrapper}>
            <AppText
              weight="medium"
              style={{ fontSize: 14 }}
              color={colors.gray}
            >
              Customize
            </AppText>
            <View style={styles.row}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setPickerVisible(true)}
                style={[styles.iconPicker, { backgroundColor: activeColor }]}
              >
                <View style={styles.iconBox}>
                  <SelectedIcon color={colors.white} size={22} />
                </View>
              </TouchableOpacity>

              <View style={styles.colorsWrapper}>
                {taskColors.map((color) => (
                  <Pressable
                    onPress={() => {
                      setActiveColor(color);
                    }}
                    key={color}
                    style={[
                      styles.colorItem,
                      color === activeColor ? styles.activeColor : null,
                      { backgroundColor: color },
                    ]}
                  ></Pressable>
                ))}
              </View>
            </View>
          </View>

          <AppButton
            title="Add Task"
            leftIcon={<PlusCircle color={colors.white} size={18} />}
            onPress={handleSave}
          />
        </View>

        <IconPickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelect={(name) => {
            setIconName(name);
            setPickerVisible(false);
          }}
        />
      </SafeAreaView>
    </KeyboardDismissView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    gap: 32,
  },
  error: {
    width: "100%",
    marginTop: -24,
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  customizeWrapper: {
    gap: 8,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  form: {
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    backgroundColor: colors.white,
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  iconPicker: {
    borderRadius: 12,
    justifyContent: "center",
    width: 60,
    height: 60,
    alignItems: "center",
  },

  iconPickerFocused: {
    borderColor: "#A8C4E8",
    backgroundColor: "#E2EDF8",
  },

  iconBox: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  colorItem: {
    height: 24,
    width: 24,
    borderRadius: "100%",
    borderWidth: 1,
    borderColor: colors.muted,
  },
  colorsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flexWrap: "wrap",
    maxWidth: 250,
    gap: 8,
  },
  activeColor: {
    borderWidth: 2,
    borderColor: "#000",
  },
});
