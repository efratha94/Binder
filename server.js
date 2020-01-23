const dotenv = require('dotenv').config()
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const api = require("./server/routes/api.js");
const errorHandler = require('./server/middlewares/errorHandler/errorHandler')
const config = require('./config/config')
const port = 8080
// const dbSetup = require('./server/db/dbSetup')
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const axios = require("axios")
const apiKey = process.env.GOOGLE_MAP_API_KEY //move through config
const controller = require('./server/middlewares/controllers/controller')
const queries = require('./server/db/queries')
const users = require('./dummyData').users
const userIds = require('./dummyData').userIds

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", api);
app.use(errorHandler)


io.on('connection', function (socket) {
    console.log('user has connected')
    
    socket.on('userId', (userId) => {
        const userInfo = queries.findUser(userIds.pop())
        userInfo.then( resolvedUserInfo => {
          resolvedUserInfo.socketId = socket.id
          users.push(resolvedUserInfo)
          socket.emit('userInfo', userInfo)
        })

        // socket.emit(`allUsers`, users);
        // console.log('user id socket works')
    })
    
    
    

    // let len = users.length
    
    // socket.emit(`allUsers`, users);

    socket.on('GPSlocation', async (GPSlocation) => {
        console.log('GPS location received: ' + GPSlocation.lat, GPSlocation.lng)

        const nearLocations = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${GPSlocation.lat},${GPSlocation.lng}&radius=100&type=bar&key=${apiKey}`);
        // let places = []
        let places = nearLocations.data.results.map(itemName => ({ name: itemName.name, id: itemName.place_id }))
        // console.log(places)

        socket.emit(`locationsArry`, places);
    })
    
    socket.on('selectedLocation', (selectedLocation) => {
        console.log('Selected location received: ' + selectedLocation)
        let usersNearUser = []
        let newUser = {}
        users.forEach(u => {
            if (u.location === selectedLocation) {
                usersNearUser.push(u)
            }
            if (u.socketId === socket.id) {
                u.location = selectedLocation
                newUser = u
            }
        })
        socket.emit(`usersNearMe`, usersNearUser)
        
        usersNearUser.push(newUser)

        
        for (let i = 0; i < usersNearUser.length-1; i++) {
            const usersToSend = [...usersNearUser.filter( user => user.socketId != usersNearUser[i].socketId)]

            //const index = usersToSend.findIndex( user => user.socketId == socket.id )
            //usersToSend.splice(index,1)
            io.to(`${usersNearUser[i].socketId}`).emit('usersNearMe', usersToSend);
        }
    })

    socket.on('disconnect', function () {
        console.log('user disconnected');
        for (let i = 0; i < users.length; i++) {
            if (users[i].socketId === socket.id) {
                console.log(`deleting user ${users[i].userId}`)
                users.splice(i, 1);
            }
        }
    });
});

http.listen(8080, function () {
    console.log('listening on *:8080');
});

