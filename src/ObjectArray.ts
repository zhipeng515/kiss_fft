export class ObjectArray<T> {
    private _values: T[] = [];
    private _length: number;
    private _base: number;
    private _cursor: number;
    constructor(sizeOrValues: ObjectArray<T> | number | T[], base?: number | { new(): T; }) {
        if (typeof sizeOrValues == 'number') {
            this.initWithSize(sizeOrValues, base as { new(): T; });
        }
        else {
            this.initWithArray(sizeOrValues, base as number);
        }
        return this;
    }
    get base(): number {
        return this._base;
    }
    get values(): T[] {
        return this._values;
    }
    get cursor(): number {
        return this._cursor;
    }
    set cursor(cur: number) {
        this._cursor = this.cursor;
    }
    get length(): number {
        return this._length;
    }
    private initWithArray(v: ObjectArray<T> | T[], base?: number): ObjectArray<T> {
        if (v instanceof Array) {
            this._values = v;
            this._base = (base == undefined ? 0 : base);
            this._cursor = 0;
            this._length = v.length - this.base;
        }
        else {
            this._values = v.values;
            this._base = (base == undefined ? (v.base + v.cursor) : (v.base + v.cursor) + base);
            this._cursor = 0;
            this._length = this._values.length - this._base;
        }
        return this;
    }
    private initWithSize(size: number, cls: new () => T): ObjectArray<T> {
        for (var i = 0; i < size; i++) {
            this.values.push(new cls());
        }
        this._base = 0;
        this._cursor = 0;
        this._length = this._values.length;
        return this;
    }
    subarray(offset: number = 0): ObjectArray<T> {
        var subarray = new ObjectArray<T>(this, offset);
        return subarray;
    }
    seek(offset: number): void {
        this._cursor += offset;
    }
    add(v: T) {
        this._values.push(v);
        this._length++;
    }
    value(offset: number = 0): T {
        if (this._base + this._cursor + offset >= this._values.length) {
            console.log("ArrayPointer value() offset overflow");
        }
        var value = this.values[this._base + this._cursor + offset];
        return value;
    }
    cloneValue(offset: number = 0): T {
        let v = this.value(offset);
        let nv: T = new (<any>v).constructor();
        return Object.assign(nv, v);
    }
    setValue(value: T, offset: number = 0) {
        if (this._base + this._cursor + offset >= this._values.length) {
            console.log("ArrayPointer setValue() offset overflow");
        }
        if(value instanceof Number) {
            let nv: T = new (<any>value).constructor(value.valueOf());
            this.values[this._base + this._cursor + offset] = Object.assign(nv, value);
        } else {
            let nv: T = new (<any>value).constructor();
            this.values[this._base + this._cursor + offset] = Object.assign(nv, value);
        }
    }
    resetCursor() {
        this._cursor = 0;
    }
    toString(): string {
        let out = "";
        this._values.forEach((v,i) => {
            out += "i = " + i + " ";
            out += "v = " + v.toString() + "\n";
        })
        return out;
    }
}
