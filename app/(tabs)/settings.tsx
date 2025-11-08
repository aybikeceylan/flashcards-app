import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Switch, List, Divider, Button } from "react-native-paper";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SettingsScreen() {
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
            description="Günlük hatırlatmalar için bildirim al"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <List.Item
            title="Günlük Hatırlatma Saati"
            description={dailyReminderTime}
            left={(props) => <List.Icon {...props} icon="clock" />}
            onPress={() => {
              // GÜN 6'da time picker eklenecek
            }}
          />
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
});
