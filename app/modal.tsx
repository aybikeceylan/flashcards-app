import { flashcardApi, uploadApi, WordSuggestion } from "@/api/client";
import { useCreateFlashcard } from "@/hooks/useFlashcardQueries";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
  const [phonetic, setPhonetic] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setLocalError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordInputRef = useRef<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch suggestions with debounce
  useEffect(() => {
    // Clear any pending requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmedWord = word.trim();

    // Don't make request if less than 2 characters
    if (trimmedWord.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    // Debounce: wait 500ms before making request
    debounceTimerRef.current = setTimeout(async () => {
      // Get current word value (may have changed during debounce)
      const currentWord = word.trim();

      // Double check length before making request
      if (currentWord.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        return;
      }

      try {
        setIsLoadingSuggestions(true);
        const response = await flashcardApi.getSuggestions(currentWord);
        if (response.data.success && response.data.data?.suggestions) {
          // Convert string array to WordSuggestion array
          const wordSuggestions: WordSuggestion[] =
            response.data.data.suggestions.map((word: string) => ({ word }));
          setSuggestions(wordSuggestions);
          setShowSuggestions(wordSuggestions.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        // Silently fail - suggestions are optional
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [word]);

  // Fetch dictionary data when suggestion is selected
  const handleSuggestionSelect = async (suggestion: WordSuggestion) => {
    setWord(suggestion.word);
    setPhonetic(null); // Clear previous phonetic
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const response = await flashcardApi.getDictionary(suggestion.word);
      if (response.data.success && response.data.data) {
        const dictData = response.data.data;

        // Fill meaning if empty
        if (
          !meaning.trim() &&
          dictData.meanings &&
          dictData.meanings.length > 0
        ) {
          const firstMeaning = dictData.meanings[0];
          if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            setMeaning(firstMeaning.definitions[0].definition);
          }
        }

        // Fill example if empty
        if (
          !example.trim() &&
          dictData.meanings &&
          dictData.meanings.length > 0
        ) {
          const firstMeaning = dictData.meanings[0];
          if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
            const firstExample = firstMeaning.definitions.find(
              (def) => def.example
            );
            if (firstExample?.example) {
              setExample(firstExample.example);
            }
          }
        }

        // Set phonetic if exists
        if (dictData.phonetic) {
          setPhonetic(dictData.phonetic);
        }
        if (dictData.pronunciation) {
          setAudioUrl(dictData.pronunciation);
          setAudioUri(dictData.pronunciation);
        }
      }
    } catch (err) {
      // Silently fail - dictionary data is optional
      console.log("Dictionary data fetch failed:", err);
    }
  };
  // Play audio function
  const playAudio = async () => {
    const audioSource = audioUrl || audioUri;
    if (!audioSource) return;

    try {
      // Stop and unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setIsPlayingAudio(true);

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioSource },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      // Listen for playback status
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlayingAudio(false);
            sound.unloadAsync();
            soundRef.current = null;
          }
        }
      });
    } catch (err: any) {
      console.error("Audio play error:", err);
      setLocalError("Ses dosyası çalınamadı");
      setSnackbarVisible(true);
      setIsPlayingAudio(false);
    }
  };

  // Stop audio function
  const stopAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlayingAudio(false);
      } catch (err) {
        console.error("Audio stop error:", err);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Start recording audio
  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setLocalError("Mikrofon erişim izni gerekli");
        setSnackbarVisible(true);
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Recording start error:", err);
      setLocalError("Ses kaydı başlatılamadı");
      setSnackbarVisible(true);
      setIsRecording(false);
    }
  };

  // Stop recording audio
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setIsRecording(false);

      if (uri) {
        setAudioUri(uri);
        setAudioUrl(null); // Clear dictionary URL if exists
      }
    } catch (err: any) {
      console.error("Recording stop error:", err);
      setLocalError("Ses kaydı durdurulamadı");
      setSnackbarVisible(true);
      setIsRecording(false);
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

            <View style={styles.wordInputContainer}>
              <TextInput
                ref={wordInputRef}
                label="Kelime *"
                value={word}
                onChangeText={(text) => {
                  setWord(text);
                  setPhonetic(null); // Clear phonetic when word changes
                  if (text.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow suggestion selection
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                mode="outlined"
                autoCapitalize="none"
                style={styles.input}
                disabled={createFlashcard.isPending}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                left={<TextInput.Icon icon="text" />}
                right={
                  isLoadingSuggestions ? (
                    <TextInput.Icon icon="loading" />
                  ) : undefined
                }
              />
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView
                    style={styles.suggestionsScrollView}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {suggestions.map((item, index) => (
                      <TouchableOpacity
                        key={`${item.word}-${index}`}
                        style={[
                          styles.suggestionItem,
                          index === suggestions.length - 1 &&
                            styles.suggestionItemLast,
                        ]}
                        onPress={() => handleSuggestionSelect(item)}
                      >
                        <Text
                          variant="bodyMedium"
                          style={styles.suggestionWord}
                        >
                          {item.word}
                        </Text>
                        {item.meaning && (
                          <Text
                            variant="bodySmall"
                            style={styles.suggestionMeaning}
                          >
                            {item.meaning}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {phonetic && (
                <Text variant="bodySmall" style={styles.phoneticText}>
                  {phonetic}
                </Text>
              )}
            </View>

            <View style={styles.meaningContainer}>
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
            </View>

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
              {(audioUri || audioUrl) && (
                <View style={styles.audioPreview}>
                  <Text variant="bodySmall" style={styles.audioText}>
                    {audioUrl
                      ? "Sözlükten telaffuz eklendi"
                      : `Ses dosyası seçildi: ${
                          audioUri?.split("/").pop() || ""
                        }`}
                  </Text>
                  <View style={styles.audioActions}>
                    <Button
                      mode="contained"
                      onPress={isPlayingAudio ? stopAudio : playAudio}
                      disabled={createFlashcard.isPending}
                      icon={isPlayingAudio ? "stop" : "play"}
                      compact
                      style={styles.playButton}
                    >
                      {isPlayingAudio ? "Durdur" : "Dinle"}
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => {
                        stopAudio();
                        setAudioUri(null);
                        setAudioUrl(null);
                      }}
                      compact
                    >
                      Kaldır
                    </Button>
                  </View>
                </View>
              )}
              <View style={styles.audioButtonsContainer}>
                <Button
                  mode="outlined"
                  onPress={pickAudio}
                  disabled={createFlashcard.isPending || isRecording}
                  icon="music"
                  style={[styles.uploadButton, styles.audioButton]}
                >
                  {audioUri ? "Ses Dosyasını Değiştir" : "Ses Dosyası Seç"}
                </Button>
                <Button
                  mode={isRecording ? "contained" : "outlined"}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={createFlashcard.isPending}
                  icon={isRecording ? "stop" : "microphone"}
                  style={[styles.uploadButton, styles.audioButton]}
                  buttonColor={isRecording ? "#d32f2f" : undefined}
                >
                  {isRecording
                    ? `Kayıt: ${formatDuration(recordingDuration)}`
                    : "Ses Kaydet"}
                </Button>
              </View>
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
  );
}

const styles = StyleSheet.create({
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
  meaningContainer: {
    marginBottom: 16,
  },
  phoneticText: {
    marginTop: -12,
    marginLeft: 16,
    marginBottom: 8,
    color: "#666",
    fontStyle: "italic",
  },
  wordInputContainer: {
    marginBottom: 16,
    position: "relative",
    zIndex: 10,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
    overflow: "hidden",
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionWord: {
    fontWeight: "600",
    marginBottom: 4,
  },
  suggestionMeaning: {
    color: "#666",
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
    marginBottom: 24,
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  playButton: {
    marginRight: 4,
    width: 100,
  },
  uploadButton: {
    marginTop: 8,
  },
  audioButtonsContainer: {
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  audioButton: {
    flex: 1,
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
