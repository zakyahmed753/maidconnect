import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { notificationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/theme';

export default function NotifBell({ color, style }) {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () => notificationsAPI.getAll()
      .then(r => setUnread((r.data.notifications || []).filter(n => !n.isRead).length))
      .catch(() => {});
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const iconColor = color || COLORS.green;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(user?.role === 'maid' ? 'MaidAlerts' : 'Alerts')}
      style={[{ padding: 6, position: 'relative' }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={unread > 0 ? 'notifications' : 'notifications-outline'}
        size={22}
        color={iconColor}
      />
      {unread > 0 && (
        <View style={{
          position: 'absolute', top: 2, right: 2,
          backgroundColor: '#e53e3e', borderRadius: 7,
          minWidth: 14, height: 14, alignItems: 'center',
          justifyContent: 'center', paddingHorizontal: 2,
        }}>
          <Text style={{ fontSize: 8, color: '#fff', fontWeight: '800' }}>
            {unread > 9 ? '9+' : String(unread)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
