import { notificationApi } from "@/api/client";
import TimePickerModal from "@/components/TimePickerModal";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/useNotificationQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  Snackbar,
  Switch,
  Text,
} from "react-native-paper";

export default function SettingsScreen() {
  const { isAuthenticated } = useAuthStore();
  const {
    theme,
    notificationsEnabled,
    dailyReminderTime,
    cardsPerSession,
    setTheme,
    setNotificationsEnabled,
    setDailyReminderTime,
    setCardsPerSession,
  } = useSettingsStore();

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Backend'den notification preferences çek
  const { data: preferences, isLoading: isLoadingPreferences } =
    useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  // Backend'den gelen preferences'i local store'a senkronize et
  useEffect(() => {
    if (preferences && isAuthenticated) {
      if (preferences.enabled !== undefined) {
        setNotificationsEnabled(preferences.enabled);
      }
      if (preferences.dailyReminderTime) {
        // Zaman formatını normalize et (HH:mm)
        const normalizedTime = normalizeTimeFormat(
          preferences.dailyReminderTime
        );
        setDailyReminderTime(normalizedTime);
      }
    }
  }, [
    preferences,
    isAuthenticated,
    setNotificationsEnabled,
    setDailyReminderTime,
  ]);

  // Zaman formatını normalize et (HH:mm formatına çevir)
  const normalizeTimeFormat = (time: string): string => {
    if (!time) return "09:00";

    // Eğer zaten HH:mm formatındaysa döndür
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    if (timeRegex.test(time)) {
      const [hours, minutes] = time.split(":");
      // Saat ve dakikayı 2 haneli yap (09:00 gibi)
      const normalizedHours = hours.padStart(2, "0");
      const normalizedMinutes = minutes.padStart(2, "0");
      return `${normalizedHours}:${normalizedMinutes}`;
    }

    return time; // Format tanınmıyorsa olduğu gibi döndür
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!isAuthenticated) {
      setSnackbarMessage(
        "Bildirim ayarlarını değiştirmek için giriş yapmalısınız"
      );
      setSnackbarVisible(true);
      return;
    }

    setNotificationsEnabled(enabled);

    try {
      await updatePreferences.mutateAsync({
        enabled,
      });
      setSnackbarMessage(
        enabled
          ? "Bildirimler etkinleştirildi"
          : "Bildirimler devre dışı bırakıldı"
      );
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      setSnackbarMessage("Ayarlar güncellenirken bir hata oluştu");
      setSnackbarVisible(true);
      // Rollback
      setNotificationsEnabled(!enabled);
    }
  };

  const handleTimeChange = async (time: string) => {
    if (!isAuthenticated) {
      setSnackbarMessage(
        "Hatırlatma saatini değiştirmek için giriş yapmalısınız"
      );
      setSnackbarVisible(true);
      return;
    }

    // Zaman formatını normalize et
    const normalizedTime = normalizeTimeFormat(time);
    setDailyReminderTime(normalizedTime);

    try {
      await updatePreferences.mutateAsync({
        dailyReminderTime: normalizedTime,
      });
      setSnackbarMessage(
        `Hatırlatma saati ${normalizedTime} olarak güncellendi`
      );
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error("Error updating reminder time:", error);
      setSnackbarMessage("Saat güncellenirken bir hata oluştu");
      setSnackbarVisible(true);
    }
  };

  // Test notification gönder
  const handleTestNotification = async (
    type: "daily-reminder" | "motivation"
  ) => {
    if (!isAuthenticated) {
      setSnackbarMessage("Test bildirimi göndermek için giriş yapmalısınız");
      setSnackbarVisible(true);
      return;
    }

    setIsTestingNotification(true);
    try {
      if (type === "daily-reminder") {
        await notificationApi.testDailyReminder();
        setSnackbarMessage("Günlük hatırlatma test bildirimi gönderildi");
      } else {
        await notificationApi.testMotivation();
        setSnackbarMessage("Motivasyon test bildirimi gönderildi");
      }
      setSnackbarVisible(true);
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      setSnackbarMessage("Test bildirimi gönderilirken bir hata oluştu");
      setSnackbarVisible(true);
    } finally {
      setIsTestingNotification(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Bildirimler
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Bildirimleri Etkinleştir"
            description={
              isAuthenticated
                ? "Günlük hatırlatmalar için bildirim al"
                : "Giriş yaparak bildirim ayarlarını yönetin"
            }
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                disabled={!isAuthenticated || isLoadingPreferences}
              />
            )}
          />
          <List.Item
            title="Günlük Hatırlatma Saati"
            description={dailyReminderTime || "09:00"}
            left={(props) => <List.Icon {...props} icon="clock" />}
            onPress={() => {
              if (!isAuthenticated) {
                setSnackbarMessage(
                  "Hatırlatma saatini değiştirmek için giriş yapmalısınız"
                );
                setSnackbarVisible(true);
                return;
              }
              setTimePickerVisible(true);
            }}
            disabled={!isAuthenticated || isLoadingPreferences}
          />
          <Divider style={styles.divider} />
          <Text variant="bodySmall" style={styles.testSectionTitle}>
            Test Bildirimleri
          </Text>
          <Button
            mode="outlined"
            onPress={() => handleTestNotification("daily-reminder")}
            disabled={!isAuthenticated || isTestingNotification}
            loading={isTestingNotification}
            style={styles.testButton}
            icon="bell-ring"
          >
            Günlük Hatırlatma Testi
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleTestNotification("motivation")}
            disabled={!isAuthenticated || isTestingNotification}
            loading={isTestingNotification}
            style={styles.testButton}
            icon="heart"
          >
            Motivasyon Testi
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Çalışma Ayarları
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Oturum Başına Kart Sayısı"
            description={`${cardsPerSession} kart`}
            left={(props) => <List.Icon {...props} icon="cards" />}
            onPress={() => {
              // GÜN 6'da number picker eklenecek
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Görünüm
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Tema"
            description={
              theme === "auto"
                ? "Otomatik"
                : theme === "light"
                ? "Açık"
                : "Koyu"
            }
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            onPress={() => {
              const themes: ("light" | "dark" | "auto")[] = [
                "light",
                "dark",
                "auto",
              ];
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              setTheme(nextTheme);
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Hakkında
          </Text>
          <Divider style={styles.divider} />
          <List.Item
            title="Versiyon"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Button
            mode="text"
            onPress={() => {
              // GÜN 7'de eklenecek
            }}
          >
            Gizlilik Politikası
          </Button>
        </Card.Content>
      </Card>

      <TimePickerModal
        visible={timePickerVisible}
        onDismiss={() => setTimePickerVisible(false)}
        onConfirm={handleTimeChange}
        initialTime={dailyReminderTime || "09:00"}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 8,
  },
  testSectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    opacity: 0.7,
  },
  testButton: {
    marginTop: 8,
  },
});
