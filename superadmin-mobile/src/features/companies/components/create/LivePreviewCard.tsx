import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Typography } from '../../../../components/common/Typography';
import { theme } from '../../../../constants/theme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CreateCompanyFormValues } from '../../schemas/createCompany.schema';
import { mapFormToDTO } from '../../types/createCompany.types';

export function LivePreviewCard() {
  const { watch } = useFormContext<CreateCompanyFormValues>();
  
  // Watch all values
  const formValues = watch();
  
  // Map form values to DTO for preview rendering safety
  // (We use a partial/mocked mapping since form might be incomplete)
  const name = formValues.name || 'Company Name';
  const initials = name.substring(0, 2).toUpperCase();
  const industry = formValues.industry || 'Industry';
  const displayId = 'CMP-XXXX';
  const status = 'Verification Pending';
  
  const logoUri = formValues.logo;

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logoImage} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Typography variant="headingXl" color="primaryDark">{initials}</Typography>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Typography style={styles.companyName} numberOfLines={1}>{name}</Typography>
        
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Typography style={styles.statusText}>{status}</Typography>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.detailsRow}>
          <View style={styles.infoBlock}>
            <Typography style={styles.label}>Industry</Typography>
            <Typography style={styles.value}>{industry}</Typography>
          </View>
          <View style={styles.infoBlock}>
            <Typography style={styles.label}>Company ID</Typography>
            <Typography style={styles.value}>{displayId}</Typography>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Feather name="info" size={12} color={theme.colors.textTertiary} style={{ marginRight: 6 }} />
        <Typography style={styles.footerText}>Preview updates as you fill details</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
    alignItems: 'center',
  },
  topSection: {
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.warning,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 16,
  },
  detailsRow: {
    width: '100%',
    gap: 16,
  },
  infoBlock: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  }
});
