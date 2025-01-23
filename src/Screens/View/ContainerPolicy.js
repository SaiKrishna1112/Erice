import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

const ContainerPolicy = () => {
  const [pdfBase64, setPdfBase64] = useState('');

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Load the PDF from assets
        const asset = Asset.fromModule(require('./assets/sample.pdf'));
        await asset.downloadAsync(); // Ensure the asset is available

        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setPdfBase64(`data:application/pdf;base64,${base64}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to load PDF');
        console.error(error);
      }
    };

    loadPdf();
  }, []);

  const downloadPdf = async () => {
    try {
      const asset = Asset.fromModule(require('./assets/sample.pdf'));
      await asset.downloadAsync(); // Ensure the asset is available

      const destinationPath = `${FileSystem.documentDirectory}sample.pdf`;
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: destinationPath,
      });

      Alert.alert('Download Successful', `File saved to: ${destinationPath}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download the PDF');
    }
  };

  return (
    <View style={styles.container}>
      {pdfBase64 ? (
        <WebView
          originWhitelist={['*']}
          source={{ uri: pdfBase64 }}
          style={styles.webview}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Button title="Loading PDF..." disabled />
        </View>
      )}
      <Button title="Accept and Download PDF" onPress={downloadPdf} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContainerPolicy;
