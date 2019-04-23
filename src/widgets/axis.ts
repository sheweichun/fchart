import {IAxis,IYAxis,IXAxis,AxisOpt,YAxisOpt,AxisTickOpt,AxisLabelOpt,AxisLineOpt,XAxisOption} from '../interfaces/iaxis'
import assign from '../util/assign'
import Area from '../widgets/area';
import {getUnitsFromMaxAndMin} from '../util/math';
import {IPainter} from '../interfaces/ipainter';
import {IPoint} from '../interfaces/ipoint'
import Global from '../util/global';


const defaultAxisTick:AxisTickOpt = {
    show:true,
    lineWidth:1,
    color:'red'
}
const defaultAxisLabel:AxisLabelOpt = {
    show:true,
    // color:'blue'
}
const defaultAxisLine:AxisLineOpt = {
    show:true,
    lineWidth:1,
    color:'#ccc'
}

const defaultAxisOpt = {
    horizontal:true,
    reverse:false,
    tickLen:5,
    // boundaryGap:true,
    offset:5,
}

class AxisLabel{
    constructor(private _x:number,private _y:number,private _value){}
    draw(ctx:CanvasRenderingContext2D){
        ctx.fillText(this._value != null ? this._value : '',this._x,this._y);
    }
}
 class AxisTick{
    constructor(private _tickStart,private _tickEnd,private _opt:AxisTickOpt){}
    draw(ctx:CanvasRenderingContext2D){
        const {_tickStart,_tickEnd,_opt} = this;
        if(!_opt.show) return;
        ctx.beginPath()
        ctx.moveTo(_tickStart.x,_tickStart.y);
        ctx.lineTo(_tickEnd.x,_tickEnd.y);
        ctx.stroke();
    }
}


// class XAxisTick extends AxisTick{
//     // labelPos:IPoint
//     tickStart:IPoint
//     tickEnd:IPoint
//     constructor(axis:IAxis, _index:number,opt:AxisOpt){
//         super(axis);
//         const {x,y,reverse,tickLen,length} = opt;
//         const reverseNum = reverse ? -1 : 1;
//         const newX = (x-length/2) + _index  * axis.tickWidth;
//         // console.log('tickWidth :',axis.tickWidth,_index,newX);
//         // console.log('_value :',newX,_value)
//         // let start = y,end = y + tickLen * reverseNum,endPos = labelBase + tickLen * reverseNum;
//         let start = y,end = y + tickLen * reverseNum;
//         this.tickStart = {x:newX,y:start}
//         this.tickEnd = {x:newX,y:end}
//         // this.labelPos = {x:newX,y:endPos + offset * reverseNum}
//     }
//     draw(painter:IPainter){
//         const {ctx} = painter;
//         const {_axis} = this;
//         const {axisTickOpt} = _axis;
//         // axisLabelOpt.show && ctx.fillText(this._value,labelPos.x,labelPos.y);
//         axisTickOpt.show && this.drawTick(ctx);
//     }
// }




// class YAxisTick extends AxisTick{
//     // labelPos:IPoint
//     tickStart:IPoint
//     tickEnd:IPoint
//     constructor(axis:IAxis,_index:number,opt:AxisOpt){
//         super(axis);
//         const {x,y,reverse,tickLen,length} = opt;
//         const reverseNum = reverse ? -1 : 1;
//         const newY = (y+length/2) - (_index * axis.tickUnit) * axis.tickWidth;
//         // let start = x,end = x - tickLen * reverseNum,endPos = labelBase - tickLen * reverseNum;
//         let start = x,end = x - tickLen * reverseNum;
//         this.tickStart = {x:start,y:newY}
//         this.tickEnd = {x:end,y:newY}
//         // this.labelPos = {x:endPos - offset * reverseNum,y:newY}
//     }
//     draw(painter:IPainter){
//         const {ctx} = painter;
//         const {_axis} = this;
//         const {axisTickOpt} = _axis;
//         // axisLabelOpt.show && ctx.fillText(this._value,labelPos.x,labelPos.y);
//         axisTickOpt.show && this.drawTick(ctx);
//     }
// }

export class YAxis implements IYAxis{
    axis:Axis
    max:number
    min:number
    range:number
    axisIndex:number
    constructor(private _area:Area,private _opt:{
        isRight?:boolean,
        max:number,
        axisIndex:number,
        min:number,
        axisOpt:YAxisOpt}) {
      
    }
    init(){
        const {_area,_opt} = this;
        const {isRight,axisOpt,max,min} = _opt;
        // console.log('max :',max,min);
        const ret = getUnitsFromMaxAndMin(max,min)
        this.max = ret.max;
        this.min = ret.min;

        this.range = this.max - this.min;
        // console.log('range :',this.range,this.max,this.min);
        let labelBase = isRight ? _area.right : _area.left, y = _area.y
        this.axis = new Axis(assign({},axisOpt,{
            x:labelBase,
            y,
            labelBase,
            data:ret.data,
            horizontal:false,
            boundaryGap:false,
            length:_area.height
        }) as AxisOpt)
    }
    // getUnitWidth(){
    //     return this.axis.unitWidth
    // }
    getYByValue(val:number):number{
        const {range,_area,min,max} = this;
        if(max - val >= 0 && val - min >= 0){
            return _area.bottom - (val - min) * _area.height / range
        }
        return null;
        // return _area.bottom - (val - min) * _area.height / range
    }
    draw(painter:IPainter){
        this.axis.draw(painter);
    }
}

export class XAxis implements IXAxis{
    axis:Axis
    option:XAxisOption
    constructor(private _area:Area, private _yaxisList:Array<YAxis> ,option:XAxisOption) {
       this.option = option
    }
    getZeroY(){
        for(let i = 0; i < this._yaxisList.length; i++){
            const yAxis = this._yaxisList[i];
            const ret = yAxis.getYByValue(0);
            if(ret != null) return ret;
        }
    }
    init(){
        const {_area,option} = this;
        const {isTop,axisOpt} = option;
        let labelBase = isTop ? _area.top : _area.bottom
        let y = this.getZeroY();
        if(y == null){
            y = labelBase
        }
        const x = _area.x
        this.axis = new Axis(assign({boundaryGap:true},axisOpt,{
            x,
            y,
            labelBase,
            length:_area.width
        }))
    }
    getXbyIndex(index:number,baseLeft:number):number{
        // console.log('boundaryGap => ',this.axis.boundaryGap);
        const boundaryGapLengh = this.axis.boundaryGap ? this.axis.tickWidth / 2 : 0
        return boundaryGapLengh + index * this.axis.unitWidth + baseLeft
    }
    // getBoundaryGapLengh(){
    //     return this.axis.boundaryGap ? this.axis.tickWidth / 2 : 0;
    // }
    // getYByZero(max:number,min:number):number{
    //     const {_area} = this;
    //     const range = max - min;
    //     const val = 0;
    //     if(max - val > 0 && val - min > 0){
    //         return _area.bottom - (val - min) * _area.height / range
    //     }
    //     return null;
    // }
    // getUnitWidth(){
    //     return this.axis.unitWidth
    // }
    draw(painter:IPainter){
        this.axis.draw(painter);
    }
}



export default class Axis implements IAxis{
    start:IPoint
    end:IPoint
    x:number
    data:string[]
    length:number
    y:number
    textAlign:CanvasTextAlign
    textBaseline:CanvasTextBaseline
    tickWidth:number
    tickUnit:number
    unitWidth:number
    boundaryGap:boolean
    ticks:AxisTick[]
    labels:AxisLabel[]
    axisTickOpt:AxisTickOpt
    axisLabelOpt:AxisLabelOpt
    axisLineOpt:AxisLineOpt
    constructor(opt:AxisOpt){
        this.data = (opt.data || []) as string[]
        const mergeOpt = assign({},defaultAxisOpt,opt || {}) as AxisOpt;
        const {x,y,length,axisTick,axisLabel,axisLine,horizontal,reverse,splitNumber,boundaryGap} = mergeOpt;
        this.boundaryGap = boundaryGap;
        /*x,y为轴线的中心 */
        this.x = x; 
        this.y = y; 
        const dLen = this.data.length - 1
        const rSplitNumber =  splitNumber || dLen;
        this.tickUnit = Math.ceil(dLen / rSplitNumber); // tick之间包含的数据点个数,不包含最后一个
        this.unitWidth = length / (dLen + ( this.boundaryGap ?  this.tickUnit : 0)); //每个数据点之间的距离
        this.tickWidth = this.tickUnit * this.unitWidth; //每个tick的宽度
        this.length = length;
        this.axisTickOpt = assign({},defaultAxisTick,axisTick || {})
        this.axisLabelOpt = assign({
            fontSize:Global.defaultConfig.text.fontSize,
            fontFamily:Global.defaultConfig.text.fontFamily,
            fontWeight:Global.defaultConfig.text.fontWeight,
            color:Global.defaultConfig.text.color
        },defaultAxisLabel, axisLabel || {});
        this.axisLineOpt = assign({},defaultAxisLine, axisLine || {});
        this.parseStartAndEndPoint(mergeOpt); //解析轴线的起点start和终点end
        if(horizontal){
            this.textAlign = "center";
            this.textBaseline = reverse ? "bottom" : "top";
            this.createHorizontatickAndLabels(mergeOpt) //创建横向的刻度和label
        }else{
            this.textAlign = reverse ? "left" : "right";
            this.textBaseline = "middle";
            this.createVerticatickAndLabels(mergeOpt); //创建垂直的刻度和label
        }
    }
    createHorizontatickAndLabels(opt:AxisOpt){
        const ticks = [];
        const labels = [];
        let count = 0;
        let i:number;
        const {boundaryGap} = this;
        const {x,y,reverse,tickLen,length,labelBase,offset} = opt;
        const baseX = (x-length/2)
        // console.log('boundaryGap :',this.boundaryGap);
        let dataLen:number,baseLabelX:number;
        if(boundaryGap){
            dataLen = this.data.length + 1
            baseLabelX = this.tickWidth / 2
        }else{
            dataLen = this.data.length
            baseLabelX = 0
        }
        const reverseNum = reverse ? -1 : 1;
        for(i = 0; i < dataLen; i+= this.tickUnit){
            const newX = baseX + count  * this.tickWidth;
            let start = y,end = y + tickLen * reverseNum;
            let endPos = labelBase + tickLen * reverseNum 
            const value = this.data[i];
            ticks.push(new AxisTick({x:newX,y:start},{x:newX,y:end},this.axisTickOpt))
            labels.push(new AxisLabel(newX + baseLabelX,endPos + offset * reverseNum,value));
            count++;
        }
        this.labels = labels;
        this.ticks = ticks
       
    }
    createVerticatickAndLabels(opt:AxisOpt){
        const ticks = [];
        const labels = [];
        let count = 0;
        const {x,y,reverse,tickLen,length,labelBase,offset} = opt;
        const baseY = (y+length/2)
        const reverseNum = reverse ? -1 : 1;
        const dataLen = this.data.length;
        for(let i = 0; i < dataLen; i+= this.tickUnit){
            const newY = baseY  - count  * this.tickWidth;
            let start = x,end = x - tickLen * reverseNum;
            let endPos = labelBase - tickLen * reverseNum;
            ticks.push(new AxisTick({x:start,y:newY},{x:end,y:newY},this.axisTickOpt))
            labels.push(new AxisLabel(endPos - offset * reverseNum,newY,this.data[i]));
            count++;
        }
        this.labels = labels;
        this.ticks = ticks
    }
    parseStartAndEndPoint(opt:AxisOpt){
        const {x,y,horizontal,length} = opt;
        let startX:number,startY:number,endX:number,endY:number;
        const halfLength = length / 2;
        if(horizontal){
            startX = x - halfLength
            endX = x + halfLength
            startY = endY = y;
        }else{
            startY = y + halfLength
            endY = y - halfLength
            startX = endX = x;
        }
        this.start = {
            x:startX,
            y:startY
        }
        this.end = {
            x:endX,
            y:endY
        }
    }
    draw(painter:IPainter){
        const {ctx} = painter;
        const {start,end,axisLineOpt} = this;
        const {show,lineWidth,color} = axisLineOpt;
        ctx.beginPath();
        if(show){
            // console.log(start,end);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.moveTo(start.x,start.y);
            ctx.lineTo(end.x,end.y);
            ctx.stroke();
        }
        
        this.ticks.forEach((tick)=>{
            tick.draw(ctx)
        })
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        const {fontSize,fontFamily,fontWeight} = this.axisLabelOpt;
        const font = `${fontWeight} ${fontSize} ${fontFamily}`
        ctx.font = font;
        ctx.fillStyle = this.axisLabelOpt.color;
        this.labels && this.labels.forEach((lb)=>{
            lb.draw(ctx);
        })
    }
}