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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      setError("E-posta adresi gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (!password.trim()) {
      setError("Şifre gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (!email.includes("@")) {
      setError("Geçerli bir e-posta adresi giriniz");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
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
        // Ancak store'da isAuthenticated için token yerine user kontrolü yapıyoruz
        login(user, "cookie"); // Cookie kullanıldığını belirtmek için placeholder

        // Başarılı giriş sonrası ana sayfaya yönlendir
        router.replace("/(tabs)");
      } else {
        setError(response.data.message || "Giriş başarısız");
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Giriş yapılırken bir hata oluştu";
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
                Giriş Yap
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Hesabınıza giriş yaparak kartlarınızı senkronize edin
              </Text>

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

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={loading}
                loading={loading}
              >
                Giriş Yap
              </Button>

              <View style={styles.registerContainer}>
                <Text variant="bodyMedium" style={styles.registerText}>
                  Hesabınız yok mu?{" "}
                </Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/register")}
                  disabled={loading}
                  compact
                >
                  Kayıt Ol
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  registerText: {
    color: "#666",
  },
});
