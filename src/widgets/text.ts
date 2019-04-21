
import {IXYWidget} from '../interfaces/iwidget'
import {IPainter} from '../interfaces/ipainter'
import {TextOption} from '../interfaces/itext'
import Gloal from '../util/global'
import assign from '../util/assign'

// const DEFAULT_OPTION = {
//     color:Gloal.,
//     textAlign:'center',
//     baseLine:'middle'
// }

export default class Text implements IXYWidget{
    x:number
    y:number
    color:string
    font:string
    // fontSize:number
    // fontFamily:string
    // fontWeight:string
    textAlign:CanvasTextAlign
    baseLine:CanvasTextBaseline
    constructor(x:number,y:number,private _value:string,option:TextOption = {}){
        this.x = x;
        this.y = y;
        const {color,fontFamily,fontSize,fontWeight,baseLine,textAlign} = Gloal.defaultConfig.text
        this.color = option.color || color
        const rfontSize = option.fontSize || fontSize
        const rfontFamily = option.fontFamily || fontFamily
        const rfontWeight = option.fontWeight || fontWeight
        this.font = `${rfontWeight} ${rfontSize} ${rfontFamily}`
        this.baseLine = option.baseLine || baseLine
        this.textAlign = option.textAlign || textAlign
    }
    draw(painter:IPainter){
        const {ctx} = painter;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign as CanvasTextAlign;
        ctx.textBaseline = this.baseLine as CanvasTextBaseline;
        ctx.fillStyle = this.color
        ctx.fillText(this._value,this.x,this.y);
        // console.log(this._value,this.x,this.y);
    }
}