import { useAuthStore } from "@/store/useAuthStore";
import { useCardStore } from "@/store/useCardStore";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, Text } from "react-native-paper";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cards } = useCardStore();
  const router = useRouter();

  const favoriteCount = cards.filter((card) => card.isFavorite).length;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              Giriş Yapın
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Kartlarınızı senkronize etmek için giriş yapın
            </Text>
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
        <Text variant="headlineMedium" style={styles.name}>
          {user?.name || "Kullanıcı"}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            İstatistikler
          </Text>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {cards.length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Toplam Kart
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {favoriteCount}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Favori
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
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
});
