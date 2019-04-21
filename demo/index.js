import Fchart from '../lib/index';

const canvas = document.getElementById('demo');
// new Chart(canvas,{
//     // forceRatio:2,
//     title:'Simple Chart',
//     padding:[20,20,20,40],
//     xAxis:{
//         data:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
//     },
//     series:[
//         {
//             type:'line',
//             data:[4,5,2,6,7,3,10,30,20,18,17,5,9,10,22,24,13,15,29,29]
//         }
//     ]
// })
// console.log('hello12');

function easing(t) {
    if ((t /= 0.5) < 1) {
        return 0.5 * t * t;
    }
    return -0.5 * ((--t) * (t - 2) - 1);
}
// function easing(t) {
//     return -t
// }
function generate(count,serialCount,range=300){
    const xData = [];
    const series = [];
    for(let i = 0; i < count; i++){
        xData.push(i+1);
        for(let j = 0; j < serialCount; j++){
            let serial = series[j];
            if(serial == null){
                serial = [];
                series[j] = serial
            }
            // serial.push(easing(i))
            // serial.push(Math.floor(Math.random() * range * (Math.random() > 0.5 ? 1 : -1)))
            serial.push(Math.floor(Math.random() * range))
        }
    }
    return {
        xData,
        series
    }
}

const total = 100;

const {xData,series} = generate(total,3,1000);

const chart = new Fchart(canvas,{
    width:1200,
    height:600,
    title:'Title',
    subTitle:'subTitle', 
    xAxis:{
        splitNumber:total / 2,
        boundaryGap:false,
        data:xData,
        // reverse:true,
        axisLabel:{
            // show:true
        },
        axisTick:{
            // show:false
        }
    },
    series:[
   
        {
            type:'bar',
            barStyle:{
                // widthRatio:0.25
                // color:'yellow'
            },
            // data:[80,30,10,92,72,-46,29,50,29,34,18]
            // data:[80,30,10,92,72,46,29,50,29,34,18]
            data:series[0]
            // data:[201, -128, 103, 20, 74, 279, 268, 69, 255, 1, 76, 91, 243, 217, 155, 247, 20, 250, 37, 111]
        },
        {
            type:'line',
            // reverse:true,
            lineStyle:{
                smooth:true,
                // color:'red',
                // lineWidth:1
            },
            pointStyle:{
                type:'rectRot'
            },
            // data:[80,30,10,92,72,-46,29,50,29,34,18]
            // data:[80,30,10,92,72,46,29,50,29,34,18]
            data:series[0]
            // data:[201, -128, 103, 20, 74, 279, 268, 69, 255, 1, 76, 91, 243, 217, 155, 247, 20, 250, 37, 111]
        }
        // ,{
        //     type:'line',
        //     lineStyle:{
        //         smooth:true,
        //         color:'blue',
        //         lineWidth:2
        //     },
        //     // data:[30,70,60,122,92,-96,49,-20,119,-34,88]
        //     // data:[30,70,60,122,92,96,49,20,119,34,88]
        //     data:series[1]
        // }
    ]
})
// console.log('series :',series[0]);