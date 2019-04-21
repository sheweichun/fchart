// import {RectOption} from '../interfaces/irect'

type IdefaultGlobalConfig = {
    text:{
        fontSize:number,
        fontFamily:string,
        fontWeight:string,
        color:string,
        textAlign:CanvasTextAlign,
        baseLine:CanvasTextBaseline
    },
    colors:string[],
    line:{
        lineWidth:number,
        smooth:boolean
    },
    point:{
        borderColor:string
        borderWidth:number
        backgroundColor:string
        rotation:boolean
        radius:number
    }
}

const defaultGlobalConfig:IdefaultGlobalConfig = {
    text:{
        fontFamily: "Hiragino, 'Microsoft Yahei', Arial, Helvetica, sans-serif",
        fontSize: 12,
        fontWeight: 'normal',
        color:'#333',
        baseLine:'middle',
        textAlign:'center'
    },
    colors:['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
    line:{
        lineWidth:2,
        smooth:true
    },
    point:{
        borderColor:'',
        borderWidth:1,
        backgroundColor:'white',
        rotation:false,
        radius:3
    }
}


export default {
    defaultConfig:defaultGlobalConfig,
    changeGlobalConfig(config:IdefaultGlobalConfig){
        this.defaultConfig = config;
    }
}

