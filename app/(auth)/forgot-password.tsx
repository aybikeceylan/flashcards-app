import { authApi } from "@/api/client";
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const router = useRouter();

  const handleForgotPassword = async () => {
    // Validation
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

    setLoading(true);
    setError(null);
    setResetToken(null);

    try {
      const response = await authApi.forgotPassword({
        email: email.trim(),
      });

      console.log("Forgot password response:", response.data);

      if (response.data.success) {
        setSuccess(true);
        setError(null);
        setApiMessage(response.data.message || null);
        // Development ortamında token'ı göster
        if (response.data.data?.resetToken) {
          setResetToken(response.data.data.resetToken);
        }
      } else {
        setError(response.data.message || "Bir hata oluştu");
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Şifre sıfırlama isteği gönderilirken bir hata oluştu";
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
              {success ? (
                <>
                  <Text variant="headlineMedium" style={styles.title}>
                    {resetToken ? "Token Oluşturuldu" : "E-posta Gönderildi"}
                  </Text>
                  {apiMessage && (
                    <Text variant="bodyMedium" style={styles.apiMessage}>
                      {apiMessage}
                    </Text>
                  )}
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    {resetToken
                      ? "Development modunda e-posta gönderilmedi, ancak şifre sıfırlama token'ı oluşturuldu. Aşağıdaki token ile şifrenizi sıfırlayabilirsiniz."
                      : "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin."}
                  </Text>
                  {!resetToken && (
                    <Text variant="bodySmall" style={styles.infoText}>
                      • E-postanızı spam/gereksiz klasöründe kontrol edin{"\n"}•
                      E-posta birkaç dakika içinde gelebilir{"\n"}• E-posta
                      gelmezse tekrar deneyin
                    </Text>
                  )}
                  {resetToken && (
                    <View style={styles.tokenContainer}>
                      <Text variant="bodySmall" style={styles.tokenLabel}>
                        Geliştirme Modu - Reset Token:
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={styles.tokenText}
                        selectable
                      >
                        {resetToken}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={() => {
                          router.push({
                            pathname: "/(auth)/reset-password",
                            params: { token: resetToken },
                          });
                        }}
                        style={styles.tokenButton}
                        compact
                      >
                        Token ile Şifre Sıfırla
                      </Button>
                    </View>
                  )}
                  <Button
                    mode="contained"
                    onPress={() => router.back()}
                    style={styles.button}
                  >
                    Giriş Sayfasına Dön
                  </Button>
                </>
              ) : (
                <>
                  <Text variant="headlineMedium" style={styles.title}>
                    Şifremi Unuttum
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı
                    gönderelim
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
                    returnKeyType="done"
                    style={styles.input}
                    disabled={loading}
                    blurOnSubmit={true}
                    onSubmitEditing={handleForgotPassword}
                    left={<TextInput.Icon icon="email" />}
                  />

                  <Button
                    mode="contained"
                    onPress={handleForgotPassword}
                    style={styles.button}
                    disabled={loading}
                    loading={loading}
                  >
                    Şifre Sıfırlama Bağlantısı Gönder
                  </Button>

                  <View style={styles.backContainer}>
                    <Button
                      mode="text"
                      onPress={() => router.back()}
                      disabled={loading}
                      compact
                    >
                      Giriş Sayfasına Dön
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
  apiMessage: {
    marginBottom: 12,
    textAlign: "center",
    color: "#ff9800",
    fontWeight: "500",
    padding: 8,
    backgroundColor: "#fff3e0",
    borderRadius: 4,
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
  infoText: {
    marginBottom: 16,
    textAlign: "left",
    color: "#666",
    lineHeight: 20,
  },
  tokenContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tokenLabel: {
    marginBottom: 8,
    fontWeight: "bold",
    color: "#333",
  },
  tokenText: {
    marginBottom: 12,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#6200ee",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 4,
  },
  tokenButton: {
    marginTop: 4,
  },
});
