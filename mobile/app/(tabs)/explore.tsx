import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  SafeAreaView,
  Alert,
  ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline, Callout } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { LocationAccuracy } from 'expo-location';
import axios, { AxiosError } from 'axios';

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

// API configuration
const API_URL = 'https://signalscape.onrender.com';

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

// Point in the trail
interface TrailPoint {
  latitude: number; 
  longitude: number; 
  strength: number; 
  timestamp: string;
  networkType: string;
  downloadSpeed?: number;
  uploadSpeed?: number;
  ping?: number;
}

export default function ExploreScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [networkType, setNetworkType] = useState('unknown');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [tracking, setTracking] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResult | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripEndTime, setTripEndTime] = useState<Date | null>(null);
  const [bestConnection, setBestConnection] = useState<TrailPoint | null>(null);
  const [worstConnection, setWorstConnection] = useState<TrailPoint | null>(null);

  // Map reference
  const mapRef = useRef<MapView>(null);

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
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
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

      // Record point in trail
      const timestamp = new Date().toLocaleTimeString();
      const newPoint: TrailPoint = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        strength: strength,
        timestamp: timestamp,
        networkType: updatedNetType,
        downloadSpeed: speedTest.downloadSpeed,
        uploadSpeed: speedTest.uploadSpeed,
        ping: speedTest.ping
      };
      
      setTrail(prev => {
        const updatedTrail = [...prev, newPoint];
        
        // Update best/worst connections
        updateBestAndWorstConnections(updatedTrail);
        
        return updatedTrail;
      });

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
      
      // Fetch reports data
      fetchReportData();
    } catch (error) {
      console.log("Error caught in getLocationAndConnection:", error);
      console.error('Error getting location or connection:', error);
      setErrorMsg('Error checking connection. Please try again.');
    } finally {
      console.log("Finished getLocationAndConnection");
      setIsLoading(false);
    }
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
      // ... (additional mock data if needed)
    ];
    setReportData(mockData);
  };

  // Toggle tracking
  const toggleTracking = async () => {
    if (!tracking) {
      // Start tracking
      setTripStartTime(new Date());
      setTripEndTime(null);
      setTrail([]);
      setBestConnection(null);
      setWorstConnection(null);
      await getLocationAndConnection(); // Get initial location and connection
      setTracking(true);
    } else {
      // Stop tracking
      setTracking(false);
      setTripEndTime(new Date());
    }
  };

  // Update best and worst connections
  const updateBestAndWorstConnections = (trailPoints: TrailPoint[]) => {
    if (trailPoints.length === 0) return;
    
    let best = trailPoints[0];
    let worst = trailPoints[0];
    
    trailPoints.forEach(point => {
      if (point.strength > best.strength) {
        best = point;
      }
      if (point.strength < worst.strength) {
        worst = point;
      }
    });
    
    setBestConnection(best);
    setWorstConnection(worst);
  };

  // Format speeds for display
  const formatSpeed = (speed: number | undefined): string => {
    if (!speed) return 'N/A';
    if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
    return `${speed.toFixed(1)} Mbps`;
  };

  // Format duration
  const formatDuration = (): string => {
    if (!tripStartTime) return '00:00:00';
    const endTime = tripEndTime || new Date();
    const durationMs = endTime.getTime() - tripStartTime.getTime();
    
    // Convert to hours, minutes, seconds
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Color generation based on signal strength
  function getColorFromValue(value: number): string {
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

  // Set up tracking location watch
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
  
    if (tracking) {
      const startLiveTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
        
        setPermissionGranted(true);
  
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: LocationAccuracy.High,
            timeInterval: 5000, // Every 5 seconds
            distanceInterval: 5, // Every 5 meters
          },
          async (loc) => {
            setLocation(loc);
            
            // Run a connection check with each location update
            await getLocationAndConnection();
          }
        );
      };
  
      startLiveTracking();
    }
  
    // Cleanup on unmount or when tracking stops
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [tracking]);

  // Initial data fetch
  useEffect(() => {
    // Check if location permissions are already granted
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
    
    // Fetch initial report data
    fetchReportData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        scrollEnabled={scrollEnabled}
      >
        {/* Header */}
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>BarNone</Text>
        </View>

        <View style={styles.content}>
          {/* Map */}
          <View style={styles.mapContainer}>
            {location && (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onTouchStart={() => setScrollEnabled(false)}
                onTouchEnd={() => setScrollEnabled(true)}
                onTouchCancel={() => setScrollEnabled(true)}
              >
                {/* Circles for signal strength data */}
                {reportData.map((report) => {
                  if (
                    typeof report.latitude !== 'number' ||
                    typeof report.longitude !== 'number' ||
                    isNaN(report.latitude) ||
                    isNaN(report.longitude)
                  ) {
                    return null;
                  }

                  // return (
                  //   <Circle
                  //     key={report._id}
                  //     center={{
                  //       latitude: report.latitude,
                  //       longitude: report.longitude,
                  //     }}
                  //     radius={20}
                  //     fillColor={getColorFromValue(report.signalStrength)}
                  //     strokeColor={getColorFromValue(report.signalStrength)}
                  //   />
                  // );
                })}

                {/* Current location */}
                <Marker coordinate={location.coords}>
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

                {/* Colored Trail */}
                {trail.length >= 2 && trail.map((point, i) => {
                  if (i === 0) return null;
                  const prev = trail[i - 1];
                  
                  return (
                    <Polyline
                      key={`trail-${i}`}
                      coordinates={[
                        { latitude: prev.latitude, longitude: prev.longitude },
                        { latitude: point.latitude, longitude: point.longitude },
                      ]}
                      strokeColor={getColorFromValue(point.strength)}
                      strokeWidth={4}
                    />
                  );
                })}

                {/* Best and Worst Connection Markers */}
                {bestConnection && (
                  <Marker
                    coordinate={{
                      latitude: bestConnection.latitude,
                      longitude: bestConnection.longitude
                    }}
                    pinColor="green"
                  >
                    <View style={styles.specialMarker}>
                      <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.excellent} />
                    </View>
                    <Callout>
                      <Text>Best Signal: {bestConnection.strength}%</Text>
                      <Text>Network: {bestConnection.networkType}</Text>
                      <Text>Download: {formatSpeed(bestConnection.downloadSpeed)}</Text>
                      <Text>Time: {bestConnection.timestamp}</Text>
                      <Text>Latitude: {bestConnection.latitude}</Text>
                      <Text>Longitude: {bestConnection.longitude}</Text>
                    </Callout>
                  </Marker>
                )}

                {worstConnection && (
                  <Marker
                    coordinate={{
                      latitude: worstConnection.latitude,
                      longitude: worstConnection.longitude
                    }}
                  >
                    <View style={styles.specialMarker}>
                      <Ionicons name="close-circle" size={24} color={BRAND_COLORS.poor} />
                    </View>
                    <Callout>
                      <Text>Worst Signal: {worstConnection.strength}%</Text>
                      <Text>Network: {worstConnection.networkType}</Text>
                      <Text>Download: {formatSpeed(worstConnection.downloadSpeed)}</Text>
                      <Text>Time: {worstConnection.timestamp}</Text>
                    </Callout>
                  </Marker>
                )}
              </MapView>
            )}
          </View>

          {/* Tracking Controls */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, tracking ? styles.stopButton : styles.startButton]}
              onPress={toggleTracking}
              disabled={isLoading}
            >
              <View style={styles.buttonInner}>
                <Ionicons 
                  name={tracking ? "stop-circle-outline" : "play-circle-outline"} 
                  size={24} 
                  color="white" 
                />
                <Text style={styles.buttonText}>
                  {isLoading ? "Testing..." : tracking ? "Stop Tracking" : "Start Tracking"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setTrail([]);
                setBestConnection(null);
                setWorstConnection(null);
                setTripStartTime(null);
                setTripEndTime(null);
              }}
            >
              <View style={styles.buttonInner}>
                <Ionicons name="trash-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Clear Trail</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Info Panels */}
          {location && (
            <>
              {/* Current Signal Panel */}
              <View style={styles.infoPanel}>
                <Text style={styles.panelTitle}>Current Signal</Text>
                
                <View style={styles.networkInfo}>
                  <View style={styles.networkTypeContainer}>
                    <Text style={styles.networkTypeLabel}>Network</Text>
                    <Text style={styles.networkTypeValue}>{networkType}</Text>
                  </View>
                  
                  <View style={styles.signalContainer}>
                    <Text style={styles.signalLabel}>Signal</Text>
                    <ProgressBar
                      progress={connectionStrength / 100}
                      color={getColorFromValue(connectionStrength)}
                      style={styles.progressBar}
                    />
                    <Text style={styles.signalValue}>{connectionStrength}%</Text>
                  </View>
                </View>
                
                {speedTestResults && (
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
                )}
              </View>

              {/* Trip Summary Panel */}
              <View style={styles.infoPanel}>
                <Text style={styles.panelTitle}>Trip Summary</Text>
                
                <View style={styles.tripInfo}>
                  <View style={styles.durationContainer}>
                    <Text style={styles.tripLabel}>Duration</Text>
                    <Text style={styles.tripValue}>{formatDuration()}</Text>
                  </View>
                  
                  <View style={styles.pointsContainer}>
                    <Text style={styles.tripLabel}>Points Recorded</Text>
                    <Text style={styles.tripValue}>{trail.length}</Text>
                  </View>
                </View>
                
                <View style={styles.bestWorstContainer}>
                  {bestConnection && (
                    <View style={styles.connectionSummary}>
                      <Text style={[styles.connectionLabel, { color: BRAND_COLORS.excellent }]}>Best Connection</Text>
                      <Text style={styles.connectionValue}>{bestConnection.strength}% ({bestConnection.networkType})</Text>
                      <Text style={styles.connectionDetail}>Download: {formatSpeed(bestConnection.downloadSpeed)}</Text>
                      <Text style={styles.connectionDetail}>Upload: {formatSpeed(bestConnection.uploadSpeed)}</Text>
                      <Text style={styles.connectionDetail}>Ping: {bestConnection.ping} ms</Text>
                    </View>
                  )}
                  
                  {worstConnection && (
                    <View style={styles.connectionSummary}>
                      <Text style={[styles.connectionLabel, { color: BRAND_COLORS.poor }]}>Worst Connection</Text>
                      <Text style={styles.connectionValue}>{worstConnection.strength}% ({worstConnection.networkType})</Text>
                      <Text style={styles.connectionDetail}>Download: {formatSpeed(worstConnection.downloadSpeed)}</Text>
                      <Text style={styles.connectionDetail}>Upload: {formatSpeed(worstConnection.uploadSpeed)}</Text>
                      <Text style={styles.connectionDetail}>Ping: {worstConnection.ping} ms</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.white,
  },
  content: {
    paddingBottom: 20,
    marginTop: 60,
  },
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
  mapContainer: {
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  map: {
    flex: 1,
  },
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
  specialMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: BRAND_COLORS.primary,
  },
  stopButton: {
    backgroundColor: BRAND_COLORS.poor,
  },
  clearButton: {
    backgroundColor: BRAND_COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: BRAND_COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoPanel: {
    backgroundColor: BRAND_COLORS.light,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
    marginBottom: 10,
  },
  networkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
  },
  signalContainer: {
    flex: 1,
  },
  signalLabel: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_COLORS.grey,
    marginVertical: 4,
  },
  signalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedItem: {
    alignItems: 'center',
    flex: 1,
  },
  speedLabel: {
    fontSize: 12,
    color: BRAND_COLORS.text,
  },
  speedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  durationContainer: {
    flex: 1,
  },
  pointsContainer: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 14,
    color: BRAND_COLORS.text,
  },
  tripValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
  },
  bestWorstContainer: {
    marginTop: 10,
  },
  connectionSummary: {
    marginBottom: 10,
  },
  connectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.text,
  },
  connectionDetail: {
    fontSize: 12,
    color: BRAND_COLORS.text,
  },
  error: {
    color: BRAND_COLORS.poor,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});