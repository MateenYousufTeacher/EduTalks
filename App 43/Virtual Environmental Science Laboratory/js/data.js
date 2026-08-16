'use strict';
const SIM_META = {
  waterCycle: { title: 'Water Cycle Simulator', icon: '💧', tag: 'Hydrology', color: '#1976D2' },
  carbonCycle: { title: 'Carbon Cycle Explorer', icon: '🌫️', tag: 'Climate', color: '#607D8B' },
  nitrogenCycle: { title: 'Nitrogen Cycle Laboratory', icon: '🧪', tag: 'Soil Science', color: '#43A047' },
  airPollution: { title: 'Air Pollution Laboratory', icon: '🏭', tag: 'Pollution', color: '#FB8C00' },
  waterPollution: { title: 'Water Pollution Laboratory', icon: '🛢️', tag: 'Pollution', color: '#1976D2' },
  wasteManagement: { title: 'Waste Management & Recycling Studio', icon: '♻️', tag: 'Waste', color: '#43A047' },
  renewableEnergy: { title: 'Renewable Energy Laboratory', icon: '⚡', tag: 'Energy', color: '#FFB300' },
  climateChange: { title: 'Climate Change Simulator', icon: '🌡️', tag: 'Climate', color: '#E53935' },
  biodiversity: { title: 'Biodiversity & Conservation Explorer', icon: '🦋', tag: 'Ecology', color: '#2E7D32' },
  sustainableTown: { title: 'Sustainable Development Challenge', icon: '🏙️', tag: 'Capstone', color: '#0D47A1' }
};
const SIM_ORDER = ['waterCycle','carbonCycle','nitrogenCycle','airPollution','waterPollution','wasteManagement','renewableEnergy','climateChange','biodiversity','sustainableTown'];

const GLOSSARY = [
  { term: 'Biodiversity', def: 'The variety of life across genes, species and ecosystems in a given area.', example: 'A rainforest with thousands of plant and animal species has high biodiversity.' },
  { term: 'Carbon Sink', def: 'A natural reservoir that absorbs more carbon than it releases, such as forests or oceans.', example: 'Mature forests act as carbon sinks by storing carbon in wood and soil.' },
  { term: 'Denitrification', def: 'The bacterial process converting soil nitrates back into atmospheric nitrogen gas.', example: 'Waterlogged soils often have higher denitrification rates.' },
  { term: 'Eutrophication', def: 'Excessive nutrient enrichment of water bodies causing algal blooms and oxygen depletion.', example: 'Fertilizer runoff is a common cause of lake eutrophication.' },
  { term: 'Fossil Fuel', def: 'Energy-rich material such as coal, oil or natural gas formed from ancient organic matter over geological time.', example: 'Burning fossil fuels releases stored carbon into the atmosphere.' },
  { term: 'Greenhouse Effect', def: 'The trapping of heat in the atmosphere by gases such as CO₂ and methane.', example: 'Without the greenhouse effect, Earth would be far too cold to support life as we know it.' },
  { term: 'Groundwater', def: 'Water stored underground in soil pores and rock formations, recharged by infiltrating precipitation.', example: 'Many wells draw drinking water from groundwater aquifers.' },
  { term: 'Nitrogen Fixation', def: 'The conversion of atmospheric nitrogen gas into usable compounds like ammonia.', example: 'Legume root nodules host bacteria that fix nitrogen naturally.' },
  { term: 'Photosynthesis', def: 'The process by which plants convert sunlight, water and CO₂ into glucose and oxygen.', example: 'Photosynthesis removes atmospheric CO₂ and is central to the carbon cycle.' },
  { term: 'PM2.5', def: 'Fine particulate matter with a diameter smaller than 2.5 micrometers, harmful when inhaled.', example: 'Vehicle exhaust and industrial smoke are major sources of PM2.5.' },
  { term: 'Renewable Energy', def: 'Energy derived from naturally replenishing sources such as sunlight, wind, and water.', example: 'Solar and wind power are the fastest-growing renewable sources worldwide.' },
  { term: 'Runoff', def: 'Precipitation that flows over the land surface rather than infiltrating into the soil.', example: 'Paved urban areas generate far more runoff than forested land.' },
  { term: 'Sustainable Development', def: 'Development that meets present needs without compromising future generations\' ability to meet their own.', example: 'Balancing economic growth with environmental protection is central to sustainable development.' },
  { term: 'Trophic Level', def: 'A position in a food chain, such as producer, primary consumer, or secondary consumer.', example: 'Energy decreases at each successive trophic level up a food chain.' },
  { term: 'Turbidity', def: 'The cloudiness of water caused by suspended particles, reducing light penetration.', example: 'High turbidity after heavy rain can reduce photosynthesis by aquatic plants.' }
];

const HANDBOOK = [
  { title: 'Ecosystems', body: 'An ecosystem is a community of living organisms interacting with each other and their physical environment. Ecosystems include forests, wetlands, grasslands, deserts, rivers and oceans, each with characteristic energy flow and nutrient cycling patterns.' },
  { title: 'Pollution Types', body: 'Major pollution categories include air pollution (particulates, gases), water pollution (sewage, industrial discharge, agricultural runoff), soil pollution (pesticides, heavy metals), and noise/light pollution. Each disrupts natural systems and human health differently.' },
  { title: 'Climate Terminology', body: 'Weather refers to short-term atmospheric conditions, while climate describes long-term averages over decades. Key terms include greenhouse gases, radiative forcing, climate sensitivity, and anthropogenic (human-caused) warming.' },
  { title: 'Conservation Strategies', body: 'Approaches include protected areas and national parks, wildlife corridors, captive breeding programs, community-based conservation, invasive species control, and habitat restoration projects.' },
  { title: 'Sustainable Development Goals (SDGs)', body: 'The United Nations has established 17 SDGs to be achieved by 2030, addressing poverty, hunger, health, education, clean water, clean energy, climate action, life below water, and life on land, among others.' },
  { title: 'Renewable Energy Overview', body: 'Solar, wind, hydro, biomass and geothermal energy are renewable because their sources naturally replenish on human timescales, unlike finite fossil fuels. Combining multiple renewable sources with storage improves grid reliability.' },
  { title: 'Environmental Laws (Introductory)', body: 'Many countries have air and water pollution control acts, wildlife protection acts, forest conservation laws, and environmental impact assessment requirements for major projects, aimed at balancing development with environmental protection.' },
  { title: 'Measurement Units', body: 'Common environmental units include ppm (parts per million) for gas concentrations, mg/L for dissolved substances in water, AQI (Air Quality Index) for air pollution, and dB for noise levels.' },
  { title: 'Environmental Symbols', body: 'Common symbols include the recycling triangle (♻), biohazard symbol, radiation trefoil, and the internationally recognized Ramsar wetland emblem, used to communicate environmental information quickly.' }
];

const RESOURCES = [
  { category: 'National Parks', name: 'Dachigam National Park', info: 'Located near Srinagar, Jammu & Kashmir; critical habitat for the endangered Kashmir stag (hangul).' },
  { category: 'National Parks', name: 'Kaziranga National Park', info: 'Assam; UNESCO World Heritage Site famous for the one-horned rhinoceros.' },
  { category: 'Biosphere Reserves', name: 'Nanda Devi Biosphere Reserve', info: 'Uttarakhand; protects high-altitude Himalayan ecosystems and rare alpine flora.' },
  { category: 'Ramsar Sites', name: 'Wular Lake', info: 'Jammu & Kashmir; one of Asia\'s largest freshwater lakes and a Ramsar wetland of international importance.' },
  { category: 'Renewable Technologies', name: 'Photovoltaic (PV) Solar Cells', info: 'Convert sunlight directly into electricity using semiconductor materials.' },
  { category: 'Renewable Technologies', name: 'Horizontal-Axis Wind Turbines', info: 'The most common wind turbine design, converting kinetic wind energy into electricity.' },
  { category: 'Endangered Species', name: 'Snow Leopard', info: 'Found in the high Himalayas including Kashmir; threatened by habitat loss and poaching.' },
  { category: 'Endangered Species', name: 'Hangul (Kashmir Stag)', info: 'A critically endangered deer species found almost exclusively in Dachigam National Park.' },
  { category: 'Environmental Organizations', name: 'UNEP (UN Environment Programme)', info: 'Coordinates the UN\'s environmental activities and assists countries in implementing sound environmental policies.' },
  { category: 'Global Environmental Agreements', name: 'Paris Agreement', info: 'A 2015 international treaty aiming to limit global warming to well below 2°C above pre-industrial levels.' },
  { category: 'Global Environmental Agreements', name: 'Ramsar Convention', info: 'An international treaty for the conservation and sustainable use of wetlands, signed in 1971.' }
];
