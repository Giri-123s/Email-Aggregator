import axios from "axios";

export interface Email {
  id: string;
  account: string;
  folder: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  text: string;
  html: string;
  label: string;
}

export interface EmailFilters {
  query?: string;
  account?: string;
  folder?: string;
  label?: string;
}

// Simple cache to prevent duplicate requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

const getCacheKey = (endpoint: string, filters: EmailFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.query && filters.query.trim()) params.append('q', filters.query);
  if (filters.account && filters.account.trim()) params.append('account', filters.account);
  if (filters.folder && filters.folder.trim()) params.append('folder', filters.folder);
  if (filters.label && filters.label.trim()) params.append('label', filters.label);
  return `${endpoint}?${params.toString()}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const fetchEmails = async (filters: EmailFilters = {}): Promise<Email[]> => {
  const cacheKey = getCacheKey('emails', filters);
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log('Using cached emails data');
    return cached;
  }

  const params = new URLSearchParams();
  
  if (filters.query && filters.query.trim()) params.append('q', filters.query);
  if (filters.account && filters.account.trim()) params.append('account', filters.account);
  if (filters.folder && filters.folder.trim()) params.append('folder', filters.folder);
  if (filters.label && filters.label.trim()) params.append('label', filters.label);

  const response = await axios.get(`http://localhost:4000/emails?${params.toString()}`);
  setCachedData(cacheKey, response.data);
  return response.data;
};

export const fetchStats = async () => {
  const response = await axios.get('http://localhost:4000/stats');
  return response.data;
};

export const fetchFilteredStats = async (filters: EmailFilters = {}) => {
  const cacheKey = getCacheKey('stats/filtered', filters);
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log('Using cached filtered stats data');
    return cached;
  }

  const params = new URLSearchParams();
  
  if (filters.query && filters.query.trim()) params.append('q', filters.query);
  if (filters.account && filters.account.trim()) params.append('account', filters.account);
  if (filters.folder && filters.folder.trim()) params.append('folder', filters.folder);
  if (filters.label && filters.label.trim()) params.append('label', filters.label);

  const response = await axios.get(`http://localhost:4000/stats/filtered?${params.toString()}`);
  setCachedData(cacheKey, response.data);
  return response.data;
};

export const fetchAccounts = async () => {
  const response = await axios.get('http://localhost:4000/accounts');
  return response.data;
};

export const fetchFolders = async () => {
  const response = await axios.get('http://localhost:4000/folders');
  return response.data;
};
