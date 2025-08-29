# PWA Install Guide

## Overview

The Exam Prep Platform is a Progressive Web App (PWA) that allows users to install it on their mobile devices and desktop browsers for a native app-like experience.

## Features

- **Offline Support**: Works without internet connection
- **Installable**: Can be added to home screen on mobile devices
- **Responsive**: Optimized for all screen sizes
- **Fast Loading**: Cached resources for quick access

## How to Install

### Mobile Users (Android/iOS)

1. **Automatic Prompt**: The app will automatically show an install banner after 3 seconds of use
2. **Manual Installation**: 
   - Android: Use the "Add to Home Screen" option in Chrome menu
   - iOS: Use the "Add to Home Screen" option in Safari share menu

### Desktop Users

- The install option will appear in the browser's address bar (Chrome, Edge, etc.)
- Click the install icon to add the app to your desktop

## PWA Install Button

The app includes a smart install button that:

- **Appears automatically** when the app can be installed
- **Shows after 3 seconds** to avoid being intrusive
- **Remembers user preferences** - won't show again if dismissed
- **Integrates with theme** - adapts to light/dark mode
- **Positioned above bottom navigation** for easy access

## Technical Details

### Service Worker
- Caches essential resources for offline use
- Automatically updates when new versions are available
- Handles network requests efficiently

### Manifest
- Defines app appearance and behavior
- Sets theme colors and icons
- Configures display mode as standalone

### Browser Support
- **Chrome/Edge**: Full PWA support
- **Firefox**: Basic PWA support
- **Safari**: Limited PWA support (iOS 11.3+)

## Troubleshooting

### Install Button Not Showing
- Ensure you're using a supported browser
- Check if the app is already installed
- Try refreshing the page
- Clear browser cache and cookies

### Installation Fails
- Check internet connection
- Ensure sufficient storage space
- Try using a different browser
- Check browser permissions

## Benefits of Installing

1. **Faster Access**: Quick launch from home screen
2. **Offline Use**: Study materials available without internet
3. **Better Performance**: Optimized loading and caching
4. **Native Feel**: App-like experience on mobile devices
5. **Notifications**: Receive updates and reminders (if enabled)

## Development Notes

The PWA install button is implemented in `app/components/PWAInstallButton.tsx` and integrates with:

- Theme system for consistent styling
- Service worker for offline functionality
- Local storage for user preferences
- Responsive design for all devices

The component automatically detects:
- Installation capability
- User's previous actions
- Current app state
- Device type and browser support
