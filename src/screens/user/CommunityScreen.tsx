import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { Colors } from '../../theme/colors';
import { formatDate } from '../../utils/locationUtils';
import {
  MessageSquare,
  ShieldCheck,
  UserCircle,
  Heart,
  Send
} from 'lucide-react-native';

export default function CommunityScreen() {
  const { db, addPost, likePost, getCurrentUser } = useAppStore();
  const user = getCurrentUser()!;
  const [newMessage, setNewMessage] = useState('');

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
            <MessageSquare size={24} color={Colors.textPrimary} />
            <Text style={styles.title}>Comunidad Scout</Text>
          </View>
          <Text style={styles.subtitle}>{db.community.length} publicaciones</Text>
        </View>

        <ScrollView contentContainerStyle={styles.feed} showsVerticalScrollIndicator={false}>
          {db.community.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  {post.userId === 'admin1' ? (
                    <ShieldCheck size={20} color={Colors.accent} />
                  ) : (
                    <UserCircle size={20} color={Colors.accent} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postName}>{post.userName}</Text>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                </View>
              </View>
              <Text style={styles.postText}>{post.mensaje}</Text>
              <TouchableOpacity
                style={styles.likeBtn}
                onPress={() => likePost(post.id)}
              >
                <Heart size={16} color={Colors.danger} />
                <Text style={styles.likeText}>{post.likes}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Compartí un tip o pregunta..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.4 }]}
            onPress={handlePost}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  feed: { padding: 16, gap: 12, paddingBottom: 20 },
  postCard: { backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16, gap: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  postName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  postDate: { fontSize: 11, color: Colors.textSecondary },
  postText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  likeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  likeText: { fontSize: 14, color: Colors.textSecondary },
  composer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  composerInput: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    padding: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    maxHeight: 90,
  },
  sendBtn: {
    width: 44, height: 44,
    backgroundColor: Colors.accent,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});