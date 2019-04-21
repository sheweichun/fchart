import {IAnimationWidget} from '../interfaces/iwidget'

export type AnimationItem = {
    widget:IAnimationWidget,
    option:AnimationOption
}

export type AnimationOption = {
    // easing?:string,
    duration:number,
    // onStart:()=>void
    // onCompleted:()=>void
}