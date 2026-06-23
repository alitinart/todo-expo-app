import AppText from "@/components/AppText";
import { colors } from "@/utils/theme";
import * as ICONS from "lucide-react-native";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import AppInput from "./AppInput";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

const NON_ICON_EXPORTS = new Set([
  "createLucideIcon",
  "useLucideContext",
  "LucideProvider",
  "default",
]);

export type LucideIconName = {
  [K in keyof typeof ICONS]: (typeof ICONS)[K] extends ICONS.LucideIcon
    ? K
    : never;
}[keyof typeof ICONS];

const ICON_NAMES: LucideIconName[] = (
  Object.keys(ICONS) as LucideIconName[]
).filter((key) => !NON_ICON_EXPORTS.has(key as string));

const NUM_COLUMNS = 5;

interface IconPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (iconName: LucideIconName) => void;
}

const iconsMap = ICONS;

export default function IconPickerModal({
  visible,
  onClose,
  onSelect,
}: IconPickerModalProps) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

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
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 120 || event.velocityY > 800;

      if (shouldClose) {
        scheduleOnRN(closeModal);
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      setMounted(true);

      requestAnimationFrame(() => {
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
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const filteredIcons = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return ICON_NAMES;
    return ICON_NAMES.filter((icon) => icon.toLowerCase().includes(search));
  }, [query]);

  const handleClose = () => {
    setQuery("");
    closeModal();
  };

  const renderItem: ListRenderItem<LucideIconName> = ({ item: name }) => {
    const IconComponent = iconsMap[name];

    return (
      <Pressable
        style={styles.iconCell}
        onPress={() => {
          onSelect(name);
          handleClose();
        }}
      >
        <IconComponent color={colors.primary} size={22} strokeWidth={2} />
      </Pressable>
    );
  };

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <AppText variant="title" weight="medium" color={colors.primary}>
              Choose an icon
            </AppText>

            <Pressable onPress={handleClose} hitSlop={8}>
              <X color={colors.gray} size={22} />
            </Pressable>
          </View>

          <AppInput
            style={styles.searchInput}
            placeholder="Search icons..."
            placeholderTextColor="#C2CEDF"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <FlatList
            data={filteredIcons}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            initialNumToRender={40}
            maxToRenderPerBatch={40}
            windowSize={5}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AppText color={colors.gray}>No icons found</AppText>
              </View>
            }
          />
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  searchInput: {
    marginBottom: 10,
  },

  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.gray,
    opacity: 0.35,
    marginBottom: 12,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF1FB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },

  gridContent: {
    paddingBottom: 24,
  },

  iconCell: {
    flex: 1 / NUM_COLUMNS,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderRadius: 12,
    backgroundColor: "#F7F9FC",
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
