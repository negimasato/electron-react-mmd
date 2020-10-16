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
  const [bonelists, setSkinnedMeshs] = useState<any>();
  const [facelists, setFaceLists] = useState<any>();
  const [models, setModels] = useState<ModelType[]>([])
  useEffect(() => {
    window.ipcRenderer.on('open_file',(event,arg) => {
      console.log('open_file イベントリスナ');
      let filePath = arg[0];
      filePath = filePath.split('\\');
      const fileName = filePath[filePath.length - 1];
      const path = 'file://' + fileName;
      console.log(path);
      const m = {id:models.length,url:path}
      const newModel = [... models,m]
      console.log(newModel);
      setModels(newModel);
    });
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
          <Grid item xs={6}>
            <BoneLists bonelists={bonelists}/>
          </Grid>
          <Grid item xs={6}>
            <Canvas style={{backgroundColor:"black"}}
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
      </Grid>
    </>
  );
}

export default App;
