import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function App() {
    const [message, setMessage] = useState<string>();

    useEffect(() => {
        fetch('http://localhost:3000')
            .then(res => res.text())
            .then(setMessage)
            .catch(err => setMessage('Error: ' + (err)));
    }, [])


    const testNotif = async () => {
        await fetch('http://localhost:3000/test-notif', {
            method: 'POST'
        });
    }

    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Text>{message}</Text>
            <StatusBar style="auto" />
            <Button onPress={testNotif}></Button >
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
