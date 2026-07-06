import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography, PrimaryButton, InputField, PasswordInput, OTPInput, Checkbox, SearchBar, Card, Header } from '../../components';
import { theme } from '../../constants/theme';

const TypographyRow = ({ label, variant }: { label: string; variant: any }) => (
  <View style={styles.typoRow}>
    <View style={styles.typoHeader}>
      <Typography variant="caption" color="textTertiary" weight="semiBold" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
    </View>
    <Typography variant={variant} color="textPrimary">
      Sphinx of black quartz, judge my vow.
    </Typography>
  </View>
);

export default function PlaygroundScreen() {
  const [interactivePassword, setInteractivePassword] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let interval: any;
    if (otpCountdown > 0) {
      interval = setInterval(() => setOtpCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);
  
  return (
    <ScreenWrapper scroll paddingHorizontal={theme.spacing?.lg ?? 16} paddingVertical={theme.spacing?.xl ?? 20}>
      <View style={styles.header}>
        <Typography variant="displayMd">UI Playground</Typography>
        <Typography variant="subtitle" color="textSecondary">
          Enterprise Reusable Components Preview
        </Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Typography Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Apple Human Interface Guidelines inspired typography system.
        </Typography>

        <View style={styles.showcaseCard}>
          <TypographyRow label="Display Lg" variant="displayLg" />
          <View style={styles.divider} />
          <TypographyRow label="Display Md" variant="displayMd" />
          <View style={styles.divider} />
          <TypographyRow label="Heading Xl" variant="headingXl" />
          <View style={styles.divider} />
          <TypographyRow label="Heading Lg" variant="headingLg" />
          <View style={styles.divider} />
          <TypographyRow label="Heading Md" variant="headingMd" />
          <View style={styles.divider} />
          <TypographyRow label="Heading Sm" variant="headingSm" />
          <View style={styles.divider} />
          <TypographyRow label="Title" variant="title" />
          <View style={styles.divider} />
          <TypographyRow label="Subtitle" variant="subtitle" />
          <View style={styles.divider} />
          <TypographyRow label="Body Large" variant="bodyLarge" />
          <View style={styles.divider} />
          <TypographyRow label="Body" variant="body" />
          <View style={styles.divider} />
          <TypographyRow label="Body Small" variant="bodySmall" />
          <View style={styles.divider} />
          <TypographyRow label="Caption" variant="caption" />
          <View style={styles.divider} />
          <TypographyRow label="Label" variant="label" />
          <View style={styles.divider} />
          <TypographyRow label="Button" variant="button" />
          <View style={styles.divider} />
          <TypographyRow label="Overline" variant="overline" />
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Buttons Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Premium interactive buttons with smooth spring animations.
        </Typography>

        <View style={styles.showcaseCard}>
          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>SMALL</Typography>
            <PrimaryButton title="Small Button" size="small" onPress={() => {}} />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>MEDIUM (DEFAULT)</Typography>
            <PrimaryButton title="Medium Button" onPress={() => {}} />
          </View>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>LARGE</Typography>
            <PrimaryButton title="Large Button" size="large" onPress={() => {}} />
          </View>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>LOADING</Typography>
            <PrimaryButton title="Loading" loading onPress={() => {}} />
          </View>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>DISABLED</Typography>
            <PrimaryButton title="Disabled Button" disabled onPress={() => {}} />
          </View>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>WITH LEFT ICON</Typography>
            {/* A simple placeholder view for icon */}
            <PrimaryButton 
              title="Left Icon" 
              leftIcon={<View style={{ width: 16, height: 16, backgroundColor: 'white', borderRadius: 8 }} />} 
              onPress={() => {}} 
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.buttonRow}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={styles.buttonLabel}>WITH RIGHT ICON</Typography>
            <PrimaryButton 
              title="Right Icon" 
              rightIcon={<View style={{ width: 16, height: 16, backgroundColor: 'white', borderRadius: 8 }} />} 
              onPress={() => {}} 
            />
          </View>
          <View style={styles.divider} />

          <View style={[styles.buttonRow, { alignItems: 'stretch' }]}>
            <Typography variant="caption" color="textTertiary" weight="semiBold" style={[styles.buttonLabel, { alignSelf: 'flex-start' }]}>FULL WIDTH</Typography>
            <PrimaryButton title="Full Width Button" fullWidth onPress={() => {}} />
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Input Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Apple Human Interface inspired floating label inputs.
        </Typography>

        <View style={styles.showcaseCard}>
          <InputField label="Default Input" placeholder="Tap to focus" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Focused (Simulated)" value="Focus state" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Filled" value="Filled value" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Error Input" error="This field is required." />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <InputField label="Success Input" success helperText="Looks good!" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Disabled Input" value="Cannot edit me" editable={false} />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Phone Input" keyboardType="phone-pad" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField label="Email Input" keyboardType="email-address" autoCapitalize="none" />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField 
            label="With Left Icon" 
            leftIcon={<View style={{ width: 24, height: 24, backgroundColor: theme.colors.placeholder, borderRadius: 12 }} />} 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <InputField 
            label="With Right Icon" 
            rightIcon={<View style={{ width: 24, height: 24, backgroundColor: theme.colors.placeholder, borderRadius: 12 }} />} 
          />
        </View>
      </View>
      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Password Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Live validation, strength tracking, and animated requirements.
        </Typography>

        <View style={styles.showcaseCard}>
          <PasswordInput 
            label="Interactive Password" 
            placeholder="Type to test strength..." 
            value={interactivePassword}
            onChangeText={setInteractivePassword}
            showStrength
            showRequirements
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <PasswordInput 
            label="Weak Password (Static)" 
            value="weak" 
            showStrength 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <PasswordInput 
            label="Strong Password (Static)" 
            value="StrongP@ss123" 
            showStrength 
            showRequirements 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <PasswordInput 
            label="Error State" 
            value="short"
            error="Password does not meet requirements" 
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">OTP Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Six digit secure OTP inputs with SMS auto-fill and countdown.
        </Typography>

        <View style={styles.showcaseCard}>
          <Typography variant="subtitle" style={{ marginBottom: 16 }}>Interactive (Try pasting 123456)</Typography>
          <OTPInput 
            value={otpValue}
            onChange={setOtpValue}
            countdown={otpCountdown}
            onResend={() => setOtpCountdown(30)}
          />
          <View style={[styles.divider, { marginVertical: 24 }]} />
          
          <Typography variant="subtitle" style={{ marginBottom: 16 }}>Error State</Typography>
          <OTPInput 
            value="123"
            error="Invalid verification code"
          />
          <View style={[styles.divider, { marginVertical: 24 }]} />

          <Typography variant="subtitle" style={{ marginBottom: 16 }}>Success State</Typography>
          <OTPInput 
            value="123456"
            success
          />
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Checkbox Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Apple Human Interface inspired animated checkboxes.
        </Typography>

        <View style={styles.showcaseCard}>
          <Checkbox 
            label="Default Unchecked" 
            checked={false} 
            onChange={() => {}} 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <Checkbox 
            label="Checked State" 
            checked={true} 
            onChange={() => {}} 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <Checkbox 
            label="Remember Me (Interactive)" 
            checked={rememberMe} 
            onChange={setRememberMe} 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <Checkbox 
            label="I accept the Terms & Conditions" 
            checked={termsAccepted} 
            onChange={setTermsAccepted} 
            required 
            error={!termsAccepted && "You must accept the terms"}
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <Checkbox 
            label="Small Size" 
            checked={true} 
            size="small" 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <Checkbox 
            label="Large Size" 
            checked={true} 
            size="large" 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <Checkbox 
            label="Disabled Checked" 
            checked={true} 
            disabled 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <Checkbox 
            label="Disabled Unchecked" 
            checked={false} 
            disabled 
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <Checkbox 
            label="Push Notifications (Left Label)" 
            checked={true} 
            leftLabel 
            helperText="Receive updates on your mobile device"
          />
        </View>
      </View>
      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Search Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Premium instant search bars with animated states.
        </Typography>

        <View style={styles.showcaseCard}>
          <SearchBar 
            placeholder="Search workers or companies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <SearchBar 
            placeholder="Focused Search (Simulated)"
            value="John Doe"
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <SearchBar 
            placeholder="Searching..."
            value="Batch #49"
            loading
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />
          
          <SearchBar 
            placeholder="Disabled Search"
            value="Cannot type here"
            disabled
          />
          <View style={[styles.divider, { marginVertical: 16 }]} />

          <SearchBar 
            placeholder="Search with Filter Icon"
            rightIcon={<Typography variant="body" color="primary" weight="semiBold">Filter</Typography>}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Typography variant="headingMd" color="primary">Card Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Apple Human Interface inspired foundation cards.
        </Typography>

        <Card 
          title="Default Card"
          subtitle="This is a standard default card."
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Cards are the foundational surface for grouping related content and actions.
          </Typography>
        </Card>

        <Card 
          variant="elevated"
          title="Elevated Card"
          subtitle="Casts a medium shadow"
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Elevated cards sit higher on the Z-axis, drawing more attention.
          </Typography>
        </Card>

        <Card 
          variant="outlined"
          title="Outlined Card"
          subtitle="Uses border instead of shadow"
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Great for subtle groupings or dense layouts.
          </Typography>
        </Card>

        <Card 
          variant="flat"
          title="Flat Card"
          subtitle="No border, no shadow"
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Useful for deep nesting inside other cards.
          </Typography>
        </Card>

        <Card 
          title="Pressable Card"
          subtitle="Tap to see animation"
          onPress={() => {}}
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Pressable cards slightly shrink and elevate their shadow.
          </Typography>
        </Card>

        <Card 
          title="Card with Actions"
          subtitle="Header and Footer"
          rightElement={<Typography variant="button" color="primary">Edit</Typography>}
          footer={<PrimaryButton title="Confirm Action" fullWidth onPress={() => {}} />}
          style={{ marginBottom: 16 }}
        >
          <Typography variant="body" color="textPrimary">
            Headers and footers are automatically separated by elegant dividers.
          </Typography>
        </Card>

        <Card 
          title="Nested Cards"
          style={{ marginBottom: 16 }}
        >
          <Card variant="flat" title="Inner Card 1" style={{ marginBottom: 8 }} />
          <Card variant="flat" title="Inner Card 2" />
        </Card>

      </View>

      <View style={[styles.section, { paddingBottom: 100 }]}>
        <Typography variant="headingMd" color="primary">Header Showcase</Typography>
        <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
          Universal application headers with Safe Area support.
        </Typography>

        <View style={styles.showcaseCard}>
          <Typography variant="subtitle" style={{ marginBottom: 8 }}>Simple Header</Typography>
          <View style={styles.headerMockupContainer}>
            <Header title="Settings" safeArea={false} />
          </View>
          <View style={[styles.divider, { marginVertical: 24 }]} />

          <Typography variant="subtitle" style={{ marginBottom: 8 }}>Large Title Header</Typography>
          <View style={styles.headerMockupContainer}>
            <Header 
              title="Dashboard" 
              subtitle="Welcome back, Sarah" 
              safeArea={false}
              leftComponent={
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body" weight="bold" color="surface">S</Typography>
                </View>
              }
            />
          </View>
          <View style={[styles.divider, { marginVertical: 24 }]} />

          <Typography variant="subtitle" style={{ marginBottom: 8 }}>Header with Back Button</Typography>
          <View style={styles.headerMockupContainer}>
            <Header title="Edit Profile" showBackButton onBackPress={() => {}} safeArea={false} />
          </View>
          <View style={[styles.divider, { marginVertical: 24 }]} />
          
          <Typography variant="subtitle" style={{ marginBottom: 8 }}>Centered Header with Actions</Typography>
          <View style={styles.headerMockupContainer}>
            <Header 
              title="Wallet" 
              centerTitle 
              showBackButton 
              onBackPress={() => {}}
              safeArea={false} 
              elevated
              rightComponent={
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body">🔔</Typography>
                </View>
              }
            />
          </View>
          <View style={[styles.divider, { marginVertical: 24 }]} />

          <Typography variant="subtitle" style={{ marginBottom: 8 }}>Transparent Header</Typography>
          <View style={[styles.headerMockupContainer, { backgroundColor: theme.colors.background }]}>
            <Header 
              title="QR Scanner" 
              transparent 
              showBackButton 
              onBackPress={() => {}}
              safeArea={false} 
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing?.['3xl'] ?? 32,
    gap: theme.spacing?.sm ?? 8,
  },
  section: {
    gap: theme.spacing?.sm ?? 8,
    marginBottom: theme.spacing?.['4xl'] ?? 40,
  },
  showcaseCard: {
    backgroundColor: theme.colors?.surface ?? '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing?.lg ?? 16,
    borderWidth: 1,
    borderColor: theme.colors?.border ?? '#E8E8E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typoRow: {
    paddingVertical: theme.spacing?.md ?? 12,
  },
  typoHeader: {
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors?.border ?? '#E8E8E5',
    opacity: 0.5,
  },
  buttonRow: {
    paddingVertical: theme.spacing?.md ?? 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  headerMockupContainer: {
    backgroundColor: theme.colors?.surface ?? '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors?.border ?? '#E8E8E5',
    borderRadius: theme.radius?.xl ?? 16,
    overflow: 'hidden',
  }
});
