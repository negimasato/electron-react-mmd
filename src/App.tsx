import React, { useEffect, useState, useRef, Suspense } from 'react';
// import logo from './logo.svg';
import './App.css';
import Model from './Model'
import {Canvas,useFrame} from 'react-three-fiber';
import { ControlsProvider, Controls, useControl } from 'react-three-gui';
import { Grid } from '@material-ui/core';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { Bone } from 'three';
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import Measure, { BoundingRect }  from 'react-measure';
import TimeLiner from './component/TimeLinerComponent';

type ModelType = {
  id: number
  url: string
}

function App() {
  const [bounds, setBounds] = useState<BoundingRect>();
  const [bonelists, setSkinnedMeshs] = useState<any>();
  const [models, setModels] = useState<ModelType[]>([]);
  const [selectObject, setSelectObject] = useState(0);
  useEffect(() => {
    console.log(`This platform is ${window.navigator.platform}`);
    window.ipcRenderer.on('open_file',(event,arg) => {
      let filePath:string= arg[0];
      let path = null;
      if(window.navigator.platform === 'Win32') {
        path = filePath.split('\\').join('/');
      } else {
        const fileSplitPath = filePath.split('\\');
        const fileName = fileSplitPath[fileSplitPath.length - 1];
        path = 'file://' + fileName;
      }
      console.log(filePath);
      console.log(path);
      const m = {id:models.length,url:path}
      const newModel = [... models,m]
      setModels(newModel);
    });
  }, []);
  function setSkinnedMesh(skinnedMesh:SkinnedMesh) {
    setSkinnedMeshs(skinnedMesh);
  }
  return (
    <>
      <Grid container>
          <Measure
              bounds
              onResize={contentRect => {
                setBounds(contentRect.bounds);
              }}
            >
                {({ measureRef }) => (
                  <Grid item xs={4} ref={measureRef} style={{height:400}}>
                    {<TimeLiner width={bounds?.width} height={bounds?.height} setSelectObject={setSelectObject} bonelists={bonelists} /> }
                  </Grid>
                )}
          </Measure>
          <Grid item xs={8}>
            <Canvas style={{backgroundColor:"black",height:"400px"}}
            colorManagement={false} 
            camera={{ fov: 50, position: [0, 0, 30] }} >
              <ambientLight />
              <Suspense fallback={null}>
              {models.map((model,index) => {
                console.log(model.id);
                return(
                  <Model key={model.id} url={model.url} position={[0,0,0]}　selectObject={selectObject} setSkinnedMesh={setSkinnedMesh}/>
              )})}
              </Suspense>
              <gridHelper />
            </Canvas>
          </Grid>
          <Grid item xs={4} style={{border: "1px solid #ffffff"}}>
            <p>モデル</p>
          </Grid>
          <Grid item xs={4}>
          </Grid>
      </Grid>
    </>
  );
}

export default App;
