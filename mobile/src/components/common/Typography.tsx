import React, { ReactNode } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

export type TypographyVariant =
  | 'displayLg'
  | 'displayMd'
  | 'headingXl'
  | 'headingLg'
  | 'headingMd'
  | 'headingSm'
  | 'title'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button'
  | 'overline';

export type TypographyWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

export interface TypographyProps extends TextProps {
  /** The text content to display */
  children: ReactNode;
  /** The typography variant defining size and line-height. Defaults to 'body' */
  variant?: TypographyVariant;
  /** Font weight. Inherits default weight for variant if not explicitly set. */
  weight?: TypographyWeight;
  /** Text color. Can be a theme color key or a valid color string. Defaults to textPrimary. */
  color?: string;
  /** Text alignment */
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  /** Max lines before truncating. Passed to native Text component. */
  numberOfLines?: number;
  /** Optional custom styles */
  style?: TextStyle | TextStyle[];
}

/**
 * Returns the default font weight for a given variant.
 */
function getDefaultWeight(variant: TypographyVariant): TypographyWeight {
  switch (variant) {
    case 'displayLg':
    case 'displayMd':
    case 'headingXl':
    case 'headingLg':
      return 'bold';
    case 'headingMd':
    case 'headingSm':
    case 'title':
    case 'button':
    case 'overline':
      return 'semiBold';
    case 'subtitle':
      return 'medium';
    default:
      return 'regular';
  }
}

/**
 * The only text component allowed in the application.
 * Utilizes the enterprise theme design tokens.
 */
export const Typography = React.memo(
  ({
    children,
    variant = 'body',
    weight,
    color,
    align = 'left',
    numberOfLines,
    style,
    ...rest
  }: TypographyProps) => {
    
    // Resolve styling tokens
    const fontSize = theme.typography.size[variant];
    const resolvedWeight = weight || getDefaultWeight(variant);
    const fontFamily = theme.typography.family[resolvedWeight];
    
    // Line height multiplier logic based on variant scale
    let lineHeightMultiplier = theme.typography.lineHeight.normal;
    if (fontSize >= theme.typography.size.headingLg) {
      lineHeightMultiplier = theme.typography.lineHeight.tight;
    } else if (variant === 'caption' || variant === 'label' || variant === 'overline') {
      lineHeightMultiplier = theme.typography.lineHeight.relaxed;
    }
    const lineHeight = Math.round(fontSize * lineHeightMultiplier);

    // Resolve color (Check if it's a theme token, otherwise use verbatim, else fallback)
    let textColor = theme.colors.textPrimary;
    if (color) {
      // Fast check if it exists in our color theme object
      textColor = (theme.colors as Record<string, string>)[color] || color;
    }

    const textStyles: TextStyle = {
      fontFamily,
      fontSize,
      lineHeight,
      color: textColor,
      textAlign: align,
      // React Native doesn't perfectly support letter spacing uniformly, but we can add basic defaults
      letterSpacing: variant === 'overline' ? 1.5 : 0,
      textTransform: variant === 'overline' ? 'uppercase' : 'none',
    };

    return (
      <Text
        style={[textStyles, style]}
        numberOfLines={numberOfLines}
        allowFontScaling={true} // Accessibility: respect user device font size
        maxFontSizeMultiplier={2} // Accessibility: cap scaling to prevent UI destruction
        {...rest}
      >
        {children}
      </Text>
    );
  }
);

Typography.displayName = 'Typography';
