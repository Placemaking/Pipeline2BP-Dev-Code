import React, { useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { Text, Button, Icon, Divider, List, ListItem, MenuItem } from '@ui-kitten/components';
import { HeaderBackEdit, HeaderBack } from '../../components/headers.component';
import { MapAreaWrapper, ShowArea } from '../../components/Maps/mapPoints.component';
import { ViewableArea, ContentContainer } from '../../components/content.component';
import { getDayStr } from '../../components/timeStrings.component';
import { EditSubAreas } from './viewSubareas.component';
import { EditStandingPoints } from './viewStandingPoints.component';
import { EditProjectPage } from './editProjectPage.component';
import { getFilteredProjectDetails, getAllCollectionInfo } from '../../components/apiCalls';
import { Pagination } from '../../components/pagination.component';

import { styles } from './project.styles';

const ForwardIcon = (props) => (
  <Icon {...props} name='arrow-ios-forward'/>
);

export function ProjectPage(props) {

  const [editMenuVisible, setEditMenuVisible] = useState(false);
  const [editProjectVisible, setEditProjectVisible] = useState(false);
  const [editAreasVisible, setEditAreasVisible] = useState(false);
  const [editStandingPointsVisible, setEditStandingPointsVisible] = useState(false);
  const [refreshingActivities, setRefreshingActivities] = useState(false);

  const onRefreshActivities = React.useCallback(() => {
    setRefreshingActivities(true);
    refreshDetails();
    setRefreshingActivities(false);
  }, []);

  const refreshDetails = async () => {
    let projectDetails = await getFilteredProjectDetails(props.project);
    // if successfully retrieved project info, Update
    if(projectDetails !== null) {
      // set selected project page information
      await props.setActivities([...projectDetails.activities]);
      await props.setPastActivities([...projectDetails.pastActivities]);
      projectDetails.activities = [];
      projectDetails.pastActivities = [];
      await props.setProject(projectDetails);
    }
  };

  const openActivityPage = async (collectionDetails) => {
    // clear time slots
    await props.setTimeSlots([]);

    // get Info
    collectionDetails = await getAllCollectionInfo(collectionDetails);

    // if successfully retrieved activity info, Update
    if(collectionDetails !== null) {
      await props.setTimeSlots([...collectionDetails.timeSlots]);
      collectionDetails.timeSlots = [];
      await props.setActivity(collectionDetails);
      // open activity page
      props.navigation.navigate('ActivitySignUpPage')
    }
  };

  const activityItem = ({ item, index }) => {
    return(
      <ListItem
        title={
          <Text style={styles.textTitle}>
              {`${item.title}`}
          </Text>
        }
        description={getDayStr(item.date)}
        accessoryRight={ForwardIcon}
        onPress={() => openActivityPage(item)}
      />
    )
  };

  // pagination controls
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [currentRange] = useState([1, 6]);
  const rangeInc = 6;
  const lastPage = Math.ceil(props.activities.length / resultsPerPage);
  const indexOfLastResults = currentPage * resultsPerPage;
  const indexOfFirstResults = indexOfLastResults - resultsPerPage;
  const currentResults = props.activities.slice(indexOfFirstResults, indexOfLastResults);
  
  // changes the 'page' and pagination button range
  const paginate = (pageNumber) =>{
    // if we reached the end of the current range, increment it
    if(currentRange[1] + 1 === pageNumber){
      currentRange[0] = pageNumber
      // checks to make sure it's not rendering extra pages (happens if results.length is not a mutiple of the rangeInc)
      let tempMax = (pageNumber - 1) + rangeInc
      if(tempMax <= lastPage) currentRange[1] = tempMax
      // if it does try to, then it sets the last page as the lastPage number
      else currentRange[1] = lastPage
    }
    // if we reached the start of the current range, decrement it
    else if(currentRange[0] - 1 === pageNumber){
      currentRange[1] = pageNumber
      currentRange[0] = (pageNumber + 1) - rangeInc
    }
    // change the page number
    setCurrentPage(pageNumber)
  }
  // if the max range is larger than the last page number, set the max as the last page number
  if(currentRange[1] > lastPage) currentRange[1] = lastPage

  return (
    <ViewableArea>
      {props.teamOwner() ?
        <HeaderBackEdit {...props} text={props.project.title} editMenuVisible={editMenuVisible} setEditMenuVisible={setEditMenuVisible}>
          <MenuItem title='Edit Project' onPress={() => {setEditMenuVisible(false); setEditProjectVisible(true)}}/>
          <MenuItem title='Area(s)' onPress={() => {setEditMenuVisible(false); setEditAreasVisible(true)}}/>
          <MenuItem title='Standing Points' onPress={() => {setEditMenuVisible(false); setEditStandingPointsVisible(true)}}/>
        </HeaderBackEdit>
      :
        <HeaderBack {...props} text={props.team.title}/>
      }
      <EditProjectPage
        {...props}
        visible={editProjectVisible}
        setVisible={setEditProjectVisible}
      />
      <EditSubAreas
        {...props}
        visible={editAreasVisible}
        setVisible={setEditAreasVisible}
      />
      <EditStandingPoints
        {...props}
        visible={editStandingPointsVisible}
        setVisible={setEditStandingPointsVisible}
      />
      <ContentContainer>

        <View style={styles.mapWrapper}>
          <MapAreaWrapper area={props.project.subareas[0].points} mapHeight={'100%'}>
            <ShowArea area={props.project.subareas[0].points} />
          </MapAreaWrapper>
        </View>

        <View style={styles.teamView}>
          <Text >Location: {props.project.description}</Text>
        </View>

        <View style={styles.teamView}>
            <View style={styles.teamTextView}>
                <Text style={styles.teamText}>Sign Up</Text>
            </View>
            <View style={styles.createTeamButtonView}>
              {props.teamOwner() ?
                <Button status='primary' appearance='outline' onPress={() => {props.setUpdateActivity(false); props.navigation.navigate('CreateActivityStack')}}>
                  Create Research Activity
                </Button>
              :
                null
              }
            </View>
        </View>
        <Divider style={styles.divider} />
        <Pagination
          totalResults={props.activities.length}
          resultsPerPage={resultsPerPage}
          currentPage={currentPage}
          lastPage={lastPage}
          currentRange={currentRange}
          paginate={paginate}
        />

        <View style={styles.listView}>
          <List
            style={styles.list}
            data={currentResults}
            ItemSeparatorComponent={Divider}
            renderItem={activityItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshingActivities}
                onRefresh={onRefreshActivities}
              />
            }
          />
        </View>

      </ContentContainer>
    </ViewableArea>
  );
}