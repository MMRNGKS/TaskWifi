/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  PermissionsAndroid,
  Platform,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

// Define the type for WiFi network
interface WifiNetwork {
  SSID: string;
  BSSID: string;
  capabilities: string;
  frequency: number;
  level: number;
  timestamp: number;
}

const WifiScanner: React.FC = () => {
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState<WifiNetwork | null>(null);
  const [pass, setPass] = useState('');
  const [connectedSSID, setConnectedSSID] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestLocationPermission();
      getCurrentConnection();
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Wifi networks',
          message: 'We need your permission in order to find wifi networks',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const loadWifiList = () => {
    WifiManager.loadWifiList()
      .then((wifiList: WifiNetwork[]) => {
        setWifiList(wifiList);
        console.log(wifiList);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleWifiPress = (wifi: WifiNetwork) => {
    setSelectedWifi(wifi);
    setModalVisible(true);
  };

  const connectToWifi = () => {
    if (selectedWifi) {
      const {SSID} = selectedWifi;
      WifiManager.connectToProtectedSSID(SSID, pass, false, false) // Assuming SSID is not hidden
        .then(() => {
          console.log(`Connected to ${SSID}`);
          setConnectedSSID(SSID);
          Alert.alert('Connected', `Connected to ${SSID}`);
        })
        .catch(error => {
          console.log(error);
          Alert.alert('Connection Failed', `Failed to connect to ${SSID}`);
        });
      setModalVisible(false);
    }
  };

  const getCurrentConnection = () => {
    WifiManager.getCurrentWifiSSID()
      .then(SSID => {
        setConnectedSSID(SSID);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const disconnectFromWifi = () => {
    WifiManager.disconnect()
      .then(() => {
        console.log('Disconnected from Wi-Fi');
        setConnectedSSID(null);
        Alert.alert('Disconnected', 'Disconnected from current Wi-Fi');
      })
      .catch(error => {
        console.log(error);
        Alert.alert('Error', 'Failed to disconnect');
      });
  };

  const renderItem = ({item}: {item: WifiNetwork}) => (
    <TouchableOpacity onPress={() => handleWifiPress(item)} style={styles.item}>
      <Text>{item.SSID}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button title="Scan Wi-Fi Networks" onPress={loadWifiList} />
      {wifiList.length > 0 ? (
        <FlatList
          data={wifiList}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <Text>No Wi-Fi networks found. Press the button to scan.</Text>
      )}
      {selectedWifi && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>SSID: {selectedWifi.SSID}</Text>
              <TextInput
                style={styles.input}
                onChangeText={setPass}
                value={pass}
                placeholder="Password"
                secureTextEntry
              />
              <View style={styles.fixToText}>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={connectToWifi}>
                  <Text style={styles.textStyle}>Connect</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <Pressable
        style={[
          styles.button,
          styles.buttonClose,
          {opacity: connectedSSID ? 1 : 0.5},
        ]}
        disabled={!connectedSSID}
        onPress={disconnectFromWifi}>
        <Text style={styles.textStyle}>Disconnect</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  fixToText: {
    flexDirection: 'row',
  },
  input: {
    height: 40,
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
});

export default WifiScanner;
