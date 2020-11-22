
import { OrbitControls } from '@react-three/drei/OrbitControls';
import { TransformControls } from '@react-three/drei/TransformControls';
import React, { useRef, useState, Suspense, HtmlHTMLAttributes, useMemo, useEffect }  from 'react';
import { Canvas,useLoader } from 'react-three-fiber';
import { MMDLoader } from '../libs/MMDLoader'
import { ControlsProvider, Controls, useControl } from 'react-three-gui';

function Model(props: any) {
    const mesh = useRef<THREE.Mesh>()
    const orbit = useRef<OrbitControls>()
    const transform = useRef<TransformControls>()
    const mode = useControl("mode", { type: "select", items: ["scale", "rotate", "translate"] })
    // let nodes = useLoader(MMDLoader, props.url)
    // props.setSkinnedMesh(nodes);

    useEffect(() => {
      if (typeof transform.current !== 'undefined') {
        const controls:any = transform.current
        const callback = (event: any) => {
          if(orbit.current){
            orbit.current.enabled = !event.value
          }
        }
        if(typeof controls !== 'undefined') {
          controls.attach(props.modelClass.mesh.skeleton.bones[props.selectObject]);
          controls.setMode('rotate');
          controls.addEventListener("dragging-changed", callback)
          return () => controls.removeEventListener("dragging-changed", callback)
        }
      }
    })
    return (
      <>
        <TransformControls ref={transform}>
          <mesh ref={mesh}>
            <primitive 
            object={props.modelClass.mesh} dispose={null} scale={[0.25 ,0.25, 0.25]} position={props.position} />
          </mesh>
        </TransformControls>
        <OrbitControls ref={orbit}/>
      </>
    );
}

export default Model;
