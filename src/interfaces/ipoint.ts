import {IAnimationWidget} from './iwidget';

export type IPoint = {
    x:number,
    y:number
}

export interface IPointWidet extends IAnimationWidget{
    x:number,
    y:number
    diffX:number
    diffY:number
    startX:number
    startY:number
    targetX:number
	targetY:number
    borderColor?:string
    borderWidth?:number
    backgroundColor?:string
    rotation?:boolean
    radius?:number
    pointStyle?:object | string
}

export type PointOption = {
    x?:number,
    y?:number,
    startX?:number,
    startY?:number,
    targetX?:number,
    targetY?:number,
    borderColor?:string
    borderWidth?:number
    backgroundColor?:string
    rotation?:boolean
    radius?:number
    type?:object | string
}