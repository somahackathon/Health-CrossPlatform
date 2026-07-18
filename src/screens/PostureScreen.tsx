import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../components/Button';
import Icon from '../components/Icon';
import { RootTabParamList } from '../navigation/RootNavigator';
import { POSTURE_EXERCISES, usePostureStore } from '../store/usePostureStore';
import { colors, radius, withAlpha } from '../theme/colors';

type RecordingPhase = 'intro' | 'recording';

const MAX_RECORD_SECONDS = 15;

const SEVERITY_META: Record<string, { fg: string; bg: string; icon: string }> = {
  HIGH: { fg: colors.accentForegroundRed, bg: withAlpha(colors.accentForegroundRed, 0.12), icon: 'triangle-exclamation' },
  MEDIUM: { fg: colors.accentForegroundOrange, bg: withAlpha(colors.accentForegroundOrange, 0.12), icon: 'circle-exclamation-fill' },
  LOW: { fg: colors.accentForegroundGreen, bg: withAlpha(colors.accentForegroundGreen, 0.12), icon: 'circle-check-fill' },
};

export default function PostureScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const exerciseType = usePostureStore((s) => s.exerciseType);
  const setExerciseType = usePostureStore((s) => s.setExerciseType);
  const status = usePostureStore((s) => s.status);
  const feedback = usePostureStore((s) => s.feedback);
  const errorMessage = usePostureStore((s) => s.errorMessage);
  const reset = usePostureStore((s) => s.reset);
  const submitVideo = usePostureStore((s) => s.submitVideo);

  const [phase, setPhase] = useState<RecordingPhase>('intro');
  const [recSecs, setRecSecs] = useState(0);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const hasPermission = !!cameraPermission?.granted && !!micPermission?.granted;

  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const ensurePermissions = async () => {
    let cam = cameraPermission;
    if (!cam?.granted) cam = await requestCameraPermission();
    let mic = micPermission;
    if (!mic?.granted) mic = await requestMicPermission();
    return !!cam?.granted && !!mic?.granted;
  };

  const startRec = async () => {
    const granted = await ensurePermissions();
    if (!granted) return;

    setRecSecs(0);
    setPhase('recording');
    intervalRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);

    let video: { uri: string } | undefined;
    try {
      video = await cameraRef.current?.recordAsync({ maxDuration: MAX_RECORD_SECONDS });
    } catch {
      // recording ended (stopped, max duration reached, or camera unmounted)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPhase('intro');
    setRecSecs(0);

    if (video?.uri) {
      submitVideo(video.uri);
    }
  };

  const stopRec = () => cameraRef.current?.stopRecording();
  const retake = () => reset();
  const goPlan = () => navigation.navigate('Plan');

  const recTime = `0:${String(recSecs).padStart(2, '0')}`;
  const isBusy = status === 'uploading' || status === 'polling';
  const exerciseLabel = POSTURE_EXERCISES.find((e) => e.code === exerciseType)?.label ?? exerciseType;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI 자세교정</Text>
          <Text style={styles.subtitle}>카메라로 운동 자세를 촬영하면 AI가 피드백을 줘요</Text>
        </View>

        {status === 'idle' && (
          <View style={styles.body}>
            {phase === 'intro' && (
              <View>
                <Text style={styles.chipSectionLabel}>운동 선택</Text>
                <View style={styles.chipRow}>
                  {POSTURE_EXERCISES.map((ex) => {
                    const active = exerciseType === ex.code;
                    return (
                      <Pressable
                        key={ex.code}
                        onPress={() => setExerciseType(ex.code)}
                        style={[
                          styles.chip,
                          {
                            borderColor: active ? colors.primaryNormal : colors.lineNormal,
                            backgroundColor: active ? withAlpha(colors.primaryNormal, 0.08) : colors.backgroundNormal,
                          },
                        ]}
                      >
                        <Text style={[styles.chipText, { color: active ? colors.primaryNormal : colors.labelNeutral }]}>
                          {ex.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.cameraBox}>
              {hasPermission ? (
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" mode="video" />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Icon name="camera" size={40} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.cameraPlaceholderText}>카메라 권한이 필요해요</Text>
                </View>
              )}

              {phase === 'intro' && hasPermission && (
                <>
                  <View style={styles.guideFrame} pointerEvents="none" />
                  <View style={styles.guideCaption} pointerEvents="none">
                    <Icon name="persons-fill" size={46} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.guideCaptionText}>
                      전신이 프레임 안에 들어오도록{'\n'}1.5~2m 거리에서 촬영해 주세요
                    </Text>
                  </View>
                </>
              )}

              {phase === 'recording' && (
                <>
                  <View style={styles.recFrame} pointerEvents="none" />
                  <View style={styles.recBadge} pointerEvents="none">
                    <View style={styles.recDot} />
                    <Text style={styles.recBadgeText}>REC {recTime}</Text>
                  </View>
                  <View style={styles.guideCaption} pointerEvents="none">
                    <Icon name="persons-fill" size={52} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.guideCaptionText}>{exerciseLabel} 동작을 천천히 반복하세요</Text>
                  </View>
                </>
              )}
            </View>

            {phase === 'intro' && (
              <View style={styles.infoNote}>
                <Icon name="circle-info" size={18} color={colors.labelAlternative} />
                <Text style={styles.infoNoteText}>
                  촬영 영상은 자세 분석에만 사용되고 분석 완료 후 서버에서 삭제돼요. 최대 15초, 밝은 곳에서 촬영하면 정확도가
                  높아집니다.
                </Text>
              </View>
            )}

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            {phase === 'intro' ? (
              <Button
                title={hasPermission ? `${exerciseLabel} 촬영 시작` : '카메라 권한 허용하기'}
                onPress={startRec}
              />
            ) : (
              <>
                <View style={styles.stopRow}>
                  <Pressable style={styles.stopButton} onPress={stopRec}>
                    <View style={styles.stopSquare} />
                  </Pressable>
                </View>
                <Text style={styles.stopHint}>버튼을 눌러 촬영을 완료하세요</Text>
              </>
            )}
          </View>
        )}

        {isBusy && (
          <View style={styles.analyzing}>
            <ActivityIndicator size="large" color={colors.primaryNormal} />
            <Text style={styles.analyzingTitle}>자세를 분석하고 있어요</Text>
            <Text style={styles.analyzingCaption}>영상을 AI 서버로 전송해 분석하는 중입니다</Text>
          </View>
        )}

        {status === 'error' && !isBusy && (
          <View style={styles.body}>
            <View style={styles.errorCard}>
              <Icon name="triangle-exclamation" size={18} color={colors.accentForegroundRed} />
              <Text style={styles.errorCardText}>{errorMessage}</Text>
            </View>
            <Button title="다시 촬영" variant="outlined" onPress={retake} />
          </View>
        )}

        {status === 'done' && (
          <View style={styles.body}>
            <View style={[styles.resultHeaderCard, { backgroundColor: withAlpha(colors.primaryNormal, 0.06) }]}>
              <Icon name="sparkle-fill" size={20} color={colors.primaryNormal} />
              <Text style={styles.resultHeaderText}>{exerciseLabel} 자세 분석 결과</Text>
            </View>

            {feedback && feedback.length > 0 ? (
              <View style={{ gap: 10 }}>
                {feedback.map((f, i) => {
                  const meta = SEVERITY_META[f.severity] ?? SEVERITY_META.MEDIUM;
                  return (
                    <View key={i} style={[styles.feedbackCard, { backgroundColor: meta.bg }]}>
                      <Icon name={meta.icon} size={18} color={meta.fg} />
                      <Text style={styles.feedbackText}>{f.message}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.hintText}>별도 피드백이 없어요. 좋은 자세를 유지하고 있어요!</Text>
            )}

            <View style={styles.resultButtonRow}>
              <View style={{ flex: 1 }}>
                <Button title="다시 촬영" variant="outlined" onPress={retake} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="계획에 반영" onPress={goPlan} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundNormal },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 6 },
  title: { fontSize: 23, fontWeight: '700', color: colors.labelNormal },
  subtitle: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, gap: 18 },
  chipSectionLabel: { fontSize: 13, fontWeight: '600', color: colors.labelNeutral, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: '600' },
  cameraBox: {
    aspectRatio: 3 / 4,
    borderRadius: radius.cardXLarge,
    backgroundColor: '#16181c',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: { alignItems: 'center', gap: 12, paddingHorizontal: 30 },
  cameraPlaceholderText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.72)', textAlign: 'center' },
  guideFrame: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 16,
  },
  guideCaption: { position: 'absolute', alignItems: 'center', paddingHorizontal: 30 },
  guideCaptionText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 12, lineHeight: 19 },
  recFrame: {
    position: 'absolute',
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,90,90,0.7)',
    borderRadius: 16,
  },
  recBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4d4d' },
  recBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.fillNormal,
  },
  infoNoteText: { flex: 1, fontSize: 12, fontWeight: '500', color: colors.labelNeutral, lineHeight: 18 },
  stopRow: { alignItems: 'center' },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.backgroundNormal,
    borderWidth: 4,
    borderColor: colors.lineSolidStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#ff4d4d' },
  stopHint: { textAlign: 'center', fontSize: 13, fontWeight: '500', color: colors.labelAlternative },
  analyzing: { paddingVertical: 70, paddingHorizontal: 30, alignItems: 'center' },
  analyzingTitle: { fontSize: 17, fontWeight: '700', color: colors.labelNormal, marginTop: 22 },
  analyzingCaption: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  errorText: { fontSize: 12, fontWeight: '600', color: colors.accentForegroundRed },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: withAlpha(colors.accentForegroundRed, 0.08),
  },
  errorCardText: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.labelNeutral, lineHeight: 19 },
  resultHeaderCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: radius.card },
  resultHeaderText: { fontSize: 15, fontWeight: '700', color: colors.labelNormal },
  feedbackCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: radius.card },
  feedbackText: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.labelNeutral, lineHeight: 19 },
  hintText: { fontSize: 13, fontWeight: '500', color: colors.labelAlternative, textAlign: 'center', paddingVertical: 20 },
  resultButtonRow: { flexDirection: 'row', gap: 10 },
});
