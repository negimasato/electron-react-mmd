import React, { Component }  from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import './App.css';

class App extends Component {

  public fileInput:any;

  constructor(props: any) {
    // highlight-range{3}
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  handleSubmit(event: any) {
    // highlight-range{3}
    event.preventDefault();
    alert(
      `Selected file - ${this.fileInput.current.files[0].name}`
    );
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
      </div>
    )
  }
}

export default App;
