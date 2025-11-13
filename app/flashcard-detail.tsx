import { useDeleteFlashcard, useFlashcard } from "@/hooks/useFlashcardQueries";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Chip, Snackbar, Text } from "react-native-paper";

export default function FlashcardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: card, isLoading, error } = useFlashcard(id || null);
  const deleteFlashcard = useDeleteFlashcard();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = () => {
    if (!id) return;

    Alert.alert("Kartı Sil", "Bu kartı silmek istediğinize emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFlashcard.mutateAsync(id);
            router.back();
          } catch (err: any) {
            const message =
              err.response?.data?.message ||
              err.message ||
              "Kart silinirken bir hata oluştu";
            setErrorMessage(message);
            setSnackbarVisible(true);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!id) return;
    router.push({
      pathname: "/edit-flashcard",
      params: { id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  if (error || !card) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Hata
        </Text>
        <Text variant="bodyMedium" style={styles.errorSubtext}>
          {error?.message || "Kart bulunamadı"}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineMedium" style={styles.word}>
                {card.word}
              </Text>
              {card.isFavorite && (
                <Chip icon="star" style={styles.favoriteChip}>
                  Favori
                </Chip>
              )}
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Anlam
              </Text>
              <Text variant="bodyLarge" style={styles.meaning}>
                {card.meaning}
              </Text>
            </View>

            {card.example && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Örnek Cümle
                </Text>
                <Text variant="bodyMedium" style={styles.example}>
                  "{card.example}"
                </Text>
              </View>
            )}

            {card.imageUrl && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Resim
                </Text>
                <Image
                  source={{ uri: card.imageUrl }}
                  style={styles.image}
                  contentFit="contain"
                />
              </View>
            )}

            {card.audioUrl && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Ses Dosyası
                </Text>
                <Chip icon="music" style={styles.audioChip}>
                  Ses dosyası mevcut
                </Chip>
              </View>
            )}

            {card.createdAt && (
              <View style={styles.section}>
                <Text variant="bodySmall" style={styles.dateText}>
                  Oluşturulma:{" "}
                  {new Date(card.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleEdit}
          icon="pencil"
          style={styles.editButton}
        >
          Düzenle
        </Button>
        <Button
          mode="contained"
          onPress={handleDelete}
          icon="delete"
          buttonColor="#b00020"
          style={styles.deleteButton}
          loading={deleteFlashcard.isPending}
          disabled={deleteFlashcard.isPending}
        >
          Sil
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: "Tamam",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {errorMessage || "Bir hata oluştu"}
      </Snackbar>
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
  scrollContent: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginBottom: 8,
    color: "#b00020",
  },
  errorSubtext: {
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
  },
  card: {
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  word: {
    fontWeight: "bold",
    flex: 1,
  },
  favoriteChip: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#6200ee",
  },
  meaning: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
  },
  example: {
    fontStyle: "italic",
    color: "#666",
    lineHeight: 22,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginTop: 8,
  },
  audioChip: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  dateText: {
    color: "#888",
    fontStyle: "italic",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
});
