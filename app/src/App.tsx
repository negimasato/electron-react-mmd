import React, { Component, useRef }  from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import * as THREE from 'three'
import { Mesh,Scene } from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader'
import './App.css';


class App extends Component {

  public fileInput: React.RefObject<HTMLInputElement>;
  public scene: Scene;
  public mesh: any;

  constructor(props: any) {
    // highlight-range{3}
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef<HTMLInputElement>();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xffffff );
  }

  async handleSubmit(event: any) {
    // highlight-range{3}
    event.preventDefault();
    if(this.fileInput.current?.files === null) {
      return;
    }
    const url: string = URL.createObjectURL(this.fileInput.current?.files[0]);
    const loader = new MMDLoader();
    console.log(url);
    loader.loadPMX(url, (mmd) => {
      console.log(mmd)
    }, (xhr) => {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },(error) => {
      console.error(error);
    });
  }
  
  render(){
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          <label>
            Upload file:
            <input type="file" ref={this.fileInput} />
          </label>
          <br />
          <button type="submit">Submit</button>
        </form>
        <Canvas>
        </Canvas>
      </div>
    )
  }
}

export default App;
