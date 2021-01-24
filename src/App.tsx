import React, { useEffect, useState, useRef, Suspense } from 'react';
// import logo from './logo.svg';
import './App.css';
import Model from './component/Model'
import {Canvas} from 'react-three-fiber';
import { Grid } from '@material-ui/core';
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import Measure, { BoundingRect }  from 'react-measure';
import TimeLiner from './component/TimeLinerComponent';
import ModelControl from './component/ModelControl';
import { ModelClass } from './classes/ModelClass';
import { Geometry } from 'three';

function App() {
  const [bounds, setBounds] = useState<BoundingRect>();
  const [models, setModels] = useState<ModelClass[]>([]);
  const [selectObject, setSelectObject] = useState(0);
  const [activeModelId, setActiveModelId] = useState(-1);
  useEffect(() => {
    // console.log(`This platform is ${window.navigator.platform}`);
    window.ipcRenderer.on('open_file', async (_ ,arg: any) => {
      let filePath:string= arg[0];
      let path = null;
      if(window.navigator.platform === 'Win32') {
        path = filePath.split('\\').join('/');
      } else {
        const fileSplitPath = filePath.split('\\');
        const fileName = fileSplitPath[fileSplitPath.length - 1];
        path = 'file://' + fileName;
      }
      const m:ModelClass = new ModelClass(models.length,path);
      if(await m.loadMMD(path)) {
        const newModels = [...models,m];
        const newActiveId = activeModelId + 1;
        alert(m.comment);
        setModels(newModels);
        setActiveModelId(newActiveId);
      } else {
        console.error('Load Error');
      }
    });
    return function cleanUp(){
      window.ipcRenderer.removeAllListeners('open_file')
    }
  }, [activeModelId, models]);

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
                    {(() => {
                      if(activeModelId > -1){
                        return(<TimeLiner width={bounds?.width} height={bounds?.height} setSelectObject={setSelectObject} mesh={models[activeModelId].mesh} />)
                      }
                    })()}
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
                return(
                  <Model key={model.id} modelClass={model} position={[0,0,0]}　selectObject={selectObject} activeModelId={activeModelId}/>
              )})}
              </Suspense>
              <gridHelper />
            </Canvas>
          </Grid>
          <Grid item xs={4} style={{border: "1px solid #ffffff"}}>
            <ModelControl key="modelcontrol" models={models} setActiveModelId={setActiveModelId}/>
          </Grid>
          <Grid item xs={4}>
          </Grid>
      </Grid>
    </>
  );
}

export default App;
