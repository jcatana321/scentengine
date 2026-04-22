import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Plus, X, ChevronDown, Beaker, Sparkles, AlertTriangle, Check, FlaskConical } from "lucide-react";

// ── Colour system ────────────────────────────────────────────────────────────
const FAMILY_COLORS = {
  Floral:              { bg: "#FFF0F5", dot: "#E8628A", text: "#9B2C4E" },
  Woody:               { bg: "#F5F0E8", dot: "#8B6914", text: "#5C4209" },
  Amber:               { bg: "#FFF8EC", dot: "#D97706", text: "#92400E" },
  Citrus:              { bg: "#FEFCE8", dot: "#CA8A04", text: "#78350F" },
  Musk:                { bg: "#F0F0FF", dot: "#7C3AED", text: "#4C1D95" },
  "Macrocyclic musk":  { bg: "#F5F0FF", dot: "#9333EA", text: "#581C87" },
  "Polyclic musk":     { bg: "#EEF0FF", dot: "#6366F1", text: "#312E81" },
  Aromatic:            { bg: "#ECFDF5", dot: "#059669", text: "#064E3B" },
  Herbacious:          { bg: "#F0FDF4", dot: "#16A34A", text: "#14532D" },
  Herbs:               { bg: "#ECFEF5", dot: "#10B981", text: "#064E3B" },
  Fruity:              { bg: "#FFF7ED", dot: "#EA580C", text: "#7C2D12" },
  Sweet:               { bg: "#FDF4FF", dot: "#C026D3", text: "#701A75" },
  Gourmound:           { bg: "#FEF9EC", dot: "#D97706", text: "#713F12" },
  Molecule:            { bg: "#F0F9FF", dot: "#0284C7", text: "#0C4A6E" },
  Aldehyde:            { bg: "#F0FFFE", dot: "#0D9488", text: "#134E4A" },
  Leather:             { bg: "#F3F0EB", dot: "#78350F", text: "#451A03" },
  Citrus:              { bg: "#FEFCE8", dot: "#CA8A04", text: "#78350F" },
  Ionones:             { bg: "#FFF0F9", dot: "#DB2777", text: "#831843" },
  Lactone:             { bg: "#F0FFFD", dot: "#0F766E", text: "#134E4A" },
  Ketone:              { bg: "#FFF0EE", dot: "#DC2626", text: "#7F1D1D" },
  "Terpene hydrocarbon":{ bg: "#F0FFF4", dot: "#166534", text: "#14532D" },
  "Fragrance oil":     { bg: "#F8F5FF", dot: "#7C3AED", text: "#4C1D95" },
  "Perfume bases":     { bg: "#F5F5F5", dot: "#6B7280", text: "#374151" },
  Uncategorised:       { bg: "#F9FAFB", dot: "#9CA3AF", text: "#6B7280" },
  Other:               { bg: "#F9FAFB", dot: "#9CA3AF", text: "#6B7280" },
};
const familyColor = (f) => FAMILY_COLORS[f] || FAMILY_COLORS.Other;

// ── Strength config ──────────────────────────────────────────────────────────
const STRENGTHS = [
  { label: "Trace",    pct: 0.5,  color: "#E2E8F0" },
  { label: "Light",    pct: 2,    color: "#BAE6FD" },
  { label: "Medium",   pct: 5,    color: "#6EE7B7" },
  { label: "Strong",   pct: 12,   color: "#FCD34D" },
  { label: "Dominant", pct: 25,   color: "#F87171" },
];

// ── Zones ────────────────────────────────────────────────────────────────────
const ZONES = ["top", "heart", "base"];
const ZONE_LABELS = { top: "Top", heart: "Heart", base: "Base" };
const ZONE_COLORS = { top: "#DBEAFE", heart: "#FCE7F3", base: "#FEF3C7" };
const ZONE_DOT    = { top: "#3B82F6", heart: "#EC4899", base: "#F59E0B" };

// ── 25 House Accords ─────────────────────────────────────────────────────────
const ACCORDS = [
  { id: "A1",  num: 1,  name: "Iris & Cashmere",           character: "Musk",      tags: ["Fresh/Clean","Sweet","Resinous"],  descriptor: "Soft, powdery and cozy — orris close to the skin",          family: "Musk",      materials: ["Amber white","Orris"] },
  { id: "A2",  num: 2,  name: "Madagascar Vanilla & Sandalwood", character: "Gourmand", tags: ["Sweet","Gourmand","Woody"], descriptor: "Creamy vanilla bean and sandalwood",                          family: "Sweet",     materials: ["Vanilla Bean","Sandalwood"] },
  { id: "A3",  num: 3,  name: "Hydrangea & Lilac",          character: "Floral",    tags: ["Floral","Green","Fresh/Clean"],    descriptor: "Green dewy floral — lilac and lily of the valley",          family: "Floral",    materials: ["Lotus Flower","Lilas pure 2oz","Roman  Chamomile","Lily of The Valley"] },
  { id: "A4",  num: 4,  name: "Ambrette & Oak",             character: "Amber",     tags: ["Sweet","Earthy","Resinous"],       descriptor: "Dark sweet dominant amber — warm and seductive",            family: "Amber",     materials: ["Golden Sand","Amber","Ambroxan"] },
  { id: "A5",  num: 5,  name: "Peony, Freesia & Mimosa",    character: "Floral",    tags: ["Floral","Fresh/Clean","Sweet"],    descriptor: "Soft elegant soapy cherry blossom — fresh pink floral",    family: "Floral",    materials: ["Cherry Blossom 16oz Sos","Chanel chance","Floral aldehyde","Ylang ylang"] },
  { id: "A6",  num: 6,  name: "Smoky Maté Tea & Verbena",   character: "Citrus",    tags: ["Citrus","Earthy","Aromatic"],      descriptor: "Fresh citrus bergamot and mandarin with smoky bottom",      family: "Citrus",    materials: ["Mandarin mex","Creed aventus","Bergamot"] },
  { id: "A7",  num: 7,  name: "Black Currant & Patchouli",  character: "Aromatic",  tags: ["Earthy","Woody","Fruity"],         descriptor: "Vibrant herbal — black currant and patchouli",              family: "Herbacious",materials: ["Pachouli","Black current","Lavendar 40/42"] },
  { id: "A8",  num: 8,  name: "Clearwood & Sage",           character: "Woody",     tags: ["Woody","Aromatic","Fresh/Clean"],  descriptor: "Fresh clean crisp clearwood and sage",                     family: "Woody",     materials: ["Mahogany","Sage Naz","Saif al misk","Clearwood","ISO E Super"] },
  { id: "A9",  num: 9,  name: "Cedarwood & Fresh Incense",  character: "Woody",     tags: ["Woody","Earthy","Resinous"],       descriptor: "Dark smoky cedarwood and incense",                          family: "Woody",     materials: ["Santaliff","Frida Lab","Cedarwood"] },
  { id: "A10", num: 10, name: "Hinoki & Juniper",           character: "Aromatic",  tags: ["Aromatic","Woody","Fresh/Clean"],  descriptor: "Fresh pine and juniper — outdoors forest",                  family: "Herbacious",materials: ["Balsam fir needle 4oz","Forest fresh pine  30ML","Juniper","Ivy Base"] },
  { id: "A11", num: 11, name: "Cardamom & Tobacco Leaf",    character: "Gourmand",  tags: ["Gourmand","Spicy","Resinous"],     descriptor: "Sweet smoky tobacco leaf and cardamom",                     family: "Aromatic",  materials: ["Tabbaco Naz","Cedarwood","Cardamom"] },
  { id: "A12", num: 12, name: "Indian Jasmine & Bois de Rose", character: "Floral", tags: ["Floral","Earthy","Woody"],         descriptor: "Classic Indian jasmine and rose with cedarwood",            family: "Floral",    materials: ["Jasmine Egyptian","Rose","Cedarwood Virginia","Floral aldehyde","Damascol","Edward rose 5ml","ISO E Super"] },
  { id: "A13", num: 13, name: "Grapefruit & Pink Peppercorn","character": "Citrus", tags: ["Citrus","Spicy","Fresh/Clean"],    descriptor: "Vibrant sparkling spicy grapefruit and pink pepper",        family: "Citrus",    materials: ["Fresh Grapefruit","Pink Peppercorn"] },
  { id: "A14", num: 14, name: "Fig & Cypress",              character: "Aromatic",  tags: ["Aromatic","Woody","Green"],        descriptor: "Ivy green cypress and fig — earthy evergreen",              family: "Herbacious",materials: ["Ivy Base","Cypress","Balsam fir needle 4oz","ISO E Super"] },
  { id: "A15", num: 15, name: "Salted Caramel & Saffron",   character: "Gourmand",  tags: ["Gourmand","Sweet","Resinous"],     descriptor: "Intense edible saffron and butterscotch",                   family: "Sweet",     materials: ["Butterscotch Vanilla","Saffron Tinc 10%"] },
  { id: "A16", num: 16, name: "Rose Wardia & Oud",          character: "Floral",    tags: ["Floral","Resinous","Fruity"],      descriptor: "Velvety deep rose with dark fruits and oud",               family: "Floral",    materials: ["sandal rose","Tom Ford Oudwood Essential","Hibiscus  Lola 1/4oz"] },
  { id: "A17", num: 17, name: "Cognac & Suede",             character: "Leather",   tags: ["Resinous","Sweet","Woody"],        descriptor: "Boozy leather cognac and suede",                            family: "Leather",   materials: ["ISO E Super","Suederal Lt","Ethyl maltol"] },
  { id: "A18", num: 18, name: "Lavender & Black Pepper",    character: "Aromatic",  tags: ["Aromatic","Spicy","Floral"],       descriptor: "Creamy lavender with black pepper bringing green tones",    family: "Aromatic",  materials: ["Lavender","Black Pepper India","Pachouli"] },
  { id: "A19", num: 19, name: "Coconut Water & Musk",       character: "Musk",      tags: ["Fruity","Fresh/Clean","Resinous"], descriptor: "Light creamy tropical coconut and soft musk",               family: "Fruity",    materials: ["Coconut","Superior Egyptian Musk 1oz"] },
  { id: "A20", num: 20, name: "Coffee, Mocha & Cream",      character: "Gourmand",  tags: ["Gourmand","Sweet"],                descriptor: "Coffee mocha vanilla bean roasted caramel",                 family: "Sweet",     materials: ["Coffee Florida","Vanilla Bean","Butterscotch Vanilla","Ethyl maltol","Vanillin Crystals","Methyl Cyclo Pentenolone"] },
  { id: "A21", num: 21, name: "Tomato Leaf, Basil & Rhubarb","character": "Green",  tags: ["Green","Aromatic","Fresh/Clean"],  descriptor: "Green tomato leaf and ivy — fresh garden",                  family: "Herbacious",materials: ["Fresh Grapefruit","Basil","Ivy Base"] },
  { id: "A22", num: 22, name: "Agarwood & Chai",            character: "Resinous",  tags: ["Resinous","Spicy","Gourmand"],     descriptor: "Dark chai tea cardamom and oud — luxurious spices",         family: "Amber",     materials: ["Ethyl maltol","Agar Oud","Ginger Dilute","Cardamom","Clove"] },
  { id: "A23", num: 23, name: "Peach Nectarine & Apricot",  character: "Fruity",    tags: ["Fruity","Fresh/Clean","Sweet"],    descriptor: "Sparkling vibrant tropical melon and passionfruit",         family: "Fruity",    materials: ["Methyl Laitone","Cantaloupe","Passion fruit"] },
  { id: "A24", num: 24, name: "Sea Salt & Driftwood",       character: "Aquatic",   tags: ["Fresh/Clean","Earthy","Woody"],    descriptor: "Aquatic sea salt and fresh breeze with driftwood",          family: "Molecule",  materials: ["Veramoss","Helional","Fix  505","Precyclemone B Aldemone","Ambroxan","Hedione","Lemon"] },
  { id: "A25", num: 25, name: "Magnolia & Orange Flower",   character: "Floral",    tags: ["Floral","Sweet","Resinous"],       descriptor: "Bold white floral — classic elegant magnolia",              family: "Floral",    materials: ["white oud"] },
];

// ── Full ingredient database ──────────────────────────────────────────────────
const INGREDIENTS = [{"id":1,"name":"360 Perry Eliss","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":2,"name":"5-methyl-2-phenyl-2-hexenal","family":"Sweet","ifra":8.0,"supplier":"Perfume apprentice"},{"id":3,"name":"6-methyl- Quinoline","family":"Leather","ifra":null,"supplier":"Fraterworks"},{"id":4,"name":"Abs Ambergris","family":"Molecule","ifra":null,"supplier":"Fraterworks"},{"id":5,"name":"Agar Oud","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":6,"name":"Agarwood","family":"Uncategorised","ifra":null,"supplier":"Eden botanicals"},{"id":7,"name":"Aldehyde 16 Strawberry","family":"Fruity","ifra":15.0,"supplier":"Perfume apprentice"},{"id":8,"name":"Aldehyde C10","family":"Molecule","ifra":null,"supplier":"Perfume apprentice"},{"id":9,"name":"Aldehyde C11","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":10,"name":"Aldehyde C11 Undecylenic","family":"Aldehyde","ifra":null,"supplier":"Fraterworks"},{"id":11,"name":"Aldehyde C12 Mma","family":"Molecule","ifra":0.25,"supplier":"Fraterworks"},{"id":12,"name":"Aldehyde C8","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":13,"name":"Aldehyde C9","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":14,"name":"Ally Amyl Glycolate","family":"Fruity","ifra":0.25,"supplier":"Fraterworks"},{"id":15,"name":"Amber","family":"Amber","ifra":null,"supplier":"Naz Oil"},{"id":16,"name":"Amber Extreme 10%","family":"Uncategorised","ifra":null,"supplier":""},{"id":17,"name":"Amber white","family":"Amber","ifra":null,"supplier":"Naz Oil"},{"id":18,"name":"AmberXtreme 10%dpg","family":"Ketone","ifra":1.0,"supplier":"Fraterworks"},{"id":19,"name":"Ambergris","family":"Uncategorised","ifra":null,"supplier":"Lola"},{"id":20,"name":"Ambrettolide","family":"Macrocyclic musk","ifra":0.5,"supplier":"Fraterworks"},{"id":21,"name":"Ambroxan","family":"Amber","ifra":null,"supplier":"Perfume supply house"},{"id":22,"name":"Anais Anais","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":23,"name":"Anisaldehyde","family":"Aldehyde","ifra":1.4,"supplier":"Fraterworks"},{"id":24,"name":"Annis Annis","family":"Fragrance oil","ifra":null,"supplier":""},{"id":25,"name":"Annointment oil","family":"Perfume bases","ifra":null,"supplier":""},{"id":26,"name":"Anti anxiety base","family":"Perfume bases","ifra":null,"supplier":""},{"id":27,"name":"Apple","family":"Fruity","ifra":null,"supplier":""},{"id":28,"name":"Apple Fantasy","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":29,"name":"Aqua De Gio","family":"Uncategorised","ifra":null,"supplier":""},{"id":30,"name":"Archangel Gab","family":"Perfume bases","ifra":null,"supplier":""},{"id":31,"name":"Armani  Perfume 8 oz","family":"Fragrance oil","ifra":null,"supplier":""},{"id":32,"name":"Armani code","family":"Fragrance oil","ifra":null,"supplier":""},{"id":33,"name":"Armani type","family":"Fragrance oil","ifra":null,"supplier":""},{"id":34,"name":"Aubrey Oil","family":"Floral","ifra":null,"supplier":""},{"id":35,"name":"Baby Oil","family":"Uncategorised","ifra":null,"supplier":""},{"id":36,"name":"Baccarat Type","family":"Uncategorised","ifra":null,"supplier":""},{"id":37,"name":"Balsam fir needle 4oz","family":"Herbacious","ifra":null,"supplier":"Plant guru"},{"id":38,"name":"Balsam fir needle Sos 4oz","family":"Herbacious","ifra":null,"supplier":"Save on scents"},{"id":39,"name":"Banana","family":"Fruity","ifra":null,"supplier":""},{"id":40,"name":"Basil","family":"Herbacious","ifra":null,"supplier":"Naz Oil"},{"id":41,"name":"Bay Leave","family":"Herbs","ifra":null,"supplier":""},{"id":42,"name":"Benzaldehyde","family":"Fruity","ifra":0.25,"supplier":"Perfume apprentice"},{"id":43,"name":"Benzoin","family":"Amber","ifra":null,"supplier":"Save on scents"},{"id":44,"name":"Benzoin 5ml Lola","family":"Amber","ifra":null,"supplier":"Lola"},{"id":45,"name":"Benzoin Resinoid, Siam","family":"Sweet","ifra":null,"supplier":""},{"id":46,"name":"Benzoin Resinoid, Siam","family":"Woody","ifra":null,"supplier":""},{"id":47,"name":"Benzyl Acetate","family":"Floral","ifra":30.0,"supplier":"Perfume apprentice"},{"id":48,"name":"Benzyl Salicylate","family":"Floral","ifra":null,"supplier":"Perfume apprentice"},{"id":49,"name":"Benzyl Salicylate","family":"Floral","ifra":null,"supplier":"Fraterworks"},{"id":50,"name":"Bergamal","family":"Citrus","ifra":null,"supplier":"Perfume apprentice"},{"id":51,"name":"Bergamont Naz","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":52,"name":"Bergamot","family":"Citrus","ifra":null,"supplier":"Eden botanicals"},{"id":53,"name":"Bergamot & Ambergris","family":"Amber","ifra":null,"supplier":"The wooden wick"},{"id":54,"name":"Birch","family":"Aromatic","ifra":null,"supplier":"Plant guru"},{"id":55,"name":"Black Butter","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":56,"name":"Black Pepper India","family":"Aromatic","ifra":null,"supplier":"Perfume apprentice"},{"id":57,"name":"Black cumin","family":"Gourmound","ifra":null,"supplier":"Lola"},{"id":58,"name":"Black current","family":"Herbacious","ifra":null,"supplier":""},{"id":59,"name":"Black current Lola","family":"Herbacious","ifra":null,"supplier":"Lola"},{"id":60,"name":"Black pepper","family":"Gourmound","ifra":null,"supplier":"Artizen"},{"id":61,"name":"Bleu De Chanel","family":"Perfume bases","ifra":null,"supplier":""},{"id":62,"name":"Blood Orange 8oz","family":"Citrus","ifra":null,"supplier":"Save on scents"},{"id":63,"name":"Bloom","family":"Perfume bases","ifra":null,"supplier":""},{"id":64,"name":"Born In Roma","family":"Perfume bases","ifra":null,"supplier":""},{"id":65,"name":"Bran Abs","family":"Uncategorised","ifra":null,"supplier":""},{"id":66,"name":"Butterscotch Vanilla","family":"Sweet","ifra":null,"supplier":"Naz Oil"},{"id":67,"name":"Calone 1951","family":"Molecule","ifra":0.05,"supplier":"Perfume apprentice"},{"id":68,"name":"Calvin Klein Eternity","family":"Perfume bases","ifra":null,"supplier":""},{"id":69,"name":"Camphor","family":"Aromatic","ifra":null,"supplier":"Naz Oil"},{"id":70,"name":"Cantaloupe","family":"Fruity","ifra":null,"supplier":""},{"id":71,"name":"Cardamom","family":"Gourmound","ifra":null,"supplier":"Save on scents"},{"id":72,"name":"Cashmeran","family":"Musk","ifra":2.0,"supplier":"Perfume apprentice"},{"id":73,"name":"Cassia bark","family":"Aromatic","ifra":null,"supplier":"Aura cacia"},{"id":74,"name":"Cassie Abs Spain","family":"Floral","ifra":null,"supplier":"Eden botanicals"},{"id":75,"name":"Cassis Black Current","family":"Uncategorised","ifra":null,"supplier":""},{"id":76,"name":"Cedarwood","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":77,"name":"Cedarwood Virginia","family":"Woody","ifra":20.0,"supplier":"Perfume apprentice"},{"id":78,"name":"Cerezoate(fruitaleur)","family":"Fruity","ifra":null,"supplier":"Perfume supply house"},{"id":79,"name":"Chanel 5","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":80,"name":"Chanel chance","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":81,"name":"Cherry","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":82,"name":"Cherry Blossom 16oz Sos","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":83,"name":"Chocolate extract","family":"Sweet","ifra":null,"supplier":""},{"id":84,"name":"Cinnamon","family":"Gourmound","ifra":null,"supplier":"Naz Oil"},{"id":85,"name":"Cis 3 Hexenyl Acetate 10%","family":"Herbacious","ifra":0.16,"supplier":"Fraterworks"},{"id":86,"name":"Cis Jasmone","family":"Floral","ifra":3.0,"supplier":""},{"id":87,"name":"Cistus Abs","family":"Amber","ifra":null,"supplier":"Eden botanicals"},{"id":88,"name":"Citral","family":"Citrus","ifra":0.62,"supplier":"Fraterworks"},{"id":89,"name":"Citronella","family":"Citrus","ifra":null,"supplier":"Save on scents"},{"id":90,"name":"Citronellol 950","family":"Citrus","ifra":null,"supplier":"Perfume supply house"},{"id":91,"name":"Civetone 1% Sda","family":"Amber","ifra":null,"supplier":""},{"id":92,"name":"Civettone 10% IPM","family":"Musk","ifra":null,"supplier":"Mane"},{"id":93,"name":"Clary sage","family":"Aromatic","ifra":null,"supplier":"Save on scents"},{"id":94,"name":"Clearwood","family":"Woody","ifra":null,"supplier":"Perfume apprentice"},{"id":95,"name":"Clementine & Green tea","family":"Fruity","ifra":null,"supplier":"Filmore"},{"id":96,"name":"Clove","family":"Gourmound","ifra":null,"supplier":"Naz Oil"},{"id":97,"name":"Clove Stem Madagascar","family":"Aromatic","ifra":null,"supplier":"Perfume apprentice"},{"id":98,"name":"Coco piña","family":"Fruity","ifra":null,"supplier":"Mexico"},{"id":99,"name":"Cocomango","family":"Fruity","ifra":null,"supplier":""},{"id":100,"name":"Coconut","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":101,"name":"Coffee Florida","family":"Sweet","ifra":null,"supplier":"Florida"},{"id":102,"name":"Coffee Leather","family":"Perfume bases","ifra":null,"supplier":""},{"id":103,"name":"Coffee Trescent","family":"Aromatic","ifra":null,"supplier":"Filmore"},{"id":104,"name":"Coriander","family":"Herbacious","ifra":null,"supplier":"Plant guru"},{"id":105,"name":"Coumarin Natural","family":"Sweet","ifra":1.5,"supplier":"Perfume supply house"},{"id":106,"name":"Creamy","family":"Perfume bases","ifra":null,"supplier":""},{"id":107,"name":"Creed Silver Mountain Water","family":"Uncategorised","ifra":null,"supplier":""},{"id":108,"name":"Creed aventus","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":109,"name":"Crystal Import","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":110,"name":"Crystal cleaner","family":"Perfume bases","ifra":null,"supplier":""},{"id":111,"name":"Cucumber Extract","family":"Herbacious","ifra":null,"supplier":"Perfume apprentice"},{"id":112,"name":"CucumberMelon","family":"Fruity","ifra":null,"supplier":""},{"id":113,"name":"Cyclamen Aldehyde","family":"Aldehyde","ifra":0.77,"supplier":"Fraterworks"},{"id":114,"name":"Cypress","family":"Citrus","ifra":null,"supplier":"Save on scents"},{"id":115,"name":"Cypress mex","family":"Citrus","ifra":null,"supplier":"Mexico"},{"id":116,"name":"Cypriol","family":"Herbacious","ifra":null,"supplier":"Perfume apprentice"},{"id":117,"name":"Damascol","family":"Floral","ifra":5.0,"supplier":"Perfume apprentice"},{"id":118,"name":"Dark Amber 5ML","family":"Amber","ifra":null,"supplier":""},{"id":119,"name":"Dayana Special Oil","family":"Fragrance oil","ifra":null,"supplier":""},{"id":120,"name":"Delta Delactone","family":"Lactone","ifra":null,"supplier":""},{"id":121,"name":"Dihydro Ionne Beta","family":"Uncategorised","ifra":null,"supplier":""},{"id":122,"name":"Dihydro Mycenol","family":"Floral","ifra":75.0,"supplier":"Perfume apprentice"},{"id":123,"name":"Dihydro Myrcenol","family":"Ionones","ifra":null,"supplier":"Fraterworks"},{"id":124,"name":"Dior savage","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":125,"name":"Dolce And gabana","family":"Fragrance oil","ifra":null,"supplier":"Mexico"},{"id":126,"name":"Dominance","family":"Perfume bases","ifra":null,"supplier":""},{"id":127,"name":"Dragons blood","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":128,"name":"E blossom","family":"Floral","ifra":null,"supplier":""},{"id":129,"name":"Edward rose 5ml","family":"Floral","ifra":null,"supplier":"Sleeping dragon"},{"id":130,"name":"Egyptian musk","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":131,"name":"Egyptian musk import","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":132,"name":"Elegance","family":"Perfume bases","ifra":null,"supplier":""},{"id":133,"name":"Elemi","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":134,"name":"Envy W","family":"Fragrance oil","ifra":null,"supplier":"Save on scents"},{"id":135,"name":"Eternity","family":"Fragrance oil","ifra":null,"supplier":""},{"id":136,"name":"Ethyl Linalyl Acetate","family":"Citrus","ifra":40.0,"supplier":"Perfume apprentice"},{"id":137,"name":"Ethyl Vanillin","family":"Gourmound","ifra":null,"supplier":"Fraterworks"},{"id":138,"name":"Ethyl maltol","family":"Sweet","ifra":10.0,"supplier":"Perfume apprentice"},{"id":139,"name":"Ethylene Brassylate","family":"Macrocyclic musk","ifra":10.0,"supplier":"Fraterworks"},{"id":140,"name":"Eucalyptus","family":"Aromatic","ifra":null,"supplier":""},{"id":141,"name":"Eugenyl Acetate","family":"Uncategorised","ifra":null,"supplier":"Mane"},{"id":142,"name":"Evening Jasmine","family":"Floral","ifra":null,"supplier":""},{"id":143,"name":"Evening primrose","family":"Floral","ifra":null,"supplier":""},{"id":144,"name":"Evewood Natwist","family":"Uncategorised","ifra":null,"supplier":"Mane"},{"id":145,"name":"Exotic Teakwood","family":"Woody","ifra":null,"supplier":"Save on scents"},{"id":146,"name":"Fahrenheit","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":147,"name":"Fenugreek Ext","family":"Uncategorised","ifra":null,"supplier":""},{"id":148,"name":"Firascone","family":"Floral","ifra":null,"supplier":"Perfume apprentice"},{"id":149,"name":"Fix  505","family":"Molecule","ifra":null,"supplier":""},{"id":150,"name":"Fixative Base Citrus","family":"Molecule","ifra":null,"supplier":""},{"id":151,"name":"Fixolide","family":"Polyclic musk","ifra":2.5,"supplier":"Fraterworks"},{"id":152,"name":"Floral","family":"Perfume bases","ifra":null,"supplier":""},{"id":153,"name":"Floral Accord","family":"Uncategorised","ifra":null,"supplier":""},{"id":154,"name":"Floral aldehyde","family":"Molecule","ifra":null,"supplier":"Save on scents"},{"id":155,"name":"Florol","family":"Floral","ifra":2.1,"supplier":"Fraterworks"},{"id":156,"name":"Flower bomb","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":157,"name":"Flower bomb midnight","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":158,"name":"Forest fresh pine  30ML","family":"Woody","ifra":null,"supplier":"Save on scents"},{"id":159,"name":"Fragrance Fixative","family":"Molecule","ifra":null,"supplier":"Save on scents"},{"id":160,"name":"Fraistone","family":"Fruity","ifra":null,"supplier":"Perfume apprentice"},{"id":161,"name":"Frankincense","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":162,"name":"Frankincense Essen","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":163,"name":"Fresco","family":"Perfume bases","ifra":null,"supplier":""},{"id":164,"name":"Fresh Cut grass","family":"Herbacious","ifra":null,"supplier":"Amazon"},{"id":165,"name":"Fresh Grapefruit","family":"Citrus","ifra":null,"supplier":"Perfume apprentice"},{"id":166,"name":"Fresh Rain","family":"Molecule","ifra":null,"supplier":"Filmore"},{"id":167,"name":"Frida Lab","family":"Amber","ifra":null,"supplier":""},{"id":168,"name":"Galaxolide","family":"Molecule","ifra":12.0,"supplier":"Perfume apprentice"},{"id":169,"name":"Galbanum Rsd Frg10%","family":"Aromatic","ifra":null,"supplier":"Mane"},{"id":170,"name":"Gamma Decalactone","family":"Uncategorised","ifra":null,"supplier":"Fraterworks"},{"id":171,"name":"Gardenia tube rose 2oz","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":172,"name":"Geosmin","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":173,"name":"Geranium","family":"Floral","ifra":null,"supplier":"Naz Oil"},{"id":174,"name":"Ginger","family":"Aromatic","ifra":null,"supplier":"Nonin"},{"id":175,"name":"Ginger Dilute","family":"Herbacious","ifra":null,"supplier":"Eden botanicals"},{"id":176,"name":"Ginger Madagacar","family":"Aromatic","ifra":8.0,"supplier":"Perfume apprentice"},{"id":177,"name":"Ginger Root","family":"Herbs","ifra":null,"supplier":""},{"id":178,"name":"Globanolide","family":"Polyclic musk","ifra":null,"supplier":"Perfume apprentice"},{"id":179,"name":"Glycolierral","family":"Floral","ifra":8.0,"supplier":"Perfume apprentice"},{"id":180,"name":"Golden Sand","family":"Sweet","ifra":null,"supplier":"Naz Oil"},{"id":181,"name":"Golden sand","family":"Perfume bases","ifra":null,"supplier":""},{"id":182,"name":"Good Girl","family":"Perfume bases","ifra":null,"supplier":""},{"id":183,"name":"Grapefruit Naz","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":184,"name":"Green Apple","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":185,"name":"Green Apple money","family":"Fragrance oil","ifra":null,"supplier":""},{"id":186,"name":"Green Mate 2%","family":"Uncategorised","ifra":null,"supplier":""},{"id":187,"name":"Green cardamom 2oz","family":"Gourmound","ifra":null,"supplier":"Mexico"},{"id":188,"name":"Green tea","family":"Herbacious","ifra":null,"supplier":"Naz Oil"},{"id":189,"name":"Grosjman Accord","family":"Perfume bases","ifra":null,"supplier":""},{"id":190,"name":"Guaiac Wood","family":"Woody","ifra":null,"supplier":"Save on scents"},{"id":191,"name":"Guava","family":"Fruity","ifra":null,"supplier":""},{"id":192,"name":"Gucci Envy Col","family":"Aromatic","ifra":null,"supplier":""},{"id":193,"name":"Gucci Flora Jasmine","family":"Uncategorised","ifra":null,"supplier":""},{"id":194,"name":"Gucci guilty","family":"Fragrance oil","ifra":null,"supplier":""},{"id":195,"name":"Habanolide","family":"Macrocyclic musk","ifra":3.0,"supplier":"Fraterworks"},{"id":196,"name":"Habanolide","family":"Musk","ifra":null,"supplier":"Perfume supply house"},{"id":197,"name":"Hedione","family":"Floral","ifra":null,"supplier":"Perfume apprentice"},{"id":198,"name":"Helional","family":"Molecule","ifra":null,"supplier":""},{"id":199,"name":"Heliotropin 20% Dpg","family":"Floral","ifra":46.0,"supplier":"Fraterworks"},{"id":200,"name":"Helvetolide","family":"Macrocyclic musk","ifra":5.0,"supplier":"Fraterworks"},{"id":201,"name":"Hexenol-3-Cis","family":"Herbacious","ifra":8.0,"supplier":"Perfume apprentice"},{"id":202,"name":"Hibiscus  Lola 1/4oz","family":"Floral","ifra":null,"supplier":"Lola"},{"id":203,"name":"Hibiscus Sos","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":204,"name":"Hiniscus Passion 1/4 Oz","family":"Fruity","ifra":null,"supplier":"Lola"},{"id":205,"name":"Hinoki","family":"Uncategorised","ifra":null,"supplier":""},{"id":206,"name":"Honey Essence","family":"Sweet","ifra":13.0,"supplier":"Perfume apprentice"},{"id":207,"name":"Honey Lactone","family":"Sweet","ifra":2.0,"supplier":"Perfume apprentice"},{"id":208,"name":"Honeysuckle","family":"Sweet","ifra":null,"supplier":"Naz Oil"},{"id":209,"name":"Honeysuckle","family":"Sweet","ifra":null,"supplier":"Naz Oil"},{"id":210,"name":"Hydrocarbosine","family":"Amber","ifra":null,"supplier":""},{"id":211,"name":"Hydroxycitronellal","family":"Citrus","ifra":2.1,"supplier":"Fraterworks"},{"id":212,"name":"Hydroxycitronellal Pure","family":"Citrus","ifra":2.0,"supplier":"Perfume apprentice"},{"id":213,"name":"ISO E Super","family":"Woody","ifra":10.0,"supplier":"Perfume apprentice"},{"id":214,"name":"Imagination LV","family":"Perfume bases","ifra":null,"supplier":""},{"id":215,"name":"Indian sandalwood","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":216,"name":"Indole","family":"Floral","ifra":null,"supplier":"Fraterworks"},{"id":217,"name":"Invictus","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":218,"name":"Ionone Alpha","family":"Ionones","ifra":1.4,"supplier":"Fraterworks"},{"id":219,"name":"Ionone Beta","family":"Floral","ifra":0.97,"supplier":"Fraterworks"},{"id":220,"name":"Iris Key Accord","family":"Floral","ifra":null,"supplier":"Perfume apprentice"},{"id":221,"name":"Iso E Super","family":"Molecule","ifra":10.0,"supplier":"Fraterworks"},{"id":222,"name":"Isoeugenol","family":"Aldehyde","ifra":0.75,"supplier":"Fraterworks"},{"id":223,"name":"Italian Bergamot","family":"Citrus","ifra":null,"supplier":"Perfume apprentice"},{"id":224,"name":"Ivy Base","family":"Herbacious","ifra":null,"supplier":"Perfume apprentice"},{"id":225,"name":"Japanese cherry blossom 16oz","family":"Floral","ifra":null,"supplier":"Filmore"},{"id":226,"name":"Jasmacyclene","family":"Floral","ifra":10.0,"supplier":"Perfume apprentice"},{"id":227,"name":"Jasmine 1 oz","family":"Floral","ifra":null,"supplier":""},{"id":228,"name":"Jasmine Abs","family":"Floral","ifra":null,"supplier":"Eden botanicals"},{"id":229,"name":"Jasmine Egyptian","family":"Floral","ifra":null,"supplier":""},{"id":230,"name":"Jasmine Ninon","family":"Floral","ifra":null,"supplier":"Nonin"},{"id":231,"name":"Jasmine primrose","family":"Floral","ifra":null,"supplier":""},{"id":232,"name":"Javanol","family":"Woody","ifra":null,"supplier":"Perfume supply house"},{"id":233,"name":"Juniper","family":"Fruity","ifra":null,"supplier":"Save on scents"},{"id":234,"name":"Juniper Berry Eo Bulgaria","family":"Herbacious","ifra":null,"supplier":"Perfume apprentice"},{"id":235,"name":"Juniper Berry Eo Hungary","family":"Fruity","ifra":null,"supplier":"Perfume apprentice"},{"id":236,"name":"Kephalis","family":"Woody","ifra":0.25,"supplier":"Fraterworks"},{"id":237,"name":"Koavone Iff","family":"Uncategorised","ifra":null,"supplier":"Perfume apprentice"},{"id":238,"name":"Lavendar 40/42","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":239,"name":"Lavender","family":"Floral","ifra":null,"supplier":"Nonin"},{"id":240,"name":"Lavindin 10%","family":"Aromatic","ifra":null,"supplier":"Eden botanicals"},{"id":241,"name":"Lemon","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":242,"name":"Lemon Verbena","family":"Fragrance oil","ifra":null,"supplier":"Perfume apprentice"},{"id":243,"name":"Lemongrass","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":244,"name":"Liebe","family":"Perfume bases","ifra":null,"supplier":""},{"id":245,"name":"Liebe perfume 2oz","family":"Perfume bases","ifra":null,"supplier":""},{"id":246,"name":"Lilas pure 2oz","family":"Floral","ifra":null,"supplier":"Mexico"},{"id":247,"name":"Lilial Sub","family":"Floral","ifra":null,"supplier":""},{"id":248,"name":"Lilith perfume 3oz","family":"Perfume bases","ifra":null,"supplier":""},{"id":249,"name":"Lily of The Valley","family":"Floral","ifra":null,"supplier":""},{"id":250,"name":"Lime","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":251,"name":"Limeonene D","family":"Terpene hydrocarbon","ifra":2.0,"supplier":"Fraterworks"},{"id":252,"name":"Linalool","family":"Molecule","ifra":12.0,"supplier":""},{"id":253,"name":"Linalyl Acetate","family":"Floral","ifra":2.5,"supplier":"Fraterworks"},{"id":254,"name":"Linden Blossom","family":"Floral","ifra":null,"supplier":""},{"id":255,"name":"Lisea Cuba Dilute","family":"Citrus","ifra":null,"supplier":"Plant guru"},{"id":256,"name":"Litchi","family":"Fruity","ifra":null,"supplier":""},{"id":257,"name":"Litsea Cubeba 2oz","family":"Citrus","ifra":null,"supplier":"Plant guru"},{"id":258,"name":"Lotus","family":"Floral","ifra":null,"supplier":""},{"id":259,"name":"Lotus 8 oz","family":"Floral","ifra":null,"supplier":"Naz Oil"},{"id":260,"name":"Lotus Flower","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":261,"name":"Lotus Nemat","family":"Floral","ifra":null,"supplier":"Nemat"},{"id":262,"name":"Lotus cream","family":"Floral","ifra":null,"supplier":""},{"id":263,"name":"Lotus floer portable 30ml","family":"Perfume bases","ifra":null,"supplier":""},{"id":264,"name":"Luscious","family":"Perfume bases","ifra":null,"supplier":""},{"id":265,"name":"Lustro","family":"Uncategorised","ifra":null,"supplier":""},{"id":266,"name":"MYRRH Lola","family":"Woody","ifra":null,"supplier":"Lola"},{"id":267,"name":"Madagascar Vanilla","family":"Sweet","ifra":29.0,"supplier":""},{"id":268,"name":"Madagascar Vanilla Abs 10% Dpg","family":"Gourmound","ifra":null,"supplier":"Mane"},{"id":269,"name":"Magnolia Flower Eo China","family":"Floral","ifra":null,"supplier":"Eden botanicals"},{"id":270,"name":"Mahogany","family":"Woody","ifra":null,"supplier":""},{"id":271,"name":"Mahogany Teakwood","family":"Woody","ifra":null,"supplier":"Filmore"},{"id":272,"name":"Mahogonate","family":"Woody","ifra":null,"supplier":"Perfume apprentice"},{"id":273,"name":"Mandarin mex","family":"Citrus","ifra":null,"supplier":"Mexico"},{"id":274,"name":"Manderin Sos","family":"Citrus","ifra":null,"supplier":"Save on scents"},{"id":275,"name":"Mango Je","family":"Fruity","ifra":null,"supplier":""},{"id":276,"name":"Mango Mex","family":"Fruity","ifra":null,"supplier":"Mexico"},{"id":277,"name":"Mango Naz","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":278,"name":"Marc Jacobs Daisy","family":"Uncategorised","ifra":null,"supplier":""},{"id":279,"name":"Mascone","family":"Polyclic musk","ifra":null,"supplier":"Perfume apprentice"},{"id":280,"name":"Matcha 23 Le Labo","family":"Aromatic","ifra":null,"supplier":"Naz Oil"},{"id":281,"name":"Mazarine P-16","family":"Uncategorised","ifra":2.0,"supplier":"Mane"},{"id":282,"name":"Menthyl Acetate","family":"Molecule","ifra":null,"supplier":"Perfume apprentice"},{"id":283,"name":"Methly Cedryl Ketone Vertofix","family":"Woody","ifra":10.0,"supplier":""},{"id":284,"name":"Methyl Cyclo Pentenolone","family":"Sweet","ifra":null,"supplier":"Perfume apprentice"},{"id":285,"name":"Methyl Ionone Gama","family":"Floral","ifra":31.0,"supplier":"Perfume apprentice"},{"id":286,"name":"Methyl Laitone","family":"Molecule","ifra":2.0,"supplier":"Perfume apprentice"},{"id":287,"name":"Methyl Pamplemousse","family":"Citrus","ifra":1.0,"supplier":"Fraterworks"},{"id":288,"name":"Methyl Pamplemousse","family":"Fruity","ifra":10.0,"supplier":"Perfume apprentice"},{"id":289,"name":"Mica Powder","family":"Uncategorised","ifra":null,"supplier":""},{"id":290,"name":"Michael Kors women","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":291,"name":"Milk Lactone","family":"Lactone","ifra":null,"supplier":"Fraterworks"},{"id":292,"name":"Mimosa","family":"Floral","ifra":null,"supplier":""},{"id":293,"name":"Mimosal","family":"Floral","ifra":1.5,"supplier":""},{"id":294,"name":"Mint Abu Simbel","family":"Aromatic","ifra":null,"supplier":"Abu simbel perfume palace"},{"id":295,"name":"Miss Dior","family":"Uncategorised","ifra":null,"supplier":""},{"id":296,"name":"Modern Vanilla Essence","family":"Sweet","ifra":null,"supplier":"Perfume apprentice"},{"id":297,"name":"Mokhalat","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":298,"name":"Molecule 1","family":"Molecule","ifra":null,"supplier":""},{"id":299,"name":"Molecule 2","family":"Molecule","ifra":null,"supplier":""},{"id":300,"name":"Molecule 3","family":"Molecule","ifra":null,"supplier":""},{"id":301,"name":"Money Brown","family":"Fragrance oil","ifra":null,"supplier":"Nonin"},{"id":302,"name":"Money Brown 32oz","family":"Fragrance oil","ifra":null,"supplier":""},{"id":303,"name":"Money SOS","family":"Fragrance oil","ifra":null,"supplier":"Save on scents"},{"id":304,"name":"Money Sos","family":"Fragrance oil","ifra":null,"supplier":"Save on scents"},{"id":305,"name":"Money green","family":"Fragrance oil","ifra":null,"supplier":"Save on scents"},{"id":306,"name":"Mulberry","family":"Fruity","ifra":null,"supplier":""},{"id":307,"name":"Muscone Firmenich","family":"Macrocyclic musk","ifra":0.47,"supplier":"Perfume apprentice"},{"id":308,"name":"Musk Ketone","family":"Uncategorised","ifra":null,"supplier":""},{"id":309,"name":"Myrhh","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":310,"name":"Myrrh Sos","family":"Woody","ifra":null,"supplier":"Save on scents"},{"id":311,"name":"Myrrh mex","family":"Woody","ifra":null,"supplier":"Mexico"},{"id":312,"name":"Myself YSL","family":"Perfume bases","ifra":null,"supplier":""},{"id":313,"name":"Nag Champa  16oz","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":314,"name":"Narcissist perfume","family":"Perfume bases","ifra":null,"supplier":""},{"id":315,"name":"Narcissus","family":"Floral","ifra":null,"supplier":""},{"id":316,"name":"Neroli","family":"Floral","ifra":null,"supplier":"Naz Oil"},{"id":317,"name":"Neroli Tincture","family":"Uncategorised","ifra":null,"supplier":""},{"id":318,"name":"Neroli mex","family":"Floral","ifra":null,"supplier":"Mexico"},{"id":319,"name":"Noir 29","family":"Perfume bases","ifra":null,"supplier":""},{"id":320,"name":"Norlimbanol","family":"Woody","ifra":1.3,"supplier":"Fraterworks"},{"id":321,"name":"Nutmeg","family":"Gourmound","ifra":null,"supplier":""},{"id":322,"name":"Oakmoss","family":"Herbacious","ifra":1.0,"supplier":"Georgia herbal"},{"id":323,"name":"Ocean Propanol","family":"Molecule","ifra":10.0,"supplier":"Perfume apprentice"},{"id":324,"name":"Opopanax","family":"Woody","ifra":null,"supplier":"Eden botanicals"},{"id":325,"name":"Orange","family":"Citrus","ifra":null,"supplier":"Naz Oil"},{"id":326,"name":"Orange blossom","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":327,"name":"Orris","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":328,"name":"Osmanthus Gold Abd","family":"Floral","ifra":null,"supplier":"Fraterworks"},{"id":329,"name":"Oud Luxe","family":"Musk","ifra":null,"supplier":"Filmore"},{"id":330,"name":"Oud Safi Cambodia","family":"Amber","ifra":null,"supplier":""},{"id":331,"name":"Oud Sythetic","family":"Musk","ifra":null,"supplier":"Mane"},{"id":332,"name":"P vanilla 15 oz","family":"Sweet","ifra":null,"supplier":""},{"id":333,"name":"Pachouli","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":334,"name":"Pachouli Eden","family":"Woody","ifra":null,"supplier":"Eden botanicals"},{"id":335,"name":"Pachoulol Crystals","family":"Aromatic","ifra":1.6,"supplier":"Fraterworks"},{"id":336,"name":"Palo santo tincture","family":"Woody","ifra":null,"supplier":""},{"id":337,"name":"Paradise Molecule","family":"Floral","ifra":null,"supplier":"Fraterworks"},{"id":338,"name":"Passion fruit","family":"Fruity","ifra":null,"supplier":"Abu simbel perfume palace"},{"id":339,"name":"Patchouli portable 15 ml","family":"Woody","ifra":null,"supplier":""},{"id":340,"name":"Peach","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":341,"name":"Peach Georgia","family":"Fruity","ifra":null,"supplier":""},{"id":342,"name":"Pear Key Accord","family":"Fruity","ifra":5.0,"supplier":"Perfume apprentice"},{"id":343,"name":"Peppermint","family":"Aromatic","ifra":null,"supplier":"Naz Oil"},{"id":344,"name":"Perry Ellis 360","family":"Fragrance oil","ifra":null,"supplier":""},{"id":345,"name":"Persian musk","family":"Musk","ifra":null,"supplier":""},{"id":346,"name":"Phenyl Ethyl Alcohol","family":"Floral","ifra":4.2,"supplier":"Fraterworks"},{"id":347,"name":"Pine Aura cacia","family":"Woody","ifra":null,"supplier":"Aura cacia"},{"id":348,"name":"Pine Es Oil","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":349,"name":"Pine Pinesol","family":"Woody","ifra":null,"supplier":""},{"id":350,"name":"Pine Plant Guru","family":"Woody","ifra":null,"supplier":"Plant guru"},{"id":351,"name":"Pine SOS","family":"Woody","ifra":null,"supplier":"Save on scents"},{"id":352,"name":"Pine import","family":"Woody","ifra":null,"supplier":"Mexico"},{"id":353,"name":"Pineapple","family":"Fruity","ifra":null,"supplier":""},{"id":354,"name":"Pineapple Extract","family":"Citrus","ifra":null,"supplier":"Perfume apprentice"},{"id":355,"name":"Pink P. Pussy","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":356,"name":"Pink Peppercorn","family":"Gourmound","ifra":null,"supplier":"Perfume apprentice"},{"id":357,"name":"Pink sugar","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":358,"name":"Pistachio","family":"Uncategorised","ifra":null,"supplier":""},{"id":359,"name":"Precyclemone B Aldemone","family":"Aromatic","ifra":10.0,"supplier":"Perfume apprentice"},{"id":360,"name":"Pruneau","family":"Gourmound","ifra":null,"supplier":""},{"id":361,"name":"Prunells","family":"Gourmound","ifra":null,"supplier":""},{"id":362,"name":"Pumpkin spice","family":"Gourmound","ifra":null,"supplier":"Save on scents"},{"id":363,"name":"Pwx Factor Fixative","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":364,"name":"Rain","family":"Molecule","ifra":null,"supplier":"Cielo mystic mix"},{"id":365,"name":"Rasberry Ketone","family":"Ketone","ifra":1.01,"supplier":"Fraterworks"},{"id":366,"name":"Raspberry Ketone","family":"Sweet","ifra":null,"supplier":""},{"id":367,"name":"Red Door","family":"Fragrance oil","ifra":null,"supplier":""},{"id":368,"name":"Red Door","family":"Fragrance oil","ifra":null,"supplier":""},{"id":369,"name":"Rhodinol Extra Coer","family":"Floral","ifra":12.0,"supplier":"Mane"},{"id":370,"name":"Roman  Chamomile","family":"Herbacious","ifra":null,"supplier":"Wild herb"},{"id":371,"name":"Romandolide","family":"Molecule","ifra":null,"supplier":"Perfume supply house"},{"id":372,"name":"Rompe Bru.","family":"Fragrance oil","ifra":null,"supplier":""},{"id":373,"name":"Rosalva","family":"Floral","ifra":null,"supplier":"Perfume apprentice"},{"id":374,"name":"Rose","family":"Floral","ifra":null,"supplier":"Naz Oil"},{"id":375,"name":"Rose India","family":"Floral","ifra":null,"supplier":""},{"id":376,"name":"Rose Oxide","family":"Floral","ifra":2.0,"supplier":"Perfume apprentice"},{"id":377,"name":"Rosemary","family":"Aromatic","ifra":null,"supplier":"Naz Oil"},{"id":378,"name":"Rosemary Pure Je Abs","family":"Uncategorised","ifra":null,"supplier":"Eden botanicals"},{"id":379,"name":"Rosewood Bois De Rose","family":"Woody","ifra":20.0,"supplier":"Perfume apprentice"},{"id":380,"name":"Ruda","family":"Herbacious","ifra":null,"supplier":""},{"id":381,"name":"Ruda","family":"Herbs","ifra":null,"supplier":"Mexico"},{"id":382,"name":"Rum Co2 10%","family":"Sweet","ifra":0.05,"supplier":"Fraterworks"},{"id":383,"name":"Sacrocaulonmossamedense","family":"Uncategorised","ifra":null,"supplier":""},{"id":384,"name":"Saffron Tinc 10%","family":"Gourmound","ifra":null,"supplier":""},{"id":385,"name":"Safraleine","family":"Aromatic","ifra":3.0,"supplier":"Perfume apprentice"},{"id":386,"name":"Sage Bundle","family":"Herbs","ifra":null,"supplier":""},{"id":387,"name":"Sage Naz","family":"Herbacious","ifra":null,"supplier":"Naz Oil"},{"id":388,"name":"Sage plant guru","family":"Herbacious","ifra":null,"supplier":"Plant guru"},{"id":389,"name":"Saif al misk","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":390,"name":"Sandalore","family":"Woody","ifra":null,"supplier":"Lermond"},{"id":391,"name":"Sandalwood","family":"Woody","ifra":null,"supplier":""},{"id":392,"name":"Sandalwood imp 1oz","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":393,"name":"Sandalwood import","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":394,"name":"Santal 33 Le labo","family":"Fragrance oil","ifra":null,"supplier":"Naz Oil"},{"id":395,"name":"Santaliff","family":"Woody","ifra":40.0,"supplier":"Perfume apprentice"},{"id":396,"name":"Sarcocaulon Mossamedense","family":"Aromatic","ifra":null,"supplier":"Mane"},{"id":397,"name":"Seduction","family":"Uncategorised","ifra":null,"supplier":""},{"id":398,"name":"Shay Oud Imp","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":399,"name":"Sichuan Pepper Co2","family":"Aromatic","ifra":null,"supplier":"Perfume supply house"},{"id":400,"name":"Sparkling aldehyde","family":"Molecule","ifra":null,"supplier":""},{"id":401,"name":"Special","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":402,"name":"Strawberry","family":"Fruity","ifra":null,"supplier":""},{"id":403,"name":"Styrax Absolute","family":"Woody","ifra":null,"supplier":"Perfume supply house"},{"id":404,"name":"Suederal Lt","family":"Molecule","ifra":null,"supplier":"Perfume apprentice"},{"id":405,"name":"Sulfur","family":"Herbs","ifra":null,"supplier":""},{"id":406,"name":"Superior Egyptian Musk 1oz","family":"Musk","ifra":null,"supplier":"Naz Oil"},{"id":407,"name":"Sweet pea  10 oz","family":"Sweet","ifra":null,"supplier":""},{"id":408,"name":"Tabacco Abs Nic Free","family":"Uncategorised","ifra":null,"supplier":"Lermond"},{"id":409,"name":"Tabbaco Naz","family":"Gourmound","ifra":null,"supplier":"Naz Oil"},{"id":410,"name":"Tagetes Marigold","family":"Floral","ifra":null,"supplier":""},{"id":411,"name":"Tangerine","family":"Citrus","ifra":null,"supplier":"Aura cacia"},{"id":412,"name":"Tea tree","family":"Aromatic","ifra":null,"supplier":""},{"id":413,"name":"The  One","family":"Fragrance oil","ifra":null,"supplier":""},{"id":414,"name":"Tom Ford Oudwood Essential","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":415,"name":"TomFord Oudwood","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":416,"name":"Tomate Fueilles","family":"Aromatic","ifra":null,"supplier":""},{"id":417,"name":"Tonka bean 2oz","family":"Sweet","ifra":null,"supplier":"Save on scents"},{"id":418,"name":"Tubereuse","family":"Woody","ifra":2.0,"supplier":"Perfume apprentice"},{"id":419,"name":"Tuberose","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":420,"name":"Tuberose Mexico","family":"Floral","ifra":null,"supplier":"Mexico"},{"id":421,"name":"Tuscan leather","family":"Leather","ifra":null,"supplier":"Naz Oil"},{"id":422,"name":"Untitled 2","family":"Uncategorised","ifra":null,"supplier":""},{"id":423,"name":"Vanilla 28","family":"Uncategorised","ifra":null,"supplier":""},{"id":424,"name":"Vanilla Bean","family":"Sweet","ifra":null,"supplier":"Save on scents"},{"id":425,"name":"Vanilla Bean Accord","family":"Sweet","ifra":null,"supplier":"Perfume apprentice"},{"id":426,"name":"Vanilla Jojoba","family":"Sweet","ifra":null,"supplier":"Aura cacia"},{"id":427,"name":"Vanilla Plantifolia Jojoba","family":"Amber","ifra":null,"supplier":""},{"id":428,"name":"Vanilla extract 8oz","family":"Sweet","ifra":null,"supplier":""},{"id":429,"name":"Vanillin Crystals","family":"Sweet","ifra":5.0,"supplier":"Fraterworks"},{"id":430,"name":"Veramoss","family":"Aromatic","ifra":null,"supplier":"Perfume supply house"},{"id":431,"name":"Vetiver","family":"Woody","ifra":null,"supplier":"Naz Oil"},{"id":432,"name":"Vetiveryl Acetate","family":"Woody","ifra":null,"supplier":"Perfume apprentice"},{"id":433,"name":"Violet","family":"Floral","ifra":null,"supplier":""},{"id":434,"name":"Violet Leaf France","family":"Floral","ifra":null,"supplier":"Eden botanicals"},{"id":435,"name":"Vitamin E","family":"Uncategorised","ifra":null,"supplier":""},{"id":436,"name":"Vixen","family":"Perfume bases","ifra":null,"supplier":""},{"id":437,"name":"Water Accord","family":"Uncategorised","ifra":null,"supplier":""},{"id":438,"name":"Watermelon Naz","family":"Fruity","ifra":null,"supplier":"Naz Oil"},{"id":439,"name":"White amber 30ml","family":"Amber","ifra":null,"supplier":""},{"id":440,"name":"White diamond","family":"Fragrance oil","ifra":null,"supplier":""},{"id":441,"name":"White musk","family":"Musk","ifra":null,"supplier":""},{"id":442,"name":"Wild mint","family":"Aromatic","ifra":null,"supplier":"Save on scents"},{"id":443,"name":"Wood Mex","family":"Woody","ifra":null,"supplier":"Mexico"},{"id":444,"name":"Woody Musk","family":"Perfume bases","ifra":null,"supplier":""},{"id":445,"name":"Ylang Ylang 3","family":"Uncategorised","ifra":0.73,"supplier":""},{"id":446,"name":"Ylang ylang","family":"Floral","ifra":null,"supplier":""},{"id":447,"name":"Ylang ylang 1oz Naz","family":"Floral","ifra":null,"supplier":"Save on scents"},{"id":448,"name":"Ylang ylang Aura Casia","family":"Floral","ifra":null,"supplier":"Aura cacia"},{"id":449,"name":"Ysl Libre","family":"Uncategorised","ifra":null,"supplier":""},{"id":450,"name":"Yuzu","family":"Citrus","ifra":null,"supplier":""},{"id":451,"name":"benzyl benzoate","family":"Molecule","ifra":null,"supplier":"Perfume apprentice"},{"id":452,"name":"chocolate","family":"Sweet","ifra":null,"supplier":""},{"id":453,"name":"sandal rose","family":"Floral","ifra":null,"supplier":""},{"id":454,"name":"white oud","family":"Woody","ifra":null,"supplier":""}];

// ── Strength Bar Component ────────────────────────────────────────────────────
function StrengthBar({ value, onChange, ifraLimit }) {
  const pct = STRENGTHS[value].pct;
  const overIfra = ifraLimit !== null && pct > ifraLimit;
  const fillColor = overIfra ? "#EF4444" : STRENGTHS[value].color;
  const fillPct = ((value) / 4) * 100;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: overIfra ? "#EF4444" : "#374151", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {STRENGTHS[value].label}
        </span>
        <span style={{ fontSize: 10, color: overIfra ? "#EF4444" : "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
          {overIfra && <AlertTriangle size={9} />}
          ~{pct}%{ifraLimit !== null && ` · IFRA ${ifraLimit}%`}
        </span>
      </div>

      {/* Track */}
      <div
        style={{ position: "relative", height: 6, borderRadius: 999, background: "#F1F5F9", cursor: "pointer", overflow: "hidden" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, x / rect.width));
          onChange(Math.round(ratio * 4));
        }}
      >
        <div style={{
          height: "100%",
          width: `${fillPct}%`,
          borderRadius: 999,
          background: fillColor,
          transition: "width 0.15s ease, background 0.15s ease",
        }} />
        {/* Segment ticks */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", top: 0, left: `${(i / 4) * 100}%`,
            width: 1, height: "100%", background: "white", opacity: 0.8
          }} />
        ))}
      </div>

      {/* Clickable labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        {STRENGTHS.map((s, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              fontSize: 9, color: i === value ? "#1E293B" : "#CBD5E1",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontWeight: i === value ? 700 : 400, letterSpacing: "0.03em",
              transition: "color 0.1s"
            }}
          >
            {s.label[0]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Zone Badge ────────────────────────────────────────────────────────────────
function ZoneBadge({ zone, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          background: ZONE_COLORS[zone], border: "none", borderRadius: 20,
          padding: "3px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600,
          color: ZONE_DOT[zone], transition: "opacity 0.1s",
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ZONE_DOT[zone] }} />
        {ZONE_LABELS[zone]}
        <ChevronDown size={9} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
          background: "white", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          border: "1px solid #E2E8F0", overflow: "hidden", minWidth: 80,
        }}>
          {ZONES.map(z => (
            <button
              key={z}
              onClick={() => { onChange(z); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6, width: "100%",
                padding: "7px 12px", background: z === zone ? "#F8FAFC" : "white",
                border: "none", cursor: "pointer", fontSize: 11, fontWeight: z === zone ? 700 : 400,
                color: ZONE_DOT[z], textAlign: "left",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ZONE_DOT[z] }} />
              {ZONE_LABELS[z]}
              {z === zone && <Check size={10} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Family Chip ───────────────────────────────────────────────────────────────
function FamilyChip({ family }) {
  const c = familyColor(family);
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
      background: c.bg, color: c.text,
      borderRadius: 20, padding: "2px 7px",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />
      {family}
    </span>
  );
}

// ── Composition summary bars ──────────────────────────────────────────────────
function CompositionSummary({ selected }) {
  const byFamily = useMemo(() => {
    const map = {};
    selected.forEach(i => {
      const w = STRENGTHS[i.strength].pct;
      map[i.family] = (map[i.family] || 0) + w;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([fam, w]) => ({ fam, pct: Math.round((w / total) * 100) }));
  }, [selected]);

  const byZone = useMemo(() => {
    const map = { top: 0, heart: 0, base: 0 };
    selected.forEach(i => { map[i.zone] += STRENGTHS[i.strength].pct; });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([z, w]) => ({ z, pct: Math.round((w / total) * 100) }));
  }, [selected]);

  if (selected.length === 0) return null;

  return (
    <div style={{ padding: "0 20px 16px" }}>
      {/* Zone bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Structure</div>
        <div style={{ display: "flex", height: 5, borderRadius: 999, overflow: "hidden", gap: 1 }}>
          {byZone.map(({ z, pct }) => pct > 0 && (
            <div key={z} style={{ flex: pct, background: ZONE_DOT[z], borderRadius: 999 }} title={`${ZONE_LABELS[z]}: ${pct}%`} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {byZone.map(({ z, pct }) => (
            <span key={z} style={{ fontSize: 9, color: ZONE_DOT[z], fontWeight: 600 }}>{ZONE_LABELS[z]} {pct}%</span>
          ))}
        </div>
      </div>

      {/* Family bars */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Olfactive profile</div>
      <div style={{ display: "flex", gap: 2, height: 20, borderRadius: 6, overflow: "hidden" }}>
        {byFamily.map(({ fam, pct }) => (
          <div
            key={fam}
            style={{ flex: pct, background: familyColor(fam).dot, opacity: 0.85 }}
            title={`${fam}: ${pct}%`}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginTop: 5 }}>
        {byFamily.slice(0, 5).map(({ fam, pct }) => (
          <span key={fam} style={{ fontSize: 9, color: familyColor(fam).dot, fontWeight: 600 }}>
            {fam} {pct}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Right Panel: Visual Scent Profile ────────────────────────────────────────
function ScentProfile({ selected }) {
  const byFamily = useMemo(() => {
    const map = {};
    selected.forEach(i => {
      const w = STRENGTHS[i.strength].pct;
      if (!map[i.family]) map[i.family] = { total: 0, items: [] };
      map[i.family].total += w;
      map[i.family].items.push(i);
    });
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([fam, { total, items }]) => ({ fam, total, items }));
  }, [selected]);

  const grandTotal = byFamily.reduce((a, b) => a + b.total, 0) || 1;

  // Build color mosaic — each ingredient gets a tile sized by strength
  const tiles = useMemo(() => {
    return selected
      .slice()
      .sort((a, b) => b.strength - a.strength)
      .map(i => ({
        ...i,
        size: [24, 32, 44, 60, 80][i.strength],
        color: familyColor(i.family).dot,
        bg: familyColor(i.family).bg,
      }));
  }, [selected]);

  return (
    <div style={{
      width: 220, borderLeft: "1px solid #EEF0F4",
      background: "white", display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      <div style={{ padding: "16px 16px 10px", borderBottom: "1px solid #EEF0F4" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Scent Profile
        </div>
      </div>

      {selected.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.35, gap: 8, padding: 20 }}>
          <FlaskConical size={28} color="#94A3B8" />
          <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", lineHeight: 1.4 }}>Add materials to see your scent profile</div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>

          {/* Color mosaic */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 4,
            padding: 10, borderRadius: 12,
            background: "#F8F9FB", marginBottom: 16,
            minHeight: 80,
          }}>
            {tiles.map(tile => (
              <div
                key={tile.id}
                title={`${tile.name} · ${STRENGTHS[tile.strength].label}`}
                style={{
                  width: tile.size, height: tile.size,
                  borderRadius: tile.size > 44 ? 10 : 6,
                  background: tile.color,
                  opacity: 0.75 + (tile.strength * 0.05),
                  transition: "all 0.2s",
                  cursor: "default",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Family breakdown */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            By Family
          </div>

          {byFamily.map(({ fam, total, items }) => {
            const pct = Math.round((total / grandTotal) * 100);
            const c = familyColor(fam);
            return (
              <div key={fam} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: c.text }}>{fam}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{pct}%</span>
                </div>
                {/* Fill bar */}
                <div style={{ height: 4, borderRadius: 999, background: "#F1F5F9", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 999,
                    background: c.dot, opacity: 0.7,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                {/* Material names */}
                <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {items.map(i => (
                    <span key={i.id} style={{
                      fontSize: 9, color: c.text, background: c.bg,
                      borderRadius: 4, padding: "1px 5px", fontWeight: 500,
                    }}>
                      {i.name.length > 14 ? i.name.slice(0, 13) + "…" : i.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Dominant note callout */}
          {byFamily.length > 0 && (
            <div style={{
              marginTop: 14, padding: "10px 12px", borderRadius: 10,
              background: familyColor(byFamily[0].fam).bg,
              border: `1px solid ${familyColor(byFamily[0].fam).dot}22`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>
                Dominant character
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: familyColor(byFamily[0].fam).text, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                {byFamily[0].fam}
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
                {Math.round((byFamily[0].total / grandTotal) * 100)}% of composition
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function ScentEngine() {
  const [search, setSearch] = useState("");
  const [activeFamily, setActiveFamily] = useState("All");
  const [leftTab, setLeftTab] = useState("materials"); // "materials" | "accords"
  const [accordSearch, setAccordSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [buildName, setBuildName] = useState("Untitled Scent");
  const [editingName, setEditingName] = useState(false);
  const [sent, setSent] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => { if (editingName) nameRef.current?.focus(); }, [editingName]);

  const families = useMemo(() => {
    const fams = ["All", ...Array.from(new Set(INGREDIENTS.map(i => i.family))).sort()];
    return fams;
  }, []);

  const filtered = useMemo(() => {
    return INGREDIENTS.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchFamily = activeFamily === "All" || i.family === activeFamily;
      return matchSearch && matchFamily;
    }).slice(0, 60);
  }, [search, activeFamily]);

  const addIngredient = (ing) => {
    if (!selected.find(i => i.id === ing.id)) {
      setSelected(prev => [...prev, { ...ing, strength: 2, zone: "heart" }]);
    }
  };

  const addAccord = (accord) => {
    // Add accord as a single pseudo-ingredient entry
    const accordId = `accord-${accord.id}`;
    if (!selected.find(i => i.id === accordId)) {
      setSelected(prev => [...prev, {
        id: accordId,
        name: `#${accord.num} ${accord.name}`,
        family: accord.family,
        ifra: null,
        supplier: "House Accord",
        strength: 2,
        zone: "heart",
        isAccord: true,
        accordNum: accord.num,
        descriptor: accord.descriptor,
      }]);
    }
  };

  const updateStrength = (id, val) => setSelected(prev => prev.map(i => i.id === id ? { ...i, strength: val } : i));
  const updateZone = (id, zone) => setSelected(prev => prev.map(i => i.id === id ? { ...i, zone } : i));
  const removeIngredient = (id) => setSelected(prev => prev.filter(i => i.id !== id));

  const totalLoad = selected.reduce((acc, i) => acc + STRENGTHS[i.strength].pct, 0);
  const hasIfraWarning = selected.some(i => i.ifra !== null && STRENGTHS[i.strength].pct > i.ifra);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const zoneGroups = useMemo(() => {
    const g = { top: [], heart: [], base: [] };
    selected.forEach(i => g[i.zone].push(i));
    return g;
  }, [selected]);

  return (
    <div style={{
      display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
      background: "#F8F9FB", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
        button { font-family: inherit; }
        input { font-family: inherit; }
        .ing-row:hover { background: #F0F4FF !important; }
        .ing-row:hover .add-btn { opacity: 1 !important; }
        .fam-chip { transition: all 0.1s; }
        .fam-chip:hover { opacity: 0.85; }
      `}</style>

      {/* ── LEFT: Ingredient / Accords Browser ──────────────────────────── */}
      <div style={{
        width: 280, background: "white",
        borderRight: "1px solid #EEF0F4",
        display: "flex", flexDirection: "column",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #1E293B, #334155)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Beaker size={14} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", letterSpacing: "-0.01em" }}>Scent Engine</div>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>Studio Perfumers</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, background: "#F1F5F9", borderRadius: 8, padding: 3, marginBottom: 12 }}>
            {[["materials", "Materials"], ["accords", "Accords"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLeftTab(key)}
                style={{
                  flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
                  cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: leftTab === key ? "white" : "transparent",
                  color: leftTab === key ? "#1E293B" : "#94A3B8",
                  boxShadow: leftTab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#F8F9FB", border: "1px solid #EEF0F4",
            borderRadius: 10, padding: "8px 12px",
          }}>
            <Search size={13} color="#94A3B8" />
            <input
              placeholder={leftTab === "materials" ? `Search ${INGREDIENTS.length} materials…` : "Search accords…"}
              value={leftTab === "materials" ? search : accordSearch}
              onChange={e => leftTab === "materials" ? setSearch(e.target.value) : setAccordSearch(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", fontSize: 13, color: "#374151", width: "100%" }}
            />
            {(leftTab === "materials" ? search : accordSearch) && (
              <button onClick={() => leftTab === "materials" ? setSearch("") : setAccordSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── MATERIALS TAB ── */}
        {leftTab === "materials" && (
          <>
            <div style={{ paddingLeft: 16, paddingRight: 8, paddingBottom: 10, display: "flex", gap: 5, overflowX: "auto", flexShrink: 0 }}>
              {["All", "Floral", "Woody", "Amber", "Citrus", "Musk", "Aromatic", "Fruity", "Sweet", "Molecule"].map(f => {
                const active = activeFamily === f;
                const c = f === "All" ? null : familyColor(f);
                return (
                  <button key={f} className="fam-chip" onClick={() => setActiveFamily(f)} style={{
                    flexShrink: 0, fontSize: 10, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                    border: active ? "1px solid transparent" : "1px solid #E2E8F0",
                    background: active ? (c ? c.bg : "#1E293B") : "white",
                    color: active ? (c ? c.text : "white") : "#6B7280",
                    letterSpacing: "0.03em",
                  }}>
                    {f}
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "0 16px 8px", fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>
              {filtered.length} materials{filtered.length === 60 ? " (showing first 60)" : ""}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
              {filtered.map(ing => {
                const isAdded = selected.some(i => i.id === ing.id);
                return (
                  <div key={ing.id} className="ing-row" onClick={() => !isAdded && addIngredient(ing)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 8px", borderRadius: 8, cursor: isAdded ? "default" : "pointer",
                    background: isAdded ? "#F0FDF4" : "white",
                    marginBottom: 1, transition: "background 0.1s", opacity: isAdded ? 0.6 : 1,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                        {ing.name}
                      </div>
                      <div style={{ marginTop: 2 }}><FamilyChip family={ing.family} /></div>
                    </div>
                    <button className="add-btn" onClick={(e) => { e.stopPropagation(); if (!isAdded) addIngredient(ing); }} style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                      background: isAdded ? "#86EFAC" : "#1E293B", border: "none",
                      cursor: isAdded ? "default" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: isAdded ? 1 : 0, transition: "opacity 0.15s",
                    }}>
                      {isAdded ? <Check size={11} color="white" /> : <Plus size={11} color="white" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── ACCORDS TAB ── */}
        {leftTab === "accords" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            <div style={{ padding: "0 8px 8px", fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>
              25 house accords
            </div>
            {ACCORDS
              .filter(a => a.name.toLowerCase().includes(accordSearch.toLowerCase()) || a.descriptor.toLowerCase().includes(accordSearch.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(accordSearch.toLowerCase())))
              .map(accord => {
                const isAdded = selected.some(i => i.id === `accord-${accord.id}`);
                const c = familyColor(accord.family);
                return (
                  <div
                    key={accord.id}
                    className="ing-row"
                    onClick={() => !isAdded && addAccord(accord)}
                    style={{
                      padding: "9px 10px", borderRadius: 10, marginBottom: 4,
                      cursor: isAdded ? "default" : "pointer",
                      background: isAdded ? "#F0FDF4" : "white",
                      border: `1px solid ${isAdded ? "#86EFAC" : c.dot}22`,
                      borderLeft: `3px solid ${c.dot}`,
                      opacity: isAdded ? 0.7 : 1,
                      transition: "all 0.1s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, color: "white",
                            background: c.dot, borderRadius: 4,
                            padding: "1px 5px", flexShrink: 0,
                          }}>
                            {accord.num}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", letterSpacing: "-0.01em" }}>
                            {accord.name}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.3, marginBottom: 4 }}>
                          {accord.descriptor}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                          {accord.tags.map(tag => (
                            <span key={tag} style={{
                              fontSize: 9, color: c.text, background: c.bg,
                              borderRadius: 4, padding: "1px 5px", fontWeight: 600,
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (!isAdded) addAccord(accord); }}
                        style={{
                          flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                          background: isAdded ? "#86EFAC" : c.dot,
                          border: "none", cursor: isAdded ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginLeft: 6, marginTop: 2,
                        }}
                      >
                        {isAdded ? <Check size={11} color="white" /> : <Plus size={11} color="white" />}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── CENTER: Composition Canvas ───────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          padding: "16px 24px",
          background: "white",
          borderBottom: "1px solid #EEF0F4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {editingName ? (
              <input
                ref={nameRef}
                value={buildName}
                onChange={e => setBuildName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => e.key === "Enter" && setEditingName(false)}
                style={{
                  fontSize: 18, fontWeight: 700, color: "#1E293B",
                  border: "none", borderBottom: "2px solid #6366F1",
                  outline: "none", background: "none",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic", minWidth: 200,
                }}
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                style={{
                  fontSize: 18, fontWeight: 600, color: "#1E293B", margin: 0,
                  cursor: "text", fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic", letterSpacing: "-0.01em",
                }}
              >
                {buildName}
              </h1>
            )}
            {selected.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: "#6B7280",
                background: "#F1F5F9", borderRadius: 20, padding: "2px 10px",
              }}>
                {selected.length} material{selected.length !== 1 ? "s" : ""}
                {" · "}
                <span style={{ color: totalLoad > 50 ? "#F59E0B" : "#10B981" }}>~{totalLoad.toFixed(0)}% load</span>
              </span>
            )}
            {hasIfraWarning && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#EF4444", fontWeight: 600 }}>
                <AlertTriangle size={12} /> IFRA warning
              </span>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={selected.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: sent ? "#10B981" : "#1E293B",
              color: "white", border: "none",
              padding: "9px 18px", borderRadius: 10, cursor: selected.length === 0 ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600, opacity: selected.length === 0 ? 0.4 : 1,
              transition: "background 0.2s",
              letterSpacing: "-0.01em",
            }}
          >
            {sent ? <><Check size={14} /> Sent!</> : <><Sparkles size={14} /> Send to Lab</>}
          </button>
        </div>

        {/* Composition summary */}
        <CompositionSummary selected={selected} />

        {/* Zone-grouped composition */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
          {selected.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              height: "60%", gap: 12, opacity: 0.5,
            }}>
              <div style={{ fontSize: 32 }}>🧪</div>
              <div style={{ fontSize: 14, color: "#94A3B8", fontWeight: 500 }}>Search and add materials to begin</div>
              <div style={{ fontSize: 11, color: "#CBD5E1" }}>{INGREDIENTS.length} materials available</div>
            </div>
          ) : (
            ZONES.map(zone => {
              const items = zoneGroups[zone];
              if (items.length === 0) return null;
              return (
                <div key={zone} style={{ marginBottom: 20 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                    paddingBottom: 6, borderBottom: `2px solid ${ZONE_COLORS[zone]}`,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: ZONE_DOT[zone] }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: ZONE_DOT[zone], letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {ZONE_LABELS[zone]} notes
                    </span>
                    <span style={{ fontSize: 10, color: "#CBD5E1" }}>({items.length})</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map(ing => (
                      <div
                        key={ing.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: familyColor(ing.family).bg,
                          padding: "12px 14px", borderRadius: 12,
                          border: `1px solid ${familyColor(ing.family).dot}28`,
                          borderLeft: `3px solid ${familyColor(ing.family).dot}`,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                          transition: "box-shadow 0.15s",
                        }}
                      >
                        {/* Name + family */}
                        <div style={{ minWidth: 140, maxWidth: 140 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                            {ing.isAccord && (
                              <span style={{
                                fontSize: 9, fontWeight: 800, color: "white",
                                background: familyColor(ing.family).dot,
                                borderRadius: 4, padding: "1px 5px", flexShrink: 0,
                              }}>#{ing.accordNum}</span>
                            )}
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {ing.isAccord ? ing.name.replace(`#${ing.accordNum} `, "") : ing.name}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <FamilyChip family={ing.family} />
                            {!ing.isAccord && ing.ifra !== null && (
                              <span style={{ fontSize: 9, color: "#94A3B8" }}>lim {ing.ifra}%</span>
                            )}
                          </div>
                          {ing.isAccord && ing.descriptor && (
                            <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 2, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ing.descriptor}
                            </div>
                          )}
                        </div>

                        {/* Strength bar */}
                        <StrengthBar
                          value={ing.strength}
                          onChange={(v) => updateStrength(ing.id, v)}
                          ifraLimit={ing.ifra}
                        />

                        {/* Zone picker */}
                        <ZoneBadge zone={ing.zone} onChange={(z) => updateZone(ing.id, z)} />

                        {/* Remove */}
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: "#FEE2E2", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "background 0.1s",
                          }}
                          onMouseOver={e => e.currentTarget.style.background = "#FECACA"}
                          onMouseOut={e => e.currentTarget.style.background = "#FEE2E2"}
                        >
                          <X size={11} color="#EF4444" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Scent Profile ─────────────────────────────────────────── */}
      <ScentProfile selected={selected} />
    </div>
  );
}
