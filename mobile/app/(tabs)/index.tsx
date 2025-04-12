import { useState } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Circle } from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connectionStrength, setConnectionStrength] = useState<number>(0);
  const [networkType, setNetworkType] = useState<string>('unknown');

  const getLocationAndConnection = async () => {
    // Get location
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    // Check network connection
    const netInfo = await NetInfo.fetch();
    setNetworkType(netInfo.type);

    // Simulate connection strength (replace with real measurement)
    const strength = netInfo.isConnected ? 
      Math.floor(Math.random() * 70) + 30 : // 30-100% when connected
      0; // 0% when offline
    setConnectionStrength(strength);
  };

  return (

    <View style={styles.container}>
      <TouchableOpacity style={{ position: 'absolute', top: 47, right: 50 }} onPress={() => {}}>
      <Ionicons name="settings-outline" size={24} color="black" />
      </TouchableOpacity>
        
      <Text style={styles.title}>📡 SignalScape</Text>
      
      <Button 
        title="Check My Connection" 
        onPress={getLocationAndConnection} 
      />

      {location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              }}
              radius={connectionStrength * 5} // Radius in meters
              fillColor={`rgba(0, ${128 + connectionStrength}, 255, 0.5)`}
              strokeColor="rgba(0, 100, 255, 0.8)"
            />
          </MapView>

          <View style={styles.infoPanel}>
            <Text style={styles.coords}>
              📍 Location: {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
            </Text>
            <Text style={styles.connection}>
              {connectionStrength > 0 ? (
                `📶 ${connectionStrength}% ${networkType} connection`
              ) : (
                "❌ No connection detected"
              )}
            </Text>
          </View>
        </View>
      )}

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  mapContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: Dimensions.get('window').height * 0.6,
  },
  infoPanel: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  coords: {
    fontSize: 16,
    marginBottom: 5,
  },
  connection: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
