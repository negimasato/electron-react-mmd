import React, { useEffect, useState, useRef, CSSProperties } from 'react';
import { ModelClass } from '../classes/ModelClass';
function ModelControl(props:any){

    function onChangeModelSelect(event: React.ChangeEvent<HTMLSelectElement>){
        props.setActiveModelId(event.target.value);
    }
    function onLoadModel(){
        console.log('onLoadModel');
        window.ipcRenderer.send('openFileFromRenderer');
    }
    function onDeleteModel()
    {
        console.log('onDeleteModel');
    }
    return (
        <div style={{textAlign: "center"}}>
            <p style={{color:"white",fontSize:10,margin:"5px 0px 0px 0px"}}>モデル操作</p>
            <div style={{padding:"0px 10px 10px 10px"}}>
                <div>
                    <select style={{width:"100%"}} onChange={onChangeModelSelect}>
                        {props.models.map((model: ModelClass,index: number) => {
                            return(
                            <option value={model.id}>{model.modelName}</option>
                        )})}
                    </select>
                </div>
                <div>
                    <input type="button" style={{width:"50%"}} value="読み込み" onClick={onLoadModel}/>
                    <input type="button" style={{width:"50%"}} value="削除" onClick={onDeleteModel}/>
                </div>
            </div>
        </div>
      );
}
export default ModelControl;