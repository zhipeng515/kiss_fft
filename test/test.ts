import { kiss_fft } from "../src/kiss_fft"
import { ObjectArray } from "../src/ObjectArray"
import fs = require('fs');
import { ArrayUtil } from '../src/ArrayUtil';

const SV_FFT_N = 1024;
let buffer: Buffer = fs.readFileSync("./audio.wav").subarray(44);
let waveData: Int16Array = ArrayUtil.bufferToInt16Buffer(buffer);

let fftcfg: kiss_fft.kiss_fft_cfg = kiss_fft.kiss_fft_alloc(SV_FFT_N, 0, null, 0);
let dataIn = new ObjectArray<kiss_fft.kiss_fft_cpx>(SV_FFT_N, kiss_fft.kiss_fft_cpx);
let dataOut = new ObjectArray<kiss_fft.kiss_fft_cpx>(SV_FFT_N, kiss_fft.kiss_fft_cpx);

let i: number;
for (i = 0; i < SV_FFT_N; ++i) {
    dataIn.value(i).r = waveData[i];
}
kiss_fft.kiss_fft(fftcfg, dataIn, dataOut);