import type { Dict } from './uk';

export const en: Dict = {
  app: { name: 'SHLYAKH', tagline: 'Kyiv · Chișinău · Marrakesh' },

  nav: { home: 'Home', itinerary: 'Route', places: 'Places', checklist: 'Checklists', more: 'More' },

  common: {
    skip: 'Skip', next: 'Next', back: 'Back', done: 'Done', start: 'Start',
    save: 'Save', cancel: 'Cancel', close: 'Close', edit: 'Edit', reset: 'Reset',
    search: 'Search', all: 'All', more: 'Details', less: 'Collapse', copy: 'Copy',
    copied: 'Copied', loading: 'Loading…', error: 'Could not load',
    retry: 'Try again', offline: 'No connection', online: 'Online', today: 'Today',
    yes: 'Yes', no: 'No', optional: 'optional', km: 'km', min: 'min', hours: 'h',
    nothingFound: 'Nothing found', approx: 'approximate', free: 'free',
    call: 'Call', route: 'Route', onMap: 'On map', show: 'Show', add: 'Add',
  },

  offline: {
    badge: 'Offline mode',
    note: 'Map and route calculation are limited. SOS, checklists, itinerary and phrasebook work.',
  },

  update: { title: 'New version available', body: 'Update to get the latest data.', action: 'Update' },

  install: {
    iosTitle: 'Add SHLYAKH to your Home Screen',
    iosLead: 'The app works offline — but only once installed. Takes 10 seconds.',
    iosStep1: 'Tap Share at the bottom of Safari',
    iosStep1Note: 'The square with an arrow pointing up',
    iosStep2: 'Scroll and choose “Add to Home Screen”',
    iosStep2Note: 'Near the bottom of the list',
    iosStep3: 'Tap “Add”, then open SHLYAKH from the icon',
    iosStep3Note: 'From now on it opens only from there',
    inAppTitle: 'Open in Safari',
    inAppLead: 'You are in an in-app browser — installing is not possible here. Open the link in Safari.',
    inAppOpen: 'Open in Safari',
    inAppCopy: 'Copy link',
    inAppHint: 'Or tap “…” at the top → “Open in Safari”',
    androidTitle: 'Install SHLYAKH',
    androidLead: 'So it works offline and opens from its own icon.',
    androidAction: 'Install',
    later: 'Later',
    whyTitle: 'Why install',
    why1: 'Works with no internet — the medina often has no signal',
    why2: 'SOS and numbers — two taps from the Home Screen',
    why3: 'Full screen, no address bar',
  },

  onb: {
    of: 'of',
    langTitle: 'Choose your language', langLead: 'You can change it any time in settings.',
    themeTitle: 'Light or dark?', themeLead: 'Light is “desert paper”. Dark is for the evening medina.',
    themeLight: 'Light', themeDark: 'Dark', themeSystem: 'Match system',
    themePreview: 'This is how the app will look',
    datesTitle: 'When are you leaving?',
    datesLead: 'The countdown, the day-by-day route and reminders are all counted from this date.',
    departure: 'Departure date', ret: 'Return date',
    datesErrOrder: 'Return must be after departure',
    datesErrLong: 'Over 60 days — check the dates',
    datesDuration: 'Trip: {{n}} days',
    partyTitle: 'Who is travelling?',
    partyLead: 'This decides what the checklist shows and in what quantity.',
    partySolo: 'Just me', partyPartner: 'Me and my husband', partyKids: 'Children',
    partyKidsNote: 'How many children are coming',
    stayTitle: 'Where will you stay?',
    stayLead: 'So the app can show the spot on the map, the distance — and an address you can show a taxi driver.',
    stayPreset: 'From the research', stayCustom: 'My own place',
    stayName: 'Name (hotel, riad, apartment)', stayAddress: 'Address',
    stayFind: 'Find on map', stayFinding: 'Searching…', stayFound: 'Location found',
    stayNotFound: 'Not found — you can add it later in settings',
    stayOfflineHint: 'Address lookup needs internet. You can save the address without a pin.',
    geoTitle: 'Allow location?',
    geoLead: 'Only to show distance to places and detect which city you are in. Nothing is sent anywhere.',
    geoAllow: 'Allow', geoLater: 'Not now',
    geoDenied: 'Fine — you can switch cities manually.',
    geoOk: 'Thanks, the city will be detected automatically.',
    installTitle: 'One last step',
    finish: 'Let’s go',
  },

  home: {
    until: 'Until departure', started: 'Trip in progress', over: 'Trip finished',
    days: 'd', hoursShort: 'h', minutes: 'm', seconds: 's',
    todayCard: 'Today', dayN: 'Day {{n}}', beforeTrip: 'Still ahead',
    quick: 'Quick actions',
    myHome: 'My place', noHome: 'No accommodation set', addHome: 'Add accommodation',
    takeMeHome: 'Take me home', addressForDriver: 'Address for the driver',
    rates: 'Exchange rates', ratesNote: 'Approximate, per €1. Editable.',
    tip: 'Tip of the day', weather: 'Weather', weatherOffline: 'Weather needs internet',
    noTrip: 'Trip dates not set', setTrip: 'Set dates',
  },

  itin: {
    title: 'Route', day: 'Day', stay: 'Overnight', noDay: 'No blocks for this day',
    types: {
      move: 'Transfer', sight: 'Sight', food: 'Food', stay: 'Stay',
      shop: 'Shopping', rest: 'Rest', tour: 'Tour',
    },
  },

  places: {
    title: 'Places', scopeCity: 'My city', scopeAll: 'All Morocco',
    sortNear: 'Nearest first', sortAZ: 'By name',
    nearWarn: 'Caution zone nearby', fixedPrice: 'Fixed prices — no haggling',
    copyAddress: 'Copy address', copyHint: 'Show or send it to the driver',
    coordsApprox: 'Approximate coordinates',
    findNearby: 'Find nearby',
    fromOsm: 'from OpenStreetMap',
    cats: {
      all: 'All', sight: 'Sights', food: 'Food', shop: 'Shopping', market: 'Markets',
      pharmacy: 'Pharmacies', exchange: 'Currency exchange', transport: 'Transport', stay: 'Stay',
      money: 'ATMs', craft: 'Crafts', nature: 'Nature',
    },
  },

  map: {
    title: 'Map', layers: 'Layers', myLocation: 'Where I am', routes: 'Routes',
    stops: 'stops', start: 'Start', downloadTiles: 'Download city map',
    downloading: 'Downloading tiles… {{n}}%', downloaded: 'City map saved for offline',
    offlineNote: 'Offline you only see areas downloaded earlier.',
    estimate: 'Straight-line estimate ×1.35', attribution: '© OpenStreetMap contributors',
  },

  check: {
    title: 'Checklists', progress: '{{done}} of {{total}} done', critical: 'critical',
    addOwn: 'Add your own', addPlaceholder: 'What else to pack?',
    resetConfirm: 'Clear all ticks?', done100: 'All packed. Safe travels.',
    forHer: 'Mine', forHim: 'His', forKids: 'Kids', forBoth: 'Both',
    filterAll: 'Everything', share: 'Share the list',
  },

  sos: {
    title: 'You are not alone', lead: 'Tap and the app dials immediately.',
    lost: 'If you get lost', lostSteps: 'Four steps',
    myStay: 'My place — show this to the driver', embassy: 'Embassy',
    verifyNote: 'Re-check these numbers 3–5 days before you leave — they change.',
    kinds: {
      police: 'Police', medical: 'Ambulance', fire: 'Fire', rescue: 'Rescue',
      tourist: 'Tourist police', embassy: 'Embassy', general: 'Single number',
      hospital: 'Hospital',
    },
  },

  phrases: {
    title: 'Phrasebook', count: '{{n}} phrases', showThem: 'Show it to them',
    hide: 'Hide', say: 'How to say it', fav: 'Favourites', searchHint: 'Search in Ukrainian or English',
    legend: 'AR is Arabic script to show the other person. The italic line is Darija in Latin letters: read it exactly as written.',
    cats: {
      all: 'All', basics: 'Basics', polite: 'Politeness', taxi: 'Taxi', bargain: 'Haggling',
      food: 'Food', hotel: 'Hotel', directions: 'Directions', health: 'Health', sos: 'SOS',
      numbers: 'Numbers', time: 'Time', women: 'Personal boundaries', family: 'Family',
    },
  },

  safety: {
    title: 'Safety', disclaimer: 'Advisory only. Check current travel warnings before you leave.',
    levels: { info: 'Good to know', caution: 'Caution', avoid: 'Avoid' },
    kinds: {
      all: 'Everything', zone: 'Areas', scam: 'Scams', rule: 'Rules',
      women: 'For women', health: 'Health', legal: 'Law',
    },
    why: 'Why', what: 'What to do',
  },

  services: {
    title: 'Services & transport',
    taxi: 'Taxi', intercity: 'Intercity transport', pharmacy: 'Pharmacies', exchange: 'Currency exchange',
    openApp: 'Open app', dial: 'Call',
    pharmacyNote: 'Moroccan night pharmacies rotate — “pharmacie de garde”. The list changes weekly; ask reception or check the notice on the nearest pharmacy door.',
    exchangeNote: 'Change money at banks and official bureaux. The dirham is a closed currency — you may not take it out of Morocco, so change what is left at the airport.',
    taxiWarn: 'The legal status of ride-hailing apps in Morocco is unresolved. An official petit taxi is the safer bet.',
  },

  guide: {
    title: 'Guide', culture: 'Culture & etiquette', money: 'Money', shopping: 'Shopping',
    events: 'Events', health: 'Health',
  },

  settings: {
    title: 'Settings', appearance: 'Appearance', theme: 'Theme', lang: 'Language',
    trip: 'Trip', city: 'City', cityAuto: 'Detect automatically', cityManual: 'Chosen manually',
    stays: 'Accommodation', party: 'Who is travelling', ratesTitle: 'Exchange rates',
    ratesRefresh: 'Refresh rates online', ratesUpdated: 'Rates updated',
    offline: 'Offline', data: 'Data', resetCheck: 'Clear checklists',
    resetAll: 'Reset everything', resetAllConfirm: 'Delete all settings and ticks?',
    install: 'Installation', about: 'About',
    aboutText: 'SHLYAKH is a pocket guide for the Kyiv → Chișinău → Marrakesh trip. Works offline.',
    attribution: 'Map: © OpenStreetMap contributors. Routing: FOSSGIS OSRM. Icons: Font Awesome Free.',
    rerunOnboarding: 'Run onboarding again',
  },

  more: {
    title: 'More',
    places: 'Place catalogue, search and filters',
    services: 'Taxi, transport, pharmacies, exchange',
    safety: 'Areas, scams, rules',
    phrases: 'Phrases in Ukrainian, French and Darija',
    guide: 'Culture, money, shopping, events',
    map: 'Map, routes and offline tiles',
    settings: 'Theme, language, dates, accommodation',
  },

  cityName: { kyiv: 'Kyiv', chisinau: 'Chișinău', marrakech: 'Marrakesh' },
};
