import { colors } from "@/utils/theme";
import { Plus } from "lucide-react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function AddTaskButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.wrapper}
    >
      <Plus color={colors.white} size={32} strokeWidth={3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    position: "absolute",
    bottom: 48,
    right: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
