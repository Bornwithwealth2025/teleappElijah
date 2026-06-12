import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

type FeedbackContextValue = {
  tap: () => void;
  message: () => void;
  joinMeeting: () => void;
  videoOn: () => void;
  success: () => void;
  warning: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const tapPlayer = useAudioPlayer(require('@/assets/sounds/button-tap.wav'));
  const messagePlayer = useAudioPlayer(require('@/assets/sounds/message-send.wav'));
  const joinPlayer = useAudioPlayer(require('@/assets/sounds/meeting-join.wav'));
  const videoPlayer = useAudioPlayer(require('@/assets/sounds/video-on.wav'));

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
    }).catch(() => {});
  }, []);

  function replay(player: ReturnType<typeof useAudioPlayer>) {
    player.seekTo(0);
    player.play();
  }

  const value = useMemo(
    () => ({
      tap: () => {
        Haptics.selectionAsync();
        replay(tapPlayer);
      },
      message: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        replay(messagePlayer);
      },
      joinMeeting: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        replay(joinPlayer);
      },
      videoOn: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        replay(videoPlayer);
      },
      success: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      warning: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      },
    }),
    [tapPlayer, messagePlayer, joinPlayer, videoPlayer]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }

  return context;
}