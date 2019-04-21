
import {IArea} from './iarea'
import {IPainter} from './ipainter'

export interface IWidget{
    // x:number
    // y:number
    draw(painter:IPainter,area?:IArea):void
}

export interface ILazyWidget{
    init():void
    draw(painter:IPainter,area?:IArea):void
}

export interface IAnimationWidget{
    onStart:()=>void
    onComplete:()=>void
    transtion(changeTm:number,duration:number):boolean | void
    draw(painter:IPainter,area?:IArea):void
}

export interface IXYWidget extends IWidget{
    x:number
    y:number
}