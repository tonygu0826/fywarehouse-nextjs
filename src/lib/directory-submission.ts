// Automated directory submission system for logistics industry backlinks
// Manages a list of industry directories and tracks submission status

import * as fs from 'fs';
import * as path from 'path';

// ==================== Types ====================

export type DirectoryType = 'free' | 'paid';
export type SubmissionStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';

export type DirectoryEntry = {
  id: string;
  name: string;
  url: string;
  submissionUrl: string;
  type: DirectoryType;
  status: SubmissionStatus;
  priority: number; // 1-10, higher = more important
  category: string;
  notes: string;
  submittedAt: string | null;
  approvedAt: string | null;
  lastChecked: string | null;
};

// ==================== Directory List ====================

const LOGISTICS_DIRECTORIES: DirectoryEntry[] = [
  {
    id: 'freightnet',
    name: 'FreightNet Directory',
    url: 'https://www.freightnet.com',
    submissionUrl: 'https://www.freightnet.com/directory/submit',
    type: 'free',
    status: 'pending',
    priority: 8,
    category: 'Freight & Logistics',
    notes: 'Global freight forwarder directory. Free basic listing available.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'wca',
    name: 'World Cargo Alliance',
    url: 'https://www.wcaworld.com',
    submissionUrl: 'https://www.wcaworld.com/membership',
    type: 'paid',
    status: 'pending',
    priority: 9,
    category: 'Freight & Logistics',
    notes: 'Largest freight forwarder network. Membership required for listing.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'fiata',
    name: 'FIATA Member Directory',
    url: 'https://fiata.org',
    submissionUrl: 'https://fiata.org/membership',
    type: 'paid',
    status: 'pending',
    priority: 10,
    category: 'Industry Association',
    notes: 'International Federation of Freight Forwarders Associations. High authority backlink.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'ciffa',
    name: 'Canadian International Freight Forwarders Association (CIFFA)',
    url: 'https://www.ciffa.com',
    submissionUrl: 'https://www.ciffa.com/membership',
    type: 'paid',
    status: 'pending',
    priority: 10,
    category: 'Industry Association',
    notes: 'Key Canadian freight forwarder association. Highly relevant for local SEO.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'ti',
    name: 'Transport Intelligence',
    url: 'https://www.ti-insight.com',
    submissionUrl: 'https://www.ti-insight.com/directory/submit',
    type: 'free',
    status: 'pending',
    priority: 7,
    category: 'Logistics Research',
    notes: 'Logistics research and analysis platform. Company profile listing.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'logistics-link',
    name: 'Logistics Link',
    url: 'https://www.logisticslink.com',
    submissionUrl: 'https://www.logisticslink.com/register',
    type: 'free',
    status: 'pending',
    priority: 6,
    category: 'Logistics Directory',
    notes: 'General logistics company directory with free listings.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'cwda',
    name: 'Canadian Warehouse & Distribution Association',
    url: 'https://www.cwda.ca',
    submissionUrl: 'https://www.cwda.ca/membership',
    type: 'paid',
    status: 'pending',
    priority: 9,
    category: 'Industry Association',
    notes: 'Canadian warehouse industry association. Strong relevance for warehousing services.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
  {
    id: 'mpa',
    name: 'Montreal Port Authority Directory',
    url: 'https://www.port-montreal.com',
    submissionUrl: 'https://www.port-montreal.com/en/business-directory',
    type: 'free',
    status: 'pending',
    priority: 10,
    category: 'Port Directory',
    notes: 'Montreal Port Authority business directory. Critical for local SEO and authority.',
    submittedAt: null,
    approvedAt: null,
    lastChecked: null,
  },
];

// ==================== Storage ====================

const DATA_DIR = path.join(process.cwd(), 'data', 'seo');
const DIRECTORIES_FILE = path.join(DATA_DIR, 'directories.json');

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDirectories(): DirectoryEntry[] {
  try {
    if (fs.existsSync(DIRECTORIES_FILE)) {
      return JSON.parse(fs.readFileSync(DIRECTORIES_FILE, 'utf-8'));
    }
  } catch { /* fallback to defaults */ }
  return [...LOGISTICS_DIRECTORIES];
}

function saveDirectories(dirs: DirectoryEntry[]): void {
  ensureDir();
  fs.writeFileSync(DIRECTORIES_FILE, JSON.stringify(dirs, null, 2));
}

// ==================== Public API ====================

export function getAllDirectories(): DirectoryEntry[] {
  return loadDirectories();
}

export function getDirectoryById(id: string): DirectoryEntry | null {
  const dirs = loadDirectories();
  return dirs.find((d) => d.id === id) || null;
}

export function getDirectoriesByStatus(status: SubmissionStatus): DirectoryEntry[] {
  return loadDirectories().filter((d) => d.status === status);
}

export function getDirectoriesByPriority(minPriority = 7): DirectoryEntry[] {
  return loadDirectories()
    .filter((d) => d.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority);
}

export function markAsSubmitted(id: string, notes?: string): DirectoryEntry | null {
  const dirs = loadDirectories();
  const dir = dirs.find((d) => d.id === id);
  if (!dir) return null;

  dir.status = 'submitted';
  dir.submittedAt = new Date().toISOString();
  dir.lastChecked = new Date().toISOString();
  if (notes) dir.notes = notes;

  saveDirectories(dirs);
  return dir;
}

export function updateDirectoryStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string,
): DirectoryEntry | null {
  const dirs = loadDirectories();
  const dir = dirs.find((d) => d.id === id);
  if (!dir) return null;

  dir.status = status;
  dir.lastChecked = new Date().toISOString();
  if (status === 'approved') dir.approvedAt = new Date().toISOString();
  if (notes) dir.notes = notes;

  saveDirectories(dirs);
  return dir;
}

export function getSubmissionSummary() {
  const dirs = loadDirectories();
  const byStatus = {
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  };

  for (const d of dirs) {
    byStatus[d.status]++;
  }

  return {
    total: dirs.length,
    ...byStatus,
    freeDirectories: dirs.filter((d) => d.type === 'free').length,
    paidDirectories: dirs.filter((d) => d.type === 'paid').length,
    highPriority: dirs.filter((d) => d.priority >= 8).length,
    nextToSubmit: dirs
      .filter((d) => d.status === 'pending')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map((d) => ({ id: d.id, name: d.name, priority: d.priority, type: d.type })),
  };
}
