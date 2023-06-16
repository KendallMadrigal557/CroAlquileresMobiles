import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NavBar from '../components/navbar/navbar';
import DepartmentSearch from '../components/Department/DepartmentSeacrh/departmentSearch';
import DepartmentService from '../services/department.service';
import FavoriteService from '../services/favorite.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DepartmentCard from '../components/Department/cardDepartment/carddepartment'

export default function FavoritePage() {
    const [favoriteDepartments, setFavoriteDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchFavoriteDepartments = async () => {
            try {
                const userId = await AsyncStorage.getItem('user');
                if (!userId) {
                    // No hay usuario logueado, mostrar mensaje de aviso
                    setLoading(false);
                    return;
                }

                const favorites = await FavoriteService.getFavoritesByUserId(userId);
                const departmentIds = favorites.map((favorite) => favorite.idDepartment);

                const departments = await DepartmentService.getDepartments();
                const favoriteDepartments = departments.filter((department) =>
                    departmentIds.includes(department._id)
                );

                setFavoriteDepartments(favoriteDepartments);
                setLoading(false);
            } catch (error) {
                console.log('Error fetching favorite departments:', error);
                setLoading(false);
            }
        };

        fetchFavoriteDepartments();
    }, []);

    const handleDepartmentCardPress = (department) => {
        navigation.navigate('detailsDepartment', { departmentId: department._id });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}></View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                <DepartmentSearch />
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
                ) : favoriteDepartments.length === 0 ? (
                    <Text style={styles.noDepartmentsText}>No se encontraron departamentos favoritos.</Text>
                ) : (
                    favoriteDepartments.map((department) => (
                        <Pressable
                            key={department._id}
                            onPress={() => handleDepartmentCardPress(department)}
                            style={({ pressed }) => [
                                styles.departmentCard,
                                {
                                    opacity: pressed ? 0.5 : 1,
                                },
                            ]}
                        >
                            <DepartmentCard
                                image={`http:/192.168.0.2:3002/uploads/${department.image}`}
                                price={department.price}
                                name={department.place}
                                location={department.location}
                            />
                        </Pressable>
                    ))
                )}
            </ScrollView>

            <NavBar />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        padding: 24,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: 40,
        paddingBottom: 80,
    },
});
