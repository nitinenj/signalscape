import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle, Marker, Polyline, Callout } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import { ScrollView } from 'react-native-gesture-handler';
import { LocationAccuracy } from 'expo-location';


export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [networkType, setNetworkType] = useState('unknown');
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [trail, setTrail] = useState([]);
  const [tracking, setTracking] = useState(false);

  const getLocationAndConnection = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const coords = loc.coords;
    setLocation(loc);

    const netInfo = await NetInfo.fetch();
    const strength = netInfo.isConnected ? Math.floor(Math.random() * 70) + 30 : 0;
    setNetworkType(netInfo.type);
    setConnectionStrength(strength);

    const timestamp = new Date().toLocaleTimeString();

    setTrail(prev => [...prev, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      strength,
      timestamp,
    }]);
  };

  const fetchBatteryLevel = async () => {
    const battery = await Battery.getBatteryLevelAsync();
    setBatteryLevel(Math.round(battery * 100));
  };

  useEffect(() => {
    fetchBatteryLevel();
  
    let locationSubscription = null;
  
    if (tracking) {
      const startLiveTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
  
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: LocationAccuracy.High,
            timeInterval: 2000,
            distanceInterval: 1, // meters
          },
          async (loc) => {
            const coords = loc.coords;
            const netInfo = await NetInfo.fetch();
            const strength = netInfo.isConnected ? Math.floor(Math.random() * 70) + 30 : 0;
  
            setLocation(loc);
            setConnectionStrength(strength);
            setNetworkType(netInfo.type);
  
            const timestamp = new Date().toLocaleTimeString();
  
            setTrail(prev => [...prev, {
              latitude: coords.latitude,
              longitude: coords.longitude,
              strength,
              timestamp,
            }]);
          }
        );
      };
  
      startLiveTracking();
    }
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [tracking]);
  
  return (
    <ScrollView
      style={[styles.container, isDark && styles.darkBackground]}
      scrollEnabled={scrollEnabled}
    >
      <TouchableOpacity style={styles.settingsButton} onPress={() => {}}>
        <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : 'black'} />
      </TouchableOpacity>

      <Text style={[styles.title, isDark && styles.darkText]}>📡 SignalScape</Text>

      <Button title="Check My Connection" onPress={getLocationAndConnection} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <Button
          title={tracking ? 'Stop Tracking' : 'Start Tracking'}
          onPress={() => setTracking(prev => !prev)}
          color={tracking ? '#e53935' : '#4caf50'}
        />
        <Button
          title="Clear Trail"
          onPress={() => setTrail([])}
          color="#607d8b"
        />
      </View>

      {location && (
        <>
          <MapView
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
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={connectionStrength * 5}
              fillColor={`rgba(0, ${128 + connectionStrength}, 255, 0.5)`}
              strokeColor="rgba(0, 100, 255, 0.8)"
            />

            {/* Live Location Icon */}
            <Marker coordinate={location.coords}>
              <Ionicons name="navigate" size={28} color="dodgerblue" />
            </Marker>

            {/* Colored Trail */}
            {trail.length >= 2 && trail.map((point, i) => {
              if (i === 0) return null;
              const prev = trail[i - 1];
              const color =
                point.strength >= 70 ? 'green' :
                point.strength >= 40 ? 'orange' : 'red';

              return (
                <Polyline
                  key={`trail-${i}`}
                  coordinates={[
                    { latitude: prev.latitude, longitude: prev.longitude },
                    { latitude: point.latitude, longitude: point.longitude },
                  ]}
                  strokeColor={color}
                  strokeWidth={4}
                />
              );
            })}

            {/* Timestamp Markers */}
            {trail.map((point, i) => (
              <Marker
                key={`marker-${i}`}
                coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                pinColor="transparent"
              >
                <Ionicons name="radio-button-on" size={10} color="gray" />
                <Callout>
                  <Text>📶 {point.strength}%</Text>
                  <Text>🕓 {point.timestamp}</Text>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={22} color="#f44336" />
              <Text style={styles.label}>Location</Text>
            </View>
            <Text style={styles.value}>
              {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
            </Text>

            <View style={[styles.infoRow, { marginTop: 16 }]}>
              <MaterialIcons name="signal-cellular-alt" size={22} color="#ffa000" />
              <Text style={styles.label}>Signal Strength</Text>
            </View>
            <Text style={styles.value}>
              {connectionStrength > 0
                ? `${connectionStrength}% ${networkType} connection`
                : '❌ No connection detected'}
            </Text>
            <ProgressBar
              progress={connectionStrength / 100}
              color="#4caf50"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <MaterialIcons name="devices" size={22} color="#2196f3" />
              <Text style={styles.label}>Device Info</Text>
            </View>
            <Text style={styles.value}>OS: {Platform.OS}</Text>
            <Text style={styles.value}>Model: {Device.modelName}</Text>
            <Text style={styles.value}>Battery: {batteryLevel}%</Text>
          </View>
        </>
      )}

      {errorMsg && <Text style={[styles.error, isDark && styles.darkText]}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingsButton: {
    position: 'absolute',
    top: 47,
    right: 20,
    zIndex: 10,
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  infoPanel: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 6,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    marginLeft: 30,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
