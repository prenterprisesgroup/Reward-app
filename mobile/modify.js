const fs = require('fs');
let content = fs.readFileSync('src/app/WorkerHomeScreen.tsx', 'utf-8');

// 1. Replace Text with Typography
if (!content.includes('import { Typography }')) {
    content = content.replace(
        "import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';",
        "import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';\nimport { Typography } from '../components/common/Typography';"
    );
}
content = content.replace(/<Text /g, '<Typography ');
content = content.replace(/<Text>/g, '<Typography>');
content = content.replace(/<\/Text>/g, '</Typography>');

// 2. Add hitSlop
const hitSlop = ' hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}';
content = content.replace(
    /<TouchableOpacity><Typography style=\{styles\.viewAll\}/g,
    `<TouchableOpacity${hitSlop} accessible={true} accessibilityRole="button" accessibilityLabel="View all"><Typography style={styles.viewAll}`
);
content = content.replace(
    'style={styles.notificationBtn}',
    `style={styles.notificationBtn}${hitSlop} accessible={true} accessibilityRole="button" accessibilityLabel="Notifications"`
);

// 3. Safe Area Insets
if (!content.includes('useSafeAreaInsets')) {
    content = content.replace(
        "import { SafeAreaView, Dimensions } from 'react-native';",
        "import { SafeAreaView, Dimensions } from 'react-native';\nimport { useSafeAreaInsets } from 'react-native-safe-area-context';"
    );
    content = content.replace(
        "export default function WorkerHomeScreen() {\n  return (",
        "export default function WorkerHomeScreen() {\n  const insets = useSafeAreaInsets();\n  const bottomSpacing = Math.max(insets.bottom + 12, 24);\n\n  return ("
    );
    content = content.replace(
        '<View style={styles.bottomNavWrapper}>',
        '<View style={[styles.bottomNavWrapper, { bottom: bottomSpacing }]}>'
    );
    content = content.replace(
        '    bottom: 24, // Respects safe area visually\n',
        '    // bottom is dynamic now\n'
    );
}

// 4. Accessibility
content = content.replace(/style=\{styles\.actionCard\}/g, 'style={styles.actionCard} accessible={true} accessibilityRole="button"');
content = content.replace(/style=\{styles\.navItem\}/g, 'style={styles.navItem} accessible={true} accessibilityRole="tab"');
content = content.replace('style={styles.floatingWalletBtn}', 'style={styles.floatingWalletBtn} accessible={true} accessibilityRole="button" accessibilityLabel="Wallet Scanner"');

// 5. FlexShrink & Name Wrap
content = content.replace("marginVertical: 4,", "marginVertical: 4,\n    flexWrap: 'wrap',");
content = content.replace('<Typography style={styles.headerName} numberOfLines={1}>Ankit </Typography>', '<Typography style={styles.headerName}>Ankit </Typography>');

fs.writeFileSync('src/app/WorkerHomeScreen.tsx', content, 'utf-8');
console.log('Modifications applied successfully.');
