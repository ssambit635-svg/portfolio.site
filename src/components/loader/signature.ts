/**
 * The signature.
 *
 * Hand-authored monoline pen paths in exact writing order — an italic
 * chancery hand: entry flourish, connected lowercase, a capital S with a
 * returned terminal, and a long underline swash that sweeps back beneath the
 * whole name before the wax seal is stamped.
 *
 * Coordinates live in a 1120 × 320 viewBox. Each inner array is one stroke;
 * strokes are drawn in order, at one shared pen pace.
 */

export const SIGNATURE_VIEWBOX = '10 20 1100 300'

/** The letters of "Sambit Swain" plus the entry flourish and the swash. */
export const SIGNATURE_STROKES: { id: string; d: string[]; kind: 'letter' | 'flourish' | 'dot' }[] = [
  {
    id: 'entry-flourish',
    kind: 'flourish',
    d: ['M 26,168 C 38,126 66,92 106,76 C 130,66 144,80 132,96']
  },
  {
    id: 'S1',
    kind: 'letter',
    d: [
      'M 150,70 C 132,52 100,55 88,80 C 76,105 96,128 122,140 C 148,152 152,182 132,200 C 112,218 78,218 66,196 C 62,190 60,184 62,176',
      'M 66,196 C 84,214 110,214 130,204'
    ]
  },
  {
    id: 'a1',
    kind: 'letter',
    d: [
      'M 168,208 C 174,196 179,183 181,170 C 183,154 169,147 157,155 C 141,164 137,190 151,202 C 161,210 175,204 180,190 C 183,198 185,205 191,208 C 196,211 203,208 209,200'
    ]
  },
  {
    id: 'm',
    kind: 'letter',
    d: [
      'M 209,200 C 214,190 218,172 221,155 C 222,138 243,128 250,150 C 254,166 254,188 255,205 C 257,163 262,140 272,134 C 282,128 292,138 293,152 C 294,168 293,188 294,205 C 296,210 303,207 310,198'
    ]
  },
  {
    id: 'b',
    kind: 'letter',
    d: [
      'M 310,198 C 319,172 330,132 342,104 C 349,124 344,164 331,198 C 342,152 368,144 377,162 C 386,180 370,200 348,203 C 340,204 333,202 328,198 C 341,211 353,207 363,200'
    ]
  },
  {
    id: 'i1',
    kind: 'letter',
    d: ['M 362,200 C 368,188 372,168 374,152 C 376,168 376,192 380,206 C 383,210 390,208 398,200']
  },
  {
    id: 'i1-dot',
    kind: 'dot',
    d: ['M 381,113 l 1,1']
  },
  {
    id: 't',
    kind: 'letter',
    d: ['M 398,200 C 405,180 412,138 420,112 C 421,140 421,180 425,202 C 428,212 438,210 446,200']
  },
  {
    id: 't-bar',
    kind: 'letter',
    d: ['M 404,142 C 414,138 432,134 448,133']
  },
  {
    id: 'S2',
    kind: 'letter',
    d: [
      'M 690,70 C 672,52 640,55 628,80 C 616,105 636,128 662,140 C 688,152 692,182 672,200 C 652,218 618,218 606,196 C 602,190 600,184 602,176',
      'M 606,196 C 622,213 644,214 658,208'
    ]
  },
  {
    id: 'w',
    kind: 'letter',
    d: [
      'M 658,208 C 668,190 674,168 678,152 C 679,172 681,194 687,206 C 691,214 701,210 706,198 C 711,186 715,166 717,152 C 719,172 721,194 727,206 C 732,214 742,210 749,198',
      'M 749,198 C 762,204 778,207 790,205'
    ]
  },
  {
    id: 'a2',
    kind: 'letter',
    d: [
      'M 792,208 C 798,196 803,183 805,170 C 807,154 793,147 781,155 C 765,164 761,190 775,202 C 785,210 799,204 804,190 C 807,198 809,205 815,208 C 820,211 827,208 833,200'
    ]
  },
  {
    id: 'i2',
    kind: 'letter',
    d: ['M 833,200 C 839,188 843,168 845,152 C 847,168 847,192 851,206 C 854,210 861,208 869,200']
  },
  {
    id: 'i2-dot',
    kind: 'dot',
    d: ['M 852,113 l 1,1']
  },
  {
    id: 'n',
    kind: 'letter',
    d: [
      'M 869,200 C 873,190 877,170 879,155 C 880,137 898,130 905,146 C 909,158 907,185 906,202 C 908,210 916,207 924,197 C 942,191 966,186 986,182'
    ]
  },
  {
    id: 'swash',
    kind: 'flourish',
    d: [
      'M 988,180 C 1020,186 1042,204 1034,224 C 1024,248 952,258 832,260 C 634,264 366,258 190,244 C 122,238 76,228 56,216'
    ]
  }
]

/** Flat list of every path, in drawing order. */
export const SIGNATURE_PATHS = SIGNATURE_STROKES.flatMap((stroke) => stroke.d)

/** Where the wax seal sits, in viewBox coordinates. */
export const SEAL = { x: 1002, y: 248, r: 38 }
