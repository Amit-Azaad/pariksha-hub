# PWA Installation Troubleshooting Guide

## Problem: Install Button Not Showing on Android Chrome

If you're not seeing the PWA install button on Android Chrome, follow these troubleshooting steps:

## 🔍 **Step 1: Check Browser Console**

1. Open Chrome on Android
2. Navigate to your app
3. Open Developer Tools (Chrome DevTools)
4. Check the console for any error messages
5. Look for logs starting with "PWA Install Button:"

## 📱 **Step 2: Verify PWA Requirements**

Your app must meet these criteria for Chrome to show the install prompt:

- ✅ **HTTPS or localhost** (required for service workers)
- ✅ **Valid manifest.json** file
- ✅ **Service worker** registered
- ✅ **App not already installed**
- ✅ **User hasn't dismissed the prompt before**

## 🚨 **Common Issues & Solutions**

### Issue 1: "beforeinstallprompt" Event Not Firing

**Symptoms:**
- No install button appears
- Console shows "PWA Install Button: useEffect running" but no further logs

**Solutions:**
1. **Visit the app multiple times** - Chrome requires multiple visits
2. **Clear browser data** - Clear cookies and site data
3. **Check if app is already installed** - Look for app icon on home screen
4. **Verify HTTPS** - Must be served over HTTPS (except localhost)

### Issue 2: Service Worker Not Registered

**Symptoms:**
- Console shows "Service Worker registration failed"

**Solutions:**
1. Check if `/service-worker.js` file exists
2. Verify the file path in root.tsx
3. Check browser console for specific error messages

### Issue 3: Manifest Issues

**Symptoms:**
- Console shows manifest-related errors
- PWA Debug shows "Manifest: ❌"

**Solutions:**
1. Verify `/manifest.json` file exists
2. Check if manifest is properly linked in root.tsx
3. Validate manifest.json format

## 🛠️ **Manual Installation Methods**

If the automatic install button doesn't work, users can manually install:

### Android Chrome:
1. Tap the menu (⋮) in Chrome
2. Select "Add to Home screen"
3. Tap "Add"

### iOS Safari:
1. Tap the share button
2. Select "Add to Home Screen"
3. Tap "Add"

## 🔧 **Debugging Tools**

### PWA Debug Component
- Red "PWA Debug" button appears in development mode
- Shows real-time PWA criteria status
- Helps identify specific issues

### Console Logging
The PWA install button logs detailed information:
- Mobile device detection
- PWA criteria checks
- Event firing status
- Service worker registration

## 📋 **Testing Checklist**

- [ ] App loads without errors
- [ ] Service worker registers successfully
- [ ] Manifest.json is accessible
- [ ] Console shows PWA debug logs
- [ ] No "beforeinstallprompt" errors
- [ ] App meets all PWA criteria

## 🌐 **Browser Compatibility**

| Browser | PWA Support | Notes |
|---------|-------------|-------|
| Chrome (Android) | ✅ Full | Best support |
| Chrome (Desktop) | ✅ Full | Install in address bar |
| Edge (Android) | ✅ Full | Good support |
| Firefox (Android) | ⚠️ Partial | Limited PWA support |
| Safari (iOS) | ⚠️ Partial | Manual install only |

## 🚀 **Quick Fixes to Try**

1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache** and cookies
3. **Visit the app multiple times** over several minutes
4. **Check if you're in incognito mode** (PWA doesn't work in incognito)
5. **Verify the app isn't already installed**

## 📞 **Still Having Issues?**

If none of the above solutions work:

1. Check the browser console for specific error messages
2. Verify all files are properly built and served
3. Test on a different Android device
4. Try a different browser (Edge, Firefox)
5. Check if your hosting provider supports HTTPS properly

## 🔍 **Advanced Debugging**

For developers, you can also:

1. Use Chrome DevTools Application tab
2. Check Service Workers section
3. Verify Manifest details
4. Test offline functionality
5. Check network requests for PWA files
