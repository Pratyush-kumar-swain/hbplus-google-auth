import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAIN, colors } from '../config/constants';

export default function LoginScreen() {
  const { signInWithGoogle, signingIn, error } = useAuth();
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.card}>
        <View style={s.logo}><Text style={s.logoText}>HB+</Text></View>
        <Text style={s.title}>Sign in to HB+ Portal</Text>
        <Text style={s.sub}>Use your @{ALLOWED_DOMAIN} Google account to continue.</Text>

        {error ? (
          <View style={s.error} accessibilityRole="alert">
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={signInWithGoogle}
          disabled={signingIn}
          style={({ pressed }) => [s.btn, (pressed || signingIn) && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          {signingIn ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Login with Google</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 16,
    padding: 32, borderWidth: 1, borderColor: colors.line,
  },
  logo: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  error: { backgroundColor: colors.errorBg, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: colors.error, fontSize: 14, lineHeight: 20 },
  btn: { height: 48, borderRadius: 10, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
