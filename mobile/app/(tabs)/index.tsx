import { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  StatusBar,
  Platform,
  Animated,
  Image
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import axios, { AxiosError } from 'axios';

//index.tsx

// Report type definition
interface ReportData {
  _id: string;
  latitude: number;
  longitude: number;
  networkType: string;
  signalStrength: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
  ping?: number;
  createdAt: string;
  updatedAt: string;
}

// Speed Test Result interface
interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
}

// API configuration
const API_URL = 'https://signalscape.onrender.com';

// Brand color constants
const BRAND_COLORS = {
  primary: '#008b8e',
  poor: '#c33813',
  fair: '#fff624',
  good: '#9df37d',
  excellent: '#15752a',
  white: '#ffffff',
  black: '#2c3e50',
  grey: '#e0e0e0',
  light: 'rgba(255, 255, 255, 0.8)',
  button: '#008b8e',
  text: '#2c3e50',
};

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connectionStrength, setConnectionStrength] = useState<number>(0);
  const [networkType, setNetworkType] = useState<string>('unknown');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResult | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // Animation values
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const mapOpacity = useRef(new Animated.Value(0)).current;
  const resultsHeight = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(0)).current;
  const legendHeight = useRef(new Animated.Value(0)).current;

  // Map reference
  const mapRef = useRef<MapView>(null);

  // Logo rotation animation
  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Default location for map if real location is not available yet
  const defaultLocation = {
    coords: {
      latitude: 38.98825,
      longitude: -76.94,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };

  // Use real location or default
  const displayLocation = location || defaultLocation;

  // Calculate the zoom level based on location
  const getZoomLevel = () => {
    return {
      latitude: displayLocation.coords.latitude,
      longitude: displayLocation.coords.longitude,
      latitudeDelta: 0.05, // More zoomed in (smaller value)
      longitudeDelta: 0.05, // More zoomed in (smaller value)
    };
  };

  // Get location and connection strength
  const getLocationAndConnection = async () => {
    console.log("Starting getLocationAndConnection");
    setIsLoading(true);
    try {
      // Check if location permission is already granted
      if (!permissionGranted) {
        // Get location permission
        console.log("Requesting location permissions");
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("Permission status:", status);
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
        setPermissionGranted(true);
      }

      // Get current location
      console.log("Getting current location");
      const loc = await Location.getCurrentPositionAsync({});
      console.log("Location received:", loc.coords);
      setLocation(loc);

      // Zoom to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }

      // Check network connection
      console.log("Checking network connection");
      const netInfo = await NetInfo.fetch();
      let netType = netInfo.type;
      console.log("Network type:", netType);
      
      // Run speed test
      console.log("Starting speed test");
      const speedTest = await performSpeedTest();
      console.log("Speed test results:", speedTest);
      setSpeedTestResults(speedTest);
      
      // Update network type based on speed test results
      const updatedNetType = getNetworkTypeFromSpeed(netType, speedTest);
      console.log("Updated network type:", updatedNetType);
      setNetworkType(updatedNetType);
      
      // Calculate signal strength based on speed test and network type
      const strength = calculateSignalStrength(updatedNetType, speedTest);
      console.log("Calculated signal strength:", strength);
      setConnectionStrength(strength);

      // Save the report to database
      if (loc) {
        console.log("Saving report to database");
        await saveReport(
          loc.coords.latitude, 
          loc.coords.longitude, 
          updatedNetType, 
          strength,
          speedTest.downloadSpeed,
          speedTest.uploadSpeed,
          speedTest.ping
        );
      }
      
      // Refresh reports after submitting a new one
      console.log("Fetching updated report data");
      fetchReportData();
      
      // Show results panel
      toggleResultsPanel(true);
    } catch (error) {
      console.log("Error caught in getLocationAndConnection:", error);
      console.error('Error getting location or connection:', error);
      setErrorMsg('Error checking connection. Please try again.');
    } finally {
      console.log("Finished getLocationAndConnection");
      setIsLoading(false);
    }
  };

  // Toggle results panel with animation
  const toggleResultsPanel = (show: boolean) => {
    setShowResults(show);
    Animated.timing(resultsHeight, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Toggle legend panel with animation
  const toggleLegend = () => {
    setShowLegend(!showLegend);
    Animated.timing(legendHeight, {
      toValue: showLegend ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Perform a speed test
  const performSpeedTest = async (): Promise<SpeedTestResult> => {
    try {
      const startTime = new Date().getTime();
      
      // Test file URLs - adjust size based on your needs
      // Small file for ping test (100KB)
      const pingTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage100k.php';
      // Larger file for download test (10MB)
      const downloadTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage10m.php';
      
      // Ping test
      console.log("Starting ping test");
      const pingStartTime = new Date().getTime();
      await fetch(pingTestUrl, { method: 'HEAD' });
      const pingTime = new Date().getTime() - pingStartTime;
      console.log(`Ping: ${pingTime}ms`);
      
      // Download speed test
      console.log("Starting download test");
      const downloadStartTime = new Date().getTime();
      const downloadResponse = await fetch(downloadTestUrl);
      const downloadBlob = await downloadResponse.blob();
      const downloadEndTime = new Date().getTime();
      
      // Calculate download speed in Mbps
      const downloadTimeSec = (downloadEndTime - downloadStartTime) / 1000;
      const fileSizeInBits = downloadBlob.size * 8;
      const downloadSpeed = (fileSizeInBits / downloadTimeSec) / 1000000; // Convert to Mbps
      console.log(`Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
      
      // Upload speed test (simplified simulation)
      // In a real implementation, you'd need a server endpoint to receive data
      console.log("Simulating upload test");
      const sampleData = new Array(1024 * 1024 * 2).fill('X').join(''); // 2MB of dummy data
      const blob = new Blob([sampleData], { type: 'text/plain' });
      
      const uploadStartTime = new Date().getTime();
      // Simulate upload by posting to a test endpoint
      try {
        await fetch(`${API_URL}/api/test-upload`, {
          method: 'POST',
          body: blob,
        });
      } catch (e) {
        console.log("Upload test error (expected in simulation):", e);
      }
      const uploadEndTime = new Date().getTime();
      
      // Calculate upload speed (this is just an estimation)
      const uploadTimeSec = (uploadEndTime - uploadStartTime) / 1000;
      const uploadData = new TextEncoder().encode(sampleData).length * 8;
      const uploadSpeed = (uploadData / uploadTimeSec) / 1000000; // Convert to Mbps
      console.log(`Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
      
      return {
        downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
        uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
        ping: pingTime
      };
    } catch (error) {
      console.error("Speed test error:", error);
      // Return default values if test fails
      return {
        downloadSpeed: 0,
        uploadSpeed: 0,
        ping: 999
      };
    }
  };

  // Determine more specific network type based on speed test results
  const getNetworkTypeFromSpeed = (baseNetType: string, speedTest: SpeedTestResult): string => {
    if (baseNetType === 'cellular') {
      // Classify cellular connection based on speed
      if (speedTest.downloadSpeed >= 50) return '5G';
      if (speedTest.downloadSpeed >= 20) return '4G/LTE';
      if (speedTest.downloadSpeed >= 5) return '3G';
      return '2G';
    } else if (baseNetType === 'wifi') {
      // Classify WiFi connection
      if (speedTest.downloadSpeed >= 100) return 'WiFi (High-speed)';
      if (speedTest.downloadSpeed >= 25) return 'WiFi (Medium)';
      return 'WiFi (Low-speed)';
    }
    return baseNetType;
  };

  // Calculate signal strength percentage based on network type and speed
  const calculateSignalStrength = (netType: string, speedTest: SpeedTestResult): number => {
    let strength = 0;
    
    // Factor 1: Download speed relative to maximum expected for network type
    let downloadFactor = 0;
    if (netType.includes('5G')) {
      downloadFactor = Math.min(100, (speedTest.downloadSpeed / 300) * 100);
    } else if (netType.includes('4G') || netType.includes('LTE')) {
      downloadFactor = Math.min(100, (speedTest.downloadSpeed / 100) * 100);
    } else if (netType.includes('3G')) {
      downloadFactor = Math.min(100, (speedTest.downloadSpeed / 10) * 100);
    } else if (netType.includes('WiFi')) {
      downloadFactor = Math.min(100, (speedTest.downloadSpeed / 200) * 100);
    } else {
      downloadFactor = Math.min(100, (speedTest.downloadSpeed / 1) * 100);
    }
    
    // Factor 2: Upload speed relative to download
    const uploadRatio = speedTest.downloadSpeed > 0 ? 
      Math.min(1, speedTest.uploadSpeed / speedTest.downloadSpeed) : 0;
    const uploadFactor = uploadRatio * 100;
    
    // Factor 3: Ping (lower is better)
    let pingFactor = 0;
    if (speedTest.ping <= 20) pingFactor = 100;
    else if (speedTest.ping <= 50) pingFactor = 80;
    else if (speedTest.ping <= 100) pingFactor = 60;
    else if (speedTest.ping <= 200) pingFactor = 40;
    else if (speedTest.ping <= 500) pingFactor = 20;
    else pingFactor = 0;
    
    // Weight the factors (download is most important, then ping, then upload)
    strength = (downloadFactor * 0.6) + (pingFactor * 0.3) + (uploadFactor * 0.1);
    
    // Ensure it's within 0-100 range and round to integer
    return Math.max(0, Math.min(100, Math.round(strength)));
  };

  // Save a new signal report to MongoDB
  const saveReport = async (
    latitude: number, 
    longitude: number, 
    networkType: string, 
    signalStrength: number,
    downloadSpeed: number = 0,
    uploadSpeed: number = 0,
    ping: number = 0
  ) => {
    console.log("About to save report to:", `${API_URL}/api/report/post`);
    console.log("Report data:", { 
      latitude, 
      longitude, 
      networkType, 
      signalStrength,
      downloadSpeed,
      uploadSpeed,
      ping 
    });
    
    try {
      const response = await axios.post(`${API_URL}/api/report/post`, {
        latitude,
        longitude,
        networkType,
        signalStrength,
        downloadSpeed,
        uploadSpeed,
        ping
      });
      console.log('Report saved, response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Full error object:', error);
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to save your signal report. Please try again.');
      return null;
    }
  };

  // Fetch report data from MongoDB
  const fetchReportData = async () => {
    console.log("Starting fetchReportData");
    setIsLoading(true);
    try {
      // Set a longer timeout for slow connections
      console.log("Sending GET request to:", `${API_URL}/api/report/get`);
      const response = await axios.get(`${API_URL}/api/report/get`, {
        timeout: 10000 // 10 seconds
      });
      console.log("Received report data:", response.data);
      setReportData(response.data);
    } catch (err: unknown) {
      // Type guard for error handling
      const error = err as Error | AxiosError;
      
      console.log("Error in fetchReportData:", error);
      console.error('Error fetching report data:', error);
      
      // Check if it's an AxiosError with timeout
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.log('Request timed out - network may be slow');
        }
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data");
      useMockData();
      
      Alert.alert(
        'Connection Error',
        'Could not connect to the database. Using cached data instead.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log("Finished fetchReportData");
      setIsLoading(false);
    }
  };

  // Fallback to mock data if API connection fails
  const useMockData = () => {
    const mockData = [
      { _id: '3ddda7356de54ae09f7d710d', latitude: 38.98764, longitude: -76.94255, networkType: '5G', signalStrength: 79, createdAt: '2025-04-12T21:27:23.000Z', updatedAt: '2025-04-12T21:27:23.000Z', __v: 0 },
      // ... (rest of your mock data)
    ];
    setReportData(mockData);
  };

  // Color generation based on signal strength - using the defined colors
  function getColorFromValue(value: number, darkenFactor: number = 0): string {
    const applyDarken = (color: number) => Math.max(0, color - darkenFactor);

    if (value <= 25) {
      return BRAND_COLORS.poor;
    } else if (value <= 50) {
      return BRAND_COLORS.fair;
    } else if (value <= 75) {
      return BRAND_COLORS.good;
    } else {
      return BRAND_COLORS.excellent;
    }
  }

  // Format speeds for display
  const formatSpeed = (speed: number): string => {
    if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
    return `${speed.toFixed(1)} Mbps`;
  };

  // Run splash screen animation
  const runSplashAnimation = () => {
    // Create a sequence of animations
    Animated.sequence([
      // First: scale up logo
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Then rotate logo
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Finally fade out splash and fade in map
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(mapOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      setShowSplash(false);
      setIsFirstLaunch(false);
    });
  };

  // Initial data fetch on component mount and splash animation
  useEffect(() => {
    console.log("Component mounted, fetching initial data");
    fetchReportData();
    
    // Check if location permissions are already granted
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
    
    // Run splash screen animation after a short delay
    setTimeout(() => {
      runSplashAnimation();
    }, 1000);
  }, []);

  // If on first launch and no permission yet, show the permission request
  const renderPermissionRequest = () => {
    if (!showSplash && isFirstLaunch && !permissionGranted) {
      return (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Enable Location</Text>
            <Text style={styles.permissionText}>
              BarNone needs access to your location to map signal quality in your area.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={getLocationAndConnection}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  // Render splash screen
  const renderSplash = () => {
    if (showSplash) {
      return (
        <Animated.View style={[styles.splashScreen, { opacity: logoOpacity }]}>
          <Animated.View style={{ 
            transform: [
              { scale: logoScale },
              { rotate: spin }
            ]
          }}>
            <View style={styles.logoContainer}>
              <Text style={styles.splashLogo}>📡</Text>
              <Text style={styles.splashText}>BarNone</Text>
            </View>
          </Animated.View>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Splash screen */}
      {renderSplash()}
      
      {/* Main App UI */}
      <Animated.View style={[styles.mainContainer, { opacity: mapOpacity }]}>
        {/* Map as the main background */}
        <View style={styles.mapWrapper}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={getZoomLevel()}
            onMapReady={() => setMapReady(true)}
          >
            {/* Render circles for signal strength data */}
            {reportData.map((report) => {
              if (
                typeof report.latitude !== 'number' ||
                typeof report.longitude !== 'number' ||
                isNaN(report.latitude) ||
                isNaN(report.longitude)
              ) {
                return null;
              }

              return (
                <Circle
                  key={report._id}
                  center={{
                    latitude: report.latitude,
                    longitude: report.longitude,
                  }}
                  radius={20} // Bigger circles like Life360
                  fillColor={getColorFromValue(report.signalStrength)}
                  strokeColor={getColorFromValue(report.signalStrength, 20)}
                />
              );
            })}
            
            {/* Current location marker */}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your Location"
                description={connectionStrength > 0 ? 
                  `Network: ${networkType}, Signal: ${connectionStrength}%` : 
                  "No connection data"
                }
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <Text style={styles.markerText}>📡</Text>
                  </View>
                  {connectionStrength > 0 && (
                    <View style={[
                      styles.signalIndicator, 
                      {backgroundColor: getColorFromValue(connectionStrength)}
                    ]} />
                  )}
                </View>
              </Marker>
            )}
          </MapView>
          
          {/* Header overlay */}
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>BarNone</Text>
          </View>
          
          {/* Check Connection Button - Floating on Map */}
          <TouchableOpacity 
            style={styles.checkButton}
            onPress={getLocationAndConnection}
            disabled={isLoading}
          >
            <View style={styles.checkButtonInner}>
              <Ionicons name="cellular-outline" size={24} color="white" />
              <Text style={styles.checkButtonText}>
                {isLoading ? "Testing..." : "Check Connection"}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Legend Button */}
          <TouchableOpacity 
            style={styles.legendButton}
            onPress={toggleLegend}
          >
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Legend Panel - toggled by button */}
          <Animated.View 
            style={[
              styles.legendOverlay,
              {
                height: legendHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100]
                }),
                opacity: legendHeight,
                bottom: legendHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 110]
                })
              }
            ]}
          >
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.poor }]} />
                <Text style={styles.legendText}>Poor</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.fair }]} />
                <Text style={styles.legendText}>Fair</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.good }]} />
                <Text style={styles.legendText}>Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.excellent }]} />
                <Text style={styles.legendText}>Excellent</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Results Panel - Slide up from bottom */}
          <Animated.View 
            style={[
              styles.resultsPanel,
              {
                height: resultsHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '45%']
                })
              }
            ]}
          >
            {/* Handle for dragging */}
            <View style={styles.panelHandle} />
            
            {/* Panel Content */}
            {speedTestResults && (
              <View style={styles.panelContent}>
                <Text style={styles.panelTitle}>Network Analysis</Text>
                
                <View style={styles.networkInfo}>
                  <View style={styles.networkTypeContainer}>
                    <Text style={styles.networkTypeLabel}>Network</Text>
                    <Text style={styles.networkTypeValue}>{networkType}</Text>
                  </View>
                  
                  <View style={styles.signalContainer}>
                    <Text style={styles.signalLabel}>Signal</Text>
                    <View style={styles.signalBarContainer}>
                      <View 
                        style={[
                          styles.signalBar, 
                          {
                            width: `${connectionStrength}%`,
                            backgroundColor: getColorFromValue(connectionStrength)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.signalValue}>{connectionStrength}%</Text>
                  </View>
                </View>
                
                <View style={styles.speedContainer}>
                  <View style={styles.speedItem}>
                    <Text style={styles.speedLabel}>Download</Text>
                    <Text style={styles.speedValue}>{formatSpeed(speedTestResults.downloadSpeed)}</Text>
                  </View>
                  
                  <View style={styles.speedItem}>
                    <Text style={styles.speedLabel}>Upload</Text>
                    <Text style={styles.speedValue}>{formatSpeed(speedTestResults.uploadSpeed)}</Text>
                  </View>
                  
                  <View style={styles.speedItem}>
                    <Text style={styles.speedLabel}>Ping</Text>
                    <Text style={styles.speedValue}>{speedTestResults.ping} ms</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => toggleResultsPanel(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Animated.View>
      
      {/* Permission request overlay */}
      {renderPermissionRequest()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  // Splash Screen
  splashScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.primary,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 60,
    marginBottom: 16,
    color: BRAND_COLORS.white,
  },
  splashText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: BRAND_COLORS.white,
  },
  // Main Container
  mainContainer: {
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.light,
    padding: 15,
    zIndex: 1,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
  },
  // Check Connection Button
  checkButton: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: BRAND_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2,
  },
  checkButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButtonText: {
    color: BRAND_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
    // Update the legend button position in styles
  legendButton: {
    position: 'absolute',
    right: 20,
    top: 80, // Move to top right
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 20,
    padding: 10,
    zIndex: 2,
    elevation: 4,
  },
    // Update legend overlay to be more compact and technically specific
  legendOverlay: {
    position: 'absolute',
    right: 20,
    top: 130, // Position below the legend button
    backgroundColor: BRAND_COLORS.white,
    borderRadius: 12,
    padding: 10,
    zIndex: 3,
    elevation: 4,
    width: 200, // Fixed width instead of full width
  },

  /////
    // Add legend title style
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 8,
  },

  // Update legend items layout to vertical
  legendItems: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  // Marker
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: BRAND_COLORS.primary,
    padding: 6,
    borderRadius: 20,
  },
  markerText: {
    fontSize: 16,
    color: BRAND_COLORS.white,
  },
  signalIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  // Results Panel
  resultsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: BRAND_COLORS.grey,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  panelContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 10,
  },
  networkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  networkTypeContainer: {
    flex: 1,
  },
  networkTypeLabel: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  networkTypeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_COLORS.primary,
  },
  signalContainer: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  signalBarContainer: {
    height: 8,
    backgroundColor: BRAND_COLORS.grey,
    borderRadius: 4,
    marginVertical: 4,
    overflow: 'hidden',
  },
  signalBar: {
    height: 8,
    borderRadius: 4,
  },
  signalValue: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  speedItem: {
    alignItems: 'center',
    flex: 1,
  },
  speedLabel: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  speedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_COLORS.primary,
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  closeButtonText: {
    color: BRAND_COLORS.white,
    fontWeight: 'bold',
  },
  // Permission Overlay
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  permissionBox: {
    backgroundColor: BRAND_COLORS.white,
    padding: 30,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    color: BRAND_COLORS.text,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: BRAND_COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: BRAND_COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
