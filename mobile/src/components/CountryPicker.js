import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  TextInput, StyleSheet
} from 'react-native';
import { COLORS, FONTS } from '../utils/theme';
import { useTranslation } from '../utils/i18n';

const COUNTRIES = [
  'Bangladesh','Burundi','Cameroon','Congo','Côte d\'Ivoire',
  'Egypt',
  'Eritrea','Ethiopia',
  'Ghana','Guinea',
  'India','Indonesia',
  'Kenya',
  'Madagascar','Malawi','Malaysia','Morocco','Mozambique','Myanmar',
  'Nepal','Nigeria',
  'Philippines',
  'Rwanda',
  'Senegal','Sierra Leone','Somalia','South Sudan','Sri Lanka','Sudan',
  'Tanzania','Togo',
  'Uganda',
  'Vietnam',
  'Zambia','Zimbabwe',
  'Other',
].sort();

export default function CountryPicker({ value, onChange, placeholder }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const select = (country) => {
    onChange(country);
    setVisible(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {value || (placeholder ?? t('select_nationality'))}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('select_nationality')}</Text>
            <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t('search_country')}
            placeholderTextColor={COLORS.muted}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, item === value && styles.itemSelected]}
                onPress={() => select(item)}
              >
                <Text style={[styles.itemText, item === value && styles.itemTextSelected]}>
                  {item}
                </Text>
                {item === value && <Text style={{ color: COLORS.gold }}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger:          { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 5, padding: 12, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  triggerValue:     { fontSize: 14, color: COLORS.text, flex: 1 },
  triggerPlaceholder:{ fontSize: 14, color: COLORS.muted, flex: 1 },
  chevron:          { fontSize: 12, color: COLORS.muted },
  modal:            { flex: 1, backgroundColor: COLORS.cream },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 54, backgroundColor: '#1a1108' },
  headerTitle:      { fontFamily: FONTS.display, fontSize: 20, color: '#fff8ee' },
  close:            { fontSize: 20, color: 'rgba(232,201,122,0.6)', paddingHorizontal: 8 },
  search:           { margin: 12, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 7, padding: 12, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.surface },
  item:             { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemSelected:     { backgroundColor: '#fef9ee' },
  itemText:         { fontSize: 14, color: COLORS.text },
  itemTextSelected: { color: COLORS.gold, fontWeight: '700' },
});
