import {IWidget} from './iwidget';

export type AreaOption = {
    width:number
    height:number
    x:number
    y:number
}

export interface IArea{
    isInArea(widget:IWidget):boolean
}

