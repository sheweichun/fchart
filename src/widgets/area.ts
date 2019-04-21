
import {IArea,AreaOption} from '../interfaces/iarea';
import {IXYWidget} from '../interfaces/iwidget';
// import {EPSILON} from '../util/constant';


export default class Area implements IArea{
    width:number
    height:number
    left:number
    right:number
    top:number
    bottom:number
    x:number
    y:number
    constructor(option:AreaOption) {
        const {width,height,x,y} = option;
        this.width = width
        this.height = height
        this.x = x;
        this.y = y;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        this.left = this.x - halfWidth
        this.right = this.x + halfWidth
        this.top = this.y - halfHeight
        this.bottom = this.y + halfHeight
    }
    isInArea(widget:IXYWidget){
		return widget.x > this.left && widget.x < this.right &&
        widget.y > this.top && widget.y < this.bottom ;
    }
}