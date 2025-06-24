# 📱 React Native SSO POC (Expo) — AES-256 Encrypted Login

This project is a **proof-of-concept mobile app** built with **React Native and Expo**. It demonstrates how to securely pass user authentication data to a Next.js web application using **AES-256-bit encryption**.

---

## 🚀 Getting Started with Expo Go

Follow these steps to run the app on your device using **Expo Go**:

### 📦 1. Install Dependencies

```bash
npm install
````

### ▶️ 2. Start the Expo Dev Server

```bash
npm start
```

This will open the **Expo Dev Tools** in your browser.

### 📱 3. Run the App on Your Mobile Device

* Download the **Expo Go** app from the App Store or Google Play.
* Scan the QR code shown in your terminal or browser.
* The app will build and run directly on your device.

---

## 🔧 Required Changes Before Testing

To connect this app to your backend and web:

### ✅ 1. Update the API URL

Open the file:

```
app/(tabs)/index.tsx
```

Inside the `handleLogin` function, **replace the API call URL** with your backend endpoint for login:

```ts
const response = await axios.post("https://<your-backend-url>/api/v1/auth/login", payload);
```

---

### ✅ 2. Update the Community Web Base URL

In the same file (`(tabs)/index.tsx`), locate the `generateSSOUrl()` function and update the base URL:

```ts
const baseUrl = "https://<your-community-web-url>";
```

This URL is used to redirect the user to the web app after login, carrying the **encrypted payload** in the query string.

---

## 🔐 SSO Flow Summary

1. User logs in via mobile app.
2. User data is encrypted using **AES-256** and appended as a query string.
3. The app opens the community web app using a secure `sso-login` URL:

   ```
   https://your-community-url.com/sso-login?data=<encrypted_payload>
   ```
4. The web app decrypts the payload and logs in the user automatically.

---

## 🔒 Encryption Technology

* AES-256 encryption with PBKDF2 (password-based key derivation)
* Salt and IV are randomly generated
* Base64-encoded JSON structure for easy transport via URL

---

## 🛡️ Security Note

* Use the **same encryption key and algorithm** across mobile and web for compatibility.
* Never expose secret keys in a production build.
* Backend must verify the token securely.