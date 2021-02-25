
  export interface Entry {
      _id: string;
      sgv: number;
      date: number;
      device: string;
      type: string;
      direction: string;
      dateString: Date;
      utcOffset: number;
      sysTime: Date;
      mills: any;
  }

    export interface Sgv {
        _id: string;
        mgdl: number;
        mills: number;
        device: string;
        direction: string;
        type: string;
        scaled: string;
    }

    export interface Bgnow {
        mean: number;
        last: number;
        mills: number;
        sgvs: Sgv[];
    }

    export interface Sgv2 {
        _id: string;
        mgdl: number;
        mills: number;
        device: string;
        direction: string;
        type: string;
    }

    export interface Previous {
        mean: number;
        last: number;
        mills: number;
        sgvs: Sgv2[];
    }

    export interface Delta {
        absolute: number;
        elapsedMins: number;
        interpolated: boolean;
        mean5MinsAgo: number;
        mgdl: number;
        scaled: number;
        display: string;
        previous: Previous;
    }

    export interface Direction {
      label: string,
      value: string
    }

    export interface Upbat {
    }

    export interface Iob {
    }

    export interface Cob {
    }

    export interface Pump {
    }

    export interface Loop {
    }

    export interface Basal {
    }

    export interface Properties {
        bgnow: Bgnow;
        delta: Delta;
        buckets: any[];
        direction: Direction;
        upbat: Upbat;
        iob: Iob;
        cob: Cob;
        pump: Pump;
        loop: Loop;
        basal: Basal;
    }

    export interface NSdisplayData {
      sgv: string;
      deltaDisplay: string;
      directionArrow: string;
      direction: string;
    }

}

