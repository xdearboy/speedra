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
      latitude: 50.8897,
      longitude: 6.0563,
      city: 'Eygelshoven',
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
      latitude: 50.1109,
      longitude: 8.6821,
      city: 'Frankfurt am Main',
      country: 'Germany',
      countryCode: 'DE',
    },
    asn: { number: 'AS215439', organization: 'play2go.cloud' },
    distance: null,
    isNearest: false,
  },
  {
    id: 'play2go-ams',
    ip: '144.31.30.177',
    port: 5201,
    name: 'Amsterdam (play2go)',
    location: {
      latitude: 52.3676,
      longitude: 4.9041,
      city: 'Amsterdam',
      country: 'Netherlands',
      countryCode: 'NL',
    },
    asn: { number: 'AS215439', organization: 'play2go.cloud' },
    distance: null,
    isNearest: false,
  },

  {
    id: 'init7-zur',
    ip: '185.102.218.1',
    port: 5201,
    name: 'Zurich',
    location: {
      latitude: 47.3769,
      longitude: 8.5417,
      city: 'Zurich',
      country: 'Switzerland',
      countryCode: 'CH',
    },
    asn: { number: 'AS60068', organization: 'Datacamp Limited' },
    distance: null,
    isNearest: false,
  },
];
