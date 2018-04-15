import React from 'react'
import { Alert, Button, StyleSheet, Text, View, ScrollView, Image } from 'react-native'


export default class App extends React.Component {
  constructor(props){
    super(props) 
  }
  render() {
    return (
      
        <View style={ styles.container }>
          <View style={ styles.header }>
            <Image source={ require('./logo2.png') } style={ styles.logo }/>
            <Image source={ require('./cyberlogo.png') } style={ styles.cyberlogo } />
          </View>
          <ScrollView contentContainerStyle={ styles.midContainer }>
            <SituationList />
          </ScrollView>
          <View style={ styles.footer }>
            
          </View>
        </View>
    );
  }
}

class SituationList extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      scenarios: [],
      lat: 0,
      lng: 0,
      messageAvailible: false,
      safe: false,
      newMsg: false
    }    

    this.updatePosition = this.updatePosition.bind(this)
    this.getSituations = this.getSituations.bind(this)
    this.showAlert = this.showAlert.bind(this)
  }

  componentDidUpdate(){
    clearInterval(this.state.intervalId);
  }

  componentDidMount(){

    var c = this
  
    setInterval(function(){
      navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        c.updatePosition(position)
        c.getSituations()
         
      },
       (error) => {console.log(error)},
       {enableHighAccuracy: true, timeout: 20000, maximumAge: 0}
      );
    }, 3000)
  }

  updatePosition(position){
    this.setState(previousState => { 
      return { 
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
     })
  }

  getSituations() {
    console.log('lng', this.state.lng)
    console.log('lat', this.state.lat)

    return fetch(
      'https://weyes9suzh.execute-api.eu-west-1.amazonaws.com' +
      '/production/scenarios/latest?lat='+ this.state.lat +'&lon=' + this.state.lng + '&radius=' + 1000, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    )
    .then((res) => {
      if(res.ok){
        console.log('OK')
        return res
      } else {
        console.log('error')
      }
    })
    .then(response => response.json())
    .then((json) => {
      console.log(json)
      this.setState({scenarios: json})
      this.forceUpdate()

      console.log('update');
      if(this.state.scenarios.length > 0){
        console.log(this.state.scenarios[0]["id"] + '\n')
        this.setState({
          safe: false,
          messageAvailible: true,
          newMsg: true
        })
      } else {
        this.setState({
          safe: false
        })
      }
      
    })
    .catch((err) => { console.error(err) })

  }

  showAlert(){

    if (!this.alertPresent) {

      this.alertPresent = true;
      if (this.state.messageAvailible) {
        this.setState({
          newMsg: false
        })
        Alert.alert(
          'Warning',
          this.state.scenarios[0]['append_text'],
          [
            {text: 'OK', onPress: () => {
              this.setState({
                newMsg: true
              })
            }, style: 'cancel'},
          ],
          { cancelable: true }
        )
      } else {
          this.alertPresent = false;
      }
  }
    
  }

  render() {

    let text = 'No scenarios', severity = '5', timestamp = '2018-04-12 23:45', type = 'WARNING'

    if(this.state.scenarios.length > 0){
      text = this.state.scenarios[0]['append_text']
      severity = this.state.scenarios[0]['severity'] 
      timestamp = this.state.scenarios[0]['timeStamp']
    } 

    return(
        (this.state.safe) ? 

        
        <Image source={ require('./safe.png')} style={styles.safe}/>

        : 
       
        <View style={ styles.lastScenario }>
          <View style={ styles.bgDiv }>
            <Text style={ styles.typeText }>{ type }</Text>
            <Text style={ styles.severityText }>{ severity }</Text>
            <Text style={ styles.warningText }>{ text }</Text>
            <Text style={ styles.timestampText }>{ timestamp }</Text>
          </View>
        {
            
            this.showAlert()

        }
        
      </View>
      
    );
  }
}




const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fcfcfc'
  },
  midContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    marginTop: 120,
    width: 250, 
    height: 250
  },
  logo:{
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    marginTop: 25,
    marginBottom: 5,
    marginRight: 50,
  },
  situationList: {
      paddingTop: 70
  },
  header: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 90
  },
  footer: {
    backgroundColor: '#fff',
    height: 40,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 7,
  },
  typeText: {
    fontSize: 40,
    fontFamily: 'Roboto',
  },
  lastScenario:{
    marginTop: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 22,
    fontFamily: 'Roboto'
  },
  severityText: {
    fontSize: 70,
    color: 'red',
    fontWeight: 'bold',
    fontFamily: 'Roboto'
  },
  timestampText: {
    color: '#999',
    fontFamily: 'Roboto'
  },
  bgDiv: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    padding: 30,
    borderRadius:10,
    borderWidth: 3,
    borderColor: '#bbb'
  },
  cyberlogo: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain',
    marginTop: 25,
    marginLeft: 150,
    marginBottom: 5
  }


});