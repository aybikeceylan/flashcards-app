import { useFlashcards } from "@/hooks/useFlashcardQueries";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Card, FAB, Searchbar, Text } from "react-native-paper";

export default function FlashcardsScreen() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  // Use React Query hook for flashcards
  const {
    data: cards = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useFlashcards();

  const filteredCards = cards.filter(
    (card) =>
      card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const renderCard = ({ item }: { item: any }) => (
    <Card
      style={styles.card}
      onPress={() => {
        router.push({
          pathname: "/flashcard-detail",
          params: { id: item.id },
        });
      }}
    >
      <Card.Content>
        <Text variant="titleLarge">{item.word}</Text>
        <Text variant="bodyMedium" style={styles.meaning}>
          {item.meaning}
        </Text>
        {item.example && (
          <Text variant="bodySmall" style={styles.example}>
            "{item.example}"
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Kart ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              Henüz kart eklenmemiş
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Yeni kart eklemek için + butonuna basın
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          router.push("/modal");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  meaning: {
    marginTop: 8,
    color: "#666",
  },
  example: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#888",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    color: "#888",
  },
});
