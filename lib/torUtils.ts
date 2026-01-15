import { Platform } from 'react-native';

// Tor utilities for privacy-focused networking and detection

export interface TorStatus {
  isUsingTor: boolean;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  onionAddress?: string;
}

/**
 * Detect if the user is accessing the app via Tor
 */
export async function detectTorUsage(): Promise<TorStatus> {
  if (Platform.OS !== 'web') {
    return { isUsingTor: false, confidence: 'unknown' };
  }

  try {
    // Method 1: Check for Tor-specific headers
    const hasTorHeaders = checkTorHeaders();

    // Method 2: Check if we're on a .onion domain
    const isOnionDomain = checkOnionDomain();

    // Method 3: Check IP via Tor check service (privacy-preserving)
    const torCheckResult = await checkViaTorCheckService();

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let isUsingTor = false;

    if (isOnionDomain) {
      confidence = 'high';
      isUsingTor = true;
    } else if (hasTorHeaders && torCheckResult) {
      confidence = 'high';
      isUsingTor = true;
    } else if (hasTorHeaders || torCheckResult) {
      confidence = 'medium';
      isUsingTor = true;
    }

    return {
      isUsingTor,
      confidence,
      onionAddress: isOnionDomain ? window.location.hostname : undefined,
    };
  } catch (error) {
    console.warn('Tor detection failed:', error);
    return { isUsingTor: false, confidence: 'unknown' };
  }
}

/**
 * Check for Tor-specific request headers
 */
function checkTorHeaders(): boolean {
  // In a real implementation, this would check server-side headers
  // For client-side detection, we rely on other methods
  return false;
}

/**
 * Check if we're accessing via .onion domain
 */
function checkOnionDomain(): boolean {
  if (Platform.OS !== 'web') return false;

  try {
    const hostname = window.location.hostname;
    return hostname.endsWith('.onion');
  } catch {
    return false;
  }
}

/**
 * Check via a Tor check service (privacy-preserving)
 */
async function checkViaTorCheckService(): Promise<boolean> {
  try {
    // Use a privacy-focused Tor check service
    const response = await fetch('https://check.torproject.org/api/ip', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Use timeout to avoid hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.IsTor === true;
  } catch (error) {
    console.warn('Tor check service failed:', error);
    return false;
  }
}

/**
 * Configure network requests to use Tor (when available)
 */
export function configureTorProxy(): void {
  if (Platform.OS !== 'web') return;

  // For web, we rely on the browser's proxy settings
  // In a real implementation, you might use a WebRTC proxy or similar
  console.log('Tor proxy configuration: Browser proxy settings should be used');
}

/**
 * Get recommended Tor browser download URL
 */
export function getTorBrowserUrl(): string {
  const userAgent = Platform.OS === 'web' ? navigator.userAgent : '';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (isMobile) {
    if (userAgent.includes('Android')) {
      return 'https://play.google.com/store/apps/details?id=org.torproject.torbrowser';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'https://apps.apple.com/app/onion-browser/id519296448';
    }
  }

  return 'https://www.torproject.org/download/';
}

/**
 * Show privacy warning if not using Tor
 */
export function shouldShowTorWarning(torStatus: TorStatus): boolean {
  return !torStatus.isUsingTor && torStatus.confidence !== 'unknown';
}

/**
 * Get privacy score based on current setup
 */
export function getPrivacyScore(torStatus: TorStatus, hasBraveBrowser: boolean): number {
  let score = 0;

  if (torStatus.isUsingTor) {
    score += 50; // Major privacy boost
  }

  if (hasBraveBrowser) {
    score += 30; // Additional privacy features
  }

  if (Platform.OS === 'web') {
    score += 10; // Web platform has some inherent privacy
  }

  return Math.min(score, 100);
}

/**
 * Privacy tips for users
 */
export const privacyTips = [
  'Use Tor Browser for maximum privacy',
  'Enable Brave Shields to block trackers',
  'Use a VPN in combination with Tor',
  'Clear cookies and browsing data regularly',
  'Use privacy-focused search engines',
  'Enable HTTPS Everywhere',
  'Use password managers with strong encryption',
];

/**
 * Check if browser supports WebRTC (potential fingerprinting vector)
 */
export function hasWebRTCSupport(): boolean {
  if (Platform.OS !== 'web') return false;

  try {
    return !!(window.RTCPeerConnection ||
              (window as any).webkitRTCPeerConnection ||
              (window as any).mozRTCPeerConnection);
  } catch {
    return false;
  }
}

/**
 * Get browser privacy features
 */
export function getBrowserPrivacyFeatures(): string[] {
  if (Platform.OS !== 'web') return [];

  const features: string[] = [];
  const userAgent = navigator.userAgent;

  if (userAgent.includes('Brave')) {
    features.push('Brave Shields', 'Built-in Tor', 'Native crypto wallet');
  }

  if (userAgent.includes('Firefox')) {
    features.push('Enhanced Tracking Protection');
  }

  if (userAgent.includes('Chrome') && !userAgent.includes('Brave')) {
    features.push('Basic tracking protection');
  }

  if ('serviceWorker' in navigator) {
    features.push('Service Worker support');
  }

  return features;
}
