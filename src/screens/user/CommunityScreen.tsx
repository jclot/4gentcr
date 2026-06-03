import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeContext';
import { formatDate } from '../../utils/locationUtils';
import { MessageSquare, ShieldCheck, UserCircle, Heart, Send } from 'lucide-react-native';

export default function CommunityScreen() {
  const { db, addPost, likePost, getCurrentUser } = useAppStore();
  const { colors: C, fs } = useTheme();
  const user = getCurrentUser()!;
  const [newMessage, setNewMessage] = useState('');
  const styles = useMemo(() => makeStyles(C, fs), [C, fs]);

  const getAvatarByUserId = (userId: string) => db.users.find((u) => u.id === userId)?.avatar || '';

  const handlePost = () => {
    if (!newMessage.trim()) return;
    addPost(user.id, newMessage.trim());
    setNewMessage('');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={24} color={C.textPrimary} />
            <Text style={styles.title}>Comunidad Scout</Text>
          </View>
          <Text style={styles.subtitle}>{db.community.length} publicaciones</Text>
        </View>

        <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
          {db.community.map(post => {
            const avatarUri = getAvatarByUserId(post.userId) || post.userAvatar || '';
            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.postAvatarImage} />
                    ) : post.userId === 'admin1' ? (
                      <ShieldCheck size={20} color={C.accent} />
                    ) : (
                      <UserCircle size={20} color={C.accent} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postName}>{post.userName}</Text>
                    <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                  </View>
                </View>
                <Text style={styles.postText}>{post.mensaje}</Text>
                <TouchableOpacity style={styles.likeBtn} onPress={() => likePost(post.id)}>
                  <Heart size={16} color={C.danger} />
                  <Text style={styles.likeText}>{post.likes}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Compartí un tip o pregunta..."
            placeholderTextColor={C.textSecondary}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.4 }]}
            onPress={handlePost}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C: any, fs: (n: number) => number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: fs(24), fontWeight: '800', color: C.textPrimary },
  subtitle: { fontSize: fs(13), color: C.textSecondary, marginTop: 4 },
  feed: { padding: 16, gap: 12, paddingBottom: 20 },
  postCard: { backgroundColor: C.bgCard, borderRadius: 16, padding: 16, gap: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  postAvatarImage: { width: '100%', height: '100%' },
  postName: { fontSize: fs(14), fontWeight: '700', color: C.textPrimary },
  postDate: { fontSize: fs(11), color: C.textSecondary },
  postText: { fontSize: fs(14), color: C.textPrimary, lineHeight: 22 },
  likeBtn: { alignSelf: 'flex-start', paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeText: { fontSize: fs(14), color: C.textSecondary },
  composer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard },
  composerInput: { flex: 1, backgroundColor: C.bgInput, borderRadius: 12, padding: 12, color: C.textPrimary, fontSize: fs(14), maxHeight: 90 },
  sendBtn: { width: 44, height: 44, backgroundColor: C.accent, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
});
