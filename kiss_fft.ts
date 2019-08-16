import { ObjectArray } from "./ObjectArray";
import { String } from 'typescript-string-operations';
//import NP from 'number-precision'

export module kiss_fft {
    type kiss_fft_scalar = number;

    type size_t = number;

    let MAXFACTORS: number = 32;

    export class kiss_fft_cpx {
        r: kiss_fft_scalar = 0;
        i: kiss_fft_scalar = 0;
        toString(): string {
            return String.Format('kiss_fft_cpx r = {0} i = {1}', this.r, this.i);
        }
    }

    export class kiss_fft_state {
        nfft: number;
        inverse: number;
        factors: ObjectArray<Number> = new ObjectArray<Number>(2 * MAXFACTORS, Number);
        twiddles: ObjectArray<kiss_fft_cpx> = new ObjectArray<kiss_fft_cpx>(1, kiss_fft_cpx);
        toString(): string {
            return String.Format('kiss_fft_cpx r = {0} i = {1}\n  factors: {2}\n  twiddles: {3}', 
            this.nfft, this.inverse, this.factors, this.twiddles);
        }
    }
    export type kiss_fft_cfg = kiss_fft_state;

    export function C_MUL(m: any, a: any, b: any): void {
        // m.r = NP.minus(NP.times(a.r, b.r), NP.times(a.i, b.i));
        // m.i = NP.plus(NP.times(a.r, b.i), NP.times(a.i, b.r));
        m.r = a.r * b.r - a.i * b.i;
        m.i = a.r * b.i + a.i * b.r;
    }

    export function C_FIXDIV(c: any, div: any): void {
        ;
    }

    export function C_MULBYSCALAR(c: any, s: any) {
        c.r *= s;
        c.i *= s;
    }

    export function C_ADD(res: any, a: any, b: any): void {
        CHECK_OVERFLOW_OP(a.r, "+", b.r);
        CHECK_OVERFLOW_OP(a.i, "+", b.i);
        res.r = a.r + b.r;
        res.i = a.i + b.i;
    }

    export function C_SUB(res: any, a: any, b: any) {
        CHECK_OVERFLOW_OP(a.r, "-", b.r);
        CHECK_OVERFLOW_OP(a.i, "-", b.i);
        res.r = a.r - b.r;
        res.i = a.i - b.i;
    }

    export function C_ADDTO(res: any, a: any): void {
        CHECK_OVERFLOW_OP((res).r, "+", (a).r);
        CHECK_OVERFLOW_OP((res).i, "+", (a).i);
        (res).r += (a).r;
        (res).i += (a).i;
    }

    export function C_SUBFROM(res: any, a: any): void {
        CHECK_OVERFLOW_OP((res).r, "-", (a).r);
        CHECK_OVERFLOW_OP((res).i, "-", (a).i);
        (res).r -= (a).r;
        (res).i -= (a).i;
    }

    export function S_MUL(a: any, b: any): number {
        return a * b;
    }

    export function KISS_FFT_COS(phase: number) { return Math.cos(phase); }
    export function KISS_FFT_SIN(phase: number) { return Math.sin(phase); }
    export function HALF_OF(x: number): number { return ((x) * .5); }

    export function kf_cexp(x: kiss_fft_cpx, phase: number): void {
        x.r = parseFloat(KISS_FFT_COS(phase).toFixed(6));
        x.i = parseFloat(KISS_FFT_SIN(phase).toFixed(6));
    }


    //This function receives two number and one operator, and check if the desired operation will result
    // in a arithmetic overflow. If yes, return true, vice versa.
    export function CHECK_OVERFLOW_OP(a: number, op: string, b: number): boolean {
        if (a > Number.MAX_VALUE || a < Number.MIN_VALUE
            || b > Number.MAX_VALUE || b < Number.MIN_VALUE) {
            return true;
        }

        if (op == "+") {
            return (a + b > Number.MAX_VALUE);
        } else if (op == "-") {
            return (a + b < Number.MIN_VALUE);
        } else if (op == "/") {
            return (a / b > Number.MAX_VALUE || a / b < Number.MIN_VALUE)
        } else if (op == "*") {
            return (a * b > Number.MAX_VALUE);
        } else {
            console.log("Invalid Operator");
            return false;
        }
    }


    export function kf_bfly2(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        st: kiss_fft_cfg,
        m: number): void {

        let Fout = Fout_in.subarray();
        let tw1 = st.twiddles.subarray();
        let Fout2 = Fout_in.subarray(m);
        let t: kiss_fft_cpx;
        do {
            C_FIXDIV(Fout.value(), 2);
            C_FIXDIV(Fout2.value(), 2);
            C_MUL(t, Fout2.value(), tw1.value());
            tw1.seek(fstride);
            C_SUB(Fout2.value(), Fout.value(), t);
            C_ADDTO(Fout.value(), t);
            Fout2.seek(1);
            Fout.seek(1);
        } while (--m);
    }

    export function kf_bfly4(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        st: kiss_fft_cfg,
        m: size_t): void {

        let Fout = Fout_in.subarray();
        let scratch: Array<kiss_fft_cpx> = Array<kiss_fft_cpx>(6);
        for (var i = 0; i < scratch.length; i++) {
            scratch[i] = new kiss_fft_cpx();
        }
        let k: size_t = m;
        let m2: size_t = 2 * m;
        let m3: size_t = 3 * m;

        let tw1 = st.twiddles.subarray();
        let tw2 = st.twiddles.subarray();
        let tw3 = st.twiddles.subarray();

        do {
            let fv = Fout.value();
            let fmv = Fout.value(m);
            let fmv2 = Fout.value(m2);
            let fmv3 = Fout.value(m3);

            C_FIXDIV(fv, 4);
            C_FIXDIV(fmv, 4);
            C_FIXDIV(fmv2, 4);
            C_FIXDIV(fmv3, 4);

            C_MUL(scratch[0], fmv, tw1.value());
            C_MUL(scratch[1], fmv2, tw2.value());
            C_MUL(scratch[2], fmv3, tw3.value());

            C_SUB(scratch[5], fv, scratch[1]);
            C_ADDTO(fv, scratch[1]);
            C_ADD(scratch[3], scratch[0], scratch[2]);
            C_SUB(scratch[4], scratch[0], scratch[2]);
            C_SUB(fmv2, fv, scratch[3]);

            tw1.seek(fstride)
            tw2.seek(fstride * 2)
            tw3.seek(fstride * 3)

            C_ADDTO(fv, scratch[3]);

            if (st.inverse) {
                fmv.r = scratch[5].r - scratch[4].i;
                fmv.i = scratch[5].i + scratch[4].r;
                fmv3.r = scratch[5].r + scratch[4].i;
                fmv3.i = scratch[5].i - scratch[4].r;
            } else {
                fmv.r = scratch[5].r + scratch[4].i;
                fmv.i = scratch[5].i - scratch[4].r;
                fmv3.r = scratch[5].r - scratch[4].i;
                fmv3.i = scratch[5].i + scratch[4].r;
            }
            Fout.seek(1);
        } while (--k);
    }

    export function kf_bfly3(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        st: kiss_fft_cfg,
        m: size_t): void {

        let Fout = Fout_in.subarray();
        let k: size_t = m;
        let m2: size_t = 2 * m;
        let tw1 = st.twiddles.subarray();
        let tw2 = st.twiddles.subarray();
        let scratch: Array<kiss_fft_cpx> = new Array<kiss_fft_cpx>(5);
        for (var i = 0; i < scratch.length; i++) {
            scratch[i] = new kiss_fft_cpx();
        }
        let epi3: kiss_fft_cpx = st.twiddles.cloneValue(fstride * m);

        do {
            C_FIXDIV(Fout.value, 3); C_FIXDIV(Fout.value(m), 3); C_FIXDIV(Fout.value(m2), 3);

            C_MUL(scratch[1], Fout.value(m), tw1.value());
            C_MUL(scratch[2], Fout.value(m2), tw2.value());

            C_ADD(scratch[3], scratch[1], scratch[2]);
            C_SUB(scratch[0], scratch[1], scratch[2]);

            tw1.seek(fstride);
            tw2.seek(fstride * 2);
            //tw1 += fstride;
            //tw2 += (fstride * 2);

            Fout.value(m).r = Fout.value().r - HALF_OF(scratch[3].r);
            Fout.value(m).i = Fout.value().i - HALF_OF(scratch[3].i);

            C_MULBYSCALAR( scratch[0], epi3.i );

            C_ADDTO(Fout.value(), scratch[3]);

            Fout.value(m2).r = Fout.value(m).r + scratch[0].i;
            Fout.value(m2).i = Fout.value(m).i - scratch[0].r;

            Fout.value(m).r -= scratch[0].i;
            Fout.value(m).i += scratch[0].r;

            Fout.seek(1);
        } while (--k);
    }

    export function kf_bfly5(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        st: kiss_fft_cfg,
        m: number
    ) {
        let Fout = Fout_in.subarray();
        let Fout0 = Fout.subarray(0);
        let Fout1 = Fout.subarray(m);
        let Fout2 = Fout.subarray(2*m);
        let Fout3 = Fout.subarray(3*m);
        let Fout4 = Fout.subarray(4*m);

        let u: number;
        let scratch: Array<kiss_fft_cpx> = new Array<kiss_fft_cpx>(13);
        for (var i = 0; i < scratch.length; i++) {
            scratch[i] = new kiss_fft_cpx();
        }
        let twiddles = st.twiddles;
        let tw: ObjectArray<kiss_fft_cpx>;
        let ya: kiss_fft_cpx, yb: kiss_fft_cpx;
        ya = twiddles.cloneValue(fstride * m);
        yb = twiddles.cloneValue(fstride * 2 * m);

        tw = st.twiddles;

        for (u = 0; u < m; ++u) {
            C_FIXDIV(Fout0.value(), 5);
            C_FIXDIV(Fout1.value(), 5);
            C_FIXDIV(Fout2.value(), 5);
            C_FIXDIV(Fout3.value(), 5);
            C_FIXDIV(Fout4.value(), 5);
            scratch[0] = Fout0.cloneValue();

            C_MUL(scratch[1], Fout1.value(), tw.value(u * fstride));
            C_MUL(scratch[2], Fout2.value(), tw.value(2 * u * fstride));
            C_MUL(scratch[3], Fout3.value(), tw.value(3 * u * fstride));
            C_MUL(scratch[4], Fout4.value(), tw.value(4 * u * fstride));

            C_ADD(scratch[7], scratch[1], scratch[4]);
            C_SUB(scratch[10], scratch[1], scratch[4]);
            C_ADD(scratch[8], scratch[2], scratch[3]);
            C_SUB(scratch[9], scratch[2], scratch[3]);

            Fout0.value().r += scratch[7].r + scratch[8].r;
            Fout0.value().i += scratch[7].i + scratch[8].i;

            scratch[5].r = scratch[0].r + S_MUL(scratch[7].r, ya.r) + S_MUL(scratch[8].r, yb.r);
            scratch[5].i = scratch[0].i + S_MUL(scratch[7].i, ya.r) + S_MUL(scratch[8].i, yb.r);

            scratch[6].r = S_MUL(scratch[10].i, ya.i) + S_MUL(scratch[9].i, yb.i);
            scratch[6].i = -S_MUL(scratch[10].r, ya.i) - S_MUL(scratch[9].r, yb.i);

            C_SUB(Fout1.value(), scratch[5], scratch[6]);
            C_ADD(Fout4.value(), scratch[5], scratch[6]);

            scratch[11].r = scratch[0].r + S_MUL(scratch[7].r, yb.r) + S_MUL(scratch[8].r, ya.r);
            scratch[11].i = scratch[0].i + S_MUL(scratch[7].i, yb.r) + S_MUL(scratch[8].i, ya.r);
            scratch[12].r = -S_MUL(scratch[10].i, yb.i) + S_MUL(scratch[9].i, ya.i);
            scratch[12].i = S_MUL(scratch[10].r, yb.i) - S_MUL(scratch[9].r, ya.i);

            C_ADD(Fout2.value(), scratch[11], scratch[12]);
            C_SUB(Fout3.value(), scratch[11], scratch[12]);

            Fout0.seek(1);
            Fout1.seek(1);
            Fout2.seek(1);
            Fout3.seek(1);
            Fout4.seek(1);
        }
    }

    /* perform the butterfly for one stage of a mixed radix FFT */
    export function kf_bfly_generic(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        st: kiss_fft_cfg,
        m: number,
        p: number
    ): void {
        let Fout = Fout_in.subarray();
        let u: number, k: number, q1: number, q: number;
        let twiddles: ObjectArray<kiss_fft_cpx> = st.twiddles;
        let t: kiss_fft_cpx;
        let Norig: number = st.nfft;

        let scratch: Array<kiss_fft_cpx> = new Array<kiss_fft_cpx>(p);
        for (var i = 0; i < scratch.length; i++) {
            scratch[i] = new kiss_fft_cpx();
        }
        //kiss_fft_cpx * scratch = (kiss_fft_cpx*)KISS_FFT_TMP_ALLOC(sizeof(kiss_fft_cpx)*p);

        for (u = 0; u < m; ++u) {
            k = u;
            for (q1 = 0; q1 < p; ++q1) {
                scratch[q1] = Fout.value(k);
                C_FIXDIV(scratch[q1], p);
                k += m;
            }

            k = u;
            for (q1 = 0; q1 < p; ++q1) {
                let twidx: number = 0;
                Fout.setValue(scratch[0], k);
                for (q = 1; q < p; ++q) {
                    twidx += fstride * k;
                    if (twidx >= Norig) twidx -= Norig;
                    C_MUL(t, scratch[q], twiddles.value(twidx));
                    C_ADDTO(Fout.value(k), t);
                }
                k += m;
            }
        }
        // KISS_FFT_TMP_FREE(scratch);
    }

    export function kf_work(
        Fout_in: ObjectArray<kiss_fft_cpx>,
        f_in: ObjectArray<kiss_fft_cpx>,
        fstride: size_t,
        in_stride: number,
        factors_in: ObjectArray<Number>,
        st: kiss_fft_cfg): void {

        // let Fout_beg: kiss_fft_cpx = Fout.value();
        let factors = factors_in.subarray();
        let Fout = Fout_in.subarray();
        let f = f_in.subarray();
        let p: number = factors.value().valueOf();//*factors++; /* the radix  */
        factors.seek(1);
        let m: number = factors.value().valueOf();//*factors++; /* stage's fft length/p */
        factors.seek(1);
        let Fout_beg_index: number = Fout.cursor;
        let Fout_end_index: number = p * m;

        //#ifdef _OPENMP
        // use openmp extensions at the 
        // top-level (not recursive)
        // if (fstride == 1 && p <= 5) {
        //     let k: number;

        //     // execute the p different work units in different threads
        //     //#       pragma omp parallel for
        //     for (k = 0; k < p; ++k) {
        //         let Fout_new = Fout.subarray(k*m);
        //         let f_new = f.subarray(fstride*in_stride*k);
        //         kf_work(Fout_new, f_new, fstride * p, in_stride, factors, st);
        //     }

        //     // all threads have joined by this point

        //     switch (p) {
        //         case 2: kf_bfly2(Fout, fstride, st, m); break;
        //         case 3: kf_bfly3(Fout, fstride, st, m); break;
        //         case 4: kf_bfly4(Fout, fstride, st, m); break;
        //         case 5: kf_bfly5(Fout, fstride, st, m); break;
        //         default: kf_bfly_generic(Fout, fstride, st, m, p); break;
        //     }
        //     return;
        // }
        //#endif

        if (m == 1) {
            do {
                Fout.setValue(f.value());
                f.seek(fstride * in_stride);
                Fout.seek(1);
            } while (Fout.cursor != Fout_end_index);
        } else {
            do {
                // recursive call:
                // DFT of size m*p performed by doing
                // p instances of smaller DFTs of size m, 
                // each one takes a decimated version of the input
                kf_work(Fout, f, fstride * p, in_stride, factors, st);
                f.seek(fstride * in_stride);
                Fout.seek(m);
            } while (Fout.cursor != Fout_end_index);
        }

        Fout = Fout_in.subarray();
        // console.log("Fout beg %d", Fout_end_index);

        // recombine the p smaller DFTs 
        switch (p) {
            case 2: kf_bfly2(Fout, fstride, st, m); break;
            case 3: kf_bfly3(Fout, fstride, st, m); break;
            case 4: kf_bfly4(Fout, fstride, st, m); break;
            case 5: kf_bfly5(Fout, fstride, st, m); break;
            default: kf_bfly_generic(Fout, fstride, st, m, p); break;
        }
    }

    /*  facbuf is populated by p1,m1,p2,m2, ...
    where 
    p[i] * m[i] = m[i-1]
    m0 = n                  */
    export function kf_factor(n: number, facbuf: ObjectArray<Number>): void {
        let p: number = 4;
        let floor_sqrt: number;
        floor_sqrt = Math.floor(Math.sqrt(n));

        let tmpbuf = facbuf.subarray();
        /*factor out powers of 4, powers of 2, then any remaining primes */
        do {
            while (n % p) {
                switch (p) {
                    case 4: p = 2; break;
                    case 2: p = 3; break;
                    default: p += 2; break;
                }
                if (p > floor_sqrt)
                    p = n;          /* no more factors, skip to end */
            }
            n /= p;
            tmpbuf.setValue(new Number(p));tmpbuf.seek(1);
            tmpbuf.setValue(new Number(n));tmpbuf.seek(1);
        } while (n > 1);
    }


    export function kiss_fft_alloc(nfft: number, inverse_fft: number, mem: any, lenmem: size_t): kiss_fft_cfg {
        let st: kiss_fft_cfg;
        if (lenmem == 0) {
            st = new kiss_fft_state();
            for (var i = 0; i < nfft - 1; i++) {
                st.twiddles.add(new kiss_fft_cpx());
            }
        } else {
            if (mem != null && lenmem >= nfft) {
                st = mem;
            }
        }

        if (st) {
            let i: number;
            st.nfft = nfft;
            st.inverse = inverse_fft;

            for (i = 0; i < nfft; ++i) {
                let pi = 3.141592653589793238462643383279502884197169399375105820974944;
                let phase = -2 * pi * i / nfft;
                if (st.inverse) {
                    phase *= -1;
                }
                kf_cexp(st.twiddles.value(i), phase);
                // console.log(i + " r = " + st.twiddles.value(i).r + " i = " + st.twiddles.value(i).i + " p = " + phase);
            }

            kf_factor(nfft, st.factors);
        }
        return st;
    }
    /*
    *
    * User-callable function to allocate all necessary storage space for the fft.
    *
    * The return value is a contiguous block of memory, allocated with malloc.  As such,
    * It can be freed with free(), rather than a kiss_fft-specific function.
    * */
    // export function kiss_fft_alloc(nfft: number, inverse_fft: number, mem: void, lenmem: size_t): kiss_fft_cfg {
    //     let st: kiss_fft_cfg = null;
    //     size_t memneeded = sizeof(struct kiss_fft_state)
    //         + sizeof(kiss_fft_cpx)*(nfft-1); /* twiddle factors*/

    //     if (lenmem == null) {
    //         st = ( kiss_fft_cfg)KISS_FFT_MALLOC( memneeded );
    //     } else {
    //         if (mem != null && *lenmem >= memneeded)
    //             st = (kiss_fft_cfg)mem;
    //         *lenmem = memneeded;
    //     }
    //     if (st) {
    //         let i: number;
    //         st.nfft = nfft;
    //         st.inverse = inverse_fft;

    //         for (i = 0;i < nfft; ++i) {
    //             1let pi: number = 3.141592653589793238462643383279502884197169399375105820974944;
    //             let phase: number = -2 * pi * i / nfft;
    //             if (st.inverse)
    //                 phase *= -1;
    //             this.kf_cexp(st.twiddles[i], phase);
    //         }

    //         kf_factor(nfft,st.factors);
    //     }
    //     return st;
    // }


    export function kiss_fft_stride(st: kiss_fft_cfg, fin: ObjectArray<kiss_fft_cpx>, fout: ObjectArray<kiss_fft_cpx>, in_stride: number) {
        if (fin == fout) {
            //NOTE: this is not really an in-place FFT algorithm.
            //It just performs an out-of-place FFT into a temp buffer
            let tmpbuf: ObjectArray<kiss_fft_cpx> = new ObjectArray<kiss_fft_cpx>(st.nfft, kiss_fft_cpx);
            // let tmpbuf: kiss_fft_cpx[];
            //(kiss_fft_cpx*)KISS_FFT_TMP_ALLOC( sizeof(kiss_fft_cpx)*st->nfft)
            kf_work(tmpbuf, fin, 1, in_stride, st.factors, st);
            for (var i = 0; i < st.nfft; i++) {
                fout.setValue(tmpbuf.value(i), i);
            }
            //memcpy(fout,tmpbuf,sizeof(kiss_fft_cpx)*st->nfft);
            //KISS_FFT_TMP_FREE(tmpbuf);
        } else {
            kf_work(fout, fin, 1, in_stride, st.factors, st);
        }
    }

    export function kiss_fft(cfg: kiss_fft_cfg, fin: ObjectArray<kiss_fft_cpx>, fout: ObjectArray<kiss_fft_cpx>): void {
        kiss_fft_stride(cfg, fin, fout, 1);
    }

    export function kiss_fft_next_fast_size(n: number): number {
        while (true) {
            let m: number = n;
            while ((m % 2) == 0) m /= 2;
            while ((m % 3) == 0) m /= 3;
            while ((m % 5) == 0) m /= 5;
            if (m <= 1)
                break; /* n is completely factorable by twos, threes, and fives */
            n++;
        }
        return n;
    }
}