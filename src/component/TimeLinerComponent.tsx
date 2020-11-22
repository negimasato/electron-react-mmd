import React, { useEffect, useState, useRef, CSSProperties } from 'react';
import {Geometry, SkinnedMesh } from 'three';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import FrameControl from './FrameControl';

const w = 15;
const itemListHeight = 20;
const frameHeight = 140;
const DIAMOND_SIZE = 10;
const LINEHEIGHT = 2;

const canvasStyle:CSSProperties = {
  float:"right",
  padding: "5",
  zIndex:-3
}
class ItemList{
  public group:number;
  public no:number;
  constructor(group:number,no:number){
    this.group = group;
    this.no = no;
  }
}
class KeyFrame{
  public x:number;
  public y:number;
  public width:number;
  public height:number;
  public isSelect:boolean;
  public itemListNum:number;
  public keyFrameNum:number;
  public p:number;
  constructor(x:number,y:number,itemListNum:number,keyFrameNum:number){
    this.x = x;
    this.y = y;
    this.itemListNum = itemListNum;
    this.keyFrameNum = keyFrameNum;
    this.width = 10;
    this.height = 10;
    this.isSelect = false;
    this.p = 0;
  }
  public isPointInside(x:number, y:number) {
    return (x >= (this.x - (this.width / 2)) && x <= this.x + (this.width * 0.5) && y >= this.y - (this.height / 2) && y <= this.y + this.height);
  }
  public draw(ctx:CanvasRenderingContext2D){
    ctx.beginPath()
    ctx.strokeStyle="#FFFFFF";
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y + this.width / 2);
    ctx.lineTo(this.x, this.y + this.width);
    ctx.lineTo(this.x - this.width / 2, this.y + this.width / 2);
    ctx.closePath();
    if(this.isSelect){
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fill();
    }
    ctx.stroke();
  }
  public clear(ctx:CanvasRenderingContext2D){
    ctx.clearRect(this.x,this.y,this.width,this.height);
  }
}

function TimeLiner(props:any) {
  const [nowWidth, setNowWidth] = useState(500);
  const [nowHeight, setNowHeight] = useState(100);
  const [isExpandFrameGroupList, setisExpandFrameGroupList] = useState([false,false,false,false,false,false,false,false,false,false,false]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const [itemLists, setItemLists] = useState<ItemList[]>([]);
  const [selectKeyFrame, setSelectKeyFrame] = useState<KeyFrame|null>(null);
  const [currentFrameNum, setCurrentFrameNum] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const keyFrameCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const selectLineCanvasRef = useRef<HTMLCanvasElement>(null);
  const itemListRef = useRef<HTMLDivElement>(null);


  var skinnedMesh:SkinnedMesh = props.mesh;
  

  useEffect(() => {
    draw();
    //load
    const KAO=1;
    if(!skinnedMesh)return;
    skinnedMesh?.morphTargetInfluences?.map((no,_index) => {
      const itemList = new ItemList(KAO,no);
      itemLists.push(itemList);
    });
    setItemLists(itemLists);
  });

  function draw(){
    const ctx = canvasRef.current?.getContext('2d');
    const keyCtx = keyFrameCanvasRef.current?.getContext('2d');
    const width = props.width;
    const height = itemListRef.current?.clientHeight;

    if(ctx && keyCtx && width && height) {
      setNowWidth(width);
      setNowHeight(height);
      var c = 0;
      var frame = 10;
      // 縦線
      for(var i = 0;i < width;i = i+w){
        c++
        if(c === 10) {
          drawVerticalLine(keyCtx,i,height);
          drawFrameText(ctx,frame.toString(),i,10);
          frame=frame + c;
          c=0;
        }else{
          drawVerticalLine(keyCtx,i,height);
        }
      }
      drawHorizonLines(keyCtx,height);
      drawSelectFrameLine(keyCtx);
    }
  }

  function drawHorizonLines(ctx:CanvasRenderingContext2D,height:number){
      //横線
      for(var i = 0;i < height;i = i+(itemListHeight + 2)){
        ctx.strokeStyle="#FFFFFF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(nowWidth, i);
        ctx.closePath();
        ctx.stroke();
      }
  }

  function drawMmdFromCurrentFrameNum(){
    const keyFrameNum = currentFrameNum;
    for(var keyframe of keyFrames){
      if(keyframe.keyFrameNum === keyFrameNum){
        if(skinnedMesh.morphTargetInfluences) {
          skinnedMesh.morphTargetInfluences[keyframe.itemListNum - 2] = keyframe.p;
        }
      }
    }
  }

  function drawVerticalLine(ctx:CanvasRenderingContext2D,x:number,height:number) {
    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.closePath();
    ctx.stroke();
  }

  function drawFrameText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number) {
    var textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(255, 255, 255)';
    ctx.fillText(text, x - (textWidth / 2), y);
  }

  function ReDrawKeyFrames(){
    const keyFrameCanvasCtx = keyFrameCanvasRef.current?.getContext('2d');
    if(!keyFrameCanvasCtx)return;
    keyFrameCanvasCtx.clearRect(0,0,nowWidth,nowHeight);
    for(var keyFrame of keyFrames){
      keyFrame.draw(keyFrameCanvasCtx);
    }
  }

  function onClickHandler(e:React.MouseEvent<HTMLDivElement, MouseEvent>){
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - 100;
    const y = e.clientY - rect.top;
    var lineX = 0;
    const ctx = selectLineCanvasRef.current?.getContext('2d');
    if(!ctx)return;
    ctx.clearRect(0, 0, nowWidth, 400);
    if((x % w) < (w/2)){
      lineX = (x - (x % w));
    } else {
      lineX = (x - (x % w)) + w;
    }
    
    var elem = window.document.elementFromPoint(1, e.clientY);
    if(!elem)return;
    // @ts-ignore
    const frameId = elem.dataset.frameId;
    if(frameId) {
      // console.log(skinnedMesh);
      props.setSelectObject(frameId)
    }
    setCurrentFrameNum((lineX / w) + 1);
    drawSelectFrameLine(ctx);
  }

  /**
   * drawSelectFrameLine
   * 選択しているフレーム番号に線を引く
   * @param ctx 
   */
  function drawSelectFrameLine(ctx: CanvasRenderingContext2D){
    const x = currentFrameNum * w;
    const height = itemListRef.current?.clientHeight;
    ctx.strokeStyle="#66cc99";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.closePath();
    ctx.stroke();
  }

  function onDoubleClickHandler(e:React.MouseEvent<HTMLDivElement, MouseEvent>){
    const ctx = keyFrameCanvasRef.current?.getContext('2d');
    if(!ctx)return;
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    if(!itemListRef.current?.clientWidth)return;
    var x = e.clientX - itemListRef.current?.clientWidth;
    var y = e.clientY - rect.top;

    if((x % w) < (w/2)){
      x = (x - (x % w));
    } else {
      x = (x - (x % w)) + w;
    }
    const itemListNum = Math.floor(y / (itemListHeight + LINEHEIGHT)) + 1;
    const keyFrameNum = (x / w) + 1;
    // console.log("keyFrameNum="+keyFrameNum);
    const y2 = ((itemListNum * (itemListHeight + LINEHEIGHT)) - DIAMOND_SIZE);
    // console.log("itemListNum=" + itemListNum + ",y=" + y);
    
    const keyFrame = new KeyFrame(x,y2,itemListNum,keyFrameNum);
    keyFrame.draw(ctx);
    keyFrames.push(keyFrame);
    
    setKeyFrames(keyFrames);
  }

  function onMouseDownHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    // console.log("x=" + x + ",y=" + y);
    // keyFrameチェック
    const keyFrameCanvasCtx = keyFrameCanvasRef.current?.getContext('2d');
    if(!keyFrameCanvasCtx)return;
    for(var keyFrame of keyFrames){
      // console.log("selectX=" + x + ",selectY=" + y);
      // console.log("frameX=" + keyFrame.x + ",frameY=" + keyFrame.y);
      if(keyFrame.isPointInside(x,y)){
        keyFrame.isSelect = true;
        setIsDragMode(true);
        setSelectKeyFrame(keyFrame);
        // console.log("入ってる");
      }else{
        // console.log("入ってない");
        keyFrame.isSelect = false;
      }
      keyFrame.clear(keyFrameCanvasCtx);
      keyFrame.draw(keyFrameCanvasCtx);
    }
    setKeyFrames(keyFrames);
  }

  function onMouseMoveHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
    if(!isDragMode)return;
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if(selectKeyFrame){
      const maxY = (((selectKeyFrame.itemListNum - 1) * (itemListHeight + 2))) + (frameHeight + 4) - selectKeyFrame.height - 100;
      if(y > (maxY - itemListHeight) && y < maxY) {
        selectKeyFrame.y = y;
        const currentRange = maxY - y;
        const maxRange = (itemListHeight - selectKeyFrame.height);
        const p = currentRange / maxRange;
        selectKeyFrame.p = p;
        ReDrawKeyFrames();
        drawMmdFromCurrentFrameNum();
        const keyCtx = keyFrameCanvasRef.current?.getContext('2d');
        if(!keyCtx)return;
        drawHorizonLines(keyCtx,nowHeight);
      } 
    }
  }

  function onMouseUpHandler(_e: React.MouseEvent<HTMLDivElement, MouseEvent>){
    if(isDragMode){
      setIsDragMode(false);
      setSelectKeyFrame(null);
    }
  }

  function setFaces(){
    if(!skinnedMesh) {
      return null;
    }
    const geometry:Geometry = skinnedMesh.geometry as Geometry;
    var list = [];
    // @ts-ignore
    const mmdData:any = geometry.userData.MMD;
    for(let i = 1; i < mmdData.frames.length ; i++){
      //グループ
      list.push(
        <div style={{height:itemListHeight,border: "1px solid #FFFFFF",color:"white",fontSize:10}}>
          {isExpandFrameGroupList[i] ? 
            <span onClick={(e) => toggleGroup(i,false)}><RemoveIcon fontSize="small" style={{display:"inline-block",verticalAlign: "middle"}}/></span> : 
            <span onClick={(e) => toggleGroup(i,true)} ><AddIcon    fontSize="small" style={{display:"inline-block",verticalAlign: "middle"}}/></span>}
            <p style={{display:"inline",verticalAlign:"middle"}}>{mmdData.frames[i].name}</p>
        </div>
      )
      if(isExpandFrameGroupList[i] === false)continue;
      for(var ii = 0; ii < mmdData.frames[i].elements.length; ii++) {
        const index:number = mmdData.frames[i].elements[ii].index
        if(mmdData.frames[i].type === 1){
          //表情
          list.push(
            <div key={index} style={{height:itemListHeight,border: "1px solid #FFFFFF",fontSize:10}} data-frame-id={index}>
              <span data-frame-id={index} style={{color:"white",padding:"0px 0px 0px 20px"}}>{mmdData.morphs[index].name}</span>
            </div>
          )
        }else{
          //それ以外
          list.push(
            <div key={index} style={{height:itemListHeight,border: "1px solid #FFFFFF",fontSize:10}} data-frame-id={index}>
              <span data-frame-id={index} style={{color:"white",padding:"0px 0px 0px 20px"}}>{mmdData.bones[index].name}</span>
            </div>
          )
        }
      }
    }
    return (
      <div>
        {list}
      </div>
    );
  }

  function toggleGroup(groupNo:number,isOpen:boolean){
    var list:boolean[] = [];
    isExpandFrameGroupList.forEach((e, index) => {
      if(index === groupNo){
        list.push(isOpen);
      }else{
        list.push(e);
      }
    });
    setisExpandFrameGroupList(list);
  }

  return (
    <div>
      <div>
        <FrameControl currentFrameNum={currentFrameNum} setCurrentFrameNum={setCurrentFrameNum}/>
        <div style={{width:"100px",float:"left" }}>
          <div style={{height:"20px",border: "1px solid #FFFFFF"}}></div>
        </div>
        <canvas
        style={canvasStyle}
        ref={canvasRef}        
        width={nowWidth-100}
        height={20}
        >
        </canvas>
        <canvas
        style={{clear:"both",position: 'absolute', zIndex:-2}}
        ref={selectLineCanvasRef}        
        width={nowWidth-100}
        height={300}
        >
        </canvas>
      </div>
      <div style={{overflow:"scroll",height:300,clear:"left"}}
                onMouseDown={onMouseDownHandler}
                onMouseMove={onMouseMoveHandler}
                onMouseUp={onMouseUpHandler}
                onDoubleClick={onDoubleClickHandler}
                onClick={onClickHandler}>
        <div style={{width:"100px",float:"left" }} ref={itemListRef}>
            { setFaces() }
        </div>
        <div>
          <canvas 
          id="keyFrameCanvas"
          style={{  float:"right",
          zIndex:-1}}
          width={nowWidth-117}
          height={itemListRef.current?.clientHeight}
          ref={keyFrameCanvasRef}>
          </canvas>
        </div>
      </div>
    </div>
  );
}

export default TimeLiner;

