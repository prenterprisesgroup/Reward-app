import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface CompanyInfoSectionProps {
  company: {
    address: any;
    settlementMethod: string;
    gstNumber: string;
    createdAt: string;
    phone: string;
  };
}

export function CompanyInfoSection({ company }: CompanyInfoSectionProps) {
  const getAddress = () => {
    if (!company.address) return 'N/A';
    if (typeof company.address === 'string') return company.address;
    return `${company.address.street || ''}, ${company.address.city || ''}\n${company.address.state || ''} - ${company.address.pincode || ''}`;
  };

  const infoItems = [
    {
      icon: <Feather name="map-pin" size={16} color={theme.colors.success} />,
      label: 'Registered Address',
      value: getAddress()
    },
    {
      icon: <MaterialCommunityIcons name="bank-outline" size={16} color={theme.colors.success} />,
      label: 'Settlement Method',
      value: company.settlementMethod === 'AUTOMATIC' ? 'Automatic Settlement' : 'Manual Settlement'
    },
    {
      icon: <Feather name="file-text" size={16} color={theme.colors.success} />,
      label: 'GST Number',
      value: company.gstNumber || 'N/A'
    },
    {
      icon: <Feather name="calendar" size={16} color={theme.colors.success} />,
      label: 'Created Date',
      value: new Date(company.createdAt).toLocaleString()
    },
    {
      icon: <Feather name="phone" size={16} color={theme.colors.success} />,
      label: 'Primary Contact',
      value: company.phone || 'N/A'
    }
  ];

  return (
    <View style={styles.container}>
      <Typography style={styles.sectionTitle} variant="title">Company Information</Typography>
      
      <View style={styles.grid}>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.iconContainer}>
              {item.icon}
            </View>
            <View style={styles.textContainer}>
              <Typography style={styles.label}>{item.label}</Typography>
              <Typography style={styles.value}>{item.value}</Typography>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '47%', // 2 columns
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  }
});
