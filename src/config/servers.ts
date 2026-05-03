export interface ServerLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  countryCode: string;
}

export interface ServerASN {
  number: string;
  organization: string;
}

export interface ServerConfig {
  id: string;
  ip: string;
  port: number;

  name: string;

  location: ServerLocation;

  asn: ServerASN;

  distance: number | null;

  isNearest: boolean;
}

export const DEFAULT_SERVERS: ServerConfig[] = [
  {
    id: 'server-1',
    ip: '213.165.53.248',
    port: 5201,
    name: 'Frankfurt',
    location: {
      latitude: 50.1084,
      longitude: 8.6837,
      city: 'Frankfurt am Main',
      country: 'Germany',
      countryCode: 'DE',
    },
    asn: { number: 'AS207567', organization: 'Intezio Worldwide Limited' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'server-2',
    ip: '138.124.100.47',
    port: 5201,
    name: 'Tallinn',
    location: {
      latitude: 59.4381,
      longitude: 24.7369,
      city: 'Tallinn',
      country: 'Estonia',
      countryCode: 'EE',
    },
    asn: { number: 'AS207567', organization: 'Intezio Worldwide Limited' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'server-3',
    ip: '138.124.105.21',
    port: 5201,
    name: 'Netherlands',
    location: {
      latitude: 50.8924,
      longitude: 6.0505,
      city: 'Hopel',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS207567', organization: 'Intezio Worldwide Limited' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'server-4',
    ip: '95.85.254.73',
    port: 5201,
    name: 'Warsaw',
    location: {
      latitude: 52.2299,
      longitude: 21.0093,
      city: 'Warsaw',
      country: 'Poland',
      countryCode: 'PL',
    },
    asn: { number: 'AS207567', organization: 'Intezio Worldwide Limited' },
    distance: null,
    isNearest: false,
  },

  {
    id: 'play2go-fra',
    ip: '94.156.114.3',
    port: 5201,
    name: 'Frankfurt (play2go)',
    location: {
      latitude: 50.1155,
      longitude: 8.6842,
      city: 'Frankfurt am Main',
      country: 'Germany',
      countryCode: 'DE',
    },
    asn: { number: 'AS215439', organization: 'PLAY2GO INTERNATIONAL LIMITED' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'play2go-ams',
    ip: '144.31.30.177',
    port: 5201,
    name: 'Kerkrade (play2go)',
    location: {
      latitude: 50.8658,
      longitude: 6.0625,
      city: 'Kerkrade',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS215439', organization: 'PLAY2GO INTERNATIONAL LIMITED' },
    distance: null,
    isNearest: false,
  },

  {
    id: 'init7-zur',
    ip: '185.102.218.1',
    port: 5201,
    name: 'Amsterdam (Datacamp)',
    location: {
      latitude: 52.3740,
      longitude: 4.8897,
      city: 'Amsterdam',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS60068', organization: 'Datacamp Limited' },
    distance: null,
    isNearest: false,
  },

  // Public iperf3 servers
  {
    id: 'clouvider-fra',
    ip: '91.199.118.184',
    port: 5200,
    name: 'Frankfurt (Clouvider)',
    location: {
      latitude: 50.0979,
      longitude: 8.5999,
      city: 'Frankfurt am Main',
      country: 'Germany',
      countryCode: 'DE',
    },
    asn: { number: 'AS62240', organization: 'Clouvider' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'worldstream-nl',
    ip: '185.182.195.76',
    port: 5201,
    name: 'Rotterdam (Worldstream)',
    location: {
      latitude: 51.9225,
      longitude: 4.4792,
      city: 'Rotterdam',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS49981', organization: 'WorldStream B.V.' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'serverius-nl',
    ip: '5.178.66.18',
    port: 5002,
    name: 'Dronten (Serverius)',
    location: {
      latitude: 52.5250,
      longitude: 5.7181,
      city: 'Dronten',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS50673', organization: 'Serverius' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ping-online-fr',
    ip: '51.158.1.21',
    port: 5201,
    name: 'Paris (Scaleway)',
    location: {
      latitude: 48.8534,
      longitude: 2.3488,
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
    },
    asn: { number: 'AS12876', organization: 'Scaleway SAS' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'he-net-us',
    ip: '216.218.207.42',
    port: 5201,
    name: 'San Jose (Hurricane Electric)',
    location: {
      latitude: 37.3394,
      longitude: -121.8950,
      city: 'San Jose',
      country: 'United States',
      countryCode: 'US',
    },
    asn: { number: 'AS6939', organization: 'Hurricane Electric LLC' },
    distance: null,
    isNearest: false,
  },

  // Russia — MTS
  {
    id: 'mts-moscow',
    ip: '212.188.4.173',
    port: 3333,
    name: 'Moscow (MTS)',
    location: {
      latitude: 55.7558,
      longitude: 37.6173,
      city: 'Moscow',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS8359', organization: 'MTS PJSC' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'mts-krasnodar',
    ip: '212.188.4.231',
    port: 3333,
    name: 'Krasnodar (MTS)',
    location: {
      latitude: 45.0355,
      longitude: 38.9753,
      city: 'Krasnodar',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS8359', organization: 'MTS PJSC' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'mts-yakutsk',
    ip: '212.188.4.239',
    port: 3333,
    name: 'Yakutsk (MTS)',
    location: {
      latitude: 62.0355,
      longitude: 129.6755,
      city: 'Yakutsk',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS8359', organization: 'MTS PJSC' },
    distance: null,
    isNearest: false,
  },

  // Russia — Hostkey
  {
    id: 'hostkey-moscow',
    ip: '31.192.104.200',
    port: 5201,
    name: 'Moscow (Hostkey)',
    location: {
      latitude: 55.7558,
      longitude: 37.6173,
      city: 'Moscow',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS50867', organization: 'HOSTKEY B.V.' },
    distance: null,
    isNearest: false,
  },

  // Russia — Ertelecom (each city has its own AS)
  {
    id: 'ertelecom-spb',
    ip: '109.195.80.230',
    port: 5201,
    name: 'Saint Petersburg (Ertelecom)',
    location: {
      latitude: 59.9343,
      longitude: 30.3351,
      city: 'Saint Petersburg',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS51570', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-ekat',
    ip: '109.195.96.230',
    port: 5201,
    name: 'Yekaterinburg (Ertelecom)',
    location: {
      latitude: 56.8389,
      longitude: 60.6057,
      city: 'Yekaterinburg',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS51604', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-nsk',
    ip: '109.194.80.230',
    port: 5201,
    name: 'Novosibirsk (Ertelecom)',
    location: {
      latitude: 54.9885,
      longitude: 82.9207,
      city: 'Novosibirsk',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS43478', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-kazan',
    ip: '109.194.176.230',
    port: 5201,
    name: 'Kazan (Ertelecom)',
    location: {
      latitude: 55.7887,
      longitude: 49.1221,
      city: 'Kazan',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS41668', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-rostov',
    ip: '109.195.224.230',
    port: 5201,
    name: 'Rostov-on-Don (Ertelecom)',
    location: {
      latitude: 47.2357,
      longitude: 39.7015,
      city: 'Rostov-on-Don',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS57378', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-irkutsk',
    ip: '109.194.16.230',
    port: 5201,
    name: 'Irkutsk (Ertelecom)',
    location: {
      latitude: 52.2978,
      longitude: 104.2964,
      city: 'Irkutsk',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS51645', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-krsk',
    ip: '109.195.64.230',
    port: 5201,
    name: 'Krasnoyarsk (Ertelecom)',
    location: {
      latitude: 56.0153,
      longitude: 92.8932,
      city: 'Krasnoyarsk',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS50544', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-perm',
    ip: '212.33.230.200',
    port: 5201,
    name: 'Perm (Ertelecom)',
    location: {
      latitude: 58.0105,
      longitude: 56.2502,
      city: 'Perm',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS12768', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-ufa',
    ip: '109.195.144.230',
    port: 5201,
    name: 'Ufa (Ertelecom)',
    location: {
      latitude: 54.7388,
      longitude: 55.9721,
      city: 'Ufa',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS51035', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-samara',
    ip: '85.113.62.252',
    port: 5201,
    name: 'Samara (Ertelecom)',
    location: {
      latitude: 53.2001,
      longitude: 50.15,
      city: 'Samara',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS34533', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'ertelecom-nn',
    ip: '91.144.184.231',
    port: 5201,
    name: 'Nizhny Novgorod (Ertelecom)',
    location: {
      latitude: 56.3269,
      longitude: 44.0059,
      city: 'Nizhny Novgorod',
      country: 'Russia',
      countryCode: 'RU',
    },
    asn: { number: 'AS42682', organization: 'JSC ER-Telecom Holding' },
    distance: null,
    isNearest: false,
  },
];
