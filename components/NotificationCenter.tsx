import { Notification } from "@/api/client";
import { useNotificationHistory } from "@/hooks/useNotificationQueries";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge, Card, Chip, IconButton, Text } from "react-native-paper";

interface NotificationCenterProps {
  limit?: number;
  showHeader?: boolean;
}

export default function NotificationCenter({
  limit = 10,
  showHeader = true,
}: NotificationCenterProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [menuVisible, setMenuVisible] = useState(false);

  // GET /api/notifications/history endpoint'ini kullan
  const { data: historyData, isLoading } = useNotificationHistory({
    read: filter === "all" ? undefined : filter === "read",
    type: typeFilter,
    limit,
  });

  // Paginated response'dan notifications array'ini al
  const notifications = historyData?.notifications || [];
  const totalItems = historyData?.totalItems || 0;
  const currentPage = historyData?.currentPage || 1;
  const totalPages = historyData?.totalPages || 0;

  // Unread sayısını history'den hesapla
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "check-circle";
      case "warning":
        return "alert";
      case "error":
        return "alert-circle";
      default:
        return "information";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      default:
        return "#2196f3";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Bildirimler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View>
                <Text variant="titleLarge" style={styles.headerTitle}>
                  Bildirimler
                </Text>
                {unreadCount > 0 && (
                  <Text variant="bodySmall" style={styles.unreadText}>
                    {unreadCount} okunmamış
                  </Text>
                )}
                {totalItems > 0 && (
                  <Text variant="bodySmall" style={styles.totalText}>
                    Toplam: {totalItems}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.filterRow}>
              <Chip
                selected={filter === "all"}
                onPress={() => setFilter("all")}
                style={styles.filterChip}
              >
                Tümü
              </Chip>
              <Chip
                selected={filter === "unread"}
                onPress={() => setFilter("unread")}
                style={styles.filterChip}
              >
                Okunmamış
              </Chip>
              <Chip
                selected={filter === "read"}
                onPress={() => setFilter("read")}
                style={styles.filterChip}
              >
                Okunmuş
              </Chip>
            </View>

            <View style={styles.typeFilterRow}>
              <Chip
                selected={typeFilter === undefined}
                onPress={() => setTypeFilter(undefined)}
                style={styles.typeChip}
                mode="outlined"
              >
                Hepsi
              </Chip>
              <Chip
                selected={typeFilter === "info"}
                onPress={() => setTypeFilter("info")}
                style={styles.typeChip}
                mode="outlined"
              >
                Bilgi
              </Chip>
              <Chip
                selected={typeFilter === "success"}
                onPress={() => setTypeFilter("success")}
                style={styles.typeChip}
                mode="outlined"
              >
                Başarılı
              </Chip>
              <Chip
                selected={typeFilter === "warning"}
                onPress={() => setTypeFilter("warning")}
                style={styles.typeChip}
                mode="outlined"
              >
                Uyarı
              </Chip>
              <Chip
                selected={typeFilter === "error"}
                onPress={() => setTypeFilter("error")}
                style={styles.typeChip}
                mode="outlined"
              >
                Hata
              </Chip>
            </View>
          </Card.Content>
        </Card>
      )}

      <ScrollView style={styles.scrollView}>
        {filteredNotifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                Bildirim bulunamadı
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
            >
              <Card.Content>
                <TouchableOpacity
                  onPress={() => {
                    // Notification'a tıklandığında yapılacak işlemler
                    // Backend'de mark as read endpoint'i yok, bu yüzden sadece görüntüleme
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationTitleRow}>
                        <IconButton
                          icon={getNotificationIcon(notification.type)}
                          iconColor={getNotificationColor(notification.type)}
                          size={20}
                          style={styles.typeIcon}
                        />
                        <View style={styles.titleContainer}>
                          <Text
                            variant="titleMedium"
                            style={[
                              styles.notificationTitle,
                              !notification.read && styles.unreadTitle,
                            ]}
                          >
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <Badge style={styles.unreadBadge} />
                          )}
                        </View>
                      </View>
                    </View>

                    <Text
                      variant="bodyMedium"
                      style={styles.notificationMessage}
                    >
                      {notification.message}
                    </Text>

                    <View style={styles.notificationFooter}>
                      <Chip
                        icon={getNotificationIcon(notification.type)}
                        style={[
                          styles.typeChip,
                          {
                            backgroundColor: `${getNotificationColor(
                              notification.type
                            )}20`,
                          },
                        ]}
                        textStyle={{
                          color: getNotificationColor(notification.type),
                          fontSize: 10,
                        }}
                      >
                        {notification.type}
                      </Chip>
                      <Text variant="bodySmall" style={styles.dateText}>
                        {new Date(notification.createdAt).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: "bold",
  },
  unreadText: {
    color: "#6200ee",
    marginTop: 4,
  },
  totalText: {
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  filterChip: {
    marginRight: 4,
  },
  typeFilterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  typeChip: {
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
  notificationCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee",
    backgroundColor: "#f3e5f5",
  },
  notificationContent: {
    paddingVertical: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    margin: 0,
    marginRight: 4,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    flex: 1,
    fontWeight: "600",
  },
  unreadTitle: {
    fontWeight: "bold",
  },
  unreadBadge: {
    marginLeft: 8,
    backgroundColor: "#6200ee",
  },
  notificationMessage: {
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    color: "#999",
  },
});
