import React, { Component } from 'react';
import { observer, inject } from "mobx-react"
import { Route } from "react-router-dom"
import Locations from "../Locations"
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { Input, InputBase } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import { StylesProvider, InputLabel } from '@material-ui/core';
import { MenuItem } from 'material-ui';
import axios from "axios"
import MapContainer from "../MapContainer"
@inject("user", "usersStore", "locationsStore", "myProfile", "socketStore")
@observer

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            loggedIn: false
        }
    }

    handleChange = (input) => (event) => {
        this.setState({
            [input]: event.target.value
        })
    }

    submit = async (event) => {
        event.preventDefault()
        const loginInformation = { address: this.state.email, password: this.state.password }
        const checkIfUserExists = await axios.post('http://localhost:8080/login', loginInformation)
        if (checkIfUserExists.data === "Welcome") {
            this.setState({ loggedIn: true })
        } else {
            alert("Incorrect Email Address/Password")
        }
    }

    render() {

        return (

            <MuiThemeProvider>
                {!this.state.loggedIn ? 
                <React.Fragment>

                    <AppBar title="Login" />
                    <TextField
                        hintText="Enter Your Email"
                        floatingLabelText="Email"
                        onChange={this.handleChange('email')}
                        defaultValue={this.state.email}
                        type="email"
                    />
                    <br />
                    <TextField
                        hintText="Enter Your Password"
                        floatingLabelText="Password"
                        onChange={this.handleChange('password')}
                        defaultValue={this.state.password}
                        type="password"
                    />
                    <br />
                    <RaisedButton label="Submit" primary={true} style={styles.button} onClick={this.submit} />

                </React.Fragment>
    : <Route path="/" exact render={({ match }) => <><MapContainer /> <Locations/> </>} />}
            </MuiThemeProvider>

        )
    }
}

const styles = {
    buttons: {
        margin: 15
    }
}

export default Login