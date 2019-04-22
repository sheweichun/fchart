
import {IAnimationWidget} from '../interfaces/iwidget';
import {IPainter} from '../interfaces/ipainter';
import {IPoint} from '../interfaces/ipoint';
import Easing from '../animation/easing';

import {LineOption} from '../interfaces/iline';
import {previousItem,nextItem} from '../util/array';
import {splineCurve,LinePoint} from '../util/math';
import Global from '../util/global';
import assign from '../util/assign';

function transformPoint(item:LinePoint,i:number,data:IPoint[]){
    const prevPo = previousItem(data,i);
    const point = item as LinePoint;
    const nextPoint = nextItem(data,i);
    const {next,previous} = splineCurve(prevPo,point,nextPoint,0.2);
    // point.controlPointPreviousX = previous.x;
    // point.controlPointPreviousY = previous.y;
    // point.controlPointNextX = next.x;
    // point.controlPointNextY = next.y;
    point.controlPointPreviousX = previous.x;
    point.controlPointPreviousY = previous.y;
    point.controlPointNextX = next.x;
    point.controlPointNextY = next.y;
    return point;
}

export default class Line implements IAnimationWidget{
    option:LineOption
    showData:LinePoint[]
    // transitionData:
    data:LinePoint[]
    constructor(data:IPoint[],option:LineOption){
        const mergeOption = assign({
            lineWidth:Global.defaultConfig.line.lineWidth,
            smooth:Global.defaultConfig.line.smooth,
        },option || {}) as LineOption;
        const {smooth} = mergeOption;
        if(smooth){
            this.data = data.map((item,i)=>{
                return transformPoint(item as LinePoint,i,data);
            })
        }else{
            this.data = data;
        }
        this.option = mergeOption;
    }
    onComplete(){
        this.data.forEach((item)=>{
            item.startX = item.x;
            item.startY = item.y;
            // item.diffY = item.targetY - item.startY;
        })
    }
    onStart(){
        this.data.forEach((item)=>{
            item.diffX = item.targetX - item.startX;
            item.diffY = item.targetY - item.startY;
        })
    } 
    transtion(tm:number,duration:number):boolean | void{
        const {smooth} = this.option 
        this.data.forEach((item,i)=>{
            item.y = Easing.easeInOutCubic(tm,item.startY,item.diffY,duration);
            smooth && transformPoint(item,i,this.data)
        })
    }
    simpleDraw(ctx:CanvasRenderingContext2D){
        const firstPoint = this.data[0];
        ctx.moveTo(firstPoint.x,firstPoint.y)
        for(let i = 1 ; i < this.data.length; i++){
            const point = this.data[i];
            ctx.lineTo(point.x,point.y)
        }
    }
    smoothDraw(ctx:CanvasRenderingContext2D){
        const firstPoint = this.data[0];
        ctx.moveTo(firstPoint.x,firstPoint.y)
        let flip = false;
        for(let i = 1 ; i < this.data.length; i++){
            const prevPo = previousItem(this.data,i);
            const point = this.data[i];
            ctx.bezierCurveTo(
                flip ? prevPo.controlPointPreviousX : prevPo.controlPointNextX,
                flip ? prevPo.controlPointPreviousY : prevPo.controlPointNextY,
                flip ? point.controlPointNextX : point.controlPointPreviousX,
                flip ? point.controlPointNextY : point.controlPointPreviousY,
                point.x,
                point.y);
        }
    }
    draw(painter:IPainter){
        const {ctx} = painter;
        const {lineWidth,color,smooth} = this.option
        ctx.beginPath()
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        smooth ? this.smoothDraw(ctx) : this.simpleDraw(ctx)
        ctx.stroke();
    }
}