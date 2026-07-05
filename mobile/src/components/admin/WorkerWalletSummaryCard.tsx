import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';

// Optional: If you had an SVG wave, you could use react-native-svg here. 
// For now we'll simulate the decorative bottom with a soft background gradient or shape.

interface WorkerWalletSummaryCardProps {
  walletBalance: number;
  pendingWithdrawal: number;
  lifetimeRewards: number;
}

export const WorkerWalletSummaryCard = React.memo(({ 
  walletBalance, 
  pendingWithdrawal, 
  lifetimeRewards 
}: WorkerWalletSummaryCardProps) => {
  return (
    <View style={styles.container}>
      <WalletCard 
        title="Current Wallet Balance"
        value={walletBalance}
        icon="wallet"
        color={theme.colors.success}
        bgColor={theme.colors.successLight}
      />
      <WalletCard 
        title="Pending Withdrawal"
        value={pendingWithdrawal}
        icon="clock"
        color={theme.colors.warning}
        bgColor={theme.colors.warningLight}
      />
      <WalletCard 
        title="Lifetime Rewards"
        value={lifetimeRewards}
        icon="gift"
        color={theme.colors.success}
        bgColor={theme.colors.successLight}
      />
    </View>
  );
});

const WalletCard = ({ title, value, icon, color, bgColor }: any) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
      <Feather name={icon} size={16} color={color} />
    </View>
    <View style={styles.content}>
      <Typography variant="caption" style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {title}
      </Typography>
      <Typography variant="title" weight="bold" style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        ₹{value.toLocaleString('en-IN')}
      </Typography>
    </View>
    <View style={[styles.decorativeWave, { backgroundColor: bgColor, opacity: 0.5 }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
    overflow: 'hidden',
    position: 'relative',
    height: 110,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginBottom: 4,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
  decorativeWave: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    borderRadius: 20,
    transform: [{ scaleX: 1.5 }, { rotate: '-10deg' }],
  }
});
