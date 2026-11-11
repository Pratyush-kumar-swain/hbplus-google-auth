import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../config/constants';

export default function DashboardScreen() {
  const { user, role, isAdmin, logout } = useAuth();
  const name = user.displayName || user.email;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.page}>
      <View style={s.wrap}>
        <View style={s.header}>
          <Text style={s.brand}>HB+ Portal</Text>
          <Pressable onPress={logout} style={s.logout} accessibilityRole="button">
            <Text style={s.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <View style={s.card}>
          {user.photoURL ? <Image source={{ uri: user.photoURL }} style={s.avatar} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={s.hello}>Welcome, {name}</Text>
            <Text style={s.muted}>{user.email}</Text>
          </View>
          <View style={[s.badge, isAdmin && { backgroundColor: colors.brand }]}>
            <Text style={[s.badgeText, isAdmin && { color: '#fff' }]}>{role}</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.h2}>{isAdmin ? 'Admin tools' : 'Your workspace'}</Text>
            <Text style={s.muted}>
              {isAdmin
                ? 'Visible to admins only. Promote users by editing their role in Firestore.'
                : 'You are signed in with a verified company account.'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, alignItems: 'center' },
  wrap: { width: '100%', maxWidth: 760 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  brand: { fontSize: 20, fontWeight: '800', color: colors.brand },
  logout: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  logoutText: { color: colors.ink, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.card,
    borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 20, marginBottom: 16,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  hello: { fontSize: 18, fontWeight: '700', color: colors.ink },
  h2: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  muted: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#E4EEEA' },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.brandDark },
});
