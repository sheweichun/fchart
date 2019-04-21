



import {IPainter} from '../interfaces/ipainter'
import {IPointWidet,PointOption} from '../interfaces/ipoint';
import Global from '../util/global';
import Easing from '../animation/easing'
import {RAD_PER_DEG,DOUBLE_PI,TWO_THIRDS_PI,QUARTER_PI,PI,HALF_PI} from '../util/constant';



function drawPoint(ctx:CanvasRenderingContext2D, style, radius:number, x:number, y:number, rotation:boolean) {
	let type:string, xOffset:number, yOffset:number, size:number, cornerRadius:number;
	//@ts-ignore
	let rad = (rotation || 0)  * RAD_PER_DEG;

	if (style && typeof style === 'object') {
		type = style.toString();
		if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
			ctx.drawImage(style, x - style.width / 2, y - style.height / 2, style.width, style.height);
			return;
		}
	}

	if (isNaN(radius) || radius <= 0) {
		return;
	}

	ctx.beginPath();

	switch (style) {
	// Default includes circle
	default:
		ctx.arc(x, y, radius, 0, DOUBLE_PI);
		ctx.closePath();
		break;
	case 'triangle':
		ctx.moveTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		rad += TWO_THIRDS_PI;
		ctx.lineTo(x + Math.sin(rad) * radius, y - Math.cos(rad) * radius);
		ctx.closePath();
		break;
	case 'rectRounded':
		// NOTE: the rounded rect implementation changed to use `arc` instead of
		// `quadraticCurveTo` since it generates better results when rect is
		// almost a circle. 0.516 (instead of 0.5) produces results with visually
		// closer proportion to the previous impl and it is inscribed in the
		// circle with `radius`. For more details, see the following PRs:
		// https://github.com/chartjs/Chart.js/issues/5597
		// https://github.com/chartjs/Chart.js/issues/5858
		cornerRadius = radius * 0.516;
		size = radius - cornerRadius;
		xOffset = Math.cos(rad + QUARTER_PI) * size;
		yOffset = Math.sin(rad + QUARTER_PI) * size;
		ctx.arc(x - xOffset, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
		ctx.arc(x + yOffset, y - xOffset, cornerRadius, rad - HALF_PI, rad);
		ctx.arc(x + xOffset, y + yOffset, cornerRadius, rad, rad + HALF_PI);
		ctx.arc(x - yOffset, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
		ctx.closePath();
		break;
	case 'rect':
		if (!rotation) {
			size = Math.SQRT1_2 * radius;
			ctx.rect(x - size, y - size, 2 * size, 2 * size);
			break;
		}
		rad += QUARTER_PI;
		/* falls through */
	case 'rectRot':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + yOffset, y - xOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		ctx.closePath();
		break;
	case 'crossRot':
		rad += QUARTER_PI;
		/* falls through */
	case 'cross':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'star':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		rad += QUARTER_PI;
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.moveTo(x + yOffset, y - xOffset);
		ctx.lineTo(x - yOffset, y + xOffset);
		break;
	case 'line':
		xOffset = Math.cos(rad) * radius;
		yOffset = Math.sin(rad) * radius;
		ctx.moveTo(x - xOffset, y - yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		break;
	case 'dash':
		ctx.moveTo(x, y);
		ctx.lineTo(x + Math.cos(rad) * radius, y + Math.sin(rad) * radius);
		break;
	}

	ctx.fill();
	ctx.stroke();
}

export default class Point implements IPointWidet{
	borderColor:string
    borderWidth:number
    backgroundColor:string
    rotation:boolean
    radius:number
    x:number
	y:number
	startX:number
    startY:number
    targetX:number
	targetY:number
	diffX:number
    diffY:number
	type:object | string
	constructor(option:PointOption) {
		const {borderColor,borderWidth,backgroundColor,rotation,radius} = Global.defaultConfig.point
		this.x = option.x;
		this.y = option.y;
		this.startX = option.startX;
		this.startY = option.startY;
		this.targetX = option.targetX;
		this.targetY = option.targetY;
		this.borderColor = option.borderColor || borderColor
		this.borderWidth = option.borderWidth || borderWidth
		this.backgroundColor = option.backgroundColor || backgroundColor
		this.rotation = option.rotation == null ? rotation : option.rotation
		this.radius = option.radius || radius
		this.type = option.type
	}
	onComplete(){
        this.startX = this.x;
        this.startY = this.y;
    }
    onStart(){
        this.diffX = this.targetX - this.startX;
        this.diffY = this.targetY - this.startY;
    } 
    transtion(tm:number,duration:number):boolean | void{
		this.x = Easing.easeInQuad(tm,this.startX,this.diffX,duration);
        this.y = Easing.easeInQuad(tm,this.startY,this.diffY,duration);
    }
    draw(painter:IPainter){
		const {ctx} = painter
		const {type,radius,rotation,x,y,backgroundColor,borderColor,borderWidth} = this;
        ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.fillStyle = backgroundColor;
		drawPoint(ctx, type, radius, x, y, rotation);
    }
}