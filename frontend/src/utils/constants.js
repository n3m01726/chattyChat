// utils/constants.js

// URL du serveur backend
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Limites
export const MAX_USERNAME_LENGTH = 20;
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_BIO_LENGTH = 200;
export const MAX_STATUS_LENGTH = 100;
export const MAX_DISPLAY_NAME_LENGTH = 32;

// Délai pour l'indicateur "en train d'écrire" (ms)
export const TYPING_TIMEOUT = 1000;

// Statuts disponibles
export const USER_STATUSES = [
  { value: 'online', label: 'En ligne', color: '#2ecc71', icon: '🟢' },
  { value: 'away', label: 'Absent', color: '#f39c12', icon: '🟡' },
  { value: 'busy', label: 'Ne pas déranger', color: '#e74c3c', icon: '🔴' },
  { value: 'offline', label: 'Hors ligne', color: '#95a5a6', icon: '⚫' }
];

// Timezones principales
export const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Temps universel coordonné)', offset: '+00:00' },
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: '-05:00/-04:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: '-08:00/-07:00' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: '-06:00/-05:00' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: '-07:00/-06:00' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)', offset: '-05:00/-04:00' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: '-06:00' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: '-03:00' },
  { value: 'Europe/London', label: 'Londres (GMT/BST)', offset: '+00:00/+01:00' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: '+01:00/+02:00' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: '+01:00/+02:00' },
  { value: 'Europe/Moscow', label: 'Moscou (MSK)', offset: '+03:00' },
  { value: 'Asia/Dubai', label: 'Dubaï (GST)', offset: '+04:00' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: '+05:30' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: '+07:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: '+08:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'Asia/Seoul', label: 'Séoul (KST)', offset: '+09:00' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: '+11:00/+10:00' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', offset: '+13:00/+12:00' }
];