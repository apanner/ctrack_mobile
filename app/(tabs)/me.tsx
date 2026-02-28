import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentUser } from '../../lib/api/profile';
import { signOut } from '../../lib/auth';
import { colors } from '../../constants/colors';
import { Image } from 'expo-image';
import { LogOut, Mail, Briefcase, Calendar, Receipt, Bell, Focus, Clock, Settings, Smartphone } from 'lucide-react-native';
import { LocationSection } from '../../components/LocationSection';
import { PwaInstallBanner } from '../../components/PwaInstallBanner';
import { useNotifications } from '../../lib/api/notifications';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

export default function MeScreen() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: notificationsData } = useNotifications();
  const unreadCount = notificationsData?.unreadCount ?? 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Me</Text>
        </View>

        <View style={styles.profileSection}>
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{user?.full_name || 'User'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'Artist'}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          {user?.department && (
            <View style={styles.infoItem}>
              <Briefcase size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{user.department}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Mail size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {user?.id ? `${user.id.substring(0, 8)}...` : 'N/A'}
            </Text>
          </View>
        </View>

        <LocationSection />

        <PwaInstallBanner />

        <View style={styles.menuSection}>
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings/pwa-install')}
              activeOpacity={0.7}
            >
              <Smartphone size={22} color={colors.accent} />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Add to Home Screen</Text>
                <Text style={styles.menuItemSubtext}>Install CTrack for quick access</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <View>
              <Bell size={22} color={colors.accent} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Notifications</Text>
              <Text style={styles.menuItemSubtext}>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'View your notifications'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/leaves')}
            activeOpacity={0.7}
          >
            <Calendar size={22} color={colors.accent} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Apply Leave</Text>
              <Text style={styles.menuItemSubtext}>Request time off</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/expenses')}
            activeOpacity={0.7}
          >
            <Receipt size={22} color={colors.accent} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Expenses</Text>
              <Text style={styles.menuItemSubtext}>Submit claims & receipts</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/focus-timer')}
            activeOpacity={0.7}
          >
            <Focus size={22} color={colors.accent} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Focus Timer</Text>
              <Text style={styles.menuItemSubtext}>Pomodoro-style focus sessions</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/reminders')}
            activeOpacity={0.7}
          >
            <Clock size={22} color={colors.accent} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Reminders</Text>
              <Text style={styles.menuItemSubtext}>Smart shift & timesheet reminders</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Settings size={22} color={colors.accent} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Settings</Text>
              <Text style={styles.menuItemSubtext}>Notifications, chat & PWA</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About CTrack</Text>
          <Text style={styles.aboutText}>
            CTrack is a VFX task management and collaboration mobile application for artists and managers.
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
