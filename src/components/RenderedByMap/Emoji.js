import React, { Component } from 'react';
import { observer, inject } from "mobx-react"

@inject("user", "usersStore", "locationsStore", "myProfile")
@observer


class Emoji extends Component{


    render(){
        return (
               <> 
               </> 
        )
    }
}

export default Emoji