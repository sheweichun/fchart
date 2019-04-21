
import {ILazyWidget} from '../../interfaces/iwidget';
import {IPainter} from '../../interfaces/ipainter';
// import {IPoint} from '../../interfaces/ipoint'
import Animation from '../../animation/index';
import {IXAxis,IYAxis} from '../../interfaces/iaxis';
import {RectOption} from '../../interfaces/irect';
import assign from '../../util/assign';
import Area from '../area';
import Rect from '../rect';

export type BarSerailOption = {
    data:number[]
    area:Area
    xAxis:IXAxis,
    yAxis:IYAxis
    barStyle?:RectOption
}

export default class BarSerial implements ILazyWidget{
    area:Area
    xAxis:IXAxis
    yAxis:IYAxis
    barViewList:Rect[]
    constructor(private option:BarSerailOption){
       
    }
    init(){
        const {area,data,xAxis,yAxis,barStyle} = this.option
        const mergeBarStyle = assign({
        },barStyle || {}) as RectOption;
        let {widthRatio,width:barWidth} = mergeBarStyle;
        if(widthRatio == null){
            widthRatio = 0.8 / xAxis.axis.tickUnit
        }
        if(barWidth == null){
            barWidth = widthRatio * xAxis.axis.tickWidth;
        }
        this.area = area;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.barViewList = data.map((value,index)=>{
            const yValue = yAxis.getYByValue(value);
            const rect =  new Rect(
                xAxis.getXbyIndex(index,area.left) - barWidth / 2,
                xAxis.axis.start.y,
                barWidth,
                (yValue - xAxis.axis.start.y),
                barStyle
            )
            Animation.addAnimationWidget(rect);
            return rect;
            // return new Rect(
            //     xAxis.getXbyIndex(index,area.left) - barWidth / 2,
            //     yValue,
            //     barWidth,
            //     (xAxis.axis.start.y- yValue),
            //     barStyle)
        })
    }
    draw(painter:IPainter){
        this.barViewList.forEach((barView)=>{
            barView.draw(painter);
        })
    }
}