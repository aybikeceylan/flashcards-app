import NotificationCenter from "@/components/NotificationCenter";
import { useNotificationHistory } from "@/hooks/useNotificationQueries";
import { useAuthStore } from "@/store/useAuthStore";
import { useCardStore } from "@/store/useCardStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Text as PaperText,
} from "react-native-paper";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cards } = useCardStore();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // Sadece authenticated kullanıcılar için notification history çek
  const { data: historyData } = useNotificationHistory(
    isAuthenticated ? { limit: 100 } : undefined
  );

  const favoriteCount = cards.filter((card) => card.isFavorite).length;
  const notifications = historyData?.notifications || [];
  const unreadNotifications =
    (isAuthenticated && notifications.filter((n) => !n.read).length) || 0;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <PaperText variant="titleLarge" style={styles.title}>
              Giriş Yapın
            </PaperText>
            <PaperText variant="bodyMedium" style={styles.subtitle}>
              Kartlarınızı senkronize etmek için giriş yapın
            </PaperText>
            <Button
              mode="contained"
              onPress={() => {
                router.replace("/login");
              }}
              style={styles.button}
            >
              Giriş Yap
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.name?.charAt(0).toUpperCase() || "U"}
          style={styles.avatar}
        />
        <PaperText variant="headlineMedium" style={styles.name}>
          {user?.name || "Kullanıcı"}
        </PaperText>
        <PaperText variant="bodyMedium" style={styles.email}>
          {user?.email}
        </PaperText>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <PaperText variant="titleMedium" style={styles.sectionTitle}>
            İstatistikler
          </PaperText>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <PaperText variant="headlineSmall" style={styles.statNumber}>
                {cards.length}
              </PaperText>
              <PaperText variant="bodySmall" style={styles.statLabel}>
                Toplam Kart
              </PaperText>
            </View>
            <View style={styles.statItem}>
              <PaperText variant="headlineSmall" style={styles.statNumber}>
                {favoriteCount}
              </PaperText>
              <PaperText variant="bodySmall" style={styles.statLabel}>
                Favori
              </PaperText>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => setShowNotifications(!showNotifications)}
            icon="bell"
            style={styles.menuButton}
            contentStyle={styles.notificationButtonContent}
          >
            Bildirimler
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/settings")}
            icon="cog"
            style={styles.menuButton}
          >
            Ayarlar
          </Button>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            style={styles.menuButton}
            textColor="#d32f2f"
          >
            Çıkış Yap
          </Button>
        </Card.Content>
      </Card>

      {showNotifications && (
        <View style={styles.notificationContainer}>
          <NotificationCenter limit={20} showHeader={true} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: "#666",
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  statLabel: {
    color: "#666",
    marginTop: 4,
  },
  menuButton: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    color: "#666",
  },
  button: {
    marginTop: 8,
  },
  notificationContainer: {
    flex: 1,
    minHeight: 400,
  },
  notificationButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
