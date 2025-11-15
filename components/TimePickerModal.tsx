import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";

interface TimePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string; // HH:mm format
}

export default function TimePickerModal({
  visible,
  onDismiss,
  onConfirm,
  initialTime = "09:00",
}: TimePickerModalProps) {
  const [time, setTime] = useState(initialTime);
  const [error, setError] = useState("");

  // Modal açıldığında initialTime'ı güncelle
  useEffect(() => {
    if (visible && initialTime) {
      setTime(initialTime);
      setError("");
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    // Trim ve validate
    const trimmedTime = time.trim();

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(trimmedTime)) {
      setError("Geçerli bir saat formatı girin (HH:mm, örn: 09:00, 14:30)");
      return;
    }

    // Saat ve dakika kontrolü
    const [hours, minutes] = trimmedTime.split(":");
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      setError("Geçerli bir saat aralığı girin (00:00 - 23:59)");
      return;
    }

    setError("");
    onConfirm(trimmedTime);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Günlük Hatırlatma Saati</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.label}>
            Saat formatı: HH:mm (örn: 09:00, 14:30)
          </Text>
          <TextInput
            label="Saat"
            value={time}
            onChangeText={(text) => {
              setTime(text);
              setError("");
            }}
            mode="outlined"
            placeholder="09:00"
            keyboardType="default"
            style={styles.input}
            error={!!error}
          />
          {error ? (
            <Text variant="bodySmall" style={styles.errorText}>
              {error}
            </Text>
          ) : (
            <Text variant="bodySmall" style={styles.helperText}>
              Format: HH:mm (örn: 09:00, 14:30)
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>İptal</Button>
          <Button onPress={handleConfirm} mode="contained">
            Kaydet
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    color: "#666",
  },
  input: {
    marginTop: 8,
  },
  errorText: {
    color: "#d32f2f",
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: "#666",
    marginTop: 4,
    marginLeft: 4,
  },
});
