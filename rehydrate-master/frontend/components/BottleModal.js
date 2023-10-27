// BottleModal.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';

export default function BottleModal({ isVisible, toggleModal, bottles, selectBottle }) {
    return (
        <Modal isVisible={isVisible}>
            <View style={styles.container}>
                <View style={styles.bottleDisplays}>
                    {bottles.map((bottle, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.bottleContainer}
                            disabled={!bottle.unlocked}
                            onPress={() => selectBottle(bottle)}
                        >
                            <Image
                                source={bottle.image}
                                style={[styles.bottleImage, !bottle.unlocked && styles.greyedOut]}
                            />
                            <Text style={{
                                textAlign: 'center',
                            }}>{bottle.unlocked ? bottle.name : 'Locked'}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    bottleDisplays: {
        flexDirection: 'row'
    },
    bottleContainer: {
        width: '30%',
        margin: 10,
        alignItems: 'center', // Align children to the center
    },
    bottleImage: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
    },
    greyedOut: {
        opacity: 0.5,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
    },
});
