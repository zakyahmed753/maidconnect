import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { notificationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import useNotifStore from '../store/notifStore';
import { COLORS } from '../utils/theme';

const BASE_URL = (Constants.expoConfig?.extra?.API_URL || 'https://api.servix.world/api')
  .replace('/api', '');

export default function NotifBell({ color, style }) {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const unread   = useNotifStore(s => s.unreadCount);
  const setCount = useNotifStore(s => s.setCount);
  const socketRef = useRef(null);

  const refresh = () =>
    notificationsAPI.getAll()
      .then(r => setCount((r.data.notifications || []).filter(n => !n.isRead).length))
      .catch(() => {});

  useEffect(() => {
    if (!user?._id) return;

    refresh();
    const poll = setInterval(refresh, 30000);

    // Real-time: connect once and listen for new_notification events
    let socket;
    (async () => {
      try {
        const io = require('socket.io-client').default;
        const token = await SecureStore.getItemAsync('maidconnect_token');
        if (!token) return;
        socket = io(BASE_URL, {
          auth: { token },
          transports: ['polling', 'websocket'],
          reconnection: true,
        });
        socketRef.current = socket;
        socket.on('new_notification', refresh);
      } catch {}
    })();

    return () => {
      clearInterval(poll);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

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
