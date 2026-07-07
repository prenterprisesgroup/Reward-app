import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Search, User, X } from 'lucide-react-native';
import { theme } from '../../../constants/theme';
import { useRecipientSearchQuery } from '../hooks/useNotifications';
import { RecipientModel } from '../types/notifications.types';

interface Props {
  value: string; // The selected recipient ID
  onChange: (recipientId: string) => void;
  error?: string;
}

export const RecipientSearchInput = ({ value, onChange, error }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientModel | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const { data: recipients, isFetching } = useRecipientSearchQuery(debouncedTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (recipient: RecipientModel) => {
    setSelectedRecipient(recipient);
    onChange(recipient.id);
    setSearchTerm('');
    setIsDropdownVisible(false);
  };

  const handleClear = () => {
    setSelectedRecipient(null);
    onChange('');
    setSearchTerm('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Recipient</Text>
      
      {selectedRecipient ? (
        <View style={[styles.selectedCard, error ? styles.inputError : null]}>
          <View style={styles.selectedInfo}>
            <User size={16} color={theme.colors.primaryDark} style={styles.icon} />
            <View>
              <Text style={styles.selectedName}>{selectedRecipient.name}</Text>
              <Text style={styles.selectedDetail}>
                {selectedRecipient.email || selectedRecipient.phone || selectedRecipient.id}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchWrapper}>
          <View style={[styles.inputContainer, error ? styles.inputError : null]}>
            <Search size={18} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Search by name, email, or phone..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchTerm}
              onChangeText={(txt) => {
                setSearchTerm(txt);
                setIsDropdownVisible(true);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isFetching && <ActivityIndicator size="small" color={theme.colors.primaryDark} />}
          </View>

          {isDropdownVisible && debouncedTerm.length >= 2 && (
            <View style={styles.dropdown}>
              {recipients && recipients.length > 0 ? (
                <FlatList
                  data={recipients}
                  keyExtractor={item => item.id}
                  keyboardShouldPersistTaps="handled"
                  style={styles.dropdownList}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelect(item)}>
                      <Text style={styles.dropdownName}>{item.name}</Text>
                      <Text style={styles.dropdownDetail}>
                        {item.email || item.phone || item.id}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                !isFetching && (
                  <View style={styles.dropdownEmpty}>
                    <Text style={styles.emptyText}>No users found.</Text>
                  </View>
                )
              )}
            </View>
          )}
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    zIndex: 10, // Ensure dropdown renders over other fields
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedName: {
    ...theme.typography.body,
    fontWeight: 'bold',
  },
  selectedDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  clearBtn: {
    padding: 4,
  },
  searchWrapper: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    height: '100%',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 20,
  },
  dropdownList: {
    flexGrow: 0,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  dropdownName: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  dropdownDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  dropdownEmpty: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  }
});
