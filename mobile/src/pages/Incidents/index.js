import React, {useEffect, useState} from 'react';
import { View, Image, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Feather } from "@expo/vector-icons";
import logoImg from '../../assets/logo.png';
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import api from '../../services/api'

export default function Incidents(){
    const [incidents, setIncidents] = useState([]);
    const [total, setTotal ] = useState(0);
    const [page, setPage ] = useState(1);
    const [loading, setloading] = useState(false);

    const navegation = useNavigation();

    const [refreshing, setRefreshing] = React.useState(false);

    function wait(timeout) {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => setRefreshing(false)); // Após 2 segundos defini Refreshing como false
    }, [refreshing]);

    function navegationToDetail(incident){
        navegation.navigate('Detail',{incident});
    }

    async function loadIncidents(){
        if(loading){
            return;
        }

        if(total > 0 && incidents.length == total){
            return;
        }

        setloading(true);

        const response = await api.get('incidents',{
            params: { page }
        });

        setIncidents([...incidents, ...response.data]);
        setTotal(response.headers['x-total-count']);
        setPage(page + 1);
        setloading(false);
    }

    useEffect(() => {
        loadIncidents();
    } , [])

    return(
        <View style={styles.conteiner}>
            <View style={styles.header}>
                <Image source={logoImg} />
                <Text style={styles.headerText}>
                    Total de <Text style={styles.headerBold}>{total} casos</Text>
                </Text>
            </View>

            <Text style={styles.title}>Bem vindo</Text>
            <Text style={styles.description}>Escolha um dos casos abaixo e salve o dia.</Text>

            <FlatList 
                data={incidents}
                style={styles.incidentsList}
                keyExtractor={incident => String(incident.id)}
                onEndReached={loadIncidents}
                onEndReachedThreshold={0.2}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                //showsVerticalScrollIndicator={false}
                renderItem={({ item: incident}) => (
                    <View style={styles.incidents}>
                        
                    <Text style={styles.incidentProperty}>ONG:</Text>
                    <Text style={styles.incidentValue}>{incident.name}</Text>
                    
                    <Text style={styles.incidentProperty}>CASO:</Text>
                    <Text style={styles.incidentValue}>{incident.title}</Text>
                    
                    <Text style={styles.incidentProperty}>VALOR:</Text>
                    <Text style={styles.incidentValue}>{
                        Intl.NumberFormat('pt-BR', {
                             style: 'currency', currency: 'BRL'}).
                             format(incident.value)}
                    </Text>

                    <TouchableOpacity 
                        style={styles.detaislButton}
                        onPress={() => navegationToDetail(incident)}>

                        <Text style={styles.detailButtonText}>Ver mais detalhes</Text>
                        <Feather name="arrow-right" size={16} color="#E02041" />
                    </TouchableOpacity>
                </View>        

                )}
            />
        </View>
    )
}