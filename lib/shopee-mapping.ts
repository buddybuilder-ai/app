/**
 * Hardcoded mapping from furniture-catalog `id` (or the scene instance `id`,
 * which mirrors the catalog id) to a real Shopee search query.
 *
 * We deliberately link to Shopee's keyword search rather than a single
 * product page — product URLs on Shopee expire when sellers remove the
 * listing, while a search link stays fresh and gives the user options.
 */

export interface ShopeeSuggestion {
  /** Thai product label shown to the user. */
  name: string
  /** Shopee search URL. */
  url: string
  /** Rough price hint in THB (min). Rendered as "ประมาณ X,XXX บาท". */
  priceFromTHB?: number
}

function shopeeSearch(keywordTh: string): string {
  return `https://shopee.co.th/search?keyword=${encodeURIComponent(keywordTh)}`
}

// Keyed by the scene item's `id` (same as catalog id) — fall back to
// matching by `category` in the component if a specific id is missing.
export const SHOPEE_BY_ID: Record<string, ShopeeSuggestion> = {
  "bed-queen": {
    name: "เตียงควีนไซส์ 6 ฟุต พร้อมที่นอน",
    url: shopeeSearch("เตียงควีนไซส์ 6 ฟุต"),
    priceFromTHB: 4990,
  },
  "wardrobe-large": {
    name: "ตู้เสื้อผ้า 4 บานประตู ขนาดใหญ่",
    url: shopeeSearch("ตู้เสื้อผ้า 4 บาน"),
    priceFromTHB: 3590,
  },
  nightstand: {
    name: "ตู้ข้างเตียง 2 ลิ้นชัก",
    url: shopeeSearch("ตู้ข้างเตียง 2 ลิ้นชัก"),
    priceFromTHB: 890,
  },
  dresser: {
    name: "โต๊ะเครื่องแป้งพร้อมกระจก",
    url: shopeeSearch("โต๊ะเครื่องแป้งพร้อมกระจก"),
    priceFromTHB: 1990,
  },
  "sofa-3seat": {
    name: "โซฟา 3 ที่นั่ง ผ้ากำมะหยี่",
    url: shopeeSearch("โซฟา 3 ที่นั่ง"),
    priceFromTHB: 5490,
  },
  armchair: {
    name: "อาร์มแชร์เก้าอี้นั่งเล่น",
    url: shopeeSearch("อาร์มแชร์"),
    priceFromTHB: 1990,
  },
  "coffee-table": {
    name: "โต๊ะกลางโซฟา ไม้",
    url: shopeeSearch("โต๊ะกลางโซฟา"),
    priceFromTHB: 990,
  },
  "tv-stand": {
    name: "ชั้นวางทีวี ยาว 1.6 เมตร",
    url: shopeeSearch("ชั้นวางทีวี"),
    priceFromTHB: 1490,
  },
  bookshelf: {
    name: "ชั้นหนังสือ 5 ชั้น",
    url: shopeeSearch("ชั้นหนังสือ 5 ชั้น"),
    priceFromTHB: 1290,
  },
  "desk-work": {
    name: "โต๊ะทำงาน 120 ซม.",
    url: shopeeSearch("โต๊ะทำงาน 120 ซม"),
    priceFromTHB: 1590,
  },
  "office-chair": {
    name: "เก้าอี้สำนักงาน ergonomic",
    url: shopeeSearch("เก้าอี้สำนักงาน ergonomic"),
    priceFromTHB: 1790,
  },
  "dining-table": {
    name: "โต๊ะอาหาร 4 ที่นั่ง",
    url: shopeeSearch("โต๊ะอาหาร 4 ที่นั่ง"),
    priceFromTHB: 2290,
  },
  "dining-chair": {
    name: "เก้าอี้รับประทานอาหาร",
    url: shopeeSearch("เก้าอี้รับประทานอาหาร"),
    priceFromTHB: 590,
  },
  "plant-medium": {
    name: "ต้นไม้ฟอกอากาศ กระถางกลาง",
    url: shopeeSearch("ต้นไม้ฟอกอากาศในบ้าน"),
    priceFromTHB: 290,
  },
  "floor-lamp": {
    name: "โคมไฟตั้งพื้น สไตล์มินิมอล",
    url: shopeeSearch("โคมไฟตั้งพื้น"),
    priceFromTHB: 690,
  },
  "area-rug": {
    name: "พรมปูพื้นห้องนั่งเล่น",
    url: shopeeSearch("พรมปูพื้นห้องนั่งเล่น"),
    priceFromTHB: 590,
  },
  "sofa-bed": {
    name: "โซฟาเบด ปรับเป็นเตียง",
    url: shopeeSearch("โซฟาเบด ปรับเป็นเตียง"),
    priceFromTHB: 4990,
  },
  "compact-wardrobe": {
    name: "ตู้เสื้อผ้าคอมแพค 2 บาน",
    url: shopeeSearch("ตู้เสื้อผ้า 2 บาน"),
    priceFromTHB: 1990,
  },
  "room-divider": {
    name: "ฉากกั้นห้อง 3 แผ่นพับได้",
    url: shopeeSearch("ฉากกั้นห้อง พับได้"),
    priceFromTHB: 1490,
  },
  "folding-desk": {
    name: "โต๊ะทำงานพับได้ ประหยัดพื้นที่",
    url: shopeeSearch("โต๊ะทำงานพับได้"),
    priceFromTHB: 890,
  },
  "compact-dining-set": {
    name: "ชุดโต๊ะอาหาร 2 ที่นั่ง คอมแพค",
    url: shopeeSearch("ชุดโต๊ะอาหาร 2 ที่นั่ง"),
    priceFromTHB: 1990,
  },
  "kitchen-counter": {
    name: "เคาน์เตอร์ครัว ยาว 1.2 เมตร",
    url: shopeeSearch("เคาน์เตอร์ครัวสำเร็จรูป"),
    priceFromTHB: 2490,
  },
  "mini-fridge": {
    name: "ตู้เย็นมินิ 1 ประตู",
    url: shopeeSearch("ตู้เย็นมินิ"),
    priceFromTHB: 3490,
  },
  "microwave-stand": {
    name: "ชั้นวางไมโครเวฟ",
    url: shopeeSearch("ชั้นวางไมโครเวฟ"),
    priceFromTHB: 790,
  },
  "shoe-cabinet": {
    name: "ตู้รองเท้าประหยัดพื้นที่",
    url: shopeeSearch("ตู้รองเท้า"),
    priceFromTHB: 990,
  },
  "coat-rack": {
    name: "ที่แขวนเสื้อผ้า ตั้งพื้น",
    url: shopeeSearch("ที่แขวนเสื้อผ้าตั้งพื้น"),
    priceFromTHB: 490,
  },
}

// Generic fallback when the exact catalog id isn't mapped — keyed by the
// furniture `category` so AI-generated layouts with unknown ids still get
// a reasonable search link.
export const SHOPEE_BY_CATEGORY: Record<string, ShopeeSuggestion> = {
  bed: { name: "เตียงนอน", url: shopeeSearch("เตียงนอน"), priceFromTHB: 2990 },
  sofa: { name: "โซฟา", url: shopeeSearch("โซฟา"), priceFromTHB: 3990 },
  sofa_bed: { name: "โซฟาเบด", url: shopeeSearch("โซฟาเบด"), priceFromTHB: 4990 },
  wardrobe: { name: "ตู้เสื้อผ้า", url: shopeeSearch("ตู้เสื้อผ้า"), priceFromTHB: 1990 },
  nightstand: { name: "ตู้ข้างเตียง", url: shopeeSearch("ตู้ข้างเตียง"), priceFromTHB: 790 },
  dresser: { name: "โต๊ะเครื่องแป้ง", url: shopeeSearch("โต๊ะเครื่องแป้ง"), priceFromTHB: 1990 },
  desk: { name: "โต๊ะทำงาน", url: shopeeSearch("โต๊ะทำงาน"), priceFromTHB: 1290 },
  chair: { name: "เก้าอี้", url: shopeeSearch("เก้าอี้ทำงาน"), priceFromTHB: 690 },
  table: { name: "โต๊ะ", url: shopeeSearch("โต๊ะ"), priceFromTHB: 990 },
  tv_stand: { name: "ชั้นวางทีวี", url: shopeeSearch("ชั้นวางทีวี"), priceFromTHB: 1290 },
  bookshelf: { name: "ชั้นหนังสือ", url: shopeeSearch("ชั้นหนังสือ"), priceFromTHB: 990 },
  rug: { name: "พรม", url: shopeeSearch("พรมปูพื้น"), priceFromTHB: 590 },
  lamp: { name: "โคมไฟ", url: shopeeSearch("โคมไฟ"), priceFromTHB: 590 },
  plant: { name: "ต้นไม้ในบ้าน", url: shopeeSearch("ต้นไม้ในบ้าน"), priceFromTHB: 290 },
}

export function getShopeeSuggestion(
  itemId: string,
  category?: string
): ShopeeSuggestion | null {
  return (
    SHOPEE_BY_ID[itemId] ??
    (category ? SHOPEE_BY_CATEGORY[category] : null) ??
    null
  )
}
