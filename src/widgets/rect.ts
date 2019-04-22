
import {IAnimationWidget} from '../interfaces/iwidget';
import {IPainter} from '../interfaces/ipainter';
import Easing from '../animation/easing';
// import {IPoint} from '../interfaces/ipoint';

import {RectOption} from '../interfaces/irect';
// import Global from '../util/global';
import assign from '../util/assign';

export default class Rect implements IAnimationWidget{
    color:string
    startHeight:number = 0
    height:number = 0
    diffHeight:number
    targetHeight:number
    constructor(private x,private y,private width,height,option:RectOption){
        this.targetHeight = height;
        this.diffHeight = height;
        const mergeOption = assign({
            color:'blue',
        },option || {}) as RectOption;
        const {color} = mergeOption;
        this.color = color;
    }
    onComplete(){
        this.startHeight = this.height
    }
    onStart(){
        this.diffHeight = this.targetHeight;
    } 
    transtion(tm:number,duration:number):boolean | void{
        this.height = Easing.easeInOutCubic(tm,this.startHeight,this.diffHeight,duration);
    }
    draw(painter:IPainter){
        const {ctx} = painter;
        const {x,y,width,height,color} = this
        ctx.fillStyle = color;
        ctx.fillRect(x,y,width,height);
    }
}