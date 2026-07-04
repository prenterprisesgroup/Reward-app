import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';

// In a real setup, you would import the theme directly:
// import { theme } from '../../constants/theme';

export interface ScreenWrapperProps {
  children: ReactNode;
  /** If true, wraps content in a ScrollView. If false, wraps in a standard View. */
  scroll?: boolean;
  /** Current state of the refresh control (only applicable if scroll=true and onRefresh is provided) */
  refreshing?: boolean;
  /** Callback fired when pull-to-refresh is triggered */
  onRefresh?: () => void;
  /** Screen background color. Defaults to theme background. */
  backgroundColor?: string;
  /** Styles applied to the inner content container (useful for flex properties) */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Styles applied to the View wrapping the children */
  style?: StyleProp<ViewStyle>;
  /** SafeAreaView edges to respect. Defaults to all edges. */
  safeAreaEdges?: Edge[];
  /** Keyboard offset for KeyboardAvoidingView. Helpful if you have custom headers. */
  keyboardOffset?: number;
  /** Status bar style (light, dark, auto) */
  statusBarStyle?: StatusBarStyle;
  /** Horizontal padding. Defaults to theme standard spacing. */
  paddingHorizontal?: number;
  /** Vertical padding. */
  paddingVertical?: number;
}

export function ScreenWrapper({
  children,
  scroll = false,
  refreshing = false,
  onRefresh,
  backgroundColor,
  contentContainerStyle,
  style,
  safeAreaEdges = ['top', 'bottom', 'left', 'right'],
  keyboardOffset = 0,
  statusBarStyle = 'auto',
  paddingHorizontal,
  paddingVertical,
}: ScreenWrapperProps) {
  
  // NOTE: Falling back to hex codes temporarily since the physical theme.ts file hasn't been created on disk yet.
  // Replace these with theme.colors.background and theme.spacing.lg respectively.
  const bgColor = backgroundColor || '#F8F8F6'; 
  const pHorizontal = paddingHorizontal ?? 16;
  const pVertical = paddingVertical ?? 0;

  const content = (
    <View style={[styles.innerContainer, { paddingHorizontal: pHorizontal, paddingVertical: pVertical }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={statusBarStyle} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#84A98C" // theme.colors.primary
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.fixedContent, contentContainerStyle]}>
            {content}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fixedContent: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
});
