import './App.css';
import React , { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Clarifai from 'clarifai';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';


const USER_ID = 'shawon';
// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = 'b53aa7df04114ca68aee65c515fd19ba';
const APP_ID = '34e7fac0ed354c408901fc3ab150d84b';
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
const IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Baby_Face.JPG';


const raw = JSON.stringify({
  "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
  },
  "inputs": [
      {
          "data": {
              "image": {
                  "url": IMAGE_URL
              }
          }
      }
  ]
});

const requestOptions = {
  method: 'POST',
  headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
  },
  body: raw
};

fetch(`https://api.clarifai.com/v2/models/face-detection/versions/6dc7e46bc9124c5c8824be4822abe105/outputs`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
const app = new Clarifai.App({
  apiKey: '34e7fac0ed354c408901fc3ab150d84b'
 });

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
    // this.clarifai = new Clarifai.App({
    //   apiKey: '34e7fac0ed354c408901fc3ab150d84b'
    // });
  }



  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }


  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width= Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
    console.log(box)
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
    
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
    .predict(
      {
        id: 'face-detection',
        name: 'face-detect',
        version: '6dc7e46bc9124c5c8824be4822abe105',
        type: 'visual-detector',
      }, this.state.input)
    .then(response => {
      console.log('hi', response)
      if (response) {
        fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })

      }

      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(error => console.log('error', error))
  }
  

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState({isSignedIn: false})
    } else if (route==='home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }
  render() {
  return (
    <div className="App">
      <Navigation isSignedIn = {this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
      {this.state.route === 'home' 
      ?  <div> 
      <Logo />
      <Rank name ={this.state.user.name} entries={this.state.user.entries}/>
      <ImageLinkForm  onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
       <FaceRecognition box = {this.state.box} imageUrl={this.state.imageUrl}/>
       </div>

      : (
        this.state.route === 'signin' ?
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
      )
      
      }
    </div>
  )
}
}

export default App
