import {observable} from "mobx"

export class User{
    
    @observable firstName
    @observable lastName
    @observable age
    @observable status
    @observable desiredRelationship
    @observable interestedIn
    @observable gender
    @observable picture
    @observable id
    // below - variables that we don't need to insert when making a new instance
    @observable isCheckedIn
    @observable coordinates 
    
    constructor(id, firstName, lastName, age, status, desiredRelationship, interestedIn, gender, picture, coordinates){
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.age = age
        this.status = status
        this.desiredRelationship = desiredRelationship
        this.interestedIn = interestedIn
        this.gender = gender
        this.picture = picture
    }
}