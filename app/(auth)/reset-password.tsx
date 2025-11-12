import { authApi } from "@/api/client";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Snackbar, Text, TextInput } from "react-native-paper";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  // Token'ı string olarak al (array ise ilk elemanı al)
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const router = useRouter();

  // Debug: Token'ı logla
  React.useEffect(() => {
    console.log("Reset password token:", token);
    console.log("Reset password params:", params);
  }, [token, params]);

  const handleResetPassword = async () => {
    // Validation
    if (!token) {
      setError("Geçersiz veya eksik token");
      setSnackbarVisible(true);
      return;
    }

    if (!newPassword.trim()) {
      setError("Yeni şifre gereklidir");
      setSnackbarVisible(true);
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setSnackbarVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Resetting password with token:", token);
      console.log("New password length:", newPassword.length);

      const response = await authApi.resetPassword({
        token: token!,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        setError(null);
      } else {
        setError(response.data.message || "Şifre sıfırlama başarısız");
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Şifre sıfırlanırken bir hata oluştu";
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
              {success ? (
                <>
                  <Text variant="headlineMedium" style={styles.title}>
                    Şifre Başarıyla Sıfırlandı
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş
                    yapabilirsiniz.
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => router.replace("/(auth)/login")}
                    style={styles.button}
                  >
                    Giriş Yap
                  </Button>
                </>
              ) : (
                <>
                  <Text variant="headlineMedium" style={styles.title}>
                    Yeni Şifre Belirle
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    Yeni şifrenizi girin
                  </Text>

                  {token && (
                    <View style={styles.tokenInfoContainer}>
                      <Text variant="bodySmall" style={styles.tokenInfoLabel}>
                        Token: {token.substring(0, 20)}...
                      </Text>
                    </View>
                  )}

                  {!token && (
                    <View style={styles.errorContainer}>
                      <Text variant="bodySmall" style={styles.errorText}>
                        Token bulunamadı. Lütfen şifre sıfırlama bağlantısını
                        tekrar kullanın.
                      </Text>
                    </View>
                  )}

                  <TextInput
                    label="Yeni Şifre"
                    value={newPassword}
                    onChangeText={setNewPassword}
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
                    label="Yeni Şifre Tekrar"
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
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    }
                  />

                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.button}
                    disabled={loading}
                    loading={loading}
                  >
                    Şifreyi Sıfırla
                  </Button>

                  <View style={styles.backContainer}>
                    <Button
                      mode="text"
                      onPress={() => router.back()}
                      disabled={loading}
                      compact
                    >
                      Geri Dön
                    </Button>
                  </View>
                </>
              )}
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
  button: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  tokenInfoContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#e3f2fd",
    borderRadius: 4,
  },
  tokenInfoLabel: {
    color: "#1976d2",
    fontFamily: "monospace",
    fontSize: 11,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#ffebee",
    borderRadius: 4,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
});
