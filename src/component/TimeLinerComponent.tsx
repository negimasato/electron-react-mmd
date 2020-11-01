import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Face3, Geometry, MorphTarget, SkinnedMesh } from 'three';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { ScrollableCanvasContainer, Canvas } from 'react-scrollable-canvas';


const WIDTH = 300;
const HEIGHT = 300;
const LARGE_WIDTH = 600;
const LARGE_HEIGHT = 600;
const CIRCLE_RADIUS = 5;
const CIRCLE_SIZE = 30;


const w = 15;
const itemListHeight = 40;
const frameHeight = 140;
const canvasStyle = {
  float:"right",
  // position: 'absolute',
  // backgroundColor: "green",
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
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isExpandFaceList, setIsExpandFaceList] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([]);
  const [itemLists, setItemLists] = useState<ItemList[]>([]);
  const [selectKeyFrame, setSelectKeyFrame] = useState<KeyFrame|null>(null);
  const [currentFrameNum, setCurrentFrameNum] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const keyFrameCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const selectLineCanvasRef = useRef<HTMLCanvasElement>(null);
  const itemListRef = useRef<HTMLDivElement>(null);


  var skinnedMesh:SkinnedMesh = props.bonelists;
  

  useEffect(() => {
    draw();
    //load
    const KAO=1;
    if(!skinnedMesh)return;
    skinnedMesh?.morphTargetInfluences?.map((no,index) => {
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

     console.log('width=' + width);
    if(ctx && keyCtx && width && height) {
      setNowWidth(width);
      setNowHeight(height);
      var c = 0;
      var frame = 10;
      // 縦線
      for(var i = 0;i < width;i = i+w){
        c++
        if(c === 10) {
          drawVerticalLine(ctx,i,height);
          drawFrameText(ctx,frame.toString(),i,70);
          frame=frame + c;
          c=0;
        }else{
          drawVerticalLine(ctx,i,height);
        }
      }
      drawHorizonLines(keyCtx,height);
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
        // console.log('設定しているフレーム');
        // const itemList = itemLists[keyframe.itemListNum];
        if(skinnedMesh.morphTargetInfluences) {
          console.log("keyframe.itemListNum=" + keyframe.itemListNum);
          console.log("p=" + keyframe.p);
          skinnedMesh.morphTargetInfluences[keyframe.itemListNum - 2] = keyframe.p;
        }
      }
    }
  }

  function drawVerticalLine(ctx:CanvasRenderingContext2D,x:number,height:number) {
    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 80);
    ctx.lineTo(x, 100);
    ctx.closePath();
    ctx.stroke();
  };
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
    // console.log("e.clientX=" + e.clientX+",e.clientY=" + e.clientY);
    // console.log("rect.left=" + rect.left+",rect.top=" + rect.top);
    const x = e.clientX - 200;
    const y = e.clientY - rect.top;
    var lineX = 0;
    const ctx = selectLineCanvasRef.current?.getContext('2d');
    if(!ctx)return;
    ctx.clearRect(0, 0, nowWidth, 400);
    // draw();

    if((x % w) < (w/2)){
      lineX = (x - (x % w));
    } else {
      lineX = (x - (x % w)) + w;
    }
    // console.log("lineX=" + lineX);
    
    setCurrentFrameNum((lineX / w) + 1);
    ctx.strokeStyle="#FF0000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lineX, 20);
    ctx.lineTo(lineX, 300);
    ctx.closePath();
    ctx.stroke();
  }
  function onDoubleClickHandler(e:React.MouseEvent<HTMLDivElement, MouseEvent>){
    const ctx = keyFrameCanvasRef.current?.getContext('2d');
    if(!ctx)return;
    const DIAMOND_SIZE = 10;
    const LINEHEIGHT = 2;
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    var x = e.clientX - rect.left - 0 - (DIAMOND_SIZE * 0.5);
    var y = e.clientY - rect.top;
    // console.log("x=" + x + ",y=" + y);

    if((x % w) < (w/2)){
      x = x - (x % w);
    } else {
      x = (x - (x % w)) + w;
    }
    console.log("keyFrameX=" + x);
    const yCenter = y - (DIAMOND_SIZE * 0.5);
    // console.log(((Math.floor((yCenter - 144) / itemListHeight) + 1) * (itemListHeight + LINEHEIGHT)) + 144 - DIAMOND_SIZE);
    const itemListNum = Math.floor((yCenter) / itemListHeight) + 1;
    const keyFrameNum = (x / w) + 1;
    console.log("keyFrameNum="+keyFrameNum);
    const y2 = ((itemListNum * (itemListHeight + LINEHEIGHT)) - DIAMOND_SIZE);
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
    // console.log("onMouseMoveHandler");
    const node = e.target as HTMLElement;
    const rect = node.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if(selectKeyFrame){
      // console.log('y=' + y);
      // console.log(((selectKeyFrame.itemListNum - 1)  + (frameHeight + 4)) - 100 + "以上　" + ((((selectKeyFrame.itemListNum - 1) * (itemListHeight + 2))) + (frameHeight + 4) - selectKeyFrame.height - 100) + "未満");
      if(y > (selectKeyFrame.itemListNum - 1) + (frameHeight + 4) - 100 && y < (((selectKeyFrame.itemListNum - 1) * (itemListHeight + 2))) + (frameHeight + 4) - selectKeyFrame.height - 100) {
        selectKeyFrame.y = y;
        const currentRange = Math.abs(y - ((itemListHeight * selectKeyFrame.itemListNum) - selectKeyFrame.height + 1));
        const maxRange = (itemListHeight - selectKeyFrame.height);
        console.log("current=" + currentRange + ",maxRange=" + maxRange);
        const p = currentRange / maxRange;
        selectKeyFrame.p = p;
        // console.log(p);
        ReDrawKeyFrames();
        drawMmdFromCurrentFrameNum();
        const keyCtx = keyFrameCanvasRef.current?.getContext('2d');
        if(!keyCtx)return;
        drawHorizonLines(keyCtx,nowHeight);
      }
      
    }
    // console.log("x=" + x + ",y=" + y);
  }

  function onMouseUpHandler(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
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
    return (
      <div>
        <div style={{height:itemListHeight,border: "1px solid #FFFFFF",color:"white"}}>
          {isExpandFaceList ? <span onClick={(e) => setIsExpandFaceList(false)}><RemoveIcon /></span> : <span onClick={(e) => setIsExpandFaceList(true)}><AddIcon /></span>}表情
        </div>
        { isExpandFaceList ? geometry.morphTargets.map((morph,index) => {
          return (
              <div key={index} style={{height:itemListHeight,border: "1px solid #FFFFFF"}}>
                <span style={{color:"white",lineHeight:"40px",padding:"0px 0px 0px 50px"}}>{morph.name}</span>
              </div>
          )
        }): null}
      </div>
    );
  }

  function onScroll(scrollTop: number, scrollLeft: number){
    setScrollTop(scrollLeft);
    setScrollLeft(scrollLeft);
  };
  function onScrollHandler(e: React.UIEvent<HTMLDivElement, UIEvent>){
    const node = e.target as HTMLElement;
    const top = node.scrollTop;
    const ctx = keyFrameCanvasRef.current?.getContext('2d');
    if(!ctx)return;
    // ctx.transform()
  }
  return (
    <div>
      <div>
        <div style={{width:"200px",float:"left" }}>
          <div style={{height:"100px",border: "1px solid #FFFFFF"}}>
            <p style={{color:"white"}}>フレーム</p>
            <input type="text" value={currentFrameNum}/>
          </div>
        </div>
        {/* <ScrollableCanvasContainer
            width={nowWidth-200}
            height={nowHeight}
            largeWidth={LARGE_WIDTH}
            largeHeight={LARGE_HEIGHT}
            onScroll={onScroll}
          >
            <Canvas
              ref={canvasRef}
              width={nowWidth-200}
              height={nowHeight}
              translateX={scrollLeft}
              translateY={scrollTop}
            />
            <Canvas
              ref={keyFrameCanvasRef}
              width={nowWidth-200}
              height={nowHeight}
              translateX={scrollLeft}
              translateY={scrollTop}
            />
        </ScrollableCanvasContainer> */}
        <canvas
        style={canvasStyle}
        ref={canvasRef}        
        width={nowWidth-200}
        height={100}
        >
        </canvas>
        <canvas
        style={{clear:"both",position: 'absolute', zIndex:-2}}
        ref={selectLineCanvasRef}        
        width={nowWidth-200}
        height={300}
        >
        </canvas>
      </div>
      <div style={{overflow:"scroll",height:200,clear:"left"}}
                onMouseDown={onMouseDownHandler}
                onMouseMove={onMouseMoveHandler}
                onMouseUp={onMouseUpHandler}
                onDoubleClick={onDoubleClickHandler}
                onScroll={onScrollHandler}
                onClick={onClickHandler}>
        <div style={{width:"200px",float:"left" }} ref={itemListRef}>
            { setFaces() }
        </div>
        <div>
          <canvas 
          id="keyFrameCanvas"
          style={{  float:"right",
          // backgroundColor: "green",
          zIndex:-1}}
          width={nowWidth-200-17}
          height={200}
          ref={keyFrameCanvasRef}>
          </canvas>
        </div>
      </div>
    </div>
  );
}

export default TimeLiner;

