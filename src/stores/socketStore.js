import { observable, action, computed } from "mobx"
import socketIOClient from "socket.io-client"

export class SocketStore {
    endpoint = "localhost:8080"
    socket = socketIOClient(this.endpoint)
    watchID
    //need to empty parantheses before deploying to heroku!!!
    @observable socketId = "";
    @observable coordinates = {}
    @observable nearbyLocations = []
    @observable nearbyUsers = []
    @observable emoji = ''
    @observable loggedInUser 
    @observable chosenLocation
    @observable checked = false
    @observable isLoggedIn = false
    @observable SelectedLocationCoordinates

    @action getUserById = (id) => {
        const user = this.nearbyUsers.find(user => user._id == id)
        console.log(user)
        return user
    }

    @action findSocketDestinationById = (id) => {
        const socketId = this.nearbyUsers.find(user => user.socketId == id)
        return socketId;
    }

    @action openSocket =  (userToSend) => {
        console.log("opensocket")
        console.log(userToSend)
        console.log("opensocket")
        this.socket.emit('userId', userToSend)
        this.loggedInUser = userToSend
        
    }

    @action getLocationsNearby = function(coordinates) {
        this.socket.emit('GPSlocation', coordinates);
        this.socket.on('locationsArry', (locationsArry) => {
            this.nearbyLocations = locationsArry
        })
    }

    @action getUsersNearMe = (location) => {
        console.log('before emit location: ' + location)
        this.socket.emit('selectedLocation', location);
        this.socket.on('usersNearMe', (usersNearMe) => {
            console.log('usersNearMe: ' + usersNearMe)
            this.nearbyUsers = usersNearMe
            this.chosenLocation = location
        })
    }
    @action sendReaction = (reactionObj) => {
        this.socket.emit('reaction', reactionObj)
        console.log('reaction obj: '+ reactionObj.destinationUser._id)
        
        let user = this.nearbyUsers.filter(u=>u._id === reactionObj.destinationUser._id)
        console.log('filter res: '+user[0]._id)
        user[0].blockTimer = true
        setTimeout(function(){ user[0].blockTimer = false }, 5000);
    }

    @action getReaction = (reactionObj) => {
        this.socket.on('reaction recieved', reactionObj => {
            console.log('Recieved an Emoji!');
        })
    }

    @action recieveMessage = () => {
        this.socket.on('reaction recieved', reactionObj => {
            console.log("Recieved Message!");
            console.log('reactingObj is ', reactionObj);
            this.reactingUser = reactionObj.sourceUser
            console.log('reactingUser is ', this.reactingUser);

            this.checked = true;
            this.emoji = reactionObj.label;

            setTimeout(() => {
                this.checked = false;
                this.reactingUser = null
                console.log('changed checked to false!');

            }, 5000)
        })
    }

    // @action setReactionUser = (user) => {
    //     this.reactingUser = user
    // }
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
  
    distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
        var earthRadiusKm = 6371;
        
        var dLat = this.degreesToRadians(lat2-lat1);
        var dLon = this.degreesToRadians(lon2-lon1);
        
        lat1 = this.degreesToRadians(lat1);
        lat2 = this.degreesToRadians(lat2);
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return earthRadiusKm * c;
    }

    @action watchPosition = () => {
        let lat = this.SelectedLocationCoordinates.lat 
        let lng = this.SelectedLocationCoordinates.lng 

        this.watchID = navigator.geolocation.watchPosition((position)=> {
            let lat2 = position.coords.latitude
            let lng2 = position.coords.longitude

            let diff = this.distanceInKmBetweenEarthCoordinates(lat,lng,lat2,lng2)
            if(diff>0.1){
                this.nearbyUsers = []
                this.socket.emit('out of range')
                navigator.geolocation.clearWatch(this.watchID)
            }
        })
    }

    @action checkoutFromLocation = () => {
        this.nearbyUsers = []
        this.socket.emit('out of range')
        navigator.geolocation.clearWatch(this.watchID)        
    }
}