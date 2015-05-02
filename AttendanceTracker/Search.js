var React = require('react-native');
var styles = require('./index.ios.js');

var {
  StyleSheet,
  Text,
  View,
  TextInput,
  ListView,
  TouchableHighlight,
  AsyncStorage,
} = React;

var Search = React.createClass({
  getInitialState: function () {
    return {
      name: "",
      events: [],
      dataSource: 
        new ListView.DataSource({
          rowHasChanged: (row1, row2) => row1 !== row2,
        }),
    }
  },
  componentWillMount: function () {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        for (var i = 0; i<keys.length; i++) {
          AsyncStorage.getItem(keys[i])
            .then(
              ((key, event) => {
                event = JSON.parse(event);
                event.storageKey=key;
                var newEvents = this.state.events.concat(event);
                this.setState({
                  events: newEvents,
                });
                this.search(this.state.name);
                console.log(this.state);
              }).bind(this, keys[i])
            )
            .catch((error) => {
              console.log(error);
            })
            .done();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .done();
  },
  componentDidMount: function() {
    console.log(this.state);
    console.log(this.props);
  },
  editEvent: function(event) {
    console.log(event);
    this.props.navigator.push({
      title: "Edit Event",
      component: require('./Event.js'),
      passProps: {
        name: event.name,
        date: event.date,
        swiped: event.swiped,
        storageKey: event.storageKey,
        editing: true,
      },
    });
  },
  render: function() {
    return (
       <View style={styles.container}>
        <Text style={styles.title}>
          {this.props.route.title}
        </Text>
        <View>
        <TouchableHighlight onPress={this.props.navigator.pop}>
          <Text>Home</Text>
        </TouchableHighlight>
          <TextInput
            style={styles.input}
            autoFocus={false}
            clearButtonMode='while-editing'
            onChangeText={this.search}
            placeholder='Event Name'
            returnKeyType='done'
            keyboardType='default'
          />
          <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderEvent}
        />
        </View>
        
      </View>
    );
  },
  renderEvent: function(event) {
    return (
      <TouchableHighlight onPress={this.editEvent.bind(this, event)}>
        <View>
          <Text>Name: {event.name}</Text>
          <Text>Date: {event.date}</Text>
          <Text>Number of Attendees: {event.swiped.length}</Text>
        </View>
      </TouchableHighlight>
    );
  },
  search: function(text) {
    this.setState({
      name: text,
      dataSource: this.state.dataSource.cloneWithRows(
        this.state.events.filter(
          (event) => {
            return event.name.toLowerCase().indexOf(text.toLowerCase()) != -1;
          }
        )
      ),
    });
  },
});

module.exports = Search;