
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity, Swipeable } from 'react-native-gesture-handler';
import { Bell, Gift, CheckCircle, XCircle, QrCode, Building, User, ShieldAlert } from 'lucide-react-native';
import { InAppNotification } from '../hooks/useNotifications';

export interface NotificationColors {
  primary: string;
  success: string;
  error: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
}

export interface NotificationCardProps {
  notification: InAppNotification;
  colors: NotificationColors;
  onPress: (notification: InAppNotification) => void;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

function formatDistanceToNow(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

const NotificationCardComponent: React.FC<NotificationCardProps> = ({ 
  notification, 
  colors,
  onPress, 
  onDelete, 
  onMarkRead 
}) => {
  const getIcon = () => {
    const props = { size: 24, color: notification.isRead ? colors.textSecondary : colors.primary };
    switch (notification.iconType) {
      case 'GIFT': return <Gift {...props} />;
      case 'WALLET_CHECK': return <CheckCircle {...props} color={colors.success} />;
      case 'WALLET_X': return <XCircle {...props} color={colors.error} />;
      case 'QR': return <QrCode {...props} />;
      case 'COMPANY': return <Building {...props} />;
      case 'USER': return <User {...props} />;
      case 'SHIELD': return <ShieldAlert {...props} color={colors.error} />;
      default: return <Bell {...props} />;
    }
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightActions}>
        {!notification.isRead && onMarkRead && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => onMarkRead(notification._id)}
          >
            <Text style={styles.actionText}>Read</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => onDelete(notification._id)}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity 
        style={[
          styles.container, 
          { backgroundColor: notification.isRead ? colors.surface : colors.surfaceHighlight },
          notification.priority === 'CRITICAL' && { borderLeftColor: colors.error, borderLeftWidth: 4 }
        ]}
        onPress={() => onPress(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {getIcon()}
          {!notification.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatDistanceToNow(notification.createdAt)}
            </Text>
          </View>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: -2,
    right: -2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  }
});

export const NotificationCard = React.memo(NotificationCardComponent);

