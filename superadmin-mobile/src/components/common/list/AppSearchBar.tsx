import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SearchBar } from '../../forms/SearchBar';
import { useDebounce } from '../../../hooks/useDebounce';

interface AppSearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  initialValue?: string;
  delay?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppSearchBar = React.memo(({
  placeholder = 'Search...',
  onSearch,
  initialValue = '',
  delay = 500,
  containerStyle,
}: AppSearchBarProps) => {
  const [internalValue, setInternalValue] = useState(initialValue);
  const debouncedValue = useDebounce(internalValue, delay);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setInternalValue('');
  };

  return (
    <SearchBar
      value={internalValue}
      onChangeText={setInternalValue}
      placeholder={placeholder}
      onClear={handleClear}
      containerStyle={[styles.container, containerStyle]}
    />
  );
});

AppSearchBar.displayName = 'AppSearchBar';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
