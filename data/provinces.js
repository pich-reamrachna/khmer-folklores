// data/provinces.js
//
// The 25 provinces of Cambodia (24 provinces + Phnom Penh). The contribute
// form's location dropdown is limited to these, and the chosen pair fills
// both place (English) and place_khmer at once, so the two never drift apart.
//
// The Khmer spellings are AI-drafted — the curator should verify each against
// an authoritative source before relying on them (Khmer is first-class
// content, never guessed at casually).
const provinces = [
  { en: "Banteay Meanchey", km: "បន្ទាយមានជ័យ" },
  { en: "Battambang", km: "បាត់ដំបង" },
  { en: "Kampong Cham", km: "កំពង់ចាម" },
  { en: "Kampong Chhnang", km: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", km: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", km: "កំពង់ធំ" },
  { en: "Kampot", km: "កំពត" },
  { en: "Kandal", km: "កណ្ដាល" },
  { en: "Kep", km: "កែប" },
  { en: "Koh Kong", km: "កោះកុង" },
  { en: "Kratie", km: "ក្រចេះ" },
  { en: "Mondulkiri", km: "មណ្ឌលគិរី" },
  { en: "Oddar Meanchey", km: "ឧត្ដរមានជ័យ" },
  { en: "Pailin", km: "ប៉ៃលិន" },
  { en: "Phnom Penh", km: "ភ្នំពេញ" },
  { en: "Preah Vihear", km: "ព្រះវិហារ" },
  { en: "Prey Veng", km: "ព្រៃវែង" },
  { en: "Pursat", km: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", km: "រតនគិរី" },
  { en: "Siem Reap", km: "សៀមរាប" },
  { en: "Preah Sihanouk", km: "ព្រះសីហនុ" },
  { en: "Stung Treng", km: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", km: "ស្វាយរៀង" },
  { en: "Takeo", km: "តាកែវ" },
  { en: "Tboung Khmum", km: "ត្បូងឃ្មុំ" },
];

export default provinces;
