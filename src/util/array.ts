export function previousItem<T>(collection:T[], index:number, loop?:boolean) {
    if (loop) {
        return index <= 0 ? collection[collection.length - 1] : collection[index - 1];
    }
    return index <= 0 ? collection[0] : collection[index - 1];
};


export function nextItem<T>(collection:T[], index:number, loop?:boolean) {
    if (loop) {
        return index >= collection.length - 1 ? collection[0] : collection[index + 1];
    }
    return index >= collection.length - 1 ? collection[collection.length - 1] : collection[index + 1];
};

export function curItem<T>(collection:T[], index:number, loop?:boolean) {
    const curIndex = index % collection.length;
    return collection[curIndex];
};


export function removeItem<T>(collection:T[],item:T){
    for(let i = 0; i < collection.length; i++){
        if(collection[i] === item){
            collection.splice(i,1);
        }
    }
}