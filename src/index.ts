import {YAxis,XAxis} from './widgets/axis';
import {AxisOpt} from './interfaces/iaxis'
import Painter from  './painter';
// import Text from './widgets/text'
import Area from './widgets/area';
import assign from './util/assign';
import {maxAndMin} from './util/math';
import LineSerial from './widgets/serials/lineSerial';
import BarSerial  from './widgets/serials/barSerial';
import { ILazyWidget } from './interfaces/iwidget';
import {LineOption} from './interfaces/iline';
import {RectOption} from './interfaces/irect';
import {curItem} from './util/array';
import Global from './util/global'
import Animation from './animation/index';
import { PointOption } from './interfaces/ipoint';

type ChartOption = {
    forceRatio?:number,
    width?:number,
    height?:number,
    xAxis?:AxisOpt,
    yAxis?:AxisOpt,
    padding:number[],
    series?:Array<SerialOption>
}

type SerialOption = {
    type:string,
    yAxisIndex:number
    xAxisIndex:number
    data:number[]
    pointStyle:PointOption
    lineStyle:LineOption
    barStyle:RectOption
}

const DEFAULT_CHART_OPTION:ChartOption = {
    padding:[40,40,40,40]
}

export default class Fchart{
    XAxisList:XAxis[] = []
    YAxisList:YAxis[] = []
    series:Array<ILazyWidget>
    painter:Painter
    paddingTop:number
    paddingRight:number
    paddingBottom:number
    paddingLeft:number
    paintArea:Area
    constructor(canvas:HTMLCanvasElement,option:ChartOption){
        const mergeOption = assign({},DEFAULT_CHART_OPTION,option);
        this.painter = new Painter(canvas,mergeOption);
        const {padding,series,xAxis,yAxis} = mergeOption;
        this.paddingTop = padding[0];
        this.paddingRight = padding[1];
        this.paddingBottom = padding[2];
        this.paddingLeft = padding[3];
        const {width,height} = this.painter; 
        const centerX = ((width - this.paddingRight) + this.paddingLeft) / 2
        const centerY = ((height - this.paddingBottom) + this.paddingTop) / 2
        this.paintArea = new Area({
            x:centerX,
            y:centerY,
            width:width - (this.paddingLeft + this.paddingRight),
            height:height - (this.paddingTop + this.paddingBottom)
        })
        this.createXYAxises(series,xAxis,yAxis);
        this.createSerialCharts(series);
        this.init();
        this.draw(); 
        Animation.startAnimation(this.painter,this.draw.bind(this));
    }
    createXYAxises(series:Array<SerialOption>,xAxis:AxisOpt,yAxis:AxisOpt){
        const yAxisItemList = [],xAxisItemList = []
        series.forEach((serial)=>{
            const {data,yAxisIndex = 0,xAxisIndex = 0} = serial
            let yAxisItem = yAxisItemList[yAxisIndex];
            let xAxisItem = xAxisItemList[xAxisIndex]; 
            if(yAxisItem == null){
                yAxisItem = {max:data[0],min:data[0]}
                yAxisItemList[yAxisIndex] = yAxisItem;
            }
            if(xAxisItem == null){
                xAxisItem = {max:data[0],min:data[0]}
                xAxisItemList[xAxisIndex] = xAxisItem;
            }
            let {max,min} = maxAndMin(data,yAxisItem);
            if(min > 0) {min = 0}
            yAxisItem.min = min
            yAxisItem.max = max
            xAxisItem.min = min
            xAxisItem.max = max
        })
        this.YAxisList = yAxisItemList.map((item,index)=>{
            return new YAxis(this.paintArea,{
                max:item.max,
                min:item.min,
                axisIndex:index,
                axisOpt:(yAxis || {}) as AxisOpt
            });
        })
        this.XAxisList = xAxisItemList.map((item,index)=>{
            return new XAxis(this.paintArea,this.YAxisList,{
                axisIndex:index,
                axisOpt:(xAxis || {}) as AxisOpt
            });
        })
    }
    createSerialCharts(series:Array<SerialOption>,){
        const {colors} = Global.defaultConfig;
        this.series = series.map((serial,index)=>{
            const {yAxisIndex = 0,xAxisIndex = 0} = serial
            const yAxis = this.YAxisList[yAxisIndex];
            const xAxis = this.XAxisList[xAxisIndex];
            const {type} = serial;
            const curColor = curItem(colors,index);
            const baseOpt = assign({},serial,{
                area:this.paintArea,
                xAxis:xAxis,
                yAxis:yAxis
            })
            if(type === 'line'){
                if(baseOpt.lineStyle == null){
                    baseOpt.lineStyle = {};
                }
                baseOpt.lineStyle = baseOpt.lineStyle || {}
                baseOpt.pointStyle = baseOpt.pointStyle || {}
                baseOpt.pointStyle.borderColor = curColor
                baseOpt.lineStyle.color = curColor;
                return new LineSerial(baseOpt)
            }else if(type === 'bar'){
                baseOpt.barStyle = baseOpt.barStyle || {color:null}
                baseOpt.barStyle.color = curColor;
                xAxis.option.axisOpt.boundaryGap = true;
                return new BarSerial(baseOpt)
            }
        })
    }
    init(){
        this.YAxisList.forEach((yAxis)=>{
            yAxis.init();
        }) //y轴需要先初始化，x轴依赖y轴去找0点Y值
        this.XAxisList.forEach((xAxis)=>{
            xAxis.init();
        })
        this.series.forEach((serial)=>{
            serial.init();
        })
        
    }
    draw(){
        const {painter} = this;
        this.XAxisList.forEach((xAxis)=>{
            xAxis.draw(painter)
        })
        this.YAxisList.forEach((yAxis)=>{
            yAxis.draw(painter)
        })
        this.series.forEach((serial)=>{
            serial.draw(painter)
        })
    }
}