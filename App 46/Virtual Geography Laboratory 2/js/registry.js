/* Central metadata registry for all simulations.
   Each simulation module (js/simulations/*.js) attaches its
   render/destroy logic onto GeoLab.sims[id].mount */
window.GeoLab = window.GeoLab || {};
GeoLab.sims = {

  projection: {
    id:'projection', num:11, icon:'🗺️', color:['#1976D2','#26C6DA'],
    title:'Map Projection Studio',
    subtitle:'Flatten the Globe — Understand Map Distortion',
    skill:'Cartography', category:'Cartography',
    blurb:'Transform the globe onto real projections and see distortion appear.'
  },
  gis: {
    id:'gis', num:12, icon:'📍', color:['#0D47A1','#1976D2'],
    title:'GIS Layer Architect',
    subtitle:'Build the Map. Combine the Layers. Discover the Pattern.',
    skill:'GIS', category:'Geographic Information Systems',
    blurb:'Toggle real map layers, buffer, and run spatial queries.'
  },
  timezone: {
    id:'timezone', num:13, icon:'🕐', color:['#212121','#1976D2'],
    title:'World Time Zone Navigator',
    subtitle:'One World. Different Times.',
    skill:'Time Geography', category:'Time Geography',
    blurb:'Calculate real local times, schedule global meetings, cross the date line.'
  },
  urban: {
    id:'urban', num:14, icon:'🏙️', color:['#43A047','#26C6DA'],
    title:'Urban Planner Studio',
    subtitle:'Design a City That Works.',
    skill:'Urban Planning', category:'Urban Geography',
    blurb:'Place zones and roads; the city scores your accessibility & compatibility.'
  },
  farm: {
    id:'farm', num:15, icon:'🌾', color:['#43A047','#FFB300'],
    title:'Smart Farm Planner',
    subtitle:'Match the Land to the Crop.',
    skill:'Agri-Geography', category:'Agricultural Geography',
    blurb:'Score parcels for crop suitability from real soil & slope data.'
  },
  transport: {
    id:'transport', num:16, icon:'🚆', color:['#1976D2','#43A047'],
    title:'Transport Network Designer',
    subtitle:'Connect Places. Reduce Distance. Build the Network.',
    skill:'Network Analysis', category:'Transport Geography',
    blurb:'Build a graph network and run real shortest-path routing.'
  },
  tourism: {
    id:'tourism', num:17, icon:'🧳', color:['#FFB300','#26C6DA'],
    title:'Tourism Route Master',
    subtitle:'Plan the Journey. Balance Time, Distance and Experience.',
    skill:'Travel Geography', category:'Tourism Geography',
    blurb:'Build day-by-day itineraries within real time & budget limits.'
  },
  culture: {
    id:'culture', num:18, icon:'🏺', color:['#0D47A1','#FFB300'],
    title:'Cultural Landscape Explorer',
    subtitle:'Read the Human Story Written Across the Landscape.',
    skill:'Cultural Geography', category:'Cultural Geography',
    blurb:'Layer cultural features and decode fictional landscapes.'
  },
  glacier: {
    id:'glacier', num:19, icon:'🧊', color:['#26C6DA','#0D47A1'],
    title:'Glacier Journey Lab',
    subtitle:'Watch Ice Shape the Landscape.',
    skill:'Glacial Geography', category:'Physical Geography',
    blurb:'Model ice movement and watch valleys, moraines & landforms emerge.'
  },
  landplanner: {
    id:'landplanner', num:20, icon:'🌍', color:['#43A047','#0D47A1'],
    title:'Sustainable Land Planner',
    subtitle:'Decide What Goes Where — Balance the Landscape.',
    skill:'Land-Use Planning', category:'Land-Use Planning',
    blurb:'Assign parcels to competing uses and balance a 4-axis score.'
  }
};
GeoLab.order = ['projection','gis','timezone','urban','farm','transport','tourism','culture','glacier','landplanner'];
