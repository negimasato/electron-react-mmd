import React, { useEffect, useState, useRef, Suspense } from 'react';
// import logo from './logo.svg';
import './App.css';
import Model from './Model'
import {Canvas,useFrame} from 'react-three-fiber';
import { ControlsProvider, Controls, useControl } from 'react-three-gui';
import { Grid } from '@material-ui/core';
import BoneLists from './BoneLists';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { Bone } from 'three';
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import Measure, { BoundingRect }  from 'react-measure';
import TimeLiner from './component/TimeLinerComponent';


function Box(props: any) {
  // This reference will give us direct access to the mesh
  const mesh = useRef<THREE.Mesh>()

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if(!mesh.current) {
      return;
    }
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}
    >
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
type ModelType = {
  id: number
  url: string
}

function App() {
  const [text, setText] = useState("not loaded");
  const [bounds, setBounds] = useState<BoundingRect>();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [bonelists, setSkinnedMeshs] = useState<any>();
  const [facelists, setFaceLists] = useState<any>();
  const [models, setModels] = useState<ModelType[]>([]);
  useEffect(() => {
    console.log(`This platform is ${window.navigator.platform}`);
    window.ipcRenderer.on('open_file',(event,arg) => {
      let filePath:string= arg[0];
      let path = null;
      if(window.navigator.platform === 'Win32') {
        path = filePath.split('\\').join('/');
      } else {
        // filePath = filePath.split('\\');
        const fileName = filePath.split('\\')[filePath.length - 1];
        path = 'file://' + fileName;
      }
      console.log(filePath);
      console.log(path);
      const m = {id:models.length,url:path}
      const newModel = [... models,m]
      console.log(newModel);
      setModels(newModel);
    });
    const pathname = 'C:/Users/nishi/Downloads/Pronama-chan_Ver3/Ver3/MMD(Ver.3)/01_Normal_通常/プロ生ちゃん.pmx';
    const m = {id:models.length,url:pathname}
    const newModel = [... models,m]
    console.log(newModel);
    setModels(newModel);
    /*
    const f = async () => {
      setText("loading...");
      try {
        const dirs = await myAPI.readDir();
        myAPI.save("uni-uni");
        setText(`files are: ${dirs.join(", ")}`);
      } catch (e) {
        setText("loading was failed");
        alert(e);
      }
    };
    f();
    */
  }, []);
  function setSkinnedMesh(skinnedMesh:SkinnedMesh) {
    console.log('setSkinnedMesh!!');
    // console.log(skinnedMesh);
    setSkinnedMeshs(skinnedMesh);
  }
  function setFaceList() {
    // setFaceLists();
  }
  return (
    <>
      <Grid container>
          <Grid item xs={12}>
            <Canvas style={{backgroundColor:"black",height:"400px"}}
            colorManagement={false} 
            camera={{ fov: 50, position: [0, 0, 30] }} >
              <ambientLight />
              <Suspense fallback={null}>
              {models.map((model,index) => {
                console.log(model.id);
                return(
                  <Model key={model.id} url={model.url} position={[0,0,0]} setSkinnedMesh={setSkinnedMesh}/>
              )})}
              </Suspense>
              <gridHelper />
            </Canvas>
          </Grid>
          <Measure
              bounds
              onResize={contentRect => {
                setBounds(contentRect.bounds);
              }}
            >
                {({ measureRef }) => (
                  <Grid item xs={12} ref={measureRef} style={{height:200}}>
                    {<TimeLiner width={bounds?.width} height={bounds?.height} bonelists={bonelists} /> }
                  </Grid>
                )}
          </Measure>
      </Grid>
    </>
  );
}

export default App;
