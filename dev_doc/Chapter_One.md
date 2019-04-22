
<p align="center">
    <img  src="https://user-gold-cdn.xitu.io/2019/4/22/16a442821e5c550a?w=200&h=147&f=svg&s=2117"><br/>
</p>
# 教你开发图表库fchart系列第一章

[工程分支](https://github.com/sheweichun/fchart/blob/Chapter_One/dev_doc/Chapter_One.md)


整个系列里作者会带着大家一起完成一个从0到1图表库的开发，欢迎来[这里](https://github.com/sheweichun/fchart)踊跃拍砖

估计很多人会问，现在开源世界里的图表库多如牛毛，为什么自己还要再弄个图表库呢?
* 开发库很多不假，但是成熟的框架都是大而全的，学习成本高，而实际业务中使用的图表都是比较简单的，尤其是移动端更是要求精简，但即便简单的图表也会掺杂个性化的需求，这个时候受框架的限制你会有一种无力感
* 这时候如果你自己有一一套基础图表库，既能满足日常的业务开发，又能满足老板对可视化个性化定制，会让你觉得生成如此惬意~~
* 当然如果最后这个库开发失败了，就权当学习好了


在具体开始撸代码之前，我们需要想清楚图表的组成部分，这个库的架构是怎样的，开发者如何使用等等，形象点说就是我们先弄一个施工图出来


## Demo演示
下面这个动图就是我们本次要实现的效果,包含了X轴、Y轴、折线图、柱形图和动画

![](./demo.gif)


## 图表组成

限于我们的图表现在还没整出来，我们走一次抽象派，见下图

![](https://user-gold-cdn.xitu.io/2019/4/22/16a44282232087e3?w=934&h=426&f=png&s=10235)

这是图展示了一个最基本的图表的组成部分(**我们由浅入深**)，它包含以下部分:

* X轴
* Y轴
* 绘制区域
* 各种类型图
* 图例
* 提示信息
* 辅助元素
* 标题、副标题


## 初步建模


![](https://user-gold-cdn.xitu.io/2019/4/22/16a442822248b9f5?w=1768&h=904&f=png&s=35827)



## 编程语言选择

选择typescript，好处有一下几点
* 增强代码的可读性和可维护性
* 增强了编辑器和 IDE 的功能，包括代码补全、接口提示、跳转到定义、重构等
* 未来开发者使用的时候能够做到配置自动提示

如果你是typescript新手，建议你上官网[中文官网](https://www.tslang.cn/)学习学习

## Coding

### 坐标轴

由前面图分析，我们会提供基础Axis，然后在Axis上分别抽象出YAxis,XAxis

#### [Axis]((https://github.com/sheweichun/fchart/blob/a8fd713e0d3939cea8bb65bdad44ed7ca82f3fc4/src/widgets/axis.ts#L212))

* [构造函数](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/axis.ts#L230)

```typescript
...
constructor(opt:AxisOpt){
    this.data = (opt.data || []) as string[] //label数据
    const mergeOpt = assign({},defaultAxisOpt,opt || {}) as AxisOpt;
    const {x,y,length,axisTick,axisLabel,axisLine,horizontal,reverse,splitNumber,boundaryGap} = mergeOpt;
    this.boundaryGap = boundaryGap;
    /*x,y为轴线的中心 */
    this.x = x; 
    this.y = y; 
    const dLen = this.data.length - 1
    const rSplitNumber =  splitNumber || dLen; //轴要分成几段
    this.tickUnit = Math.ceil(dLen / rSplitNumber); // tick之间包含的数据点个数,不包含最后一个
    this.unitWidth = length / (dLen + ( this.boundaryGap ?  this.tickUnit : 0)); //每个数据点之间的距离
    this.tickWidth = this.tickUnit * this.unitWidth; //每个tick的宽度
    this.length = length; //轴长度
    ... //省略掉一些配置参数的解析 
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
...
```

大部分还是参数的解析，核心我们还是看下createHorizontatickAndLabels

* [createHorizontatickAndLabels](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/axis.ts#L262)
```typescript
createHorizontatickAndLabels(opt:AxisOpt){
    const ticks = []; //刻度列表
    const labels = []; //label列表
    let count = 0;
    let i:number;
    const {boundaryGap} = this;
    const {x,y,reverse,tickLen,length,labelBase,offset} = opt;
    const baseX = (x-length/2) //起点的x值
    /* 设置了boundaryGap，则表示在在轴的左右两侧分别保留半个刻度长度的间隔 */
    let dataLen:number,baseLabelX:number; 
    if(boundaryGap){
        dataLen = this.data.length + 1
        baseLabelX = this.tickWidth / 2 //label的起始X偏移半个刻度宽度
    }else{
        dataLen = this.data.length
        baseLabelX = 0
    }
    const reverseNum = reverse ? -1 : 1; //刻度是向内还是向外
    for(i = 0; i < dataLen; i+= this.tickUnit){ //根据前面计算的tickUnit创建对应刻度和label
        const newX = baseX + count  * this.tickWidth; //计算当前刻度的x
        let start = y,end = y + tickLen * reverseNum; //计算刻度的起始Y和终点Y
        let endPos = labelBase + tickLen * reverseNum  //根据labelBase计算label的Y值
        const value = this.data[i];
        ticks.push(new AxisTick({x:newX,y:start},{x:newX,y:end},this.axisTickOpt))
        labels.push(new AxisLabel(newX + baseLabelX,endPos + offset * reverseNum,value));
        count++;
    }
    this.labels = labels;
    this.ticks = ticks;
}
```
[AxisTick](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/axis.ts#L39)和[AxisLabel](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/axis.ts#L33)都是直接传入的参数分别绘制线条和点，比较简单，不展开讲解



### XAxis
XAxis是通过代理的方式来实现,而不是直接继承Axis,更加灵活
```typescript
 class XAxis implements IXAxis{
    axis:Axis
    yxisList:Array<YAxis>
    option:XAxisOption
    /* 
    * _area 表示已X轴和Y轴为边的serial绘制区域
    * _yaxisList 表示所有的Y轴列表
    * option x轴的配置选项
    */
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
        let labelBase = isTop ? _area.top : _area.bottom //X轴显示在上面还是下面
        let y = this.getZeroY(); //获取Y轴上0对应的Y坐标
        if(y == null){
            y = labelBase
        }
        const x = _area.x
        this.axis = new Axis(assign({boundaryGap:true},axisOpt,{
            x,
            y,
            labelBase,
            length:_area.width //serial绘制区域的宽度就是轴的长度
        }))
    }
    getXbyIndex(index:number,baseLeft:number):number{ //根据数据点的下标获取对应的x坐标
        const boundaryGapLengh = this.axis.boundaryGap ? this.axis.tickWidth / 2 : 0
        return boundaryGapLengh + index * this.axis.unitWidth + baseLeft
    }
    draw(painter:IPainter){
        this.axis.draw(painter);
    }
}
```

### YAxis
YAxis也是通过代理的方式来实现，目前来看YAxis相比XAxis复杂一些，因为它需要根据数据的最大值和最小值自动计算整形刻度值

```typescript
class YAxis implements IYAxis{
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
        axisOpt:YAxisOpt}) {}
    init(){
        const {_area,_opt} = this;
        const {isRight,axisOpt,max,min} = _opt;
        const ret = getUnitsFromMaxAndMin(max,min) //重新计算最大值和最小值，逻辑下面会详细分析
        this.max = ret.max;
        this.min = ret.min;
        this.range = this.max - this.min; //Y轴的值范围
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
    getYByValue(val:number):number{ //根据值获取Y坐标,供serial用
        const {range,_area,min,max} = this;
        if(max - val >= 0 && val - min >= 0){
            return _area.bottom - (val - min) * _area.height / range
        }
        return null;
    }
    draw(painter:IPainter){
        this.axis.draw(painter);
    }
}
```

[getUnitsFromMaxAndMin分析](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/util/math.ts#L38)
```typescript
//目前实现得比较粗暴，后续还会再完善
function getUnitsFromMaxAndMin(max:number,min:number,splitNumber:number = 10){
    /*将最大和最小值处理成能被10整除的*/
    max = (Math.floor(max / 10 ) + 1) * 10
    min = Math.floor(min / 10 )  * 10
    const range = max - min; //计算差值
    /* 根据差值分割成splitNumber个单位,最终就是Y轴的刻度 */
    let unit = Math.ceil(range / splitNumber);
    unit = (Math.floor(unit / 10) + 1) * 10
    let data = [],tmp = min;
    while(tmp < max){
        data.push(tmp);
        tmp += unit;
    }
    data.push(tmp);
    max = tmp;
    return {
        max,
        min,
        data
    }
}
```


### LineSerial
分析完Axis之后，我们再来看看如何在XAxis和YAxis的基础上去构建具体的LineSerial，代码整体看上来还是很清晰的

```typescript
class LineSerial implements ILazyWidget{
    area:Area //Serial的绘制区域
    xAxis:IXAxis //对应的X轴
    yAxis:IYAxis //对应的Y轴
    lineView:Line //负责绘制线条
    tickPointList:Array<Point> //负责绘制对应刻度的点
    option:LineSerailOption //配置参数
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
            const isTickPoint = index % xAxis.axis.tickUnit === 0; //标记当前点是否正好对应刻度
            const posX = xAxis.getXbyIndex(index,area.left) //根据下标获取x坐标
            const posY = yAxis.getYByValue(value) //根据值获取y坐标
            const startX = posX, startY= yAxis.getYByValue(0);
            /* 这块是动画的计算基础，有初始态和终态 */
            const pos = {
                x:startX,//当前x
                y:startY, //当前y
                targetX:posX, //最终的x
                targetY:posY, //最终的x
                startX : startX, //初始的x
                startY: startY //初始的x
            }
            if(isTickPoint){
                //创建于刻度对应的数据点
                const tickPoint = new Point(assign({},pointStyle || {},pos))
                // 加入动画
                Animation.addAnimationWidget(tickPoint)
                tickPoints.push(tickPoint)
    
            }
            return pos 
        })
        this.tickPointList = tickPoints
        //创建线条
        this.lineView = new Line(newData,lineStyle) //根据一系列包含x,y坐标的点绘制具体的线条
        Animation.addAnimationWidget(this.lineView)
    }
    draw(painter:IPainter){
        this.lineView.draw(painter);
        this.tickPointList.forEach((tickPoint)=>{
            tickPoint.draw(painter);
        })
    }
}
```

对[Line]和[Point]有兴趣的同学可以分别点击进去看，基本上就是根据参数绘制线条和点，基本看看就能看懂，Line里可以看看怎么实现光滑画图，
Point可以看看怎么画不同形状的点，还是很有意思的😊

对[BarSerial](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/serials/barSerial.ts#L2)感兴趣可以点[这里](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/widgets/serials/barSerial.ts#L2)，按照上面的思路去分析

当然如果你有更强的意愿，还可以去实现其他类型的Serial

### 动画
本次动画的实现只是临时方案，后续会重构，所以这里就不展开了，有兴趣的可以到[这里](https://github.com/sheweichun/fchart/blob/Chapter_One/src/animation/index.ts)看源码

### fchart
前面介绍了XAxis，YAxis和LineSerial，都还是各自独立的个体，这里我要介绍的是如何把这些有机的结合起来最终形成我们画出来的图表

```typescript
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
        /* 创建画笔 */
        this.painter = new Painter(canvas,mergeOption);
        const {padding,series,xAxis,yAxis} = mergeOption;
        this.paddingTop = padding[0];
        this.paddingRight = padding[1];
        this.paddingBottom = padding[2];
        this.paddingLeft = padding[3];
        const {width,height} = this.painter; 
        const centerX = ((width - this.paddingRight) + this.paddingLeft) / 2
        const centerY = ((height - this.paddingBottom) + this.paddingTop) / 2
        //根据padding、width、height计算serial绘制区域
        this.paintArea = new Area({
            x:centerX,
            y:centerY,
            width:width - (this.paddingLeft + this.paddingRight),
            height:height - (this.paddingTop + this.paddingBottom)
        })
        //创建X轴和Y轴
        this.createXYAxises(series,xAxis,yAxis);
        //创建serial
        this.createSerialCharts(series);
        //初始化
        this.init();
        //绘图
        this.draw(); 
        //开启动画
        Animation.startAnimation(this.painter,this.draw.bind(this));
    }
    createXYAxises(series:Array<SerialOption>,xAxis:AxisOpt,yAxis:AxisOpt){
        ...
    }
    createSerialCharts(series:Array<SerialOption>,){
        ...
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
```
讲解完主流程后，我们在分析下createXYAxises和createSerialCharts分别做了什么事情

#### [createXYAxises](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/index.ts#L75)
```typescript
const yAxisItemList = [],xAxisItemList = []
//这一部分是根据传入的serial，计算不同序号下y轴的最大值和最小值
series.forEach((serial)=>{
    /*yAxisIndex 对应Y轴的序号 对应X轴的序号, 这里我们看出fchart是支持多个轴的*/
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
/* 创建y轴 */
this.YAxisList = yAxisItemList.map((item,index)=>{
    return new YAxis(this.paintArea,{
        max:item.max,
        min:item.min,
        axisIndex:index,
        axisOpt:(yAxis || {}) as AxisOpt
    });
})
/* 创建x轴 */
this.XAxisList = xAxisItemList.map((item,index)=>{
    return new XAxis(this.paintArea,this.YAxisList,{
        axisIndex:index,
        axisOpt:(xAxis || {}) as AxisOpt
    });
})
```

#### [createSerialCharts](https://github.com/sheweichun/fchart/blob/61892f3e2613527e306baeb118636f6974493bac/src/index.ts#L111)
```typescript
/* 代码看起来还是很简单的，根据type的不同创建对应的serial */
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
```


## 开发

本库选用parcel开箱即用的解决方案，不熟悉的同学如果对parcel感兴趣可以去[官网](https://parceljs.org)了解了解，没兴趣也没关系，按照以下指示也是能跑起demo来的


### 安装依赖
```bash
npm install
```


### 开发预览demo

```bash
npm run dev
```

<p align="center">
    <img  src="https://user-gold-cdn.xitu.io/2019/4/10/16a055f03c53753f?w=258&h=258&f=png&s=7273"><br/>
    <span>FE One</span>
</p>

<center style="font-size:12px;color:#999;">关注我们的公众号FE One，会不定期分享JS函数式编程、深入Reaction、Rxjs、工程化、WebGL、中后台构建等前端知识<center>

