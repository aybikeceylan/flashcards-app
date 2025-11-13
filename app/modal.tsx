import { uploadApi } from "@/api/client";
import { useCreateFlashcard } from "@/hooks/useFlashcardQueries";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  Checkbox,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

export default function AddFlashcardModal() {
  const router = useRouter();
  const createFlashcard = useCreateFlashcard();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setLocalError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setLocalError("Galeri erişim izni gerekli");
        setSnackbarVisible(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      setLocalError("Resim seçilirken bir hata oluştu");
      setSnackbarVisible(true);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageUri) return null;

    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await uploadApi.uploadImage(formData);
      if (response.data.success && response.data.data) {
        return response.data.data.url;
      }
      return null;
    } catch (err: any) {
      console.error("Image upload error:", err);
      throw new Error("Resim yüklenirken bir hata oluştu");
    }
  };

  const pickAudio = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setLocalError("Galeri erişim izni gerekli");
        setSnackbarVisible(true);
        return;
      }

      // Note: ImagePicker doesn't support audio on all platforms
      // For audio, consider using expo-document-picker or expo-av
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setAudioUri(result.assets[0].uri);
      }
    } catch (err: any) {
      setLocalError("Ses dosyası seçilirken bir hata oluştu");
      setSnackbarVisible(true);
    }
  };

  const uploadAudio = async (): Promise<string | null> => {
    if (!audioUri) return null;

    try {
      const formData = new FormData();
      const filename = audioUri.split("/").pop() || "audio.m4a";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `audio/${match[1]}` : "audio/m4a";

      formData.append("file", {
        uri: audioUri,
        name: filename,
        type,
      } as any);

      const response = await uploadApi.uploadAudio(formData);
      if (response.data.success && response.data.data) {
        return response.data.data.url;
      }
      return null;
    } catch (err: any) {
      console.error("Audio upload error:", err);
      throw new Error("Ses dosyası yüklenirken bir hata oluştu");
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!word.trim()) {
      setLocalError("Kelime gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (!meaning.trim()) {
      setLocalError("Anlam gereklidir");
      setSnackbarVisible(true);
      return;
    }

    setLocalError(null);

    try {
      // Upload image if exists
      let uploadedImageUrl = imageUrl;
      if (imageUri && !imageUrl) {
        uploadedImageUrl = await uploadImage();
        setImageUrl(uploadedImageUrl);
      }

      // Upload audio if exists
      let uploadedAudioUrl = audioUrl;
      if (audioUri && !audioUrl) {
        uploadedAudioUrl = await uploadAudio();
        setAudioUrl(uploadedAudioUrl);
      }

      // Create flashcard using mutation
      await createFlashcard.mutateAsync({
        word: word.trim(),
        meaning: meaning.trim(),
        example: example.trim() || undefined,
        imageUrl: uploadedImageUrl || undefined,
        audioUrl: uploadedAudioUrl || undefined,
        isFavorite: isFavorite || undefined,
      });

      // Success - mutation hook will invalidate cache automatically
      router.back();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Kart eklenirken bir hata oluştu";
      setLocalError(errorMessage);
      setSnackbarVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={true}
          scrollEnabled={true}
          alwaysBounceVertical={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Yeni Kart Ekle
              </Text>

              <TextInput
                label="Kelime *"
                value={word}
                onChangeText={setWord}
                multiline
                mode="outlined"
                autoCapitalize="none"
                style={styles.input}
                disabled={createFlashcard.isPending}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                left={<TextInput.Icon icon="text" />}
              />

              <TextInput
                label="Anlam *"
                value={meaning}
                onChangeText={setMeaning}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                disabled={createFlashcard.isPending}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                left={<TextInput.Icon icon="book-open-variant" />}
              />

              <TextInput
                label="Örnek Cümle"
                value={example}
                onChangeText={setExample}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                disabled={createFlashcard.isPending}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                left={<TextInput.Icon icon="format-quote-close" />}
              />

              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={isFavorite ? "checked" : "unchecked"}
                  onPress={() => setIsFavorite(!isFavorite)}
                  disabled={createFlashcard.isPending}
                />
                <Text
                  variant="bodyMedium"
                  onPress={() => setIsFavorite(!isFavorite)}
                  style={styles.checkboxLabel}
                >
                  Favorilere Ekle
                </Text>
              </View>

              <View style={styles.uploadSection}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Resim
                </Text>
                {imageUri && (
                  <View style={styles.imagePreview}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                      contentFit="cover"
                    />
                    <Button
                      mode="text"
                      onPress={() => {
                        setImageUri(null);
                        setImageUrl(null);
                      }}
                      compact
                    >
                      Kaldır
                    </Button>
                  </View>
                )}
                <Button
                  mode="outlined"
                  onPress={pickImage}
                  disabled={createFlashcard.isPending}
                  icon="image"
                  style={styles.uploadButton}
                >
                  {imageUri ? "Resmi Değiştir" : "Resim Seç"}
                </Button>
              </View>

              <View style={styles.uploadSection}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Ses Dosyası
                </Text>
                {audioUri && (
                  <View style={styles.audioPreview}>
                    <Text variant="bodySmall" style={styles.audioText}>
                      Ses dosyası seçildi: {audioUri.split("/").pop()}
                    </Text>
                    <Button
                      mode="text"
                      onPress={() => {
                        setAudioUri(null);
                        setAudioUrl(null);
                      }}
                      compact
                    >
                      Kaldır
                    </Button>
                  </View>
                )}
                <Button
                  mode="outlined"
                  onPress={pickAudio}
                  disabled={createFlashcard.isPending}
                  icon="music"
                  style={styles.uploadButton}
                >
                  {audioUri ? "Ses Dosyasını Değiştir" : "Ses Dosyası Seç"}
                </Button>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  disabled={createFlashcard.isPending}
                  style={styles.cancelButton}
                >
                  İptal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  disabled={createFlashcard.isPending}
                  loading={createFlashcard.isPending}
                  style={styles.submitButton}
                >
                  Kaydet
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: "Tamam",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || "Bir hata oluştu"}
        </Snackbar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  card: {
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  imagePreview: {
    marginBottom: 8,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  audioPreview: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  audioText: {
    marginBottom: 4,
  },
  uploadButton: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});
