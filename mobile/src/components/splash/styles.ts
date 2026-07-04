import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // #F8F8F6
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Background Decor ---
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  abstractCircleLarge: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    opacity: 0.1,
    top: -100,
    right: -200,
  },
  abstractCircleSmall: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    opacity: 0.1,
    top: 0,
    right: -100,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    opacity: 0.2,
  },
  bottomSkyline: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 200,
    opacity: 0.05, // very subtle
  },
  bottomLeavesLeft: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 150,
    height: 150,
    opacity: 0.4,
  },
  bottomLeavesRight: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 150,
    height: 150,
    opacity: 0.4,
  },
  
  // --- Foreground Content ---
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1,
    paddingHorizontal: theme.spacing['2xl'],
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  illustration: {
    width: 250,
    height: 250,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  giftIcon: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.headingLg,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    width: '60%',
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerStar: {
    marginHorizontal: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.size.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.size.bodyLarge * theme.typography.lineHeight.normal,
    fontWeight: '500',
  },
  loaderContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  loaderRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.borderLight,
    borderTopColor: theme.colors.accent,
    borderRightColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loaderDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    marginHorizontal: 2,
  },
  loadingText: {
    fontSize: theme.typography.size.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.pill,
    ...theme.shadows.sm,
    position: 'absolute',
    bottom: 120, // Keep above the skyline slightly
    alignSelf: 'center',
    width: '90%',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIcon: {
    marginRight: theme.spacing.xs,
  },
  trustText: {
    fontSize: theme.typography.size.bodySmall,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  trustDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
});
