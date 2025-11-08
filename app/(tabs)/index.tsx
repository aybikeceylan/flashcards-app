import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, FAB } from "react-native-paper";
import { useCardStore } from "@/store/useCardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { cards } = useCardStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const favoriteCards = cards.filter((card) => card.isFavorite);
  const recentCards = cards.slice(-5).reverse();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            {isAuthenticated ? `Merhaba, ${user?.name}! 👋` : "Merhaba! 👋"}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Bugün kaç kart çalışacaksın?
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Hızlı İstatistikler
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {cards.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Toplam Kart
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {favoriteCards.length}
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
            <Text variant="titleLarge" style={styles.cardTitle}>
              Hızlı Başlat
            </Text>
            <Button
              mode="contained"
              icon="play"
              onPress={() => {
                // GÜN 6'da study ekranı eklenecek
                alert("Çalışma modu yakında eklenecek!");
              }}
              style={styles.actionButton}
            >
              Çalışmaya Başla
            </Button>
            <Button
              mode="outlined"
              icon="cards"
              onPress={() => router.push("/(tabs)/flashcards")}
              style={styles.actionButton}
            >
              Tüm Kartları Gör
            </Button>
          </Card.Content>
        </Card>

        {recentCards.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Son Eklenenler
              </Text>
              {recentCards.map((card) => (
                <View key={card.id} style={styles.recentCard}>
                  <Text variant="titleMedium">{card.word}</Text>
                  <Text variant="bodySmall" style={styles.recentMeaning}>
                    {card.meaning}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: "#fff",
  },
  greeting: {
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
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
  actionButton: {
    marginBottom: 8,
  },
  recentCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  recentMeaning: {
    marginTop: 4,
    color: "#666",
  },
});
