import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { Body, Button, Eyebrow, Gap } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLang, useT } from '@/i18n';
import { useContent } from '@/i18n/content';
import { askRoleplay, type ChatMessage } from '@/lib/roleplay';

export default function Roleplay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const language = useLang();
  const scenario = useContent().scenario(id)!;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const reply = await askRoleplay({ scenarioId: scenario.id, messages: next, language, opening: scenario.opening });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? t('Something went wrong'));
    } finally {
      setLoading(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const getFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      setFeedback(
        await askRoleplay({ scenarioId: scenario.id, messages, mode: 'feedback', language, opening: scenario.opening }),
      );
    } catch (e: any) {
      setError(e.message ?? t('Something went wrong'));
    } finally {
      setLoading(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const userTurns = messages.filter((m) => m.role === 'user').length;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <Eyebrow>{scenario.title}</Eyebrow>
        <Body>{t('Answer as you would in real life. Stay kind, stay clear. You can end anytime and get feedback.')}</Body>
        <Gap />

        <Bubble role="assistant" content={scenario.opening} />
        {messages.map((m, i) => (
          <Bubble key={i} {...m} />
        ))}
        {loading && <ActivityIndicator color={Colors.sage} style={{ marginVertical: Spacing.md }} />}
        {error && <Body style={{ color: Colors.danger }}>{error}</Body>}

        {userTurns === 0 && (
          <>
            <Gap />
            <Eyebrow>{t('Need words? Tap one')}</Eyebrow>
            {scenario.phrases.map((p) => (
              <Pressable key={p} onPress={() => setInput(p)} style={styles.phrase}>
                <Text style={styles.phraseText}>{p}</Text>
              </Pressable>
            ))}
          </>
        )}

        {feedback && (
          <View style={styles.feedback}>
            <Eyebrow>{t('Coach feedback')}</Eyebrow>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}
        {userTurns >= 2 && !feedback && !loading && (
          <>
            <Gap />
            <Button title={t('End & get feedback')} variant="outline" onPress={getFeedback} />
          </>
        )}
      </ScrollView>

      {!feedback && (
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('Your answer…')}
            placeholderTextColor={Colors.muted}
            style={styles.input}
            multiline
          />
          <Pressable onPress={() => send()} style={styles.sendButton} disabled={loading}>
            <Ionicons name="arrow-up" size={22} color={Colors.white} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function Bubble({ role, content }: ChatMessage) {
  const mine = role === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <Text style={[styles.bubbleText, mine && { color: Colors.white }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  bubble: { maxWidth: '85%', borderRadius: 18, padding: Spacing.md, marginBottom: Spacing.sm },
  theirs: { alignSelf: 'flex-start', backgroundColor: Colors.creamLight, borderBottomLeftRadius: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: Colors.sage, borderBottomRightRadius: 4 },
  bubbleText: { fontFamily: Fonts.sans, fontSize: 16, lineHeight: 22, color: Colors.ink },
  phrase: {
    borderWidth: 1,
    borderColor: Colors.lavender,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  phraseText: { fontFamily: Fonts.serifItalic, fontSize: 17, color: Colors.text },
  feedback: { backgroundColor: Colors.lavenderLight, borderRadius: Radius.card, padding: Spacing.lg, marginTop: Spacing.md },
  feedbackText: { fontFamily: Fonts.sans, fontSize: 16, lineHeight: 24, color: Colors.ink },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.creamLight,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.ink,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
