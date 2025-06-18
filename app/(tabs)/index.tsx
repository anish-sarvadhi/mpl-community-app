/** @format */

// App.js
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(null);
  const [user, setUser] = useState<any>(null);
  const webViewRef = useRef(null);

  // Static user data (replace with your actual user structure)
  const staticUser = {
    id: "12345",
    name: "John Doe",
    email: "john.doe@example.com",
    token: "static_auth_token_123",
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setUser(staticUser);
      setIsLoggedIn(true);
      setIsLoading(false);
      Alert.alert("Success", "Login successful!");
    }, 1000);
  };

  const handleCommunityPress = () => {
    setLoadStartTime(Date.now() as any);
    setIsLoading(true);
    setShowCommunity(true);
  };

  const handleWebViewLoad = () => {
    if (loadStartTime) {
      const loadTime = Date.now() - loadStartTime;
      console.log(`Community load time: ${loadTime}ms`);
      // You can send this to analytics or show to client
      Alert.alert("Load Time", `Community loaded in ${loadTime}ms`);
    }
    setIsLoading(false);
  };

  const handleBackToHome = () => {
    setShowCommunity(false);
    setLoadStartTime(null);
  };

  // Generate SSO URL with user data
  const generateSSOUrl = () => {
    const baseUrl = "https://mpl-community.vercel.app"; // Replace with your actual URL
    const ssoParams = {
      user_id: user.id,
      name: user.name,
      email: user.email,
      token: user.token,
      return_url: "app://home", // Custom scheme for returning to app
    } as any;

    const queryString = Object.keys(ssoParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(ssoParams[key])}`
      )
      .join("&");

    return `${baseUrl}/sso-login?${queryString}`;
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.action === "back_to_home") {
      handleBackToHome();
    }
  };

  // Inject JavaScript to handle back button in web
  const injectedJavaScript = `
    (function() {
      // Listen for back to home events
      window.addEventListener('message', function(event) {
        if (event.data.action === 'back_to_home') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            action: 'back_to_home'
          }));
        }
      });

      // Override back button behavior
      window.addEventListener('popstate', function(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'back_to_home'
        }));
      });

      // Add custom back button if needed
      const backButton = document.createElement('button');
      backButton.innerHTML = '← Back to App';
      backButton.style.cssText = \`
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 9999;
        background: #007AFF;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
      \`;
      backButton.onclick = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          action: 'back_to_home'
        }));
      };
      document.body.appendChild(backButton);
    })();
  `;

  if (showCommunity && isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading Community...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: generateSSOUrl() }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          // onLoadStart={() => setIsLoading(true)}
          // onLoadEnd={() => setIsLoading(false)}
          // onMessage={handleWebViewMessage}
          // injectedJavaScript={injectedJavaScript}
          // javaScriptEnabled={true}
          // domStorageEnabled={true}
          // startInLoadingState={true}
          // renderLoading={() => (
          //   <View style={styles.loadingContainer}>
          //     <ActivityIndicator size="large" color="#007AFF" />
          //     <Text style={styles.loadingText}>Loading Community...</Text>
          //   </View>
          // )}
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
            <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>

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
              onPress={() => {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
