// import Easing from './easing';
import {IAnimationWidget} from '../interfaces/iwidget'
import {IPainter} from '../interfaces/ipainter'
import {AnimationOption,AnimationItem} from './type';
import assign from '../util/assign';
// import {removeItem} from '../util/array';

const requestAnimFrame = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
//@ts-ignore
window.mozRequestAnimationFrame ||
//@ts-ignore
window.oRequestAnimationFrame ||
//@ts-ignore
window.msRequestAnimationFrame ||
function(callback) {
    return window.setTimeout(callback, 1000 / 60);
}

const cancelAnimFrame = window.cancelAnimationFrame || 
window.webkitCancelAnimationFrame ||
//@ts-ignore
window.mozCancelAnimationFrame ||
//@ts-ignore
window.oCancelAnimationFrame ||
//@ts-ignore
window.msCancelAnimationFrame || 
function(){}

const Animation:{
    animationItemList:AnimationItem[]
    animationFlag:boolean
    addAnimationWidget:(widget:IAnimationWidget,option?:AnimationOption)=>void
    startAnimation:(painter:IPainter,draw:()=>void)=>void
    stopAnimation:()=>void
    callback?:()=>void
} = {
    animationItemList:[],
    animationFlag:false,
    addAnimationWidget(widget:IAnimationWidget,option?:AnimationOption){
        const aniOption = assign({duration:1200},option || {}) as AnimationOption
        Animation.animationItemList.push({
            widget,
            option:aniOption
        });
    },
    // removeAnimationWidget(item:AnimationItem){
    //     removeItem(Animation.widgets,item);
    // },
    // transtion(transtion:(changeTm:number)=>void,opt:{
    //     name:string,
    //     duration:number
    // }){

    // },
    stopAnimation(){
        if(!Animation.animationFlag)  return;
        Animation.animationItemList.forEach((animationItem)=>{
            animationItem.widget.onComplete();
        })
        cancelAnimFrame(this.callback);
        this.callback = null
        Animation.animationFlag = false;
        Animation.animationItemList = [];
    },
    startAnimation(painter:IPainter,draw:()=>void){
        if(Animation.animationFlag) {
            return
        }
        const {animationItemList} = Animation;
        animationItemList.forEach((item)=>{
            item.widget.onStart();
        })
        let startTm = Date.now();
        const callback = function(){
            const diffTm = (Date.now() - startTm);
            const reseverdWidgets = [];
            for(let i = 0; i < animationItemList.length; i++){
                const {widget,option} = animationItemList[i];
                const {duration} = option;
                if(diffTm > duration){
                    widget.transtion(duration,duration)
                    widget.draw(painter)
                    widget.onComplete();
                }else{
                    const ret = widget.transtion(diffTm,duration);
                    widget.draw(painter)
                    if(ret !== false){
                        reseverdWidgets.push(animationItemList[i]);
                    }else{
                        widget.onComplete();
                    }
                    
                }
            }
            painter.clear();
            draw();
            Animation.animationItemList = reseverdWidgets;
            if(reseverdWidgets.length > 0){
                requestAnimFrame(callback)
            }else{
                Animation.animationFlag = false;
            }
        }
        this.callback = callback;
        requestAnimFrame(callback)
        Animation.animationFlag = true;
    }
}


export default Animation