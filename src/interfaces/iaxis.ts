
import {IPoint} from './ipoint';
import {IXYWidget,ILazyWidget} from './iwidget';
import {IPainter} from './ipainter';

export type AxisTickLabel = {
    start:number
    end:number
    startLabel:number
    base:number
    label:string
}



export type AxisTickOpt = {
    show:boolean
    lineWidth:number
    color:string
}

export type AxisLabelOpt = {
    show:boolean
    fontSize?:number
    fontFamily?:string
    fontWeight?:string
    color?:string
}

export type AxisLineOpt = {
    show:boolean
    lineWidth:number
    color:string
}

// export type YAxisOpt = {
//     max:number,
//     min:number
// }

export interface BaseAxisOpt {
    reverse?:boolean,
    tickLen?:number // 
    offset?:number,
    boundaryGap?:boolean,
    axisTick?:AxisTickOpt
    axisLine?:AxisLineOpt
    axisLabel?:AxisLabelOpt
}



export interface AxisOpt extends BaseAxisOpt {
    x:number,
    y:number,
    labelBase:number,
    splitNumber:number,
    data:Array<string | number>,
    length:number,
    horizontal?:boolean,
}

export interface YAxisOpt extends BaseAxisOpt{
    
}

// export abstract class TickAndLabel{
//     tickStart:IPoint
//     tickEnd:IPoint
//     // private _axis:IAxis
//     constructor(protected _axis:IAxis){}
//     drawTick(ctx:CanvasRenderingContext2D){
//         const {tickStart,tickEnd} = this;
//         ctx.beginPath()
//         ctx.moveTo(tickStart.x,tickStart.y);
//         ctx.lineTo(tickEnd.x,tickEnd.y);
//         ctx.stroke();
//     }
//     abstract draw(painter:IPainter):void
// }


export interface IAxis extends IXYWidget{
    // ticks:TickAndLabel[]
    start:IPoint
    end:IPoint
    tickWidth:number
    tickUnit:number
    unitWidth:number
    length:number
    axisTickOpt:AxisTickOpt
    axisLabelOpt:AxisLabelOpt
    axisLineOpt:AxisLineOpt
}


export interface IYAxis extends ILazyWidget{
    max:number
    min:number
    range:number
    getYByValue(val:number):number
    getUnitWidth():number
    // getLenth():number
}

export interface IXAxis extends ILazyWidget{
    axis:IAxis
    // getUnitWidth():number
    // getBoundaryGapLengh():number
    getXbyIndex(index:number,baseLeft:number):number
    // getLenth():number
}

export type XAxisOption = {
    isTop?:boolean,
    // max:number,
    // min:number,
    axisIndex:number,
    axisOpt:AxisOpt
}
