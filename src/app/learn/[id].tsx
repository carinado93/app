import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Body, Button, Card, Eyebrow, Gap, Heading, Quote, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getExercise } from '@/data/exercises';
import { getArticle } from '@/data/learn';
import { useApp } from '@/store/app-state';

export default function ArticleScreen() {
  const { id, unlocked } = useLocalSearchParams<{ id: string; unlocked?: string }>();
  const article = getArticle(id);
  const { isPremium } = useApp();

  if (!article) {
    return (
      <Screen>
        <Body>Article not found.</Body>
      </Screen>
    );
  }

  // Articles inside a program day are always open.
  const locked = !article.free && !isPremium && unlocked !== '1';
  const exercise = article.exerciseId ? getExercise(article.exerciseId) : undefined;

  return (
    <Screen>
      <Eyebrow>{`Learn · ${article.minutes} min`}</Eyebrow>
      <Heading size={32}>{article.title}</Heading>
      <Gap />
      <Text style={styles.intro}>{article.intro}</Text>
      <Gap size={Spacing.lg} />

      {locked ? (
        <Card style={{ alignItems: 'center' }}>
          <Ionicons name="lock-closed-outline" size={30} color={Colors.lavender} />
          <Gap size={Spacing.sm} />
          <Body style={{ textAlign: 'center' }}>Read the full article and all other Learn articles with Premium.</Body>
          <Gap />
          <Button title="Try 7 days free" onPress={() => router.push('/paywall')} />
        </Card>
      ) : (
        <>
          {article.sections.map((s) => (
            <Card key={s.heading} style={styles.section}>
              <Text style={styles.heading}>{s.heading}</Text>
              <Body>{s.text}</Body>
            </Card>
          ))}
          <Gap />
          <Quote>{article.takeaway}</Quote>
          {exercise && (
            <>
              <Gap size={Spacing.lg} />
              <Eyebrow>Try it now</Eyebrow>
              <Button
                title={`${exercise.title} · ${exercise.minutes} min`}
                onPress={() =>
                  router.push({ pathname: '/exercise/[id]', params: { id: exercise.id, unlocked: unlocked ?? '' } })
                }
              />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: Fonts.serifItalic, fontSize: 21, lineHeight: 28, color: Colors.text },
  section: { marginBottom: Spacing.md },
  heading: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.ink, marginBottom: Spacing.xs },
});
