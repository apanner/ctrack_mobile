import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '../constants/colors';

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface SelectDropdownProps<T = string> {
  value: T | null;
  options: SelectOption<T>[];
  placeholder?: string;
  onSelect: (value: T | null) => void;
  label?: string;
  disabled?: boolean;
}

export function SelectDropdown<T = string>({
  value,
  options,
  placeholder = 'Select',
  onSelect,
  label,
  disabled = false,
}: SelectDropdownProps<T>) {
  const [visible, setVisible] = React.useState(false);
  const selectedLabel =
    options.find((o) => o.value === value)?.label ??
    (value === null && options.some((o) => o.value === null) ? options.find((o) => o.value === null)!.label : placeholder);

  const handleSelect = (opt: SelectOption<T>) => {
    onSelect(opt.value);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        accessibilityLabel={label ?? placeholder}
        accessibilityRole="button"
      >
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <ChevronDown size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label ?? placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={12}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => (item.value == null ? '__none__' : String(item.value))}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText} numberOfLines={1}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.textTertiary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  list: {
    maxHeight: 280,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
});
