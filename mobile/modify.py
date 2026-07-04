import re
import sys

def modify_file():
    filepath = r"c:\Users\sv500\PR enterprises-app\Reward-app\mobile\src\app\WorkerHomeScreen.tsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace Text with Typography
    # First, fix imports
    if "import { Typography }" not in content:
        content = content.replace(
            "import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';",
            "import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';\nimport { Typography } from '../components/common/Typography';"
        )
    
    content = content.replace("<Text ", "<Typography ")
    content = content.replace("<Text>", "<Typography>")
    content = content.replace("</Text>", "</Typography>")

    # 2. Add hitSlop to small touchables
    hit_slop = " hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}"
    # View all button
    content = content.replace("<TouchableOpacity><Typography style={styles.viewAll}", f"<TouchableOpacity{hit_slop} accessibilityRole=\"button\" accessibilityLabel=\"View all\"><Typography style={{styles.viewAll}}")
    
    # Notification button
    content = content.replace("style={styles.notificationBtn}", f"style={{styles.notificationBtn}}{hit_slop} accessible={{true}} accessibilityRole=\"button\" accessibilityLabel=\"Notifications\"")

    # 3. Safe Area Insets for bottom nav
    if "useSafeAreaInsets" not in content:
        content = content.replace(
            "import { SafeAreaView, Dimensions } from 'react-native';",
            "import { SafeAreaView, Dimensions } from 'react-native';\nimport { useSafeAreaInsets } from 'react-native-safe-area-context';"
        )
        content = content.replace(
            "import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';",
            "import { View, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';\nimport { useSafeAreaInsets } from 'react-native-safe-area-context';"
        )
        content = content.replace(
            "export default function WorkerHomeScreen() {\n  return (",
            "export default function WorkerHomeScreen() {\n  const insets = useSafeAreaInsets();\n  const bottomSpacing = Math.max(insets.bottom + 12, 24);\n\n  return ("
        )
        # Update style usage
        content = content.replace(
            "<View style={styles.bottomNavWrapper}>",
            "<View style={[styles.bottomNavWrapper, { bottom: bottomSpacing }]}>"
        )
        # Remove hardcoded bottom: 24 in styles
        content = content.replace(
            "    bottom: 24, // Respects safe area visually\n",
            "    // bottom is dynamic now\n"
        )

    # 4. Add accessibility to cards and nav items
    content = content.replace("style={styles.actionCard}", "style={styles.actionCard} accessible={true} accessibilityRole=\"button\"")
    content = content.replace("style={styles.navItem}", "style={styles.navItem} accessible={true} accessibilityRole=\"tab\"")
    content = content.replace("style={styles.floatingWalletBtn}", "style={styles.floatingWalletBtn} accessible={true} accessibilityRole=\"button\" accessibilityLabel=\"Wallet Scanner\"")

    # 5. Fix Name Wrapping
    content = content.replace("marginVertical: 4,", "marginVertical: 4,\n    flexWrap: 'wrap',")
    content = content.replace("<Typography style={styles.headerName} numberOfLines={1}>Ankit </Typography>", "<Typography style={styles.headerName}>Ankit </Typography>")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Modifications applied successfully.")

if __name__ == "__main__":
    modify_file()
