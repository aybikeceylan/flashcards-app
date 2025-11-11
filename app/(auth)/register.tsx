import { authApi } from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Snackbar, Text, TextInput } from "react-native-paper";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleRegister = async () => {
    // Validation
    if (!name.trim()) {
      setError("Ad Soyad gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (name.trim().length < 2) {
      setError("Ad Soyad en az 2 karakter olmalıdır");
      setSnackbarVisible(true);
      return;
    }

    if (!email.trim()) {
      setError("E-posta adresi gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (!email.includes("@")) {
      setError("Geçerli bir e-posta adresi giriniz");
      setSnackbarVisible(true);
      return;
    }

    if (!password.trim()) {
      setError("Şifre gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setSnackbarVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.data.success && response.data.data) {
        // API'den gelen user objesini store formatına çevir
        const user = {
          id: response.data.data._id,
          email: response.data.data.email,
          name: response.data.data.name,
          avatar: response.data.data.avatar,
        };

        // Token httpOnly cookie olarak set ediliyor (Swagger dokümanına göre)
        // Cookie otomatik olarak gönderilecek, token'ı store'a kaydetmeye gerek yok
        login(user, "cookie"); // Cookie kullanıldığını belirtmek için placeholder

        // Başarılı kayıt sonrası ana sayfaya yönlendir
        router.replace("/(tabs)");
      } else {
        setError(response.data.message || "Kayıt başarısız");
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Kayıt yapılırken bir hata oluştu";
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
      >
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                Kayıt Ol
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Yeni hesap oluşturarak başlayın
              </Text>

              <TextInput
                label="Ad Soyad"
                value={name}
                onChangeText={setName}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
                disabled={loading}
                blurOnSubmit={false}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="E-posta"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                disabled={loading}
                blurOnSubmit={false}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="off"
                style={styles.input}
                disabled={loading}
                blurOnSubmit={false}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                textColor="#000000"
                selectionColor="#6200ee"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TextInput
                label="Şifre Tekrar"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="off"
                style={styles.input}
                disabled={loading}
                blurOnSubmit={false}
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                textColor="#000000"
                selectionColor="#6200ee"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                disabled={loading}
                loading={loading}
              >
                Kayıt Ol
              </Button>

              <View style={styles.loginContainer}>
                <Text variant="bodyMedium" style={styles.loginText}>
                  Zaten hesabınız var mı?{" "}
                </Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/login")}
                  disabled={loading}
                  compact
                >
                  Giriş Yap
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  card: {
    elevation: 4,
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginText: {
    color: "#666",
  },
});
