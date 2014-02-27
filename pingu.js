 /*
    Pingu is a disk-persisted fixed-length fifo buffer. Schnoo schnoo.
*/
function Pingu(max_size, name){
    this.space_name = "YUNG_GIF_"+name;
    this.max_size = max_size;
    this.lst = (localStorage[this.space_name] == undefined ? [] : JSON.parse(localStorage[this.space_name]));
    this.length = this.lst.length;
}

// Array(-like) methods
Pingu.prototype.unshift = function(e){
    if(this.lst.length >= this.max_size){
        this.lst.pop();
    }
    this.lst.unshift(e);
    this.length = this.lst.length;
    localStorage[this.space_name] = JSON.stringify(this.lst);
};

Pingu.prototype.pop = function(){
    e = this.lst.pop();
    this.length = this.lst.length;
    localStorage[this.space_name] = JSON.stringify(this.lst);
    return e;
};

Pingu.prototype.concat = function(e){
    return this.lst.concat(e.lst);
};

Pingu.prototype.resize = function(){
    if(this.lst.length > this.max_size){
        this.lst = this.lst.slice(0, this.max_size-1);
        this.length = this.lst.length;
        localStorage[this.space_name] = JSON.stringify(this.lst);
    }
};