export type LinePoint = {
    x:number
    y:number
    startX?:number
    startY?:number
    targetX?:number
    targetY?:number
    diffX?:number
    diffY?:number
    controlPointPreviousX?:number
    controlPointPreviousY?:number
    controlPointNextX?:number
    controlPointNextY?:number
}

export function max(arr:number[],defaultMax:number){
    return arr.reduce((retMax,val)=>{
        return retMax > val ? retMax : val
    },defaultMax == null ? arr[0] : defaultMax)
}

export function min(arr:number[],defaultMin:number){
    return arr.reduce((retMax,val)=>{
        return retMax < val ? retMax : val
    },defaultMin == null ? arr[0] : defaultMin)
}

export function maxAndMin(arr:number[],origin:{max:number,min:number}){
    const first = arr[0];
    return arr.reduce((ret,val)=>{
        ret.max = ret.max > val ? ret.max : val;
        ret.min = ret.min < val ? ret.min : val;
        return ret
    },origin == null ? {max:first,min:first} : origin)
}


export function getUnitsFromMaxAndMin(max:number,min:number,splitNumber:number = 10){
    max = (Math.floor(max / 10 ) + 1) * 10
    min = Math.floor(min / 10 )  * 10
    const range = max - min;
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


export function splineCurve(previous:LinePoint, current:LinePoint, next:LinePoint, t:number) {
    // Props to Rob Spencer at scaled innovation for his post on splining between points
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html

    // This function must also respect "skipped" points

    // var previous = firstPoint;
    // var current = middlePoint;
    // var next = afterPoint.skip ? middlePoint : afterPoint;

    var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
    var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

    var s01 = d01 / (d01 + d12);
    var s12 = d12 / (d01 + d12);

    // If all points are the same, s01 & s02 will be inf
    s01 = isNaN(s01) ? 0 : s01;
    s12 = isNaN(s12) ? 0 : s12;

    var fa = t * s01; // scaling factor for triangle Ta
    var fb = t * s12;

    return {
        previous: {
            x: current.x - fa * (next.x - previous.x),
            y: current.y - fa * (next.y - previous.y)
        },
        next: {
            x: current.x + fb * (next.x - previous.x),
            y: current.y + fb * (next.y - previous.y)
        }
    };
};