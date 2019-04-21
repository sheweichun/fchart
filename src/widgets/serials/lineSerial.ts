
import {ILazyWidget} from '../../interfaces/iwidget';
import {IPainter} from '../../interfaces/ipainter';
// import {IPoint} from '../../interfaces/ipoint'
import {IXAxis,IYAxis} from '../../interfaces/iaxis';
import {LineOption} from '../../interfaces/iline';
import Area from '../area';
import Line from '../line';
import Point from '../point';
import { PointOption } from '../../interfaces/ipoint';
import Animation from '../../animation/index';
import assign from '../../util/assign';


export type LineSerailOption = {
    data:number[]
    area:Area
    xAxis:IXAxis,
    yAxis:IYAxis
    pointStyle?:PointOption
    lineStyle?:LineOption
}

export default class LineSerial implements ILazyWidget{
    area:Area
    xAxis:IXAxis
    yAxis:IYAxis
    initFlag:boolean
    lineView:Line
    tickPointList:Array<Point>
    option:LineSerailOption
    constructor(option:LineSerailOption){
        this.option = option
    }
    init(){
        const {area,data,xAxis,yAxis,lineStyle,pointStyle} = this.option
        this.area = area;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        const tickPoints = []
        const newData = data.map((value,index)=>{
            const isTickPoint = index % xAxis.axis.tickUnit === 0;
            const posX = xAxis.getXbyIndex(index,area.left)
            const posY = yAxis.getYByValue(value)
            const startX = posX, startY= yAxis.getYByValue(0);
            // ,diffX = posX - startX,diffY = posY - startY;
            const pos = {
                x:startX,
                y:startY,
                targetX:posX,
                targetY:posY,
                startX : startX,
                startY: startY
            }
            if(isTickPoint){
                const tickPoint = new Point(assign({},pointStyle || {},pos))
                Animation.addAnimationWidget(tickPoint)
                tickPoints.push(tickPoint)
    
            }
            return pos 
        })
        this.tickPointList = tickPoints
        this.lineView = new Line(newData,lineStyle)
        Animation.addAnimationWidget(this.lineView)
    }
    draw(painter:IPainter){
        this.lineView.draw(painter);
        this.tickPointList.forEach((tickPoint)=>{
            tickPoint.draw(painter);
        })
    }
}