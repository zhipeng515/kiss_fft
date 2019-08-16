export module ArrayUtil {
    export function uint8ArrayToString(data: Uint8Array, length?: number) {
        var dataString = "";
        var dataLength = length == undefined ? data.length : length;
        for (var i = 0; i < dataLength; i++) {
            dataString += String.fromCharCode(data[i]);
        }
    
        return dataString
    }

    export function int8ArrayToString(data: Int8Array, length?: number) {
        var dataString = "";
        var dataLength = length == undefined ? data.length : length;
        for (var i = 0; i < dataLength; i++) {
            dataString += String.fromCharCode(data[i]);
        }
    
        return dataString
    }
    
    export function stringToUint8Array(str: string) {
        var arr = [];
        for (var i = 0, j = str.length; i < j; ++i) {
            arr.push(str.charCodeAt(i));
        }
    
        var uint8Array = new Uint8Array(arr);
        return uint8Array;
    }

    export function bufferToArrayBuffer(buffer: Buffer, offset?: number): ArrayBuffer {
        let arrayBuffer = new ArrayBuffer(buffer.length);
        let uint8Array = new Uint8Array(arrayBuffer);
        uint8Array.set(buffer, offset);
        return arrayBuffer;
    }

    export function bufferToUint32Buffer(buffer: Buffer, offset?: number): Uint32Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Uint32Array(arrayBuffer);
    }

    export function bufferToInt32Buffer(buffer: Buffer, offset?: number): Int32Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Int32Array(arrayBuffer);
    }

    export function bufferToUint16Buffer(buffer: Buffer, offset?: number): Uint16Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Uint16Array(arrayBuffer);
    }

    export function bufferToInt16Buffer(buffer: Buffer, offset?: number): Int16Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Int16Array(arrayBuffer);
    }

    export function bufferToUint8Buffer(buffer: Buffer, offset?: number): Uint8Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Uint8Array(arrayBuffer);
    }

    export function bufferToInt8Buffer(buffer: Buffer, offset?: number): Int8Array {
        let arrayBuffer = bufferToArrayBuffer(buffer, offset);
        return new Int8Array(arrayBuffer);
    }
}