import React, { useEffect, useState, useRef, CSSProperties } from 'react';
function FrameControl(props:any){
    function backFrameCount(){
        var result = props.currentFrameNum - 1;
        if(result < 0)result = 0;
        props.setCurrentFrameNum(result);
    }
    function nextFrameCount(){
        const result = props.currentFrameNum + 1;
        props.setCurrentFrameNum(result);
    }
    return (
        <div style={{textAlign: "center"}}>
            <p style={{color:"white",fontSize:10}}>フレーム操作</p>
            <div>
                <input type="button" value="<" onClick={backFrameCount}/>
                <input type="text" style={{width:50}} value={props.currentFrameNum}/>
                <input type="button" value=">" onClick={nextFrameCount}/>
            </div>
        </div>
      );
}
export default FrameControl;