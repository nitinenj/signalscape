// // // NEW CODE
// // import { useEffect, useState, useRef } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   StyleSheet, 
// //   Dimensions, 
// //   TouchableOpacity, 
// //   Alert, 
// //   SafeAreaView, 
// //   StatusBar,
// //   Platform,
// //   Animated,
// //   Image,
// //   useColorScheme
// // } from 'react-native';
// // import * as Location from 'expo-location';
// // import MapView, { Circle, Marker } from 'react-native-maps';
// // import NetInfo from '@react-native-community/netinfo';
// // import { Ionicons } from '@expo/vector-icons';
// // import axios, { AxiosError } from 'axios';

// // // Report type definition
// // interface ReportData {
// //   _id: string;
// //   latitude: number;
// //   longitude: number;
// //   networkType: string;
// //   signalStrength: number;
// //   downloadSpeed?: number;
// //   uploadSpeed?: number;
// //   ping?: number;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // // Speed Test Result interface
// // interface SpeedTestResult {
// //   downloadSpeed: number;
// //   uploadSpeed: number;
// //   ping: number;
// // }

// // // API configuration
// // const API_URL = 'https://signalscape.onrender.com';

// // // Brand color constants
// // const BRAND_COLORS = {
// //   primary: '#008b8e',
// //   poor: '#c33813',
// //   fair: '#fff624',
// //   good: '#9df37d',
// //   excellent: '#15752a',
// //   white: '#ffffff',
// //   black: '#2c3e50',
// //   grey: '#e0e0e0',
// //   lightGrey: '#f8f8f8',
// //   darkGrey: '#333333',
// //   light: 'rgba(255, 255, 255, 0.8)',
// //   darkLight: 'rgba(50, 50, 50, 0.8)',
// //   button: '#008b8e',
// //   text: '#2c3e50',
// //   darkText: '#ffffff',
// // };

// // export default function HomeScreen() {
// //   const colorScheme = useColorScheme();
// //   const isDarkMode = colorScheme === 'dark';
  
// //   const [location, setLocation] = useState<Location.LocationObject | null>(null);
// //   const [errorMsg, setErrorMsg] = useState<string | null>(null);
// //   const [connectionStrength, setConnectionStrength] = useState<number>(0);
// //   const [networkType, setNetworkType] = useState<string>('unknown');
// //   const [reportData, setReportData] = useState<ReportData[]>([]);
// //   const [isLoading, setIsLoading] = useState<boolean>(false);
// //   const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResult | null>(null);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [showResults, setShowResults] = useState(false);
// //   const [isFirstLaunch, setIsFirstLaunch] = useState(true);
// //   const [permissionGranted, setPermissionGranted] = useState(false);
// //   const [showSplash, setShowSplash] = useState(true);
// //   const [showLegend, setShowLegend] = useState(false);
// //   const [filter5G, setFilter5G] = useState(false); // New filter state for 5G

// //   // Animation values
// //   const logoScale = useRef(new Animated.Value(1)).current; // Start already at full size
// //   const logoOpacity = useRef(new Animated.Value(1)).current;
// //   const mapOpacity = useRef(new Animated.Value(0)).current;
// //   const resultsHeight = useRef(new Animated.Value(0)).current;
// //   const logoRotation = useRef(new Animated.Value(0)).current;
// //   const legendHeight = useRef(new Animated.Value(0)).current;

// //   // Map reference
// //   const mapRef = useRef<MapView>(null);

// //   // Logo rotation animation
// //   const spin = logoRotation.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: ['0deg', '360deg']
// //   });

// //   // Theme-aware colors
// //   const themeColors = {
// //     background: isDarkMode ? BRAND_COLORS.black : BRAND_COLORS.white,
// //     text: isDarkMode ? BRAND_COLORS.darkText : BRAND_COLORS.text,
// //     headerBackground: isDarkMode ? BRAND_COLORS.darkLight : BRAND_COLORS.light,
// //     panelBackground: isDarkMode ? BRAND_COLORS.darkGrey : BRAND_COLORS.white,
// //     statusBarStyle: isDarkMode ? 'light-content' : 'dark-content' as 'light-content' | 'dark-content',
// //   };

// //   // Default location for map if real location is not available yet
// //   const defaultLocation = {
// //     coords: {
// //       latitude: 38.98825,
// //       longitude: -76.94,
// //       accuracy: 10,
// //       altitude: null,
// //       altitudeAccuracy: null,
// //       heading: null,
// //       speed: null,
// //     },
// //     timestamp: Date.now(),
// //   };

// //   // Use real location or default
// //   const displayLocation = location || defaultLocation;

// //   // Calculate the zoom level based on location
// //   const getZoomLevel = () => {
// //     return {
// //       latitude: displayLocation.coords.latitude,
// //       longitude: displayLocation.coords.longitude,
// //       latitudeDelta: 0.05, // More zoomed in (smaller value)
// //       longitudeDelta: 0.05, // More zoomed in (smaller value)
// //     };
// //   };

// //   // Get location and connection strength
// //   const getLocationAndConnection = async () => {
// //     console.log("Starting getLocationAndConnection");
// //     setIsLoading(true);
// //     try {
// //       // Check if location permission is already granted
// //       if (!permissionGranted) {
// //         // Get location permission
// //         console.log("Requesting location permissions");
// //         let { status } = await Location.requestForegroundPermissionsAsync();
// //         console.log("Permission status:", status);
        
// //         if (status !== 'granted') {
// //           setErrorMsg('Permission to access location was denied');
// //           return;
// //         }
// //         setPermissionGranted(true);
// //       }

// //       // Get current location
// //       console.log("Getting current location");
// //       const loc = await Location.getCurrentPositionAsync({});
// //       console.log("Location received:", loc.coords);
// //       setLocation(loc);

// //       // Zoom to user location
// //       if (mapRef.current) {
// //         mapRef.current.animateToRegion({
// //           latitude: loc.coords.latitude,
// //           longitude: loc.coords.longitude,
// //           latitudeDelta: 0.05,
// //           longitudeDelta: 0.05,
// //         }, 1000);
// //       }

// //       // Check network connection
// //       console.log("Checking network connection");
// //       const netInfo = await NetInfo.fetch();
// //       let netType = netInfo.type;
// //       console.log("Network type:", netType);
      
// //       // Run speed test
// //       console.log("Starting speed test");
// //       const speedTest = await performSpeedTest();
// //       console.log("Speed test results:", speedTest);
// //       setSpeedTestResults(speedTest);
      
// //       // Update network type based on speed test results
// //       const updatedNetType = getNetworkTypeFromSpeed(netType, speedTest);
// //       console.log("Updated network type:", updatedNetType);
// //       setNetworkType(updatedNetType);
      
// //       // Calculate signal strength based on speed test and network type
// //       const strength = calculateSignalStrength(updatedNetType, speedTest);
// //       console.log("Calculated signal strength:", strength);
// //       setConnectionStrength(strength);

// //       // Save the report to database
// //       if (loc) {
// //         console.log("Saving report to database");
// //         await saveReport(
// //           loc.coords.latitude, 
// //           loc.coords.longitude, 
// //           updatedNetType, 
// //           strength,
// //           speedTest.downloadSpeed,
// //           speedTest.uploadSpeed,
// //           speedTest.ping
// //         );
// //       }
      
// //       // Refresh reports after submitting a new one
// //       console.log("Fetching updated report data");
// //       fetchReportData();
      
// //       // Show results panel
// //       toggleResultsPanel(true);
// //     } catch (error) {
// //       console.log("Error caught in getLocationAndConnection:", error);
// //       console.error('Error getting location or connection:', error);
// //       setErrorMsg('Error checking connection. Please try again.');
// //     } finally {
// //       console.log("Finished getLocationAndConnection");
// //       setIsLoading(false);
// //     }
// //   };

// //   // Toggle results panel with animation
// //   const toggleResultsPanel = (show: boolean) => {
// //     setShowResults(show);
// //     Animated.timing(resultsHeight, {
// //       toValue: show ? 1 : 0,
// //       duration: 300,
// //       useNativeDriver: false,
// //     }).start();
// //   };
  
// //   // Toggle legend panel with animation
// //   const toggleLegend = () => {
// //     setShowLegend(!showLegend);
// //     Animated.timing(legendHeight, {
// //       toValue: showLegend ? 0 : 1,
// //       duration: 300,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   // Toggle 5G filter
// //   const toggle5GFilter = () => {
// //     setFilter5G(!filter5G);
// //   };

// //   // Perform a speed test
// //   const performSpeedTest = async (): Promise<SpeedTestResult> => {
// //     try {
// //       const startTime = new Date().getTime();
      
// //       // Test file URLs - adjust size based on your needs
// //       // Small file for ping test (100KB)
// //       const pingTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage100k.php';
// //       // Larger file for download test (10MB)
// //       const downloadTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage10m.php';
      
// //       // Ping test
// //       console.log("Starting ping test");
// //       const pingStartTime = new Date().getTime();
// //       await fetch(pingTestUrl, { method: 'HEAD' });
// //       const pingTime = new Date().getTime() - pingStartTime;
// //       console.log(`Ping: ${pingTime}ms`);
      
// //       // Download speed test
// //       console.log("Starting download test");
// //       const downloadStartTime = new Date().getTime();
// //       const downloadResponse = await fetch(downloadTestUrl);
// //       const downloadBlob = await downloadResponse.blob();
// //       const downloadEndTime = new Date().getTime();
      
// //       // Calculate download speed in Mbps
// //       const downloadTimeSec = (downloadEndTime - downloadStartTime) / 1000;
// //       const fileSizeInBits = downloadBlob.size * 8;
// //       const downloadSpeed = (fileSizeInBits / downloadTimeSec) / 1000000; // Convert to Mbps
// //       console.log(`Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
      
// //       // Upload speed test (simplified simulation)
// //       // In a real implementation, you'd need a server endpoint to receive data
// //       console.log("Simulating upload test");
// //       const sampleData = new Array(1024 * 1024 * 2).fill('X').join(''); // 2MB of dummy data
// //       const blob = new Blob([sampleData], { type: 'text/plain' });
      
// //       const uploadStartTime = new Date().getTime();
// //       // Simulate upload by posting to a test endpoint
// //       try {
// //         await fetch(`${API_URL}/api/test-upload`, {
// //           method: 'POST',
// //           body: blob,
// //         });
// //       } catch (e) {
// //         console.log("Upload test error (expected in simulation):", e);
// //       }
// //       const uploadEndTime = new Date().getTime();
      
// //       // Calculate upload speed (this is just an estimation)
// //       const uploadTimeSec = (uploadEndTime - uploadStartTime) / 1000;
// //       const uploadData = new TextEncoder().encode(sampleData).length * 8;
// //       const uploadSpeed = (uploadData / uploadTimeSec) / 1000000; // Convert to Mbps
// //       console.log(`Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
      
// //       return {
// //         downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
// //         uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
// //         ping: pingTime
// //       };
// //     } catch (error) {
// //       console.error("Speed test error:", error);
// //       // Return default values if test fails
// //       return {
// //         downloadSpeed: 0,
// //         uploadSpeed: 0,
// //         ping: 999
// //       };
// //     }
// //   };

// //   // Determine more specific network type based on speed test results
// //   const getNetworkTypeFromSpeed = (baseNetType: string, speedTest: SpeedTestResult): string => {
// //     if (baseNetType === 'cellular') {
// //       // Classify cellular connection based on speed
// //       if (speedTest.downloadSpeed >= 50) return '5G';
// //       if (speedTest.downloadSpeed >= 20) return '4G/LTE';
// //       if (speedTest.downloadSpeed >= 5) return '3G';
// //       return '2G';
// //     } else if (baseNetType === 'wifi') {
// //       // Classify WiFi connection
// //       if (speedTest.downloadSpeed >= 100) return 'WiFi (High-speed)';
// //       if (speedTest.downloadSpeed >= 25) return 'WiFi (Medium)';
// //       return 'WiFi (Low-speed)';
// //     }
// //     return baseNetType;
// //   };

// //   // Calculate signal strength percentage based on network type and speed
// //   const calculateSignalStrength = (netType: string, speedTest: SpeedTestResult): number => {
// //     let strength = 0;
    
// //     // Factor 1: Download speed relative to maximum expected for network type
// //     let downloadFactor = 0;
// //     if (netType.includes('5G')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 300) * 100);
// //     } else if (netType.includes('4G') || netType.includes('LTE')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 100) * 100);
// //     } else if (netType.includes('3G')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 10) * 100);
// //     } else if (netType.includes('WiFi')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 200) * 100);
// //     } else {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 1) * 100);
// //     }
    
// //     // Factor 2: Upload speed relative to download
// //     const uploadRatio = speedTest.downloadSpeed > 0 ? 
// //       Math.min(1, speedTest.uploadSpeed / speedTest.downloadSpeed) : 0;
// //     const uploadFactor = uploadRatio * 100;
    
// //     // Factor 3: Ping (lower is better)
// //     let pingFactor = 0;
// //     if (speedTest.ping <= 20) pingFactor = 100;
// //     else if (speedTest.ping <= 50) pingFactor = 80;
// //     else if (speedTest.ping <= 100) pingFactor = 60;
// //     else if (speedTest.ping <= 200) pingFactor = 40;
// //     else if (speedTest.ping <= 500) pingFactor = 20;
// //     else pingFactor = 0;
    
// //     // Weight the factors (download is most important, then ping, then upload)
// //     strength = (downloadFactor * 0.6) + (pingFactor * 0.3) + (uploadFactor * 0.1);
    
// //     // Ensure it's within 0-100 range and round to integer
// //     return Math.max(0, Math.min(100, Math.round(strength)));
// //   };

// //   // Save a new signal report to MongoDB
// //   const saveReport = async (
// //     latitude: number, 
// //     longitude: number, 
// //     networkType: string, 
// //     signalStrength: number,
// //     downloadSpeed: number = 0,
// //     uploadSpeed: number = 0,
// //     ping: number = 0
// //   ) => {
// //     console.log("About to save report to:", `${API_URL}/api/report/post`);
// //     console.log("Report data:", { 
// //       latitude, 
// //       longitude, 
// //       networkType, 
// //       signalStrength,
// //       downloadSpeed,
// //       uploadSpeed,
// //       ping 
// //     });
    
// //     try {
// //       const response = await axios.post(`${API_URL}/api/report/post`, {
// //         latitude,
// //         longitude,
// //         networkType,
// //         signalStrength,
// //         downloadSpeed,
// //         uploadSpeed,
// //         ping
// //       });
// //       console.log('Report saved, response:', response.data);
// //       return response.data;
// //     } catch (error) {
// //       console.log('Full error object:', error);
// //       console.error('Error saving report:', error);
// //       Alert.alert('Error', 'Failed to save your signal report. Please try again.');
// //       return null;
// //     }
// //   };

// //   // Fetch report data from MongoDB
// //   const fetchReportData = async () => {
// //     console.log("Starting fetchReportData");
// //     setIsLoading(true);
// //     try {
// //       // Set a longer timeout for slow connections
// //       console.log("Sending GET request to:", `${API_URL}/api/report/get`);
// //       const response = await axios.get(`${API_URL}/api/report/get`, {
// //         timeout: 10000 // 10 seconds
// //       });
// //       console.log("Received report data:", response.data);
// //       setReportData(response.data);
// //     } catch (err: unknown) {
// //       // Type guard for error handling
// //       const error = err as Error | AxiosError;
      
// //       console.log("Error in fetchReportData:", error);
// //       console.error('Error fetching report data:', error);
      
// //       // Check if it's an AxiosError with timeout
// //       if (axios.isAxiosError(error)) {
// //         if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
// //           console.log('Request timed out - network may be slow');
// //         }
// //       }
      
// //       // Fallback to mock data
// //       console.log("Falling back to mock data");
// //       useMockData();
      
// //       Alert.alert(
// //         'Connection Error',
// //         'Could not connect to the database. Using cached data instead.',
// //         [{ text: 'OK' }]
// //       );
// //     } finally {
// //       console.log("Finished fetchReportData");
// //       setIsLoading(false);
// //     }
// //   };

// //   // Fallback to mock data if API connection fails
// //   const useMockData = () => {
// //     const mockData = [
// //       { _id: '3ddda7356de54ae09f7d710d', latitude: 38.98764, longitude: -76.94255, networkType: '5G', signalStrength: 79, createdAt: '2025-04-12T21:27:23.000Z', updatedAt: '2025-04-12T21:27:23.000Z', __v: 0 },
// //       // ... (rest of your mock data)
// //     ];
// //     setReportData(mockData);
// //   };

// //   // Color generation based on signal strength with gradient effect
// //   function getColorFromValue(value: number, opacity: number = 0.6): string {
// //     // Define base colors for different strength ranges
// //     const poorColor = BRAND_COLORS.poor;
// //     const fairColor = BRAND_COLORS.fair;
// //     const goodColor = BRAND_COLORS.good;
// //     const excellentColor = BRAND_COLORS.excellent;
    
// //     // Convert hex to rgba to allow transparency
// //     const hexToRgba = (hex: string, alpha: number) => {
// //       const r = parseInt(hex.slice(1, 3), 16);
// //       const g = parseInt(hex.slice(3, 5), 16);
// //       const b = parseInt(hex.slice(5, 7), 16);
// //       return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// //     };
    
// //     if (value <= 25) {
// //       // Poor range (0-25%)
// //       return hexToRgba(poorColor, opacity);
// //     } else if (value <= 50) {
// //       // Fair range (26-50%)
// //       return hexToRgba(fairColor, opacity);
// //     } else if (value <= 75) {
// //       // Good range (51-75%)
// //       return hexToRgba(goodColor, opacity);
// //     } else {
// //       // Excellent range (76-100%)
// //       return hexToRgba(excellentColor, opacity);
// //     }
// //   }

// //   // Format speeds for display
// //   const formatSpeed = (speed: number): string => {
// //     if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
// //     return `${speed.toFixed(1)} Mbps`;
// //   };

// //   // Run splash screen animation
// //   const runSplashAnimation = () => {
// //     // Create a sequence of animations, but skip the scaling
// //     Animated.sequence([
// //       // Just rotate logo
// //       Animated.timing(logoRotation, {
// //         toValue: 1,
// //         duration: 800,
// //         useNativeDriver: true,
// //       }),
// //       // Then fade out splash and fade in map
// //       Animated.parallel([
// //         Animated.timing(logoOpacity, {
// //           toValue: 0,
// //           duration: 800,
// //           useNativeDriver: true,
// //         }),
// //         Animated.timing(mapOpacity, {
// //           toValue: 1,
// //           duration: 800,
// //           useNativeDriver: true,
// //         })
// //       ])
// //     ]).start(() => {
// //       setShowSplash(false);
// //       setIsFirstLaunch(false);
// //     });
// //   };

// //   // Initial data fetch on component mount and splash animation
// //   useEffect(() => {
// //     console.log("Component mounted, fetching initial data");
// //     fetchReportData();
    
// //     // Check if location permissions are already granted
// //     (async () => {
// //       const { status } = await Location.getForegroundPermissionsAsync();
// //       if (status === 'granted') {
// //         setPermissionGranted(true);
// //         const loc = await Location.getCurrentPositionAsync({});
// //         setLocation(loc);
// //       }
// //     })();
    
// //     // Run splash screen animation after a short delay
// //     setTimeout(() => {
// //       runSplashAnimation();
// //     }, 1000);
// //   }, []);

// //   // Filter the report data based on 5G toggle
// //   const filteredReportData = reportData.filter((report) => {
// //     if (filter5G) {
// //       return report.networkType === '5G'; // Show only 5G
// //     } else {
// //       return report.networkType !== '5G'; // Show everything except 5G
// //     }
// //   });

// //   // If on first launch and no permission yet, show the permission request
// //   const renderPermissionRequest = () => {
// //     if (!showSplash && isFirstLaunch && !permissionGranted) {
// //       return (
// //         <View style={styles.permissionOverlay}>
// //           <View style={[styles.permissionBox, {backgroundColor: themeColors.panelBackground}]}>
// //             <Text style={[styles.permissionTitle, {color: themeColors.text}]}>Enable Location</Text>
// //             <Text style={[styles.permissionText, {color: themeColors.text}]}>
// //               SignalScape needs access to your location to map signal quality in your area.
// //             </Text>
// //             <TouchableOpacity 
// //               style={styles.permissionButton}
// //               onPress={getLocationAndConnection}
// //             >
// //               <Text style={styles.permissionButtonText}>Grant Permission</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       );
// //     }
// //     return null;
// //   };

// //   // Render splash screen
// //   const renderSplash = () => {
// //     if (showSplash) {
// //       return (
// //         <Animated.View style={[styles.splashScreen, { opacity: logoOpacity }]}>
// //           {/* <Animated.View style={{ 
// //             transform: [
// //               { rotate: spin }
// //             ]
// //           }}> */}
// //             <View style={styles.logoContainer}>
// //               <Text style={styles.splashLogo}>📡</Text>
// //               {/* Removed "BarNone" text */}
// //             </View>
// //           {/* </Animated.View> */}
// //         </Animated.View>
// //       );
// //     }
// //     return null;
// //   };

// //   return (
// //     <SafeAreaView style={[styles.safeArea, {backgroundColor: themeColors.background}]}>
// //       <StatusBar barStyle={themeColors.statusBarStyle} />
      
// //       {/* Splash screen */}
// //       {renderSplash()}
      
// //       {/* Main App UI */}
// //       <Animated.View style={[styles.mainContainer, { opacity: mapOpacity }]}>
// //         {/* Map as the main background */}
// //         <View style={styles.mapWrapper}>
// //           <MapView
// //             ref={mapRef}
// //             style={styles.map}
// //             initialRegion={getZoomLevel()}
// //             onMapReady={() => setMapReady(true)}
// //           >
// //             {/* Render circles for signal strength data */}
// //             {filteredReportData.map((report) => {
// //               if (
// //                 typeof report.latitude !== 'number' ||
// //                 typeof report.longitude !== 'number' ||
// //                 isNaN(report.latitude) ||
// //                 isNaN(report.longitude)
// //               ) {
// //                 return null;
// //               }

// //               return (
// //                 <Circle
// //                   key={report._id}
// //                   center={{
// //                     latitude: report.latitude,
// //                     longitude: report.longitude,
// //                   }}
// //                   radius={20} // Bigger circles like Life360
// //                   fillColor={getColorFromValue(report.signalStrength, 0.4)} // More transparent
// //                   strokeColor={getColorFromValue(report.signalStrength, 0.6)}
// //                 />
// //               );
// //             })}
            
// //             {/* Current location marker */}
// //             {location && (
// //               <Marker
// //                 coordinate={{
// //                   latitude: location.coords.latitude,
// //                   longitude: location.coords.longitude,
// //                 }}
// //                 title="Your Location"
// //                 description={connectionStrength > 0 ? 
// //                   `Network: ${networkType}, Signal: ${connectionStrength}%` : 
// //                   "No connection data"
// //                 }
// //               >
// //                 <View style={styles.markerContainer}>
// //                   <View style={styles.marker}>
// //                     <Text style={styles.markerText}>📡</Text>
// //                   </View>
// //                   {connectionStrength > 0 && (
// //                     <View style={[
// //                       styles.signalIndicator, 
// //                       {backgroundColor: getColorFromValue(connectionStrength, 1.0)}
// //                     ]} />
// //                   )}
// //                 </View>
// //               </Marker>
// //             )}
// //           </MapView>
          
// //           {/* Header overlay */}
// //           <View style={[styles.headerOverlay, {backgroundColor: themeColors.headerBackground}]}>
// //             <Text style={styles.headerTitle}>BarNone</Text>
// //           </View>
          
// //           {/* Button container for aligned buttons */}
// //           <View style={styles.buttonContainer}>
// //             {/* Check Connection Button */}
// //             <TouchableOpacity 
// //               style={styles.checkButton}
// //               onPress={getLocationAndConnection}
// //               disabled={isLoading}
// //             >
// //               <View style={styles.checkButtonInner}>
// //                 <Ionicons name="cellular-outline" size={20} color="white" />
// //                 <Text style={styles.checkButtonText}>
// //                   {isLoading ? "Testing..." : "Check Connection"}
// //                 </Text>
// //               </View>
// //             </TouchableOpacity>
            
// //             {/* Legend Button */}
// //             <TouchableOpacity 
// //               style={styles.legendButton}
// //               onPress={toggleLegend}
// //             >
// //               <Ionicons name="information-circle-outline" size={20} color="white" />
// //             </TouchableOpacity>
            
// //             {/* Filter Button */}
// //             <TouchableOpacity 
// //               style={[styles.filterButton, filter5G && styles.filterButtonActive]}
// //               onPress={toggle5GFilter}
// //             >
// //               <Text style={styles.filterButtonText}>
// //                 {filter5G ? "5G Only" : "Non-5G"}
// //               </Text>
// //             </TouchableOpacity>
// //           </View>
          
// //           {/* Legend Panel - toggled by button */}
// //           <Animated.View 
// //             style={[
// //               styles.legendOverlay,
// //               {
// //                 backgroundColor: themeColors.panelBackground,
// //                 height: legendHeight.interpolate({
// //                   inputRange: [0, 1],
// //                   outputRange: [0, 150]
// //                 }),
// //                 opacity: legendHeight
// //               }
// //             ]}
// //           >
// //             <Text style={[styles.legendTitle, {color: themeColors.text}]}>Signal Strength</Text>
// //             <View style={styles.legendItems}>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.poor }]} />
// //                 <Text style={[styles.legendText, {color: themeColors.text}]}>Poor (0-25%)</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.fair }]} />
// //                 <Text style={[styles.legendText, {color: themeColors.text}]}>Fair (26-50%)</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.good }]} />
// //                 <Text style={[styles.legendText, {color: themeColors.text}]}>Good (51-75%)</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.excellent }]} />
// //                 <Text style={[styles.legendText, {color: themeColors.text}]}>Excellent (76-100%)</Text>
// //               </View>
// //             </View>
// //           </Animated.View>
          
// //           {/* Results Panel - Slide up from bottom */}
// // <Animated.View 
// //   style={[
// //     styles.resultsPanel,
// //     {
// //       backgroundColor: themeColors.panelBackground,
// //       height: resultsHeight.interpolate({
// //         inputRange: [0, 1],
// //         outputRange: ['0%', '45%']
// //       })
// //     }
// //   ]}
// // >
// //   {/* Handle for dragging */}
// //   <View style={styles.panelHandle} />
  


// //   {/* Panel Content */}
// //   {speedTestResults && (
// //     <View style={styles.panelContent}>
// //       <Text style={[styles.panelTitle, {color: themeColors.text}]}>Network Analysis</Text>
      
// //       <View style={styles.networkInfo}>
// //         <View style={styles.networkTypeContainer}>
// //           <Text style={[styles.networkTypeLabel, {color: themeColors.text}]}>Network</Text>
// //           <Text style={styles.networkTypeValue}>{networkType}</Text>
// //         </View>
        
// //         <View style={styles.signalContainer}>
// //           <Text style={[styles.signalLabel, {color: themeColors.text}]}>Signal</Text>
// //           <View style={styles.signalBarContainer}>
// //             <View 
// //               style={[
// //                 styles.signalBar, 
// //                 {
// //                   width: `${connectionStrength}%`,
// //                   backgroundColor: getColorFromValue(connectionStrength, 1.0)
// //                 }
// //               ]} 
// //             />
// //           </View>
// //           <Text style={[styles.signalValue, {color: themeColors.text}]}>{connectionStrength}%</Text>
// //         </View>
// //       </View>
      
// //       <View style={styles.speedContainer}>
// //         <View style={styles.speedItem}>
// //         <Text style={[styles.speedLabel, {color: themeColors.text}]}>Download</Text>
// //                   <Text style={styles.speedValue}>{formatSpeed(speedTestResults.downloadSpeed)}</Text>
// //                 </View>
// //                 <View style={styles.speedItem}>
// //                   <Text style={[styles.speedLabel, {color: themeColors.text}]}>Upload</Text>
// //                   <Text style={styles.speedValue}>{formatSpeed(speedTestResults.uploadSpeed)}</Text>
// //                 </View>
// //                 <View style={styles.speedItem}>
// //                   <Text style={[styles.speedLabel, {color: themeColors.text}]}>Ping</Text>
// //                   <Text style={styles.speedValue}>{speedTestResults.ping} ms</Text>
// //                 </View>
// //               </View>
// //               <TouchableOpacity
// //                    style={styles.closeButton}
// //                    onPress={() => toggleResultsPanel(false)}
// //                  >
// //                    <Text style={styles.closeButtonText}>Close</Text>
// //                  </TouchableOpacity>
// //             </View>
// //           )}


// //         </Animated.View>

// //         {/* Render permission request overlay if needed */}
// //         {renderPermissionRequest()}
// //       </View>
// //     </Animated.View>
// //   </SafeAreaView>
// // );
// // } // End of HomeScreen component







// // const styles = StyleSheet.create({
// //   safeArea: {
// //     flex: 1,
// //     backgroundColor: BRAND_COLORS.white,
// //     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
// //   },
// //   splashScreen: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: BRAND_COLORS.primary,
// //     zIndex: 10,
// //   },
// //   logoContainer: {
// //     alignItems: 'center',
// //   },
// //   splashLogo: {
// //     fontSize: 100,
// //     color: BRAND_COLORS.white,
// //   },
// //   mainContainer: {
// //     flex: 1,
// //   },
// //   mapWrapper: {
// //     flex: 1,
// //     position: 'relative',
// //   },
// //   map: {
// //     ...StyleSheet.absoluteFillObject,
// //   },
// //   headerOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: BRAND_COLORS.light,
// //     padding: 15,
// //     zIndex: 1,
// //     alignItems: 'center',
// //     borderBottomWidth: 1,
// //     borderBottomColor: 'rgba(0,0,0,0.1)',
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.primary,
// //   },
// //   checkButton: {
// //     position: 'absolute',
// //     top: 70,
// //     right: 10,
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 24,
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //     elevation: 4,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //     zIndex: 3,
// //   },
// //   checkButtonInner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   checkButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginLeft: 8,
// //   },
// //   legendButton: {
// //     position: 'absolute',
// //     top: 71,
// //     right: 347,
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 16,
// //     padding: 9,
// //     zIndex: 3,
// //     elevation: 4,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //   },
// //   legendOverlay: {
// //     position: 'absolute',
// //     top: 130,
// //     left: 20,
// //     backgroundColor: BRAND_COLORS.white,
// //     borderRadius: 12,
// //     padding: 10,
// //     zIndex: 3,
// //     elevation: 4,
// //     width: 200,
// //   },
// //   legendTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 8,
// //   },
// //   legendItems: {
// //     flexDirection: 'column',
// //     justifyContent: 'space-between',
// //   },
// //   legendItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 6,
// //   },
// //   legendColor: {
// //     width: 16,
// //     height: 16,
// //     borderRadius: 4,
// //     marginRight: 6,
// //   },
// //   legendText: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   markerContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   marker: {
// //     backgroundColor: BRAND_COLORS.primary,
// //     padding: 6,
// //     borderRadius: 20,
// //   },
// //   markerText: {
// //     fontSize: 16,
// //     color: BRAND_COLORS.white,
// //   },
// //   signalIndicator: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //     marginTop: 4,
// //   },
// //   resultsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: BRAND_COLORS.white,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     elevation: 5,
// //     overflow: 'hidden',
// //     minHeight: '45%',
// //   },
// //   panelHandle: {
// //     width: 40,
// //     height: 5,
// //     backgroundColor: BRAND_COLORS.grey,
// //     borderRadius: 2.5,
// //     alignSelf: 'center',
// //     marginVertical: 10,
// //   },
// //   panelContent: {
// //     paddingHorizontal: 20,
// //     flex: 1,
// //   },
// //   panelTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 10,
// //   },
// //   networkInfo: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   networkTypeContainer: {
// //     flex: 1,
// //   },
// //   networkTypeLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   networkTypeValue: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: BRAND_COLORS.primary,
// //   },
// //   signalContainer: {
// //     flex: 1,
// //   },
// //   signalLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   signalBarContainer: {
// //     height: 8,
// //     backgroundColor: BRAND_COLORS.grey,
// //     borderRadius: 4,
// //     marginVertical: 4,
// //     overflow: 'hidden',
// //   },
// //   signalBar: {
// //     height: 8,
// //     borderRadius: 4,
// //   },
// //   signalValue: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   speedContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   speedItem: {
// //     alignItems: 'center',
// //     flex: 1,
// //   },
// //   speedLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   speedValue: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: BRAND_COLORS.primary,
// //   },
// //   closeButton: {
// //     alignSelf: 'center',
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 20,
// //     paddingVertical: 10,
// //     paddingHorizontal: 30,
// //   },
// //   closeButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontWeight: 'bold',
// //   },
// //   permissionOverlay: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     zIndex: 20,
// //   },
// //   permissionBox: {
// //     backgroundColor: BRAND_COLORS.white,
// //     padding: 30,
// //     borderRadius: 20,
// //     width: '80%',
// //     alignItems: 'center',
// //   },
// //   permissionTitle: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.primary,
// //     marginBottom: 10,
// //   },
// //   permissionText: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 20,
// //   },
// //   permissionButton: {
// //     backgroundColor: BRAND_COLORS.primary,
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     borderRadius: 10,
// //   },
// //   permissionButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   buttonContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     backgroundColor: 'transparent',
// //   },
// //   filterButton: {
// //     backgroundColor: '#008b8e',
// //     paddingHorizontal: 13,
// //     paddingVertical: 11,
// //     borderRadius: 40,
// //     marginRight: 200,
// //     marginTop: 62,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //   },
// //   filterButtonActive: {
// //     borderColor: '#ffffff',
// //     borderWidth: 1.5,
// //     marginTop: 61,
// //   },
// //   filterButtonText: {
// //     color: 'white',
// //     fontWeight: '600',
// //   },
// // });











// // // OLD CODE, WORKING MENUS
// // import { useEffect, useState, useRef } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   StyleSheet, 
// //   Dimensions, 
// //   TouchableOpacity, 
// //   Alert, 
// //   SafeAreaView, 
// //   StatusBar,
// //   Platform,
// //   Animated,
// //   Image
// // } from 'react-native';
// // import * as Location from 'expo-location';
// // import MapView, { Circle, Marker } from 'react-native-maps';
// // import NetInfo from '@react-native-community/netinfo';
// // import { Ionicons } from '@expo/vector-icons';
// // import axios, { AxiosError } from 'axios';

// // // Report type definition
// // interface ReportData {
// //   _id: string;
// //   latitude: number;
// //   longitude: number;
// //   networkType: string;
// //   signalStrength: number;
// //   downloadSpeed?: number;
// //   uploadSpeed?: number;
// //   ping?: number;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // // Speed Test Result interface
// // interface SpeedTestResult {
// //   downloadSpeed: number;
// //   uploadSpeed: number;
// //   ping: number;
// // }

// // // API configuration
// // const API_URL = 'https://signalscape.onrender.com';

// // export default function HomeScreen() {
// //   const [location, setLocation] = useState<Location.LocationObject | null>(null);
// //   const [errorMsg, setErrorMsg] = useState<string | null>(null);
// //   const [connectionStrength, setConnectionStrength] = useState<number>(0);
// //   const [networkType, setNetworkType] = useState<string>('unknown');
// //   const [reportData, setReportData] = useState<ReportData[]>([]);
// //   const [isLoading, setIsLoading] = useState<boolean>(false);
// //   const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResult | null>(null);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [showResults, setShowResults] = useState(false);
// //   const [isFirstLaunch, setIsFirstLaunch] = useState(true);
// //   const [permissionGranted, setPermissionGranted] = useState(false);
// //   const [showSplash, setShowSplash] = useState(true);

// //   // Animation values
// //   const logoOpacity = useRef(new Animated.Value(1)).current;
// //   const logoScale = useRef(new Animated.Value(1)).current;
// //   const mapOpacity = useRef(new Animated.Value(0)).current;
// //   const resultsHeight = useRef(new Animated.Value(0)).current;

// //   // Default location for map if real location is not available yet
// //   const defaultLocation = {
// //     coords: {
// //       latitude: 38.98825,
// //       longitude: -76.94,
// //       accuracy: 10,
// //       altitude: null,
// //       altitudeAccuracy: null,
// //       heading: null,
// //       speed: null,
// //     },
// //     timestamp: Date.now(),
// //   };

// //   // Use real location or default
// //   const displayLocation = location || defaultLocation;

// //   // Get location and connection strength
// //   const getLocationAndConnection = async () => {
// //     console.log("Starting getLocationAndConnection");
// //     setIsLoading(true);
// //     try {
// //       // Check if location permission is already granted
// //       if (!permissionGranted) {
// //         // Get location permission
// //         console.log("Requesting location permissions");
// //         let { status } = await Location.requestForegroundPermissionsAsync();
// //         console.log("Permission status:", status);
        
// //         if (status !== 'granted') {
// //           setErrorMsg('Permission to access location was denied');
// //           return;
// //         }
// //         setPermissionGranted(true);
// //       }

// //       // Get current location
// //       console.log("Getting current location");
// //       const loc = await Location.getCurrentPositionAsync({});
// //       console.log("Location received:", loc.coords);
// //       setLocation(loc);

// //       // Check network connection
// //       console.log("Checking network connection");
// //       const netInfo = await NetInfo.fetch();
// //       let netType = netInfo.type;
// //       console.log("Network type:", netType);
      
// //       // Run speed test
// //       console.log("Starting speed test");
// //       const speedTest = await performSpeedTest();
// //       console.log("Speed test results:", speedTest);
// //       setSpeedTestResults(speedTest);
      
// //       // Update network type based on speed test results
// //       const updatedNetType = getNetworkTypeFromSpeed(netType, speedTest);
// //       console.log("Updated network type:", updatedNetType);
// //       setNetworkType(updatedNetType);
      
// //       // Calculate signal strength based on speed test and network type
// //       const strength = calculateSignalStrength(updatedNetType, speedTest);
// //       console.log("Calculated signal strength:", strength);
// //       setConnectionStrength(strength);

// //       // Save the report to database
// //       if (loc) {
// //         console.log("Saving report to database");
// //         await saveReport(
// //           loc.coords.latitude, 
// //           loc.coords.longitude, 
// //           updatedNetType, 
// //           strength,
// //           speedTest.downloadSpeed,
// //           speedTest.uploadSpeed,
// //           speedTest.ping
// //         );
// //       }
      
// //       // Refresh reports after submitting a new one
// //       console.log("Fetching updated report data");
// //       fetchReportData();
      
// //       // Show results panel
// //       toggleResultsPanel(true);
// //     } catch (error) {
// //       console.log("Error caught in getLocationAndConnection:", error);
// //       console.error('Error getting location or connection:', error);
// //       setErrorMsg('Error checking connection. Please try again.');
// //     } finally {
// //       console.log("Finished getLocationAndConnection");
// //       setIsLoading(false);
// //     }
// //   };

// //   // Toggle results panel with animation
// //   const toggleResultsPanel = (show: boolean) => {
// //     setShowResults(show);
// //     Animated.timing(resultsHeight, {
// //       toValue: show ? 1 : 0,
// //       duration: 300,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   // Perform a speed test
// //   const performSpeedTest = async (): Promise<SpeedTestResult> => {
// //     try {
// //       const startTime = new Date().getTime();
      
// //       // Test file URLs - adjust size based on your needs
// //       // Small file for ping test (100KB)
// //       const pingTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage100k.php';
// //       // Larger file for download test (10MB)
// //       const downloadTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage10m.php';
      
// //       // Ping test
// //       console.log("Starting ping test");
// //       const pingStartTime = new Date().getTime();
// //       await fetch(pingTestUrl, { method: 'HEAD' });
// //       const pingTime = new Date().getTime() - pingStartTime;
// //       console.log(`Ping: ${pingTime}ms`);
      
// //       // Download speed test
// //       console.log("Starting download test");
// //       const downloadStartTime = new Date().getTime();
// //       const downloadResponse = await fetch(downloadTestUrl);
// //       const downloadBlob = await downloadResponse.blob();
// //       const downloadEndTime = new Date().getTime();
      
// //       // Calculate download speed in Mbps
// //       const downloadTimeSec = (downloadEndTime - downloadStartTime) / 1000;
// //       const fileSizeInBits = downloadBlob.size * 8;
// //       const downloadSpeed = (fileSizeInBits / downloadTimeSec) / 1000000; // Convert to Mbps
// //       console.log(`Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
      
// //       // Upload speed test (simplified simulation)
// //       // In a real implementation, you'd need a server endpoint to receive data
// //       console.log("Simulating upload test");
// //       const sampleData = new Array(1024 * 1024 * 2).fill('X').join(''); // 2MB of dummy data
// //       const blob = new Blob([sampleData], { type: 'text/plain' });
      
// //       const uploadStartTime = new Date().getTime();
// //       // Simulate upload by posting to a test endpoint
// //       try {
// //         await fetch(`${API_URL}/api/test-upload`, {
// //           method: 'POST',
// //           body: blob,
// //         });
// //       } catch (e) {
// //         console.log("Upload test error (expected in simulation):", e);
// //       }
// //       const uploadEndTime = new Date().getTime();
      
// //       // Calculate upload speed (this is just an estimation)
// //       const uploadTimeSec = (uploadEndTime - uploadStartTime) / 1000;
// //       const uploadData = new TextEncoder().encode(sampleData).length * 8;
// //       const uploadSpeed = (uploadData / uploadTimeSec) / 1000000; // Convert to Mbps
// //       console.log(`Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
      
// //       return {
// //         downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
// //         uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
// //         ping: pingTime
// //       };
// //     } catch (error) {
// //       console.error("Speed test error:", error);
// //       // Return default values if test fails
// //       return {
// //         downloadSpeed: 0,
// //         uploadSpeed: 0,
// //         ping: 999
// //       };
// //     }
// //   };

// //   // Determine more specific network type based on speed test results
// //   const getNetworkTypeFromSpeed = (baseNetType: string, speedTest: SpeedTestResult): string => {
// //     if (baseNetType === 'cellular') {
// //       // Classify cellular connection based on speed
// //       if (speedTest.downloadSpeed >= 50) return '5G';
// //       if (speedTest.downloadSpeed >= 20) return '4G/LTE';
// //       if (speedTest.downloadSpeed >= 5) return '3G';
// //       return '2G';
// //     } else if (baseNetType === 'wifi') {
// //       // Classify WiFi connection
// //       if (speedTest.downloadSpeed >= 100) return 'WiFi (High-speed)';
// //       if (speedTest.downloadSpeed >= 25) return 'WiFi (Medium)';
// //       return 'WiFi (Low-speed)';
// //     }
// //     return baseNetType;
// //   };

// //   // Calculate signal strength percentage based on network type and speed
// //   const calculateSignalStrength = (netType: string, speedTest: SpeedTestResult): number => {
// //     let strength = 0;
    
// //     // Factor 1: Download speed relative to maximum expected for network type
// //     let downloadFactor = 0;
// //     if (netType.includes('5G')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 300) * 100);
// //     } else if (netType.includes('4G') || netType.includes('LTE')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 100) * 100);
// //     } else if (netType.includes('3G')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 10) * 100);
// //     } else if (netType.includes('WiFi')) {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 200) * 100);
// //     } else {
// //       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 1) * 100);
// //     }
    
// //     // Factor 2: Upload speed relative to download
// //     const uploadRatio = speedTest.downloadSpeed > 0 ? 
// //       Math.min(1, speedTest.uploadSpeed / speedTest.downloadSpeed) : 0;
// //     const uploadFactor = uploadRatio * 100;
    
// //     // Factor 3: Ping (lower is better)
// //     let pingFactor = 0;
// //     if (speedTest.ping <= 20) pingFactor = 100;
// //     else if (speedTest.ping <= 50) pingFactor = 80;
// //     else if (speedTest.ping <= 100) pingFactor = 60;
// //     else if (speedTest.ping <= 200) pingFactor = 40;
// //     else if (speedTest.ping <= 500) pingFactor = 20;
// //     else pingFactor = 0;
    
// //     // Weight the factors (download is most important, then ping, then upload)
// //     strength = (downloadFactor * 0.6) + (pingFactor * 0.3) + (uploadFactor * 0.1);
    
// //     // Ensure it's within 0-100 range and round to integer
// //     return Math.max(0, Math.min(100, Math.round(strength)));
// //   };

// //   // Save a new signal report to MongoDB
// //   const saveReport = async (
// //     latitude: number, 
// //     longitude: number, 
// //     networkType: string, 
// //     signalStrength: number,
// //     downloadSpeed: number = 0,
// //     uploadSpeed: number = 0,
// //     ping: number = 0
// //   ) => {
// //     console.log("About to save report to:", `${API_URL}/api/report/post`);
// //     console.log("Report data:", { 
// //       latitude, 
// //       longitude, 
// //       networkType, 
// //       signalStrength,
// //       downloadSpeed,
// //       uploadSpeed,
// //       ping 
// //     });
    
// //     try {
// //       const response = await axios.post(`${API_URL}/api/report/post`, {
// //         latitude,
// //         longitude,
// //         networkType,
// //         signalStrength,
// //         downloadSpeed,
// //         uploadSpeed,
// //         ping
// //       });
// //       console.log('Report saved, response:', response.data);
// //       return response.data;
// //     } catch (error) {
// //       console.log('Full error object:', error);
// //       console.error('Error saving report:', error);
// //       Alert.alert('Error', 'Failed to save your signal report. Please try again.');
// //       return null;
// //     }
// //   };

// //   // Fetch report data from MongoDB
// //   const fetchReportData = async () => {
// //     console.log("Starting fetchReportData");
// //     setIsLoading(true);
// //     try {
// //       // Set a longer timeout for slow connections
// //       console.log("Sending GET request to:", `${API_URL}/api/report/get`);
// //       const response = await axios.get(`${API_URL}/api/report/get`, {
// //         timeout: 10000 // 10 seconds
// //       });
// //       console.log("Received report data:", response.data);
// //       setReportData(response.data);
// //     } catch (err: unknown) {
// //       // Type guard for error handling
// //       const error = err as Error | AxiosError;
      
// //       console.log("Error in fetchReportData:", error);
// //       console.error('Error fetching report data:', error);
      
// //       // Check if it's an AxiosError with timeout
// //       if (axios.isAxiosError(error)) {
// //         if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
// //           console.log('Request timed out - network may be slow');
// //         }
// //       }
      
// //       // Fallback to mock data
// //       console.log("Falling back to mock data");
// //       useMockData();
      
// //       Alert.alert(
// //         'Connection Error',
// //         'Could not connect to the database. Using cached data instead.',
// //         [{ text: 'OK' }]
// //       );
// //     } finally {
// //       console.log("Finished fetchReportData");
// //       setIsLoading(false);
// //     }
// //   };

// //   // Fallback to mock data if API connection fails
// //   const useMockData = () => {
// //     const mockData = [
// //       { _id: '3ddda7356de54ae09f7d710d', latitude: 38.98764, longitude: -76.94255, networkType: '5G', signalStrength: 79, createdAt: '2025-04-12T21:27:23.000Z', updatedAt: '2025-04-12T21:27:23.000Z', __v: 0 },
// //       // ... (rest of your mock data)
// //     ];
// //     setReportData(mockData);
// //   };

// //   // Color generation based on signal strength
// //   function getColorFromValue(value: number, darkenFactor: number = 0): string {
// //     const applyDarken = (color: number) => Math.max(0, color - darkenFactor);

// //     if (value <= 10) {
// //       return `rgba(${applyDarken(0)}, ${applyDarken(0)}, ${applyDarken(0)}, 0.9)`;
// //     } else if (value <= 40) {
// //       const red = applyDarken(255);
// //       const green = applyDarken(Math.floor((value - 10) * (255 / 30)));
// //       return `rgba(${red}, ${green}, 0, 0.3)`;
// //     } else if (value <= 70) {
// //       const red = applyDarken(Math.floor(255 - (value - 40) * (255 / 30)));
// //       const green = applyDarken(255);
// //       return `rgba(${red}, ${green}, 0, 0.3)`;
// //     } else {
// //       return `rgba(${applyDarken(0)}, ${applyDarken(255)}, ${applyDarken(0)}, 0.3)`;
// //     }
// //   }

// //   // Format speeds for display
// //   const formatSpeed = (speed: number): string => {
// //     if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
// //     return `${speed.toFixed(1)} Mbps`;
// //   };

// //   // Initial data fetch on component mount and splash animation
// //   useEffect(() => {
// //     console.log("Component mounted, fetching initial data");
// //     fetchReportData();
    
// //     // Check if location permissions are already granted
// //     (async () => {
// //       const { status } = await Location.getForegroundPermissionsAsync();
// //       if (status === 'granted') {
// //         setPermissionGranted(true);
// //         const loc = await Location.getCurrentPositionAsync({});
// //         setLocation(loc);
// //       }
// //     })();
    
// //     // Splash screen animation
// //     setTimeout(() => {
// //       Animated.parallel([
// //         Animated.timing(logoOpacity, {
// //           toValue: 0,
// //           duration: 800,
// //           useNativeDriver: true,
// //         }),
// //         Animated.timing(logoScale, {
// //           toValue: 1.5,
// //           duration: 800,
// //           useNativeDriver: true,
// //         }),
// //         Animated.timing(mapOpacity, {
// //           toValue: 1,
// //           duration: 800,
// //           useNativeDriver: true,
// //         })
// //       ]).start(() => {
// //         setShowSplash(false);
// //         setIsFirstLaunch(false);
// //       });
// //     }, 2000);
// //   }, []);

// //   // If on first launch and no permission yet, show the permission request
// //   const renderPermissionRequest = () => {
// //     if (!showSplash && isFirstLaunch && !permissionGranted) {
// //       return (
// //         <View style={styles.permissionOverlay}>
// //           <View style={styles.permissionBox}>
// //             <Text style={styles.permissionTitle}>Enable Location</Text>
// //             <Text style={styles.permissionText}>
// //               SignalScape needs access to your location to map signal quality in your area.
// //             </Text>
// //             <TouchableOpacity 
// //               style={styles.permissionButton}
// //               onPress={getLocationAndConnection}
// //             >
// //               <Text style={styles.permissionButtonText}>Grant Permission</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       );
// //     }
// //     return null;
// //   };

// //   // Render splash screen
// //   const renderSplash = () => {
// //     if (showSplash) {
// //       return (
// //         <Animated.View style={[styles.splashScreen, { opacity: logoOpacity }]}>
// //           <Animated.View style={{ transform: [{ scale: logoScale }] }}>
// //             <Text style={styles.splashLogo}>📡 SignalScape</Text>
// //           </Animated.View>
// //         </Animated.View>
// //       );
// //     }
// //     return null;
// //   };

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       {/* Splash screen */}
// //       {renderSplash()}
      
// //       {/* Main App UI */}
// //       <Animated.View style={[styles.mainContainer, { opacity: mapOpacity }]}>
// //         {/* Map as the main background */}
// //         <View style={styles.mapWrapper}>
// //           <MapView
// //             style={styles.map}
// //             initialRegion={{
// //               latitude: displayLocation.coords.latitude,
// //               longitude: displayLocation.coords.longitude,
// //               latitudeDelta: 0.1,
// //               longitudeDelta: 0.1,
// //             }}
// //             onMapReady={() => setMapReady(true)}
// //           >
// //             {/* Render circles for signal strength data */}
// //             {reportData.map((report) => {
// //               if (
// //                 typeof report.latitude !== 'number' ||
// //                 typeof report.longitude !== 'number' ||
// //                 isNaN(report.latitude) ||
// //                 isNaN(report.longitude)
// //               ) {
// //                 return null;
// //               }

// //               return (
// //                 <Circle
// //                   key={report._id}
// //                   center={{
// //                     latitude: report.latitude,
// //                     longitude: report.longitude,
// //                   }}
// //                   radius={20} // Bigger circles like Life360
// //                   fillColor={getColorFromValue(report.signalStrength, 0.3)}
// //                   strokeColor={getColorFromValue(report.signalStrength, 0.8)}
// //                 />
// //               );
// //             })}
            
// //             {/* Current location marker */}
// //             {location && (
// //               <Marker
// //                 coordinate={{
// //                   latitude: location.coords.latitude,
// //                   longitude: location.coords.longitude,
// //                 }}
// //                 title="Your Location"
// //                 description={connectionStrength > 0 ? 
// //                   `Network: ${networkType}, Signal: ${connectionStrength}%` : 
// //                   "No connection data"
// //                 }
// //               >
// //                 <View style={styles.markerContainer}>
// //                   <View style={styles.marker}>
// //                     <Text style={styles.markerText}>📡</Text>
// //                   </View>
// //                   {connectionStrength > 0 && (
// //                     <View style={[
// //                       styles.signalIndicator, 
// //                       {backgroundColor: connectionStrength > 50 ? '#4CAF50' : '#FFC107'}
// //                     ]} />
// //                   )}
// //                 </View>
// //               </Marker>
// //             )}
// //           </MapView>
          
// //           {/* Header overlay */}
// //           <View style={styles.headerOverlay}>
// //             <Text style={styles.headerTitle}>SignalScape</Text>
// //           </View>
          
// //           {/* Check Connection Button - Floating on Map */}
// //           <TouchableOpacity 
// //             style={styles.checkButton}
// //             onPress={getLocationAndConnection}
// //             disabled={isLoading}
// //           >
// //             <View style={styles.checkButtonInner}>
// //               <Ionicons name="cellular-outline" size={24} color="white" />
// //               <Text style={styles.checkButtonText}>
// //                 {isLoading ? "Testing..." : "Check Connection"}
// //               </Text>
// //             </View>
// //           </TouchableOpacity>
          
// //           {/* Signal Legend - small overlay at bottom */}
// //           <View style={styles.legendOverlay}>
// //             <View style={styles.legendItems}>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: getColorFromValue(5) }]} />
// //                 <Text style={styles.legendText}>Poor</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: getColorFromValue(35) }]} />
// //                 <Text style={styles.legendText}>Fair</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: getColorFromValue(65) }]} />
// //                 <Text style={styles.legendText}>Good</Text>
// //               </View>
// //               <View style={styles.legendItem}>
// //                 <View style={[styles.legendColor, { backgroundColor: getColorFromValue(90) }]} />
// //                 <Text style={styles.legendText}>Excellent</Text>
// //               </View>
// //             </View>
// //           </View>
          
// //           {/* Results Panel - Slide up from bottom */}
// //           <Animated.View 
// //             style={[
// //               styles.resultsPanel,
// //               {
// //                 height: resultsHeight.interpolate({
// //                   inputRange: [0, 1],
// //                   outputRange: ['0%', '45%']
// //                 })
// //               }
// //             ]}
// //           >
// //             {/* Handle for dragging */}
// //             <View style={styles.panelHandle} />
            
// //             {/* Panel Content */}
// //             {speedTestResults && (
// //               <View style={styles.panelContent}>
// //                 <Text style={styles.panelTitle}>Network Analysis</Text>
                
// //                 <View style={styles.networkInfo}>
// //                   <View style={styles.networkTypeContainer}>
// //                     <Text style={styles.networkTypeLabel}>Network</Text>
// //                     <Text style={styles.networkTypeValue}>{networkType}</Text>
// //                   </View>
                  
// //                   <View style={styles.signalContainer}>
// //                     <Text style={styles.signalLabel}>Signal</Text>
// //                     <View style={styles.signalBarContainer}>
// //                       <View 
// //                         style={[
// //                           styles.signalBar, 
// //                           {
// //                             width: `${connectionStrength}%`,
// //                             backgroundColor: 
// //                               connectionStrength > 70 ? '#4CAF50' :
// //                               connectionStrength > 40 ? '#FFC107' : '#F44336'
// //                           }
// //                         ]} 
// //                       />
// //                     </View>
// //                     <Text style={styles.signalValue}>{connectionStrength}%</Text>
// //                   </View>
// //                 </View>
                
// //                 <View style={styles.speedContainer}>
// //                   <View style={styles.speedItem}>
// //                     <Text style={styles.speedLabel}>Download</Text>
// //                     <Text style={styles.speedValue}>{formatSpeed(speedTestResults.downloadSpeed)}</Text>
// //                   </View>
                  
// //                   <View style={styles.speedItem}>
// //                     <Text style={styles.speedLabel}>Upload</Text>
// //                     <Text style={styles.speedValue}>{formatSpeed(speedTestResults.uploadSpeed)}</Text>
// //                   </View>
                  
// //                   <View style={styles.speedItem}>
// //                     <Text style={styles.speedLabel}>Ping</Text>
// //                     <Text style={styles.speedValue}>{speedTestResults.ping} ms</Text>
// //                   </View>
// //                 </View>
                
// //                 <TouchableOpacity
// //                   style={styles.closeButton}
// //                   onPress={() => toggleResultsPanel(false)}
// //                 >
// //                   <Text style={styles.closeButtonText}>Close</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             )}
// //           </Animated.View>
// //         </View>
// //       </Animated.View>
      
// //       {/* Permission request overlay */}
// //       {renderPermissionRequest()}
// //     </SafeAreaView>
// //   );
// // }

// // // OLD STYLES
// // const styles = StyleSheet.create({
// //   safeArea: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
// //   },
// //   // Splash Screen
// //   splashScreen: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#ffffff',
// //     zIndex: 10,
// //   },
// //   splashLogo: {
// //     fontSize: 36,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   // Main Container
// //   mainContainer: {
// //     flex: 1,
// //   },
// //   mapWrapper: {
// //     flex: 1,
// //     position: 'relative',
// //   },
// //   map: {
// //     ...StyleSheet.absoluteFillObject,
// //   },
// //   // Header
// //   headerOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     padding: 15,
// //     zIndex: 1,
// //     alignItems: 'center',
// //     borderBottomWidth: 1,
// //     borderBottomColor: 'rgba(0,0,0,0.1)',
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   // Check Connection Button
// //   checkButton: {
// //     position: 'absolute',
// //     top: 80,
// //     alignSelf: 'center',
// //     backgroundColor: '#4285F4',
// //     borderRadius: 24,
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     elevation: 4,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //     zIndex: 2,
// //   },
// //   checkButtonInner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   checkButtonText: {
// //     color: 'white',
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginLeft: 8,
// //   },
// //   // Legend
// //   legendOverlay: {
// //     position: 'absolute',
// //     bottom: 110,
// //     left: 10,
// //     right: 10,
// //     backgroundColor: 'rgba(255, 255, 255, 0.8)',
// //     borderRadius: 8,
// //     padding: 8,
// //     zIndex: 1,
// //   },
// //   legendItems: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //   },
// //   legendItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   legendColor: {
// //     width: 12,
// //     height: 12,
// //     borderRadius: 6,
// //     marginRight: 4,
// //   },
// //   legendText: {
// //     fontSize: 12,
// //   },
// //   // Results Panel
// //   resultsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: 'white',
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     overflow: 'hidden',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: -2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 3,
// //     elevation: 5,
// //     zIndex: 3,
// //   },
// //   panelHandle: {
// //     width: 40,
// //     height: 5,
// //     backgroundColor: '#e0e0e0',
// //     borderRadius: 3,
// //     alignSelf: 'center',
// //     marginVertical: 10,
// //   },
// //   panelContent: {
// //     flex: 1,
// //     padding: 15,
// //   },
// //   panelTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     marginBottom: 15,
// //     color: '#2c3e50',
// //   },
// //   networkInfo: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   networkTypeContainer: {
// //     flex: 1,
// //   },
// //   networkTypeLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   networkTypeValue: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   signalContainer: {
// //     flex: 2,
// //   },
// //   signalLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   signalBarContainer: {
// //     height: 8,
// //     backgroundColor: '#e0e0e0',
// //     borderRadius: 4,
// //     marginTop: 4,
// //     overflow: 'hidden',
// //   },
// //   signalBar: {
// //     height: '100%',
// //   },
// //   signalValue: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //     marginTop: 2,
// //   },
// //   speedContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 15,
// //   },
// //   speedItem: {
// //     flex: 1,
// //     alignItems: 'center',
// //   },
// //   speedLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   speedValue: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //   },
// //   closeButton: {
// //     backgroundColor: '#f0f0f0',
// //     padding: 10,
// //     borderRadius: 8,
// //     alignItems: 'center',
// //     marginTop: 10,
// //   },
// //   closeButtonText: {
// //     color: '#2c3e50',
// //     fontWeight: '600',
// //   },
// //   // Permission request
// //   permissionOverlay: {
// //     ...StyleSheet.absoluteFillObject,
// //     backgroundColor: 'rgba(255, 255, 255, 0.95)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 5,
// //   },
// //   permissionBox: {
// //     width: '80%',
// //     backgroundColor: 'white',
// //     borderRadius: 16,
// //     padding: 20,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   permissionTitle: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     marginBottom: 15,
// //     color: '#2c3e50',
// //   },
// //   permissionText: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     marginBottom: 20,
// //     color: '#555',
// //   },
// //   permissionButton: {
// //     backgroundColor: '#4285F4',
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 24,
// //   },
// //   permissionButtonText: {
// //     color: 'white',
// //     fontSize: 16,
// //     fontWeight: '600',
// //   },
// //   // Custom marker
// //   markerContainer: {
// //     alignItems: 'center',
// //   },
// //   marker: {
// //     backgroundColor: 'white',
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     borderWidth: 3,
// //     borderColor: '#4285F4',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 2,
// //     elevation: 5,
// //   },
// //   markerText: {
// //     fontSize: 20,
// //   },
// //   signalIndicator: {
// //     position: 'absolute',
// //     top: -5,
// //     right: -5,
// //     width: 15,
// //     height: 15,
// //     borderRadius: 7.5,
// //     borderWidth: 2,
// //     borderColor: 'white',
// //   },
// // });

// // NEWEST
// import { useEffect, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Dimensions, 
//   TouchableOpacity, 
//   Alert, 
//   SafeAreaView, 
//   StatusBar,
//   Platform,
//   Animated,
//   Image,
//   useColorScheme
// } from 'react-native';
// import * as Location from 'expo-location';
// import MapView, { Circle, Marker } from 'react-native-maps';
// import NetInfo from '@react-native-community/netinfo';
// import { Ionicons } from '@expo/vector-icons';
// import axios, { AxiosError } from 'axios';

// // Report type definition
// interface ReportData {
//   _id: string;
//   latitude: number;
//   longitude: number;
//   networkType: string;
//   signalStrength: number;
//   downloadSpeed?: number;
//   uploadSpeed?: number;
//   ping?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// // Speed Test Result interface
// interface SpeedTestResult {
//   downloadSpeed: number;
//   uploadSpeed: number;
//   ping: number;
// }

// // API configuration
// const API_URL = 'https://signalscape.onrender.com';

// // Brand color constants
// const BRAND_COLORS = {
//   primary: '#008b8e',
//   poor: '#c33813',
//   fair: '#fff624',
//   good: '#9df37d',
//   excellent: '#15752a',
//   white: '#ffffff',
//   black: '#2c3e50',
//   grey: '#e0e0e0',
//   lightGrey: '#f8f8f8',
//   darkGrey: '#333333',
//   light: 'rgba(255, 255, 255, 0.8)',
//   darkLight: 'rgba(50, 50, 50, 0.8)',
//   button: '#008b8e',
//   text: '#2c3e50',
//   darkText: '#ffffff',
// };

// export default function HomeScreen() {
//   const colorScheme = useColorScheme();
//   const isDarkMode = colorScheme === 'dark';
  
//   const [location, setLocation] = useState<Location.LocationObject | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [connectionStrength, setConnectionStrength] = useState<number>(0);
//   const [networkType, setNetworkType] = useState<string>('unknown');
//   const [reportData, setReportData] = useState<ReportData[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [speedTestResults, setSpeedTestResults] = useState<SpeedTestResult | null>(null);
//   const [mapReady, setMapReady] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const [isFirstLaunch, setIsFirstLaunch] = useState(true);
//   const [permissionGranted, setPermissionGranted] = useState(false);
//   const [showSplash, setShowSplash] = useState(true);
//   const [showLegend, setShowLegend] = useState(false);
//   const [filter5G, setFilter5G] = useState(false); // New filter state for 5G

//   // Animation values
//   const logoOpacity = useRef(new Animated.Value(1)).current;
//   const mapOpacity = useRef(new Animated.Value(0)).current;
//   const resultsHeight = useRef(new Animated.Value(0)).current;
//   const legendHeight = useRef(new Animated.Value(0)).current;

//   // Map reference
//   const mapRef = useRef<MapView>(null);

//   // Theme-aware colors
//   const themeColors = {
//     background: isDarkMode ? BRAND_COLORS.black : BRAND_COLORS.white,
//     text: isDarkMode ? BRAND_COLORS.darkText : BRAND_COLORS.text,
//     headerBackground: isDarkMode ? BRAND_COLORS.darkLight : BRAND_COLORS.light,
//     panelBackground: isDarkMode ? BRAND_COLORS.darkGrey : BRAND_COLORS.white,
//     statusBarStyle: isDarkMode ? 'light-content' : 'dark-content' as 'light-content' | 'dark-content',
//   };

//   // Default location for map if real location is not available yet
//   const defaultLocation = {
//     coords: {
//       latitude: 38.98825,
//       longitude: -76.94,
//       accuracy: 10,
//       altitude: null,
//       altitudeAccuracy: null,
//       heading: null,
//       speed: null,
//     },
//     timestamp: Date.now(),
//   };

//   // Use real location or default
//   const displayLocation = location || defaultLocation;

//   // Calculate the zoom level based on location
//   const getZoomLevel = () => {
//     return {
//       latitude: displayLocation.coords.latitude,
//       longitude: displayLocation.coords.longitude,
//       latitudeDelta: 0.05, // More zoomed in (smaller value)
//       longitudeDelta: 0.05, // More zoomed in (smaller value)
//     };
//   };

//   // Get location and connection strength
//   const getLocationAndConnection = async () => {
//     console.log("Starting getLocationAndConnection");
//     setIsLoading(true);
//     try {
//       // Check if location permission is already granted
//       if (!permissionGranted) {
//         // Get location permission
//         console.log("Requesting location permissions");
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         console.log("Permission status:", status);
        
//         if (status !== 'granted') {
//           setErrorMsg('Permission to access location was denied');
//           return;
//         }
//         setPermissionGranted(true);
//       }

//       // Get current location
//       console.log("Getting current location");
//       const loc = await Location.getCurrentPositionAsync({});
//       console.log("Location received:", loc.coords);
//       setLocation(loc);

//       // Zoom to user location
//       if (mapRef.current) {
//         mapRef.current.animateToRegion({
//           latitude: loc.coords.latitude,
//           longitude: loc.coords.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }, 1000);
//       }

//       // Check network connection
//       console.log("Checking network connection");
//       const netInfo = await NetInfo.fetch();
//       let netType = netInfo.type;
//       console.log("Network type:", netType);
      
//       // Run speed test
//       console.log("Starting speed test");
//       const speedTest = await performSpeedTest();
//       console.log("Speed test results:", speedTest);
//       setSpeedTestResults(speedTest);
      
//       // Update network type based on speed test results
//       const updatedNetType = getNetworkTypeFromSpeed(netType, speedTest);
//       console.log("Updated network type:", updatedNetType);
//       setNetworkType(updatedNetType);
      
//       // Calculate signal strength based on speed test and network type
//       const strength = calculateSignalStrength(updatedNetType, speedTest);
//       console.log("Calculated signal strength:", strength);
//       setConnectionStrength(strength);

//       // Save the report to database
//       if (loc) {
//         console.log("Saving report to database");
//         await saveReport(
//           loc.coords.latitude, 
//           loc.coords.longitude, 
//           updatedNetType, 
//           strength,
//           speedTest.downloadSpeed,
//           speedTest.uploadSpeed,
//           speedTest.ping
//         );
//       }
      
//       // Refresh reports after submitting a new one
//       console.log("Fetching updated report data");
//       fetchReportData();
      
//       // Show results panel
//       toggleResultsPanel(true);
//     } catch (error) {
//       console.log("Error caught in getLocationAndConnection:", error);
//       console.error('Error getting location or connection:', error);
//       setErrorMsg('Error checking connection. Please try again.');
//     } finally {
//       console.log("Finished getLocationAndConnection");
//       setIsLoading(false);
//     }
//   };

//   // Toggle results panel with animation
//   const toggleResultsPanel = (show: boolean) => {
//     setShowResults(show);
//     Animated.timing(resultsHeight, {
//       toValue: show ? 1 : 0,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };
  
//   // Toggle legend panel with animation
//   const toggleLegend = () => {
//     setShowLegend(!showLegend);
//     Animated.timing(legendHeight, {
//       toValue: showLegend ? 0 : 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   // Toggle 5G filter
//   const toggle5GFilter = () => {
//     setFilter5G(!filter5G);
//   };

//   // Perform a speed test
//   const performSpeedTest = async (): Promise<SpeedTestResult> => {
//     try {
//       const startTime = new Date().getTime();
      
//       // Test file URLs - adjust size based on your needs
//       // Small file for ping test (100KB)
//       const pingTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage100k.php';
//       // Larger file for download test (10MB)
//       const downloadTestUrl = 'https://raw.githubusercontent.com/librespeed/speedtest/master/garbage10m.php';
      
//       // Ping test
//       console.log("Starting ping test");
//       const pingStartTime = new Date().getTime();
//       await fetch(pingTestUrl, { method: 'HEAD' });
//       const pingTime = new Date().getTime() - pingStartTime;
//       console.log(`Ping: ${pingTime}ms`);
      
//       // Download speed test
//       console.log("Starting download test");
//       const downloadStartTime = new Date().getTime();
//       const downloadResponse = await fetch(downloadTestUrl);
//       const downloadBlob = await downloadResponse.blob();
//       const downloadEndTime = new Date().getTime();
      
//       // Calculate download speed in Mbps
//       const downloadTimeSec = (downloadEndTime - downloadStartTime) / 1000;
//       const fileSizeInBits = downloadBlob.size * 8;
//       const downloadSpeed = (fileSizeInBits / downloadTimeSec) / 1000000; // Convert to Mbps
//       console.log(`Download speed: ${downloadSpeed.toFixed(2)} Mbps`);
      
//       // Upload speed test (simplified simulation)
//       // In a real implementation, you'd need a server endpoint to receive data
//       console.log("Simulating upload test");
//       const sampleData = new Array(1024 * 1024 * 2).fill('X').join(''); // 2MB of dummy data
//       const blob = new Blob([sampleData], { type: 'text/plain' });
      
//       const uploadStartTime = new Date().getTime();
//       // Simulate upload by posting to a test endpoint
//       try {
//         await fetch(`${API_URL}/api/test-upload`, {
//           method: 'POST',
//           body: blob,
//         });
//       } catch (e) {
//         console.log("Upload test error (expected in simulation):", e);
//       }
//       const uploadEndTime = new Date().getTime();
      
//       // Calculate upload speed (this is just an estimation)
//       const uploadTimeSec = (uploadEndTime - uploadStartTime) / 1000;
//       const uploadData = new TextEncoder().encode(sampleData).length * 8;
//       const uploadSpeed = (uploadData / uploadTimeSec) / 1000000; // Convert to Mbps
//       console.log(`Upload speed: ${uploadSpeed.toFixed(2)} Mbps`);
      
//       return {
//         downloadSpeed: parseFloat(downloadSpeed.toFixed(2)),
//         uploadSpeed: parseFloat(uploadSpeed.toFixed(2)),
//         ping: pingTime
//       };
//     } catch (error) {
//       console.error("Speed test error:", error);
//       // Return default values if test fails
//       return {
//         downloadSpeed: 0,
//         uploadSpeed: 0,
//         ping: 999
//       };
//     }
//   };

//   // Determine more specific network type based on speed test results
//   const getNetworkTypeFromSpeed = (baseNetType: string, speedTest: SpeedTestResult): string => {
//     if (baseNetType === 'cellular') {
//       // Classify cellular connection based on speed
//       if (speedTest.downloadSpeed >= 50) return '5G';
//       if (speedTest.downloadSpeed >= 20) return '4G/LTE';
//       if (speedTest.downloadSpeed >= 5) return '3G';
//       return '2G';
//     } else if (baseNetType === 'wifi') {
//       // Classify WiFi connection
//       if (speedTest.downloadSpeed >= 100) return 'WiFi (High-speed)';
//       if (speedTest.downloadSpeed >= 25) return 'WiFi (Medium)';
//       return 'WiFi (Low-speed)';
//     }
//     return baseNetType;
//   };

//   // Calculate signal strength percentage based on network type and speed
//   const calculateSignalStrength = (netType: string, speedTest: SpeedTestResult): number => {
//     let strength = 0;
    
//     // Factor 1: Download speed relative to maximum expected for network type
//     let downloadFactor = 0;
//     if (netType.includes('5G')) {
//       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 300) * 100);
//     } else if (netType.includes('4G') || netType.includes('LTE')) {
//       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 100) * 100);
//     } else if (netType.includes('3G')) {
//       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 10) * 100);
//     } else if (netType.includes('WiFi')) {
//       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 200) * 100);
//     } else {
//       downloadFactor = Math.min(100, (speedTest.downloadSpeed / 1) * 100);
//     }
    
//     // Factor 2: Upload speed relative to download
//     const uploadRatio = speedTest.downloadSpeed > 0 ? 
//       Math.min(1, speedTest.uploadSpeed / speedTest.downloadSpeed) : 0;
//     const uploadFactor = uploadRatio * 100;
    
//     // Factor 3: Ping (lower is better)
//     let pingFactor = 0;
//     if (speedTest.ping <= 20) pingFactor = 100;
//     else if (speedTest.ping <= 50) pingFactor = 80;
//     else if (speedTest.ping <= 100) pingFactor = 60;
//     else if (speedTest.ping <= 200) pingFactor = 40;
//     else if (speedTest.ping <= 500) pingFactor = 20;
//     else pingFactor = 0;
    
//     // Weight the factors (download is most important, then ping, then upload)
//     strength = (downloadFactor * 0.6) + (pingFactor * 0.3) + (uploadFactor * 0.1);
    
//     // Ensure it's within 0-100 range and round to integer
//     return Math.max(0, Math.min(100, Math.round(strength)));
//   };

//   // Save a new signal report to MongoDB
//   const saveReport = async (
//     latitude: number, 
//     longitude: number, 
//     networkType: string, 
//     signalStrength: number,
//     downloadSpeed: number = 0,
//     uploadSpeed: number = 0,
//     ping: number = 0
//   ) => {
//     console.log("About to save report to:", `${API_URL}/api/report/post`);
//     console.log("Report data:", { 
//       latitude, 
//       longitude, 
//       networkType, 
//       signalStrength,
//       downloadSpeed,
//       uploadSpeed,
//       ping 
//     });
    
//     try {
//       const response = await axios.post(`${API_URL}/api/report/post`, {
//         latitude,
//         longitude,
//         networkType,
//         signalStrength,
//         downloadSpeed,
//         uploadSpeed,
//         ping
//       });
//       console.log('Report saved, response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('Full error object:', error);
//       console.error('Error saving report:', error);
//       Alert.alert('Error', 'Failed to save your signal report. Please try again.');
//       return null;
//     }
//   };

//   // Fetch report data from MongoDB
//   const fetchReportData = async () => {
//     console.log("Starting fetchReportData");
//     setIsLoading(true);
//     try {
//       // Set a longer timeout for slow connections
//       console.log("Sending GET request to:", `${API_URL}/api/report/get`);
//       const response = await axios.get(`${API_URL}/api/report/get`, {
//         timeout: 10000 // 10 seconds
//       });
//       console.log("Received report data:", response.data);
//       setReportData(response.data);
//     } catch (err: unknown) {
//       // Type guard for error handling
//       const error = err as Error | AxiosError;
      
//       console.log("Error in fetchReportData:", error);
//       console.error('Error fetching report data:', error);
      
//       // Check if it's an AxiosError with timeout
//       if (axios.isAxiosError(error)) {
//         if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//           console.log('Request timed out - network may be slow');
//         }
//       }
      
//       // Fallback to mock data
//       console.log("Falling back to mock data");
//       useMockData();
      
//       Alert.alert(
//         'Connection Error',
//         'Could not connect to the database. Using cached data instead.',
//         [{ text: 'OK' }]
//       );
//     } finally {
//       console.log("Finished fetchReportData");
//       setIsLoading(false);
//     }
//   };

//   // Fallback to mock data if API connection fails
//   const useMockData = () => {
//     const mockData = [
//       { _id: '3ddda7356de54ae09f7d710d', latitude: 38.98764, longitude: -76.94255, networkType: '5G', signalStrength: 79, createdAt: '2025-04-12T21:27:23.000Z', updatedAt: '2025-04-12T21:27:23.000Z', __v: 0 },
//       // ... (rest of your mock data)
//     ];
//     setReportData(mockData);
//   };

//   // Color generation based on signal strength with gradient effect
//   function getColorFromValue(value: number, opacity: number = 0.6): string {
//     // Define base colors for different strength ranges
//     const poorColor = BRAND_COLORS.poor;
//     const fairColor = BRAND_COLORS.fair;
//     const goodColor = BRAND_COLORS.good;
//     const excellentColor = BRAND_COLORS.excellent;
    
//     // Convert hex to rgba to allow transparency
//     const hexToRgba = (hex: string, alpha: number) => {
//       const r = parseInt(hex.slice(1, 3), 16);
//       const g = parseInt(hex.slice(3, 5), 16);
//       const b = parseInt(hex.slice(5, 7), 16);
//       return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//     };
    
//     if (value <= 25) {
//       // Poor range (0-25%)
//       return hexToRgba(poorColor, opacity);
//     } else if (value <= 50) {
//       // Fair range (26-50%)
//       return hexToRgba(fairColor, opacity);
//     } else if (value <= 75) {
//       // Good range (51-75%)
//       return hexToRgba(goodColor, opacity);
//     } else {
//       // Excellent range (76-100%)
//       return hexToRgba(excellentColor, opacity);
//     }
//   }

//   // Format speeds for display
//   const formatSpeed = (speed: number): string => {
//     if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
//     return `${speed.toFixed(1)} Mbps`;
//   };

//   // Run splash screen animation - UPDATED to use provided image and simple fade
//   const runSplashAnimation = () => {
//     // Simply fade out splash screen and fade in map
//     Animated.parallel([
//       Animated.timing(logoOpacity, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(mapOpacity, {
//         toValue: 1, 
//         duration: 800,
//         useNativeDriver: true,
//       })
//     ]).start(() => {
//       setShowSplash(false);
//       setIsFirstLaunch(false);
//     });
//   };

//   // Initial data fetch on component mount and splash animation
//   useEffect(() => {
//     console.log("Component mounted, fetching initial data");
//     fetchReportData();
    
//     // Check if location permissions are already granted
//     (async () => {
//       const { status } = await Location.getForegroundPermissionsAsync();
//       if (status === 'granted') {
//         setPermissionGranted(true);
//         const loc = await Location.getCurrentPositionAsync({});
//         setLocation(loc);
//       }
//     })();
    
//     // Run splash screen animation after a short delay
//     setTimeout(() => {
//       runSplashAnimation();
//     }, 1000);
//   }, []);

//   // Filter the report data based on 5G toggle
//   const filteredReportData = reportData.filter((report) => {
//     if (filter5G) {
//       return report.networkType === '5G'; // Show only 5G
//     } else {
//       return report.networkType !== '5G'; // Show everything except 5G
//     }
//   });

//   // If on first launch and no permission yet, show the permission request
//   const renderPermissionRequest = () => {
//     if (!showSplash && isFirstLaunch && !permissionGranted) {
//       return (
//         <View style={styles.permissionOverlay}>
//           <View style={[styles.permissionBox, {backgroundColor: themeColors.panelBackground}]}>
//             <Text style={[styles.permissionTitle, {color: themeColors.text}]}>Enable Location</Text>
//             <Text style={[styles.permissionText, {color: themeColors.text}]}>
//               SignalScape needs access to your location to map signal quality in your area.
//             </Text>
//             <TouchableOpacity 
//               style={styles.permissionButton}
//               onPress={getLocationAndConnection}
//             >
//               <Text style={styles.permissionButtonText}>Grant Permission</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }
//     return null;
//   };

//   // Render splash screen - UPDATED to use the provided logo image
//   const renderSplash = () => {
//     if (showSplash) {
//       return (
//         <Animated.View style={[styles.splashScreen, { opacity: logoOpacity }]}>
//           <View style={styles.logoContainer}>
//             <Image 
//               source={require('./barnone-logo.png')} 
//               style={styles.splashLogoImage}
//               resizeMode="contain"
//             />
//           </View>
//         </Animated.View>
//       );
//     }
//     return null;
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, {backgroundColor: themeColors.background}]}>
//       <StatusBar barStyle={themeColors.statusBarStyle} />
      
//       {/* Splash screen */}
//       {renderSplash()}
      
//       {/* Main App UI */}
//       <Animated.View style={[styles.mainContainer, { opacity: mapOpacity }]}>
//         {/* Map as the main background */}
//         <View style={styles.mapWrapper}>
//           <MapView
//             ref={mapRef}
//             style={styles.map}
//             initialRegion={getZoomLevel()}
//             onMapReady={() => setMapReady(true)}
//           >
//             {/* Render circles for signal strength data */}
//             {filteredReportData.map((report) => {
//               if (
//                 typeof report.latitude !== 'number' ||
//                 typeof report.longitude !== 'number' ||
//                 isNaN(report.latitude) ||
//                 isNaN(report.longitude)
//               ) {
//                 return null;
//               }

//               return (
//                 <Circle
//                   key={report._id}
//                   center={{
//                     latitude: report.latitude,
//                     longitude: report.longitude,
//                   }}
//                   radius={20} // Bigger circles like Life360
//                   fillColor={getColorFromValue(report.signalStrength, 0.4)} // More transparent
//                   strokeColor={getColorFromValue(report.signalStrength, 0.6)}
//                 />
//               );
//             })}
            
//             {/* Current location marker */}
//             {location && (
//               <Marker
//                 coordinate={{
//                   latitude: location.coords.latitude,
//                   longitude: location.coords.longitude,
//                 }}
//                 title="Your Location"
//                 description={connectionStrength > 0 ? 
//                   `Network: ${networkType}, Signal: ${connectionStrength}%` : 
//                   "No connection data"
//                 }
//               >
//                 <View style={styles.markerContainer}>
//                   <View style={styles.marker}>
//                     <Text style={styles.markerText}>📡</Text>
//                   </View>
//                   {connectionStrength > 0 && (
//                     <View style={[
//                       styles.signalIndicator, 
//                       {backgroundColor: getColorFromValue(connectionStrength, 1.0)}
//                     ]} />
//                   )}
//                 </View>
//               </Marker>
//             )}
//           </MapView>
          
//           {/* Header overlay */}
//           <View style={[styles.headerOverlay, {backgroundColor: themeColors.headerBackground}]}>
//             <Text style={styles.headerTitle}>BarNone</Text>
//           </View>
          
//           {/* Button container for aligned buttons */}
//           <View style={styles.buttonContainer}>
//             {/* Check Connection Button */}
//             <TouchableOpacity 
//               style={styles.checkButton}
//               onPress={getLocationAndConnection}
//               disabled={isLoading}
//             >
//               <View style={styles.checkButtonInner}>
//                 <Ionicons name="cellular-outline" size={20} color="white" />
//                 <Text style={styles.checkButtonText}>
//                   {isLoading ? "Testing..." : "Check Connection"}
//                 </Text>
//               </View>
//             </TouchableOpacity>
            
//             {/* Legend Button */}
//             <TouchableOpacity 
//               style={styles.legendButton}
//               onPress={toggleLegend}
//             >
//               <Ionicons name="information-circle-outline" size={20} color="white" />
//             </TouchableOpacity>
            
//             {/* Filter Button */}
//             <TouchableOpacity 
//               style={[styles.filterButton, filter5G && styles.filterButtonActive]}
//               onPress={toggle5GFilter}
//             >
//               <Text style={styles.filterButtonText}>
//                 {filter5G ? "5G Only" : "Non-5G"}
//               </Text>
//             </TouchableOpacity>
//           </View>
          
//           {/* Legend Panel - toggled by button */}
//           <Animated.View 
//             style={[
//               styles.legendOverlay,
//               {
//                 backgroundColor: themeColors.panelBackground,
//                 height: legendHeight.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0, 150]
//                 }),
//                 opacity: legendHeight
//               }
//             ]}
//           >
//             <Text style={[styles.legendTitle, {color: themeColors.text}]}>Signal Strength</Text>
//             <View style={styles.legendItems}>
//               <View style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.poor }]} />
//                 <Text style={[styles.legendText, {color: themeColors.text}]}>Poor (0-25%)</Text>
//               </View>
//               <View style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.fair }]} />
//                 <Text style={[styles.legendText, {color: themeColors.text}]}>Fair (26-50%)</Text>
//               </View>
//               <View style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.good }]} />
//                 <Text style={[styles.legendText, {color: themeColors.text}]}>Good (51-75%)</Text>
//               </View>
//               <View style={styles.legendItem}>
//                 <View style={[styles.legendColor, { backgroundColor: BRAND_COLORS.excellent }]} />
//                 <Text style={[styles.legendText, {color: themeColors.text}]}>Excellent (76-100%)</Text>
//               </View>
//             </View>
//           </Animated.View>
          
//           {/* Results Panel - Slide up from bottom */}
//           <Animated.View 
//             style={[
//               styles.resultsPanel,
//               {
//                 backgroundColor: themeColors.panelBackground,
//                 height: resultsHeight.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ['0%', '45%']
//                 })
//               }
//             ]}
//           >
//             {/* Handle for dragging */}
// <View style={styles.panelHandle} />

// {/* Panel Content */}
// {speedTestResults && (
//   <View style={styles.panelContent}>
//     <Text style={[styles.panelTitle, {color: themeColors.text}]}>Network Analysis</Text>
    
//     <View style={styles.networkInfo}>
//       <View style={styles.networkTypeContainer}>
//         <Text style={[styles.networkTypeLabel, {color: themeColors.text}]}>Network</Text>
//         <Text style={styles.networkTypeValue}>{networkType}</Text>
//       </View>
      
//       <View style={styles.signalContainer}>
//         <Text style={[styles.signalLabel, {color: themeColors.text}]}>Signal</Text>
//         <View style={styles.signalBarContainer}>
//           <View 
//             style={[
//               styles.signalBar, 
//               {
//                 width: `${connectionStrength}%`,
//                 backgroundColor: getColorFromValue(connectionStrength, 1.0)
//               }
//             ]} 
//           />
//         </View>
//         <Text style={[styles.signalValue, {color: themeColors.text}]}>{connectionStrength}%</Text>
//       </View>
//     </View>
    
//     <View style={styles.speedContainer}>
//       <View style={styles.speedItem}>
//         <Text style={[styles.speedLabel, {color: themeColors.text}]}>Download</Text>
//         <Text style={styles.speedValue}>{formatSpeed(speedTestResults.downloadSpeed)}</Text>
//       </View>
//       <View style={styles.speedItem}>
//         <Text style={[styles.speedLabel, {color: themeColors.text}]}>Upload</Text>
//         <Text style={styles.speedValue}>{formatSpeed(speedTestResults.uploadSpeed)}</Text>
//       </View>
//       <View style={styles.speedItem}>
//         <Text style={[styles.speedLabel, {color: themeColors.text}]}>Ping</Text>
//         <Text style={styles.speedValue}>{speedTestResults.ping} ms</Text>
//       </View>
//     </View>
    
//     {/* Close button at the bottom of the panel */}
//     <TouchableOpacity 
//       style={styles.closeResultsButton}
//       onPress={() => toggleResultsPanel(false)}
//     >
//       <Text style={styles.closeButtonText}>Close</Text>
//     </TouchableOpacity>
//   </View>
// )}
// </Animated.View>

// {/* Permission request overlay */}
// {renderPermissionRequest()}

// </View>
// </Animated.View>
// </SafeAreaView>
// );
// }

// const { width, height } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: BRAND_COLORS.white,
//   },
//   mainContainer: {
//     flex: 1,
//   },
//   mapWrapper: {
//     flex: 1,
//     position: 'relative',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   headerOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: BRAND_COLORS.primary,
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 25,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   checkButton: {
//     backgroundColor: BRAND_COLORS.primary,
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     flex: 3,
//     marginRight: 10,
//   },
//   checkButtonInner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 10,
//   },
//   legendButton: {
//     backgroundColor: BRAND_COLORS.primary,
//     borderRadius: 25,
//     width: 45,
//     height: 45,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   filterButton: {
//     backgroundColor: BRAND_COLORS.grey,
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     marginLeft: 10,
//     flex: 1,
//   },
//   filterButtonActive: {
//     backgroundColor: BRAND_COLORS.primary,
//   },
//   filterButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   markerContainer: {
//     alignItems: 'center',
//   },
//   marker: {
//     padding: 3,
//     backgroundColor: 'white',
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: BRAND_COLORS.primary,
//   },
//   markerText: {
//     fontSize: 20,
//   },
//   signalIndicator: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginTop: 4,
//     borderWidth: 1,
//     borderColor: 'white',
//   },
//   resultsPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: BRAND_COLORS.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 5,
//     backgroundColor: BRAND_COLORS.grey,
//     borderRadius: 3,
//     alignSelf: 'center',
//     marginBottom: 15,
//   },
//   panelContent: {
//     flex: 1,
//   },
//   panelTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   networkInfo: {
//     marginBottom: 20,
//   },
//   networkTypeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   networkTypeLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   networkTypeValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: BRAND_COLORS.primary,
//   },
//   signalContainer: {
//     marginBottom: 5,
//   },
//   signalLabel: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 8,
//   },
//   signalBarContainer: {
//     height: 15,
//     backgroundColor: BRAND_COLORS.lightGrey,
//     borderRadius: 7.5,
//     overflow: 'hidden',
//     marginBottom: 5,
//   },
//   signalBar: {
//     height: '100%',
//     borderRadius: 7.5,
//   },
//   signalValue: {
//     fontSize: 14,
//     textAlign: 'right',
//   },
//   speedContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   speedItem: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: BRAND_COLORS.lightGrey,
//     borderRadius: 10,
//     marginHorizontal: 5,
//   },
//   speedLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   speedValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: BRAND_COLORS.primary,
//   },
//   legendOverlay: {
//     position: 'absolute',
//     top: 70,
//     right: 20,
//     left: 20,
//     backgroundColor: BRAND_COLORS.white,
//     borderRadius: 15,
//     padding: 15,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     overflow: 'hidden',
//   },
//   legendTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   legendItems: {
//     flexDirection: 'column',
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   legendColor: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     marginRight: 10,
//   },
//   legendText: {
//     fontSize: 14,
//   },
//   permissionOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 20,
//   },
//   permissionBox: {
//     width: '80%',
//     backgroundColor: BRAND_COLORS.white,
//     borderRadius: 15,
//     padding: 20,
//     alignItems: 'center',
//   },
//   permissionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   permissionText: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   permissionButton: {
//     backgroundColor: BRAND_COLORS.primary,
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   permissionButtonText: {
//     color: BRAND_COLORS.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   splashScreen: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: BRAND_COLORS.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 30,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   splashLogoImage: {
//     width: 200,
//     height: 200,
//   },
//   // New style for the close button
//   closeResultsButton: {
//     backgroundColor: BRAND_COLORS.primary,
//     borderRadius: 25,
//     paddingVertical: 10,
//     marginTop: 'auto', // Push to bottom of container
//     alignSelf: 'center', // Center horizontally
//     paddingHorizontal: 30,
//   },
//   closeButtonText: {
//     color: BRAND_COLORS.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });


// // IDK WHAT STYLES NEW AWND OLD
// // const styles = StyleSheet.create({
// //   safeArea: {
// //     flex: 1,
// //     backgroundColor: BRAND_COLORS.white,
// //     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
// //   },
// //   splashScreen: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: BRAND_COLORS.primary,
// //     zIndex: 10,
// //   },
// //   logoContainer: {
// //     alignItems: 'center',
// //   },
// //   splashLogo: {
// //     fontSize: 100,
// //     color: BRAND_COLORS.white,
// //   },
// //   mainContainer: {
// //     flex: 1,
// //   },
// //   mapWrapper: {
// //     flex: 1,
// //     position: 'relative',
// //   },
// //   map: {
// //     ...StyleSheet.absoluteFillObject,
// //   },
// //   headerOverlay: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: BRAND_COLORS.light,
// //     padding: 15,
// //     zIndex: 1,
// //     alignItems: 'center',
// //     borderBottomWidth: 1,
// //     borderBottomColor: 'rgba(0,0,0,0.1)',
// //   },
// //   headerTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.primary,
// //   },
// //   checkButton: {
// //     position: 'absolute',
// //     top: 70,
// //     right: 10,
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 24,
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //     elevation: 4,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //     zIndex: 3,
// //   },
// //   checkButtonInner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   checkButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontSize: 16,
// //     fontWeight: '600',
// //     marginLeft: 8,
// //   },
// //   legendButton: {
// //     position: 'absolute',
// //     top: 71,
// //     right: 347,
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 16,
// //     padding: 9,
// //     zIndex: 3,
// //     elevation: 4,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //   },
// //   legendOverlay: {
// //     position: 'absolute',
// //     top: 130,
// //     left: 20,
// //     backgroundColor: BRAND_COLORS.white,
// //     borderRadius: 12,
// //     padding: 10,
// //     zIndex: 3,
// //     elevation: 4,
// //     width: 200,
// //   },
// //   legendTitle: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 8,
// //   },
// //   legendItems: {
// //     flexDirection: 'column',
// //     justifyContent: 'space-between',
// //   },
// //   legendItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 6,
// //   },
// //   legendColor: {
// //     width: 16,
// //     height: 16,
// //     borderRadius: 4,
// //     marginRight: 6,
// //   },
// //   legendText: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   markerContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   marker: {
// //     backgroundColor: BRAND_COLORS.primary,
// //     padding: 6,
// //     borderRadius: 20,
// //   },
// //   markerText: {
// //     fontSize: 16,
// //     color: BRAND_COLORS.white,
// //   },
// //   signalIndicator: {
// //     width: 10,
// //     height: 10,
// //     borderRadius: 5,
// //     marginTop: 4,
// //   },
// //   resultsPanel: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: BRAND_COLORS.white,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     elevation: 5,
// //     overflow: 'hidden',
// //     minHeight: '45%',
// //   },
// //   panelHandle: {
// //     width: 40,
// //     height: 5,
// //     backgroundColor: BRAND_COLORS.grey,
// //     borderRadius: 2.5,
// //     alignSelf: 'center',
// //     marginVertical: 10,
// //   },
// //   panelContent: {
// //     paddingHorizontal: 20,
// //     flex: 1,
// //   },
// //   panelTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 10,
// //   },
// //   networkInfo: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   networkTypeContainer: {
// //     flex: 1,
// //   },
// //   networkTypeLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   networkTypeValue: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: BRAND_COLORS.primary,
// //   },
// //   signalContainer: {
// //     flex: 1,
// //   },
// //   signalLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   signalBarContainer: {
// //     height: 8,
// //     backgroundColor: BRAND_COLORS.grey,
// //     borderRadius: 4,
// //     marginVertical: 4,
// //     overflow: 'hidden',
// //   },
// //   signalBar: {
// //     height: 8,
// //     borderRadius: 4,
// //   },
// //   signalValue: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   speedContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },
// //   speedItem: {
// //     alignItems: 'center',
// //     flex: 1,
// //   },
// //   speedLabel: {
// //     fontSize: 14,
// //     color: BRAND_COLORS.text,
// //   },
// //   speedValue: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: BRAND_COLORS.primary,
// //   },
// //   closeButton: {
// //     alignSelf: 'center',
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 20,
// //     paddingVertical: 10,
// //     paddingHorizontal: 30,
// //   },
// //   closeButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontWeight: 'bold',
// //   },
// //   permissionOverlay: {
// //     ...StyleSheet.absoluteFillObject,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     zIndex: 20,
// //   },
// //   permissionBox: {
// //     backgroundColor: BRAND_COLORS.white,
// //     padding: 30,
// //     borderRadius: 20,
// //     width: '80%',
// //     alignItems: 'center',
// //   },
// //   permissionTitle: {
// //     fontSize: 22,
// //     fontWeight: 'bold',
// //     color: BRAND_COLORS.primary,
// //     marginBottom: 10,
// //   },
// //   permissionText: {
// //     fontSize: 16,
// //     textAlign: 'center',
// //     color: BRAND_COLORS.text,
// //     marginBottom: 20,
// //   },
// //   permissionButton: {
// //     backgroundColor: BRAND_COLORS.primary,
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //     borderRadius: 10,
// //   },
// //   permissionButtonText: {
// //     color: BRAND_COLORS.white,
// //     fontWeight: 'bold',
// //     fontSize: 16,
// //   },
// //   buttonContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     backgroundColor: 'transparent',
// //   },
// //   filterButton: {
// //     backgroundColor: '#008b8e',
// //     paddingHorizontal: 13,
// //     paddingVertical: 11,
// //     borderRadius: 40,
// //     marginRight: 200,
// //     marginTop: 62,
// //     shadowColor: BRAND_COLORS.black,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 3,
// //   },
// //   filterButtonActive: {
// //     borderColor: '#ffffff',
// //     borderWidth: 1.5,
// //     marginTop: 61,
// //   },
// //   filterButtonText: {
// //     color: 'white',
// //     fontWeight: '600',
// //   },
// //     splashLogoImage: {
// //     width: 200,
// //     height: 200,
// //   },
// //     closeResultsButton: {
// //     backgroundColor: BRAND_COLORS.primary,
// //     borderRadius: 25,
// //     paddingVertical: 10,
// //     marginTop: 10, // Push to bottom of container
// //     alignSelf: 'center', // Center horizontally
// //     paddingHorizontal: 30,
// //   },
// // });



// *(&@(&$@*#&$(@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@)))

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

  const [filter5G, setFilter5G] = useState(false); // New filter state for 5G

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


  // Toggle 5G filter
  const toggle5GFilter = () => {
    setFilter5G(!filter5G);
  };

  // Calculate the zoom level based on location
  const getZoomLevel = () => {
    return {
      latitude: displayLocation.coords.latitude,
      longitude: displayLocation.coords.longitude,
      latitudeDelta: 0.05, // More zoomed in (smaller value)
      longitudeDelta: 0.05, // More zoomed in (smaller value)
    };
  };

    // Filter the report data based on 5G toggle
  const filteredReportData = reportData.filter((report) => {
    if (filter5G) {
      return report.networkType === '5G'; // Show only 5G
    } else {
      return report.networkType !== '5G'; // Show everything except 5G
    }
  });

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
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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

    // Color generation based on signal strength
  function getColorFromValue(value: number, darkenFactor: number = 0): string {
    const applyDarken = (color: number) => Math.max(0, color - darkenFactor);

    if (value <= 40) {
      const red = applyDarken(255);
      const green = applyDarken(Math.floor((value - 10) * (255 / 30)));
      return `rgba(${red}, ${green}, 0, 0.3)`;
    } else if (value <= 70) {
      const red = applyDarken(Math.floor(255 - (value - 40) * (255 / 30)));
      const green = applyDarken(255);
      return `rgba(${red}, ${green}, 0, 0.3)`;
    } else {
      return `rgba(${applyDarken(0)}, ${applyDarken(255)}, ${applyDarken(0)}, 0.3)`;
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
            {filteredReportData.map((report) => {
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
                  fillColor={getColorFromValue(report.signalStrength, 0.4)} // More transparent
                  strokeColor={getColorFromValue(report.signalStrength, 0.6)}
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
                      {backgroundColor: getColorFromValue(connectionStrength, 1.0)}
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

          {/* Filter Button */}
             <TouchableOpacity 
              style={[styles.filterButton, filter5G && styles.filterButtonActive]}
              onPress={toggle5GFilter}
            >
              <Text style={styles.filterButtonText}>
                {filter5G ? "5G Only" : "Non-5G"}
              </Text>
            </TouchableOpacity>
          
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
    top: 76,
    left: 10,
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
  filterButton: {
        position: 'absolute',
        top: 10,
        left: 235,
        backgroundColor: '#008b8e',
        paddingHorizontal: 13,
        paddingVertical: 11,
        borderRadius: 40,
        marginRight: 200,
        marginTop: 72,
        shadowColor: BRAND_COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      filterButtonActive: {
        position: 'absolute',
        top: 19,
        left: 233,
        borderColor: '#ffffff',
        borderWidth: 1.5,
        marginTop: 61,
      },
      filterButtonText: {
        color: 'white',
        fontWeight: '600',
      },
});