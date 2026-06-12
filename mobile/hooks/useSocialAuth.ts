import React from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import useAuthStore from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

export function useSocialAuth() {
  const socialLogin = useAuthStore((state) => state.socialLogin);
  const clearError = useAuthStore((state) => state.clearError);

  const [appleAvailable, setAppleAvailable] = React.useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  React.useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type !== "success") return;

      const identityToken = response.params.id_token;

      if (!identityToken) {
        throw new Error("Google did not return an identity token.");
      }

      await socialLogin({
        provider: "google",
        identityToken,
      });
    }

    handleGoogleResponse().catch(() => {});
  }, [response, socialLogin]);

  const signInWithGoogle = async () => {
    clearError();

    if (!request) return;

    await promptAsync();
  };

  const signInWithApple = async () => {
    clearError();

    if (Platform.OS !== "ios" || !appleAvailable) {
      throw new Error(
        "Apple sign in is only available on supported iOS devices.",
      );
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error("Apple did not return an identity token.");
    }

    await socialLogin({
      provider: "apple",
      identityToken: credential.identityToken,
      email: credential.email,
      first_name: credential.fullName?.givenName ?? null,
      last_name: credential.fullName?.familyName ?? null,
      full_name: [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" "),
    });
  };

  return {
    googleReady: Boolean(request),
    appleAvailable,
    signInWithGoogle,
    signInWithApple,
  };
}
