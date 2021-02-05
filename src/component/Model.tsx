
import { OrbitControls } from '@react-three/drei/OrbitControls';
import { TransformControls } from '@react-three/drei/TransformControls';
import React, { useRef, useEffect }  from 'react';
import { useThree } from 'react-three-fiber';
import { CCDIKSolver } from 'three/examples/jsm/animation/CCDIKSolver';

function Model(props: any) {
    const mesh = useRef<THREE.Mesh>()
    const orbit = useRef<OrbitControls>()
    const transform = useRef<TransformControls>()
    const { scene } = useThree()
    // const mode = useControl("mode", { type: "select", items: ["scale", "rotate", "translate"] })
    useEffect(() => {
      if (typeof transform.current !== 'undefined') {
        const controls: any = transform.current
        const callback = (event: any) => {
          if(orbit.current){
            orbit.current.enabled = !event.value
          }
        }
        if(controls) {
          if(props.activeModelId === props.modelClass.id) {
            controls.attach(props.modelClass.mesh.skeleton.bones[props.selectObject]);
            if(props.controlMode === 'select'){
              if(props.modelClass.mesh) {
                var solver = new CCDIKSolver(props.modelClass.mesh,props.modelClass.mesh.geometry.userData.MMD.iks);
                var helper = solver.createHelper();
                helper.visible = true;
                scene.add(helper);
              }
            }else{
              controls.setMode(props.controlMode);
            }
            controls.addEventListener("dragging-changed", callback)
            return () => controls.removeEventListener("dragging-changed", callback)
          }
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
