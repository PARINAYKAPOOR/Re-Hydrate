import React, { useEffect, useState } from 'react';
import { ref, onChildChanged, off } from 'firebase/database';
import {
    View, Text, Button, StyleSheet, Image, Animated, ImageBackground, TouchableOpacity
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import BottleModal from '../components/BottleModal';
import * as Notifications from 'expo-notifications';

import { fetchFieldsFromUser, updateFieldsForUser, db, getTimestamp } from '../../backend/firebaseClient';

export default function GamePage() {
    const MAX_HEIGHT = 200;
    const MAX_XP = 100;

    useEffect(() => {
        // Fetch user data from Firebase
        fetchFieldsFromUser('-NhIgt4IOQLxbhFnoGZZ').then((data) => {
            setCoins(data.coins);
            setXp(data.xp);
            setWaterLevel(new Animated.Value(data.threshold_percent * MAX_HEIGHT));
            setPercentage(data.threshold_percent * 100);
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    async function sendNotification() {
        const permission = await Notifications.getPermissionsAsync();
        if (permission.granted) {
            console.log('go')
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Water Alert!',
                    body: `Don't forget to drink more water!`,
                    sound: 'default',
                },
                trigger: {
                    seconds: 1,
                },
            });
        } else {
            console.log(permission)
        }
    }


    useEffect(() => {
        const rootRef = ref(db);

        // Set up the listener
        const listener = onChildChanged(rootRef,
            (snapshot) => {
                const key = snapshot.key;
                const data = snapshot.val();
                console.log(key)
                console.log(data);


                // console.log('key', snapshot.key)
                if (key == '-NhIgt4IOQLxbhFnoGZZ') {

                    const data = snapshot.val();
                    // console.log(data);
                    setCoins(data.coins);
                    setXp(data.xp);
                    setPercentage(data.threshold_percent * 100);

                    // bots = []
                    // let i = 0;
                    // for (i = 0; i < data.bottles; i++) {
                    //     bots.push({ name: 'Bottle' + (i + 1), image: require('../../assets/bottle.png'), unlocked: true })
                    // }
                    // for (i = data.bottles; i < 5; i++) {
                    //     bots.push({ name: 'Bottle' + (i + 1), image: require('../../assets/bottle.png'), unlocked: false })
                    // }
                    // setBottles(bots)
                    // console.log('before', waterLevel._value)
                    // console.log('after', data.threshold_percent * MAX_HEIGHT)

                    Animated.timing(waterLevel, {
                        toValue: data.threshold_percent * MAX_HEIGHT,
                        duration: 500,
                        useNativeDriver: false,
                    }).start(() => {
                        setWaterLevel(new Animated.Value(data.threshold_percent * MAX_HEIGHT));
                    });
                    if (data.threshold_percent < 0.3) {
                        console.log("send a notification");
                        sendNotification();
                    }

                }
            },
            (err) => {
                console.log(`Encountered error: ${err}`);
            }
        );
    }, []);




    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedBottle, setSelectedBottle] = useState(null);
    const [percentage, setPercentage] = useState(0);
    const [bottles, setBottles] = useState([
        { name: 'Bottle1', image: require('../../assets/bottle.png'), unlocked: true },
        { name: 'Bottle2', image: require('../../assets/bottle.png'), unlocked: false },
        // ... Add more bottles here
    ]);

    const [lastDrinkTime, setLastDrinkTime] = useState(null);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const handleDrink = () => {
        const currentTime = new Date().getTime();
        setLastDrinkTime(currentTime);
        setButtonDisabled(true);

        // Disable button for 3 minutes (180000 ms)
        setTimeout(() => {
            setButtonDisabled(false);
        }, 1000);
    };

    const [waterLevel, setWaterLevel] = useState(new Animated.Value(0.4 * MAX_HEIGHT));
    const [coins, setCoins] = useState(0);
    const [xp, setXp] = useState(0);

    useEffect(() => {
        if (xp > MAX_XP) {
            setXp(0)
            bottles[1].unlocked = true
        }
    }, [xp])

    const addWater = () => {


        // Update Firebase
        console.log('percetnage', percentage)
        updateFieldsForUser('-NhIgt4IOQLxbhFnoGZZ', {
            coins: coins + 1,
            xp: (xp + 50) % MAX_XP,
            threshold_percent: Math.min(1, (percentage / 100) + 0.2),
            hydrate_timestamp: getTimestamp()
        }).then(() => {
            console.log('Updated Firebase');
        }).catch((error) => {
            console.log(error);
        })

    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSelectBottle = (bottle) => {
        setSelectedBottle(bottle);
        toggleModal();
    };

    return (
        <ImageBackground
            source={require('../../assets/bubble-background.png')}
            style={styles.container}
        >
            <Text style={styles.titleText}>Your Water Economy</Text>
            <Text style={styles.promptText}>
                Stay hydrated and earn coins!
            </Text>

            <View style={styles.infoContainer}>
                <View style={styles.coinContainer}>
                    <Image source={require('../../assets/coin.png')} style={styles.icon} />
                    <Text style={styles.coinText}>
                        {coins}
                    </Text>
                </View>
                <View style={styles.xpContainer}>
                    <Text style={styles.xpText}>XP</Text>
                    <ProgressBar progress={xp / MAX_XP} width={150} color="blue" />
                </View>
            </View>

            <View style={styles.bottleContainer}>
                <Animated.View style={{ ...styles.innerWater, height: waterLevel }}></Animated.View>
                <Image
                    source={require('../../assets/bottle.png')}
                    style={styles.bottleImage}
                    resizeMode="contain"
                />
                <Text style={styles.percentageText}>
                    {percentage.toFixed(0)}%
                </Text>
            </View>

            <TouchableOpacity disabled={buttonDisabled} style={buttonDisabled ? styles.waterButtonDisabled : styles.waterButton} onPress={() => {
                addWater()
                handleDrink()
            }}>
                <Image source={require('../../assets/water-drop.png')} style={styles.waterIcon} />
                <Text style={styles.waterButtonText}>Drink Water</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shopButton} onPress={() => { toggleModal() }}>
                <Text style={styles.shopButtonText}>Open Shop</Text>
            </TouchableOpacity>
            <Button title="decrease water tes" onPress={() => {
                Animated.timing(waterLevel, {
                    toValue: Math.max(0, waterLevel._value - 20),
                    duration: 500,
                    useNativeDriver: false,
                }).start();

                setCoins(coins + 1);
                setXp((xp + 10) % MAX_XP);

                // Update Firebase
                updateFieldsForUser('-NhIgt4IOQLxbhFnoGZZ', {
                    coins: coins - 1,
                    xp: (xp - 10) % MAX_XP,
                    threshold_percent: Math.min(1, (waterLevel._value - 20) / MAX_HEIGHT),
                    hydrate_timestamp: getTimestamp()
                }).then(() => {
                    console.log('Updated Firebase');
                }).catch((error) => {
                    console.log(error);
                })
            }} />
            <BottleModal
                isVisible={isModalVisible}
                toggleModal={toggleModal}
                bottles={bottles}
                selectBottle={handleSelectBottle}
            />

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    coinContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    xpContainer: {
        alignItems: 'center',
    },
    xpText: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    bottleContainer: {
        width: 80,
        height: 200,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 40,
        overflow: 'hidden',
    },
    bottleImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: 200,
    },
    innerWater: {
        width: '90%',
        backgroundColor: 'aqua',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 2,
    },
    icon: {
        width: 24,
        height: 24,
    },
    waterButton: {
        flexDirection: 'row',
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    waterButtonDisabled: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#B0C4DE',  // Lighter blue to indicate disabled state
        opacity: 0.7,  // Slightly transparent
    },
    waterButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    waterIcon: {
        width: 20,
        height: 20,
    },
    shopButton: {
        backgroundColor: '#228B22',
        padding: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    shopButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    promptText: {
        color: 'white',
        fontStyle: 'italic',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    titleText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2C3E50',  // Dark blue-ish color
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
        marginBottom: 15,
    },
    promptText: {
        fontStyle: 'italic',
        fontSize: 18,
        color: 'white',  // Medium blue color
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        padding: 5,
        textAlign: 'center',
    },
    percentageText: {
        position: 'absolute',
        top: '45%',
        alignSelf: 'center',
        fontWeight: '700',
        fontSize: 22,
        color: '#E74C3C',  // Red color for emphasis
        textShadowColor: 'rgba(255, 255, 255, 0.85)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
        zIndex: 5,
    },
    coinText: {
        fontSize: 26,
        fontWeight: '600',
        color: '#F39C12',  // Gold-ish color for coins
        marginLeft: 10,
    },
    xpText: {
        fontWeight: '600',
        fontSize: 20,
        color: '#8E44AD',  // Purple-ish color for XP
        marginBottom: 8,
    }
});

