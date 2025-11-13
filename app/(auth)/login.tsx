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
      console.log(response.data);
      if (response.data.success && response.data.data) {
        // API'den gelen user objesini store formatına çevir
        const user = {
          id: response.data.data._id,
          email: response.data.data.email,
          name: response.data.data.name,
          avatar: response.data.data.avatar,
        };

        // Token'ı store'a kaydet (response'da token varsa)
        const token: string | null = response.data.data.token || null;
        // Token varsa kaydet, yoksa null (cookie kullanılacak)
        login(user, token);

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
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
                textContentType="emailAddress"
                returnKeyType="next"
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
                autoComplete="password"
                keyboardType="default"
                textContentType="password"
                passwordRules="required: upper; required: lower; required: digit; minlength: 6;"
                returnKeyType="done"
                style={styles.input}
                disabled={loading}
                blurOnSubmit={true}
                onSubmitEditing={handleLogin}
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

              <Button
                mode="text"
                onPress={() => router.push("/(auth)/forgot-password")}
                disabled={loading}
                compact
                style={styles.forgotPasswordButton}
              >
                Şifremi Unuttum
              </Button>

              <View style={styles.registerContainer}>
                <Text variant="bodyMedium" style={styles.registerText}>
                  Hesabınız yok mu?{" "}
                </Text>
                <Button
                  mode="text"
                  onPress={() => router.push("/(auth)/register")}
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
    marginBottom: 8,
    paddingVertical: 4,
  },
  forgotPasswordButton: {
    marginBottom: 8,
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
