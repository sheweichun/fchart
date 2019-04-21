

export type PainterOpt = {
    forceRatio?:number,
    width?:number,
    height?:number
}



export interface IPainter{
    width:number
    height:number
    ctx:CanvasRenderingContext2D
    currentDevicePixelRatio:number
    clear()
    // new (canvas:HTMLCanvasElement,opt:PainterOpt)
}