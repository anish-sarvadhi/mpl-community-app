/** @format */

import { encryptData } from "@/enc-dec";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  type User = {
    id: string;
    first_name: string;
    last_name: string;
    user_name: string;
    email: string;
    token: string;
  };

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const webViewRef = useRef(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://1q3rk7l6-5000.inc1.devtunnels.ms/api/v1/auth/login",
        {
          data: {
            email,
            password,
          },
        }
      );

      const userData = response.data.data.data; // Nested data structure
      const { token } = userData;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // Store token in AsyncStorage
      await AsyncStorage.setItem("authToken", token);

      // Set user data
      setUser({
        id: userData.id.toString(),
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_name: userData.user_name,
        email: userData.email,
        token,
      });

      setIsLoggedIn(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityPress = () => {
    setLoadStartTime(Date.now());
    setIsLoading(true);
    setShowCommunity(true);
  };

  const handleWebViewLoad = () => {
    if (loadStartTime) {
      const loadTime = Date.now() - loadStartTime;
      console.log(`Community load time: ${loadTime}ms`);
      // Alert.alert("Load Time", `Community loaded in ${loadTime}ms`);
    }
    setIsLoading(false);
  };

  const handleBackToHome = () => {
    setShowCommunity(false);
    setLoadStartTime(null);
  };

  // const generateSSOUrl = () => {
  //   if (!user) {
  //     return "";
  //   }
  //   const baseUrl = "https://mpl-community.vercel.app";
  //   const ssoParams = {
  //     user_id: user.id,
  //     first_name: user.first_name,
  //     last_name: user.last_name,
  //     user_name: user.user_name,
  //     email: user.email,
  //     token: user.token,
  //     return_url: "app://home",
  //   };

  //   const queryString = (Object.keys(ssoParams) as (keyof typeof ssoParams)[])
  //     .map(
  //       (key) =>
  //         `${encodeURIComponent(key)}=${encodeURIComponent(ssoParams[key])}`
  //     )
  //     .join("&");

  //   const encryption = encryptData(queryString);
  //   console.log("Encrypted SSO Params:", encryption);
  //   const decrypt = decryptData(encryption);
  //   console.log("Decrypted SSO Params:", decrypt);

  //   return `${baseUrl}/sso-login?${queryString}`;
  // };
  const generateSSOUrl = () => {
    if (!user) return "";

    // const baseUrl = "https://mpl-community.vercel.app";
    const baseUrl = " http://192.168.31.195:3001";
    const ssoParams = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      user_name: user.user_name,
      email: user.email,
      token: user.token,
      return_url: "app://home",
    };

    const queryString = Object.entries(ssoParams)
      .map(
        ([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
      )
      .join("&");

    const encrypted = encryptData(queryString);

    if (!encrypted) return "";

    return `${baseUrl}/sso-login?data=${encodeURIComponent(encrypted)}`;
  };

  console.log("Generated SSO URL:", generateSSOUrl() as string);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.action === "back_to_home") {
        handleBackToHome();
      } else if (data.action === "login_required") {
        setShowCommunity(false);
        setIsLoggedIn(false);
        setUser(null);
        AsyncStorage.removeItem("authToken");
        Alert.alert("Session Expired", "Please login again.");
      }
    } catch (error) {
      console.error("WebView message parsing error:", error);
    }
  };

  const injectedJavaScript = `
    (function() {
      window.addEventListener('message', function(event) {
        if (event.data.action === 'back_to_home' || event.data.action === 'login_required') {
          window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
        }
      });

      window.addEventListener('popstate', function(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'back_to_home'
        }));
      });

      
      document.body.appendChild(backButton);
    })();
  `;

  if (showCommunity && isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <WebView
          ref={webViewRef}
          source={{ uri: generateSSOUrl() }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onMessage={handleWebViewMessage}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>MPL Community App</Text>

        {!isLoggedIn ? (
          <View style={styles.loginContainer}>
            <Text style={styles.subtitle}>
              Welcome! Please login to continue
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.homeContainer}>
            <Text style={styles.welcomeText}>
              Welcome, {user?.first_name} {user?.last_name}!
            </Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Your Stats</Text>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Matches Played:</Text>
                <Text style={styles.statValue}>25</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Wins:</Text>
                <Text style={styles.statValue}>18</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Rank:</Text>
                <Text style={styles.statValue}>Gold</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.communityButton}
              onPress={handleCommunityPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Enter MPL Community</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await AsyncStorage.removeItem("authToken");
                setIsLoggedIn(false);
                setUser(null);
                setShowCommunity(false);
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  loginContainer: {
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  homeContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    color: "#333",
  },
  statsContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
    alignItems: "center",
  },
  communityButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default Home;
