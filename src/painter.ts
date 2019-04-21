import {IPainter,PainterOpt} from './interfaces/ipainter';




export default class Painter implements IPainter{
    width:number
    height:number
    private _ctx:CanvasRenderingContext2D
    currentDevicePixelRatio:number
    // retinaScaleFlag:boolean
    constructor(private _canvas:HTMLCanvasElement,opt:PainterOpt){
        const {width,height,forceRatio} = opt;
        this._ctx = _canvas.getContext('2d');
        this.width = width || _canvas.width;
        this.height = height || _canvas.height;
        this.retinaScale(forceRatio)
    }
    get ctx():CanvasRenderingContext2D{
        return this._ctx
    }
    clear(){
        this._ctx.clearRect(0,0,this.width,this.height)
    }
    retinaScale(forceRatio:number) {
        const pixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        //@ts-ignore
        if(this._canvas.$$retinaScaleFlag) return 
        this.currentDevicePixelRatio = pixelRatio;
		if (pixelRatio === 1) {
			return;
        }
        const {_canvas,width,height,_ctx} = this;  
		_canvas.height = height * pixelRatio;
        _canvas.width = width * pixelRatio;
		_ctx.scale(pixelRatio, pixelRatio);
		// If no style has been set on the canvas, the render size is used as display size,
		// making the chart visually bigger, so let's enforce it to the "correct" values.
		// See https://github.com/chartjs/Chart.js/issues/3575
		if (!_canvas.style.height && !_canvas.style.width) {
			_canvas.style.height = height + 'px';
			_canvas.style.width = width + 'px'; 
        }
        //@ts-ignore
        this._canvas.$$retinaScaleFlag = true; 
	}
}