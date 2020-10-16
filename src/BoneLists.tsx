import React, { useEffect } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import { Bone, Face3, Geometry, Object3D, SkinnedMesh } from 'three';
import { MorphTarget } from 'three/src/core/Geometry';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      maxHeight: 600,
      overflow: 'auto',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

export default function BoneLists(props: any) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const skinnedMesh:SkinnedMesh = props.bonelists;

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
      console.log('useEffect')
        // console.log(props.bonelists);
  });

  function selectFace(e:number) {
    if(skinnedMesh.morphTargetInfluences) {
      for(var i = 0; i < skinnedMesh.morphTargetInfluences.length;i++){
        if(i === e) {
          
          skinnedMesh.morphTargetInfluences[i] = 1;
        }else {
          skinnedMesh.morphTargetInfluences[i] = 0;
        }
      }
      
    }
  }

  function getFaces() {
    if(!skinnedMesh) {
      return null;
    }
    const geometry:Geometry = skinnedMesh.geometry as Geometry;
    return geometry.morphTargets.map((morph,index) => {
      return (
        <ListItem key={index} button className={classes.nested}>
          <ListItemText primary={morph.name} onClick={() => selectFace(index)}/>
        </ListItem>
      )
    })
  }

    function setBones() {
        console.log('setBoneが呼ばれた');
        if(!skinnedMesh) {
            return null;
        }
        // const json = skinnedMesh.
        const geometry:Geometry = skinnedMesh.geometry as Geometry;
        // console.log(geometry.morphTargets);
        // var json = skinnedMesh.toJSON();
        // console.log(json);
        return null;
        // return skinnedMesh.c.map((bone:any) => {
        //     const children = bone.children;
        //     if(bone.parent != null) {
        //       return null;
        //     }
        //     return (
        //         <>
        //             {bone.children.length > 0 ? <ListItem >
        //                 <ListItemText primary={bone.name} />
        //                 {/* { children.map((child:Object3D) => {
        //                     return (
        //                         <ListItem >
        //                             <ListItemText primary={child.name} />
        //                         </ListItem>
        //                     )
        //                 })} */}
        //             </ListItem>: null }
        //         </>
        //     );
        // });
    }

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          ボーンリスト
        </ListSubheader>
      }
      className={classes.root}
    >
      <ListItem button onClick={handleClick}>
        <ListItemText primary="表情" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          { getFaces() }
        </List>
      </Collapse>
      { setBones() }
    </List>
  );
}