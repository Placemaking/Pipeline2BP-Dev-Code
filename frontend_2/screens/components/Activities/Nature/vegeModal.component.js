import React from 'react';
import { View, Modal} from 'react-native';
import { useTheme, Text, Button } from '@ui-kitten/components';

import { styles } from './modal.styles';

export function VegeModal(props) {

    const theme = useTheme();
    
    const sendData = async (desc) => {
        let data = {
            description: desc
        }
        
        // closes the modal (in natureTest)
        await props.closeData(data);
    }

    return(
        <Modal transparent={true} animationType='slide' visible={props.visible}>
            <View style={styles.modalContainer}>
                <View style={[ styles.vegeViewContainer, {backgroundColor:theme['background-basic-color-1']}]} >
                        
                    <Text category={'h1'} style={styles.titleText}>Vegetation Data</Text>
                    <Text category={'s1'} style={styles.titleLine}>__________________________________</Text>
                    <View style={styles.dataView}>
                                
                        <View style={styles.titleDesc}>
                            <Text category={'s1'} style={styles.titleDescTxt}>Select the best description for the vegetation you marked</Text>
                        </View>

                        <View>
                            <View style={styles.buttonRow}>
                                <Button style={styles.vegeButton} onPress={()=> sendData("Native")}>Native</Button>
                                <Button style={styles.vegeButton} onPress={()=> sendData("Design")}>Design</Button>
                                <Button style={styles.vegeButton} onPress={()=> sendData("Open Field")}>Open Field</Button>
                            </View>
                            

                            <View style={styles.lastButtonView}>
                                <Button style={styles.backButton} onPress={() => props.back()}>Back</Button>
                            </View>

                        </View>
                    </View>                      
                </View>
            </View>
        </Modal>
    )
}