import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";


const stack = createNativeStackNavigator();


export default function Container() {
    return (
        <NavigationContainer>
            <stack.Navigator
                initialRouteName={'Home'}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <stack.Screen name="Home" component={Home} />
            </stack.Navigator>
        </NavigationContainer>
    )
}