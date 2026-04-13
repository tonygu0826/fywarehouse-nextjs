import { createTransport, cleanInline, cleanMultiline, emailPattern, phonePattern, type SanitizedContactPayload } from '@/lib/contact-mail';
import { getStorage } from './fymail-store';
import { skillsIntegrationManager, type ContactProcessingContext, type TemplateProcessingContext, type JobProcessingContext } from './skills-integration';
import { bulkSendStrategyManager } from './bulk-send-strategy';
import { abTestingFramework } from './ab-testing-framework';

export type FymailContact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  notes: string;
  source: 'manual' | 'website-contact';
  status: 'active' | 'inactive';
  // 发送状态追踪
  emailSent: boolean;
  firstSentAt: string | null;
  lastSentAt: string | null;
  sentCount: number;
  lastTemplateId: string | null;
  batchIds: string[];
  // 欧洲货代数据字段
  acquisitionSource: string;
  acquisitionDate: string;
  country: string;
  companySize: string;
  services: string[];
  specialization: string[];
  dataQuality: 'A' | 'B' | 'C';
  createdAt: string;
  updatedAt: string;
};

export type FymailTemplate = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  previewText: string;
  html: string;
  text: string;
  category: string;
  status: 'draft' | 'active';
  version: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FymailSendJob = {
  id: string;
  templateId: string;
  templateName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  totalCount: number;
  sentCount: number;
  failedCount: number;
  requestedAt: string;
  completedAt: string | null;
  // 批次管理字段
  batchType: 'manual' | 'sequential' | 'scheduled';
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
  selectionCriteria: {
    countries: string[];
    minDataQuality: 'A' | 'B' | 'C';
    unsentOnly: boolean;
    excludeTags: string[];
  };
  scheduleConfig: {
    delayBetweenBatches: number;
    dailyLimit: number;
    timezone: string;
  };
  recipients: Array<{
    contactId: string;
    email: string;
    status: 'pending' | 'sent' | 'failed';
    attempts: number;
    lastAttemptAt: string | null;
    messageId: string | null;
    error: string | null;
  }>;
};

type FymailStore = {
  contacts: FymailContact[];
  templates: FymailTemplate[];
  jobs: FymailSendJob[];
};

export type ContactInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  tags?: string[] | string;
  notes?: string;
  source?: FymailContact['source'];
  status?: FymailContact['status'];
  // 发送状态字段（可选）
  emailSent?: boolean;
  firstSentAt?: string | null;
  lastSentAt?: string | null;
  sentCount?: number;
  lastTemplateId?: string | null;
  batchIds?: string[];
  // 欧洲货代数据字段（可选）
  acquisitionSource?: string;
  acquisitionDate?: string;
  country?: string;
  companySize?: string;
  services?: string[];
  specialization?: string[];
  dataQuality?: 'A' | 'B' | 'C';
};

export type TemplateInput = {
  name?: string;
  slug?: string;
  subject?: string;
  previewText?: string;
  html?: string;
  text?: string;
  category?: string;
  status?: FymailTemplate['status'];
  version?: number;
  parentId?: string | null;
};

export type TemplateTestSendInput = {
  to?: string;
  contactId?: string;
};

export type BulkSendInput = {
  templateId?: string;
  strategyId?: string;
  contactIds?: string[];
  // 批量发送配置
  batchConfig?: {
    batchSize?: number;           // 每批次发送数量（具体数字）
    delayBetweenBatches?: number; // 批次间隔（分钟）
    dailyLimit?: number;          // 每日上限（可选）
    countries?: string[];         // 目标国家（多选）
    unsentOnly?: boolean;         // 仅未发送联系人
    startFrom?: number;           // 从第N个未发送联系人开始
    dataQuality?: ('A' | 'B' | 'C')[]; // 数据质量筛选
  };
  // 发送调度配置
  scheduleConfig?: {
    startImmediately?: boolean;
    startDate?: string;
    timezone?: string;            // 目标时区
  };
};

const maxSendAttempts = 3;

const defaultStore: FymailStore = {
  contacts: [],
  templates: [
    {
      id: 'tpl_intro_warehouse',
      name: '仓库介绍',
      slug: 'warehouse-intro',
      subject: 'FYWarehouse服务介绍',
      previewText: '快速介绍我们的仓库和履约服务。',
      html: '<h1>FYWarehouse</h1><p>Thank you for your interest. We can support bonded warehouse, fulfillment, and local distribution workflows.</p>',
      text: 'FYWarehouse\n\nThank you for your interest. We can support bonded warehouse, fulfillment, and local distribution workflows.',
      category: '销售',
      status: 'active',
      version: 1,
      parentId: null,
      createdAt: '2026-03-24T00:00:00.000Z',
      updatedAt: '2026-03-24T00:00:00.000Z',
    },
    {
      id: 'tpl_followup_contact',
      name: '联系人跟进',
      slug: 'contact-follow-up',
      subject: '跟进您的仓库请求',
      previewText: '在网站联系提交后使用此模板。',
      html: '<p>Hello {{firstName}},</p><p>We received your request and will follow up with the next operational steps.</p>',
      text: 'Hello {{firstName}},\n\nWe received your request and will follow up with the next operational steps.',
      category: '运营',
      status: 'draft',
      version: 1,
      parentId: null,
      createdAt: '2026-03-24T00:00:00.000Z',
      updatedAt: '2026-03-24T00:00:00.000Z',
    },
  ],
  jobs: [],
};

function normalizeTags(input: ContactInput['tags']) {
  const values = Array.isArray(input) ? input : String(input ?? '').split(',');

  return [...new Set(values.map((value) => cleanInline(value).toLowerCase()).filter(Boolean))];
}

function normalizeSlug(value: string | undefined) {
  return cleanInline(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function readStore(): Promise<FymailStore> {
  const storage = getStorage();
  const store = await storage.read();
  
  // Ensure we have at least the default templates
  if (store.templates.length === 0) {
    const updatedStore: FymailStore = {
      contacts: store.contacts,
      templates: defaultStore.templates,
      jobs: store.jobs,
    };
    await storage.write(updatedStore);
    return updatedStore;
  }
  
  return store;
}

async function writeStore(store: FymailStore) {
  const storage = getStorage();
  await storage.write(store);
}

function validateContactInput(input: ContactInput, existingId?: string): Omit<FymailContact, 'id' | 'createdAt' | 'updatedAt'> {
  const firstName = cleanInline(input.firstName);
  const lastName = cleanInline(input.lastName);
  const email = cleanInline(input.email).toLowerCase();
  const phone = cleanInline(input.phone);
  const company = cleanInline(input.company);
  const notes = cleanMultiline(input.notes);
  const tags = normalizeTags(input.tags);
  const source = input.source === 'website-contact' ? 'website-contact' : 'manual';
  const status = input.status === 'inactive' ? 'inactive' : 'active';

  // 发送状态字段
  const emailSent = input.emailSent ?? false;
  const firstSentAt = input.firstSentAt || null;
  const lastSentAt = input.lastSentAt || null;
  const sentCount = input.sentCount ?? 0;
  const lastTemplateId = input.lastTemplateId || null;
  const batchIds = input.batchIds || [];

  // 欧洲货代数据字段
  const acquisitionSource = cleanInline(input.acquisitionSource || 'manual');
  const acquisitionDate = input.acquisitionDate || new Date().toISOString();
  const country = cleanInline(input.country || '');
  const companySize = cleanInline(input.companySize || '');
  const services = Array.isArray(input.services) ? input.services.map(s => cleanInline(s)) : [];
  const specialization = Array.isArray(input.specialization) ? input.specialization.map(s => cleanInline(s)) : [];
  const dataQuality = (input.dataQuality === 'A' || input.dataQuality === 'B' || input.dataQuality === 'C') 
    ? input.dataQuality 
    : 'C';

  if (!firstName) throw new Error('First name is required.');
  if (!lastName) throw new Error('Last name is required.');
  if (!email) throw new Error('Email address is required.');
  if (!emailPattern.test(email)) throw new Error('Enter a valid email address.');
  if (phone && !phonePattern.test(phone)) throw new Error('Enter a valid phone number.');
  if (firstName.length > 80 || lastName.length > 80) throw new Error('Name fields are too long.');
  if (company.length > 120) throw new Error('Company is too long.');
  if (notes.length > 5000) throw new Error('Notes are too long.');
  if (tags.join(',').length > 300) throw new Error('Tags are too long.');

  void existingId;

  return {
    firstName,
    lastName,
    email,
    phone,
    company,
    notes,
    tags,
    source,
    status,
    emailSent,
    firstSentAt,
    lastSentAt,
    sentCount,
    lastTemplateId,
    batchIds,
    acquisitionSource,
    acquisitionDate,
    country,
    companySize,
    services,
    specialization,
    dataQuality,
  };
}

function validateTemplateInput(input: TemplateInput, existingTemplate?: FymailTemplate): Omit<FymailTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  const name = cleanInline(input.name);
  const slug = normalizeSlug(input.slug || input.name);
  const subject = cleanInline(input.subject);
  const previewText = cleanInline(input.previewText);
  const category = cleanInline(input.category);
  const html = cleanMultiline(input.html);
  const text = cleanMultiline(input.text);
  const status = input.status === 'active' ? 'active' : 'draft';
  const version = input.version ?? existingTemplate?.version ?? 1;
  const parentId = input.parentId ?? existingTemplate?.parentId ?? null;

  if (!name) throw new Error('Template name is required.');
  if (!slug) throw new Error('Template slug is required.');
  if (!subject) throw new Error('Email subject is required.');
  if (!html) throw new Error('HTML content is required.');
  if (!text) throw new Error('Plain text content is required.');
  if (name.length > 120) throw new Error('Template name is too long.');
  if (slug.length > 80) throw new Error('Template slug is too long.');
  if (subject.length > 200) throw new Error('Email subject is too long.');
  if (previewText.length > 200) throw new Error('Preview text is too long.');
  if (category.length > 80) throw new Error('Category is too long.');

  return {
    name,
    slug,
    subject,
    previewText,
    html,
    text,
    category,
    status,
    version,
    parentId,
  };
}

export async function listFymailData() {
  return readStore();
}

export async function listSendJobs() {
  const store = await readStore();
  return store.jobs;
}

export async function getJobById(id: string) {
  const store = await readStore();
  return store.jobs.find((item) => item.id === id) ?? null;
}

export async function getTemplateById(id: string) {
  const store = await readStore();
  return store.templates.find((item) => item.id === id) ?? null;
}

export async function getContactById(id: string) {
  const store = await readStore();
  return store.contacts.find((item) => item.id === id) ?? null;
}

export async function createContact(input: ContactInput) {
  const store = await readStore();
  const contact = validateContactInput(input);

  if (store.contacts.some((item) => item.email === contact.email)) {
    throw new Error('A contact with this email already exists.');
  }

  // 技能集成：在保存前增强联系人数据
  try {
    const context: ContactProcessingContext = {
      input,
      validatedContact: contact,
      operation: 'create',
    };
    
    const { enrichedContact, skillResults } = await skillsIntegrationManager.processContactBeforeSave(context);
    
    // 使用增强后的联系人数据
    const now = new Date().toISOString();
    const next: FymailContact = {
      id: crypto.randomUUID(),
      ...enrichedContact,
      createdAt: now,
      updatedAt: now,
    };

    store.contacts.unshift(next);
    await writeStore(store);
    
    // 记录技能执行结果（可选）
    if (skillResults.length > 0) {
      console.log(`[FYMail Skills] Contact ${next.id} enriched with ${skillResults.filter(r => r.success).length}/${skillResults.length} skills`);
    }
    
    return next;
  } catch (skillError) {
    // 如果技能集成失败，回退到原始联系人数据
    console.warn('[FYMail Skills] Skill integration failed, using original contact data:', skillError);
    
    const now = new Date().toISOString();
    const next: FymailContact = {
      id: crypto.randomUUID(),
      ...contact,
      createdAt: now,
      updatedAt: now,
    };

    store.contacts.unshift(next);
    await writeStore(store);
    return next;
  }
}

export async function updateContact(id: string, input: ContactInput) {
  const store = await readStore();
  const index = store.contacts.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Contact not found.');

  const contact = validateContactInput(input, id);
  if (store.contacts.some((item) => item.id !== id && item.email === contact.email)) {
    throw new Error('A contact with this email already exists.');
  }

  const current = store.contacts[index];
  
  // 技能集成：在更新前增强联系人数据
  try {
    const context: ContactProcessingContext = {
      input,
      validatedContact: contact,
      existingContact: current,
      operation: 'update',
    };
    
    const { enrichedContact, skillResults } = await skillsIntegrationManager.processContactBeforeSave(context);
    
    // 使用增强后的联系人数据，但保留现有联系人中未提供的字段
    const next: FymailContact = {
      ...current,
      ...enrichedContact,
      updatedAt: new Date().toISOString(),
    };

    store.contacts[index] = next;
    await writeStore(store);
    
    // 记录技能执行结果（可选）
    if (skillResults.length > 0) {
      console.log(`[FYMail Skills] Contact ${id} updated with ${skillResults.filter(r => r.success).length}/${skillResults.length} skills`);
    }
    
    return next;
  } catch (skillError) {
    // 如果技能集成失败，回退到原始更新数据
    console.warn('[FYMail Skills] Skill integration failed, using original update data:', skillError);
    
    const next: FymailContact = {
      ...current,
      ...contact,
      updatedAt: new Date().toISOString(),
    };

    store.contacts[index] = next;
    await writeStore(store);
    return next;
  }
}

export async function deleteContact(id: string) {
  const store = await readStore();
  const nextContacts = store.contacts.filter((item) => item.id !== id);
  if (nextContacts.length === store.contacts.length) throw new Error('Contact not found.');

  store.contacts = nextContacts;
  await writeStore(store);
}

export async function createTemplate(input: TemplateInput) {
  const store = await readStore();
  const template = validateTemplateInput(input);

  if (store.templates.some((item) => item.slug === template.slug)) {
    throw new Error('A template with this slug already exists.');
  }

  // 技能集成：在保存前增强模板数据
  try {
    const context: TemplateProcessingContext = {
      input,
      validatedTemplate: template,
      operation: 'create',
    };
    
    const { enrichedTemplate, skillResults } = await skillsIntegrationManager.processTemplateBeforeSave(context);
    
    const now = new Date().toISOString();
    const next: FymailTemplate = {
      id: crypto.randomUUID(),
      ...enrichedTemplate,
      createdAt: now,
      updatedAt: now,
    };

    store.templates.unshift(next);
    await writeStore(store);
    
    // 记录技能执行结果（可选）
    if (skillResults.length > 0) {
      console.log(`[FYMail Skills] Template ${next.id} enriched with ${skillResults.filter(r => r.success).length}/${skillResults.length} skills`);
    }
    
    return next;
  } catch (skillError) {
    // 如果技能集成失败，回退到原始模板数据
    console.warn('[FYMail Skills] Skill integration failed, using original template data:', skillError);
    
    const now = new Date().toISOString();
    const next: FymailTemplate = {
      id: crypto.randomUUID(),
      ...template,
      createdAt: now,
      updatedAt: now,
    };

    store.templates.unshift(next);
    await writeStore(store);
    return next;
  }
}

export async function updateTemplate(id: string, input: TemplateInput) {
  const store = await readStore();
  const index = store.templates.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Template not found.');

  const current = store.templates[index];
  const template = validateTemplateInput(input, current);
  
  if (store.templates.some((item) => item.id !== id && item.slug === template.slug)) {
    throw new Error('A template with this slug already exists.');
  }

  // 技能集成：在更新前增强模板数据
  try {
    const context: TemplateProcessingContext = {
      input,
      validatedTemplate: template,
      existingTemplate: current,
      operation: 'update',
    };
    
    const { enrichedTemplate, skillResults } = await skillsIntegrationManager.processTemplateBeforeSave(context);
    
    const next: FymailTemplate = {
      ...current,
      ...enrichedTemplate,
      updatedAt: new Date().toISOString(),
    };

    store.templates[index] = next;
    await writeStore(store);
    
    // 记录技能执行结果（可选）
    if (skillResults.length > 0) {
      console.log(`[FYMail Skills] Template ${id} updated with ${skillResults.filter(r => r.success).length}/${skillResults.length} skills`);
    }
    
    return next;
  } catch (skillError) {
    // 如果技能集成失败，回退到原始更新数据
    console.warn('[FYMail Skills] Skill integration failed, using original update data:', skillError);
    
    const next: FymailTemplate = {
      ...current,
      ...template,
      updatedAt: new Date().toISOString(),
    };

    store.templates[index] = next;
    await writeStore(store);
    return next;
  }
}

export async function deleteTemplate(id: string) {
  const store = await readStore();
  const nextTemplates = store.templates.filter((item) => item.id !== id);
  if (nextTemplates.length === store.templates.length) throw new Error('Template not found.');

  store.templates = nextTemplates;
  await writeStore(store);
}

export async function createTemplateVersion(id: string, input?: TemplateInput) {
  const store = await readStore();
  const original = store.templates.find((item) => item.id === id);
  if (!original) throw new Error('Template not found.');

  // Generate new slug with version suffix to avoid conflicts
  const baseSlug = input?.slug ? normalizeSlug(input.slug) : original.slug;
  const newVersion = original.version + 1;
  const newSlug = `${baseSlug}-v${newVersion}`;

  // Check slug uniqueness (excluding the original)
  if (store.templates.some((item) => item.slug === newSlug && item.id !== id)) {
    throw new Error('A template with this slug already exists.');
  }

  const now = new Date().toISOString();
  const next: FymailTemplate = {
    id: crypto.randomUUID(),
    name: input?.name ?? original.name,
    slug: newSlug,
    subject: input?.subject ?? original.subject,
    previewText: input?.previewText ?? original.previewText,
    html: input?.html ?? original.html,
    text: input?.text ?? original.text,
    category: input?.category ?? original.category,
    status: input?.status ?? original.status,
    version: newVersion,
    parentId: original.id,
    createdAt: now,
    updatedAt: now,
  };

  store.templates.unshift(next);
  await writeStore(store);
  return next;
}

const supportedVariables = ['firstName', 'lastName', 'email', 'phone', 'company', 'notes'] as const;

type TemplateVariableKey = (typeof supportedVariables)[number];

function getTemplateVariables(contact?: FymailContact | null): Record<TemplateVariableKey, string> {
  return {
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    company: contact?.company ?? '',
    notes: contact?.notes ?? '',
  };
}

export function renderTemplateContent(template: FymailTemplate, contact?: FymailContact | null) {
  const variables = getTemplateVariables(contact);
  const replace = (value: string) =>
    value.replace(/\{\{\s*(firstName|lastName|email|phone|company|notes)\s*\}\}/g, (_match, key: TemplateVariableKey) => {
      return variables[key] ?? '';
    });

  return {
    subject: replace(template.subject),
    previewText: replace(template.previewText),
    html: replace(template.html),
    text: replace(template.text),
    variables: supportedVariables,
  };
}

export async function upsertWebsiteContactLead(payload: SanitizedContactPayload) {
  const store = await readStore();
  const firstName = cleanInline(payload.firstName);
  const lastName = cleanInline(payload.lastName);
  const email = cleanInline(payload.email).toLowerCase();
  const phone = cleanInline(payload.phone);
  const serviceRequest = cleanMultiline(payload.serviceRequest);
  const now = new Date().toISOString();
  const existingIndex = store.contacts.findIndex((item) => item.email === email);
  const leadNote = serviceRequest ? `Website inquiry:\n${serviceRequest}` : 'Website inquiry received.';

  if (existingIndex >= 0) {
    const current = store.contacts[existingIndex];
    const nextTags = [...new Set([...current.tags, 'website-lead'])];
    store.contacts[existingIndex] = {
      ...current,
      firstName: firstName || current.firstName,
      lastName: lastName || current.lastName,
      phone: phone || current.phone,
      source: 'website-contact',
      status: 'active',
      tags: nextTags,
      notes: current.notes ? `${current.notes}\n\n${leadNote}` : leadNote,
      updatedAt: now,
    };
    await writeStore(store);
    return store.contacts[existingIndex];
  }

  const next: FymailContact = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    phone,
    company: '',
    tags: ['website-lead'],
    notes: leadNote,
    source: 'website-contact',
    status: 'active',
    // 发送状态字段
    emailSent: false,
    firstSentAt: null,
    lastSentAt: null,
    sentCount: 0,
    lastTemplateId: null,
    batchIds: [],
    // 欧洲货代数据字段
    acquisitionSource: 'website-form',
    acquisitionDate: now,
    country: '',
    companySize: '',
    services: [],
    specialization: [],
    dataQuality: 'C',
    createdAt: now,
    updatedAt: now,
  };

  store.contacts.unshift(next);
  await writeStore(store);
  return next;
}

export async function sendTemplateTestEmail(id: string, input: TemplateTestSendInput) {
  const to = cleanInline(input.to).toLowerCase();
  if (!to) throw new Error('Recipient email is required.');
  if (!emailPattern.test(to)) throw new Error('Enter a valid recipient email address.');

  const template = await getTemplateById(id);
  if (!template) throw new Error('Template not found.');
  const contact = input.contactId ? await getContactById(input.contactId) : null;
  if (input.contactId && !contact) throw new Error('Contact not found.');
  const rendered = renderTemplateContent(template, contact);

  const { transporter, from } = createTransport();
  const info = await transporter.sendMail({
    from,
    to,
    subject: `[Test] ${rendered.subject}`,
    html: rendered.html,
    text: rendered.text,
  });

  return {
    templateId: template.id,
    templateName: template.name,
    to,
    contactId: contact?.id ?? null,
    messageId: info.messageId ?? null,
    accepted: info.accepted,
    rejected: info.rejected,
  };
}

export async function runBulkSendJob(input: BulkSendInput) {
  const job = await enqueueBulkSendJob(input);
  return processSendJob(job.id);
}

export async function enqueueBulkSendJob(input: BulkSendInput) {
  const templateId = cleanInline(input.templateId);
  if (!templateId) throw new Error('Template is required.');

  const store = await readStore();
  const template = store.templates.find((item) => item.id === templateId);
  if (!template) throw new Error('Template not found.');

  // 处理批次配置
  const batchConfig = input.batchConfig || {};
  const scheduleConfig = input.scheduleConfig || {};
  
  // 确定批次类型
  const hasBatchConfig = Boolean(batchConfig.batchSize || batchConfig.countries || batchConfig.unsentOnly);
  const batchType: 'manual' | 'sequential' | 'scheduled' = hasBatchConfig ? 'sequential' : 'manual';
  
  // 获取联系人（支持筛选）
  let contacts: FymailContact[] = [];
  
  if (Array.isArray(input.contactIds) && input.contactIds.length > 0) {
    // 手动选择模式
    const requestedIds = input.contactIds.map((value) => cleanInline(value)).filter(Boolean);
    contacts = store.contacts.filter((item) => requestedIds.includes(item.id) && item.status === 'active');
  } else if (batchConfig.unsentOnly || batchConfig.countries || batchConfig.dataQuality) {
    // 自动筛选模式
    contacts = store.contacts.filter((contact) => {
      if (contact.status !== 'active') return false;
      if (batchConfig.unsentOnly && contact.emailSent) return false;
      if (batchConfig.countries && batchConfig.countries.length > 0 && !batchConfig.countries.includes(contact.country)) return false;
      if (batchConfig.dataQuality && batchConfig.dataQuality.length > 0 && !batchConfig.dataQuality.includes(contact.dataQuality)) return false;
      return true;
    });
    
    // 按获取日期排序（保证顺序）
    contacts.sort((a, b) => {
      const dateA = new Date(a.acquisitionDate).getTime();
      const dateB = new Date(b.acquisitionDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.id.localeCompare(b.id);
    });
    
    // 应用起始位置
    const startFrom = batchConfig.startFrom || 0;
    contacts = contacts.slice(startFrom);
    
    // 应用批次大小限制（如果有）
    const batchSize = batchConfig.batchSize || contacts.length;
    contacts = contacts.slice(0, batchSize);
  } else {
    throw new Error('At least one contact is required. Provide contactIds or use batchConfig with filters.');
  }

  if (contacts.length === 0) throw new Error('No active contacts matched the request.');

  const requestedAt = new Date().toISOString();
  const job: FymailSendJob = {
    id: crypto.randomUUID(),
    templateId: template.id,
    templateName: template.name,
    status: 'queued',
    totalCount: contacts.length,
    sentCount: 0,
    failedCount: 0,
    requestedAt,
    completedAt: null,
    // 批次管理字段
    batchType,
    batchSize: batchConfig.batchSize || contacts.length,
    currentBatch: 1,
    totalBatches: Math.ceil(contacts.length / (batchConfig.batchSize || contacts.length)),
    selectionCriteria: {
      countries: batchConfig.countries || [],
      minDataQuality: (batchConfig.dataQuality && batchConfig.dataQuality.length > 0) 
        ? batchConfig.dataQuality[0] as 'A' | 'B' | 'C' 
        : 'C',
      unsentOnly: batchConfig.unsentOnly || false,
      excludeTags: [],
    },
    scheduleConfig: {
      delayBetweenBatches: batchConfig.delayBetweenBatches || 60, // 默认60分钟
      dailyLimit: batchConfig.dailyLimit || 200, // 默认每日200封
      timezone: scheduleConfig.timezone || 'Europe/Berlin',
    },
    recipients: contacts.map((contact) => ({
      contactId: contact.id,
      email: contact.email,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      messageId: null,
      error: null,
    })),
  };

  // 应用发送策略（如果提供了strategyId）
  let jobWithStrategy = job;
  if (input.strategyId) {
    try {
      jobWithStrategy = bulkSendStrategyManager.applyStrategyToJob(job, input.strategyId);
      console.log(`[FYMail] Applied strategy ${input.strategyId} to job ${jobWithStrategy.id}`);
    } catch (strategyError) {
      console.warn(`[FYMail] Failed to apply strategy ${input.strategyId}:`, strategyError);
      // 继续使用原始作业，不阻止发送
    }
  }

  // 技能集成：优化批量发送任务
  let optimizedJob = jobWithStrategy;
  try {
    const context: JobProcessingContext = {
      input,
      validatedJob: job,
      operation: 'create',
    };
    
    const { optimizedJob: skillOptimizedJob, skillResults } = await skillsIntegrationManager.processJobBeforeSave(context);
    optimizedJob = skillOptimizedJob;
    
    // 记录技能执行结果（可选）
    if (skillResults.length > 0) {
      console.log(`[FYMail Skills] Job ${optimizedJob.id} optimized with ${skillResults.filter(r => r.success).length}/${skillResults.length} skills`);
    }
  } catch (skillError) {
    // 如果技能集成失败，继续使用原始任务
    console.warn('[FYMail Skills] Skill integration failed for job creation, using original job:', skillError);
  }
  
  store.jobs.unshift(optimizedJob);
  await writeStore(store);
  return optimizedJob;
}

function summarizeJob(job: FymailSendJob): FymailSendJob {
  const recipients = job.recipients || [];
  const sentCount = recipients.filter((item) => item.status === 'sent').length;
  const failedRecipients = recipients.filter((item) => item.status === 'failed');
  const pendingCount = recipients.filter((item) => item.status === 'pending').length;

  let status: FymailSendJob['status'] = 'completed';
  if (pendingCount > 0) {
    status = 'queued';
  } else if (failedRecipients.length > 0 && sentCount === 0) {
    status = 'failed';
  } else if (failedRecipients.length > 0) {
    status = 'completed';
  }

  return {
    ...job,
    status,
    sentCount,
    failedCount: failedRecipients.length,
    completedAt: pendingCount === 0 ? new Date().toISOString() : null,
  };
}

async function updateJob(jobId: string, updater: (job: FymailSendJob) => FymailSendJob) {
  const store = await readStore();
  const index = store.jobs.findIndex((item) => item.id === jobId);
  if (index < 0) throw new Error('Send job not found.');
  const next = updater(store.jobs[index]);
  store.jobs[index] = next;
  await writeStore(store);
  return next;
}

/**
 * 为邮件发送应用A/B测试
 */
async function applyABTestingToEmail(
  job: FymailSendJob,
  contact: FymailContact,
  template: any,
  rendered: { subject: string; html: string; text: string }
): Promise<{
  modifiedRendered: { subject: string; html: string; text: string };
  abTestAssignment: any | null;
}> {
  // 默认返回原始内容
  let modifiedRendered = { ...rendered };
  let abTestAssignment = null;
  
  try {
    // 查找活跃的A/B测试（针对主题或内容）
    const activeTests = abTestingFramework.getAllTests({ status: 'active', enabled: true });
    
    // 寻找与当前发送相关的测试（主题测试或内容测试）
    const relevantTests = activeTests.filter(test => 
      (test.element === 'subject' || test.element === 'content' || test.element === 'template') &&
      test.status === 'active'
    );
    
    if (relevantTests.length > 0) {
      // 为每个相关测试分配变体
      for (const test of relevantTests) {
        // 分配变体给联系人
        const assignment = abTestingFramework.assignVariant(
          test.testId,
          contact.id,
          'contact'
        );
        
        if (assignment) {
          // 记录分配
          abTestAssignment = assignment;
          
          // 应用变体配置到邮件内容
          const variant = test.variants.find(v => v.variantId === assignment.variantId);
          if (variant && variant.config) {
            // 根据测试元素类型应用变体
            if (test.element === 'subject' && variant.config.subject) {
              modifiedRendered.subject = variant.config.subject;
            }
            
            if (test.element === 'content' && variant.config.content) {
              // 这里需要更复杂的内容替换逻辑
              // 简化：如果variant.config.html存在，则替换html
              if (variant.config.html) {
                modifiedRendered.html = variant.config.html;
              }
            }
            
            // 记录曝光（邮件发送即视为曝光）
            abTestingFramework.recordExposure(
              test.testId,
              contact.id,
              'contact'
            );
            
            console.log(`[AB Testing] Applied variant ${variant.variantId} for test ${test.testId} to contact ${contact.id}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('[AB Testing] Error applying A/B testing to email:', error);
    // 出错时返回原始内容
  }
  
  return { modifiedRendered, abTestAssignment };
}

export async function processSendJob(jobId: string) {
  const store = await readStore();
  const job = store.jobs.find((item) => item.id === jobId);
  if (!job) throw new Error('Send job not found.');
  if (job.status === 'running') {
    return job;
  }

  const template = store.templates.find((item) => item.id === job.templateId);
  if (!template) throw new Error('Template not found.');

  await updateJob(jobId, (current) => ({
    ...current,
    status: 'running',
    completedAt: null,
  }));

  const { transporter, from } = createTransport();
  let currentJob = (await readStore()).jobs.find((item) => item.id === jobId);
  if (!currentJob) throw new Error('Send job not found.');

  for (const recipient of currentJob.recipients) {
    if (recipient.status !== 'pending' || recipient.attempts >= maxSendAttempts) {
      continue;
    }

    const latestStore = await readStore();
    const contact = latestStore.contacts.find((item) => item.id === recipient.contactId);
    const attemptedAt = new Date().toISOString();

    if (!contact || contact.status !== 'active') {
      currentJob = await updateJob(jobId, (candidate) =>
        summarizeJob({
          ...candidate,
          recipients: candidate.recipients.map((item) =>
            item.contactId === recipient.contactId
              ? {
                  ...item,
                  status: 'failed',
                  attempts: item.attempts + 1,
                  lastAttemptAt: attemptedAt,
                  error: !contact ? 'Contact not found.' : 'Contact is inactive.',
                }
              : item,
          ),
        }),
      );
      continue;
    }

    try {
      const rendered = renderTemplateContent(template, contact);
      
      // 应用A/B测试（如果有）
      const { modifiedRendered, abTestAssignment } = await applyABTestingToEmail(
        job,
        contact,
        template,
        rendered
      );
      
      // 记录A/B测试分配信息到作业元数据（可选）
      if (abTestAssignment) {
        console.log(`[AB Testing] Contact ${contact.id} assigned to variant ${abTestAssignment.variantId} for test ${abTestAssignment.testId}`);
      }
      
      const info = await transporter.sendMail({
        from,
        to: recipient.email,
        subject: modifiedRendered.subject,
        html: modifiedRendered.html,
        text: modifiedRendered.text,
      });

      // 更新联系人发送状态
      const store = await readStore();
      const contactIndex = store.contacts.findIndex((c) => c.id === contact.id);
      if (contactIndex >= 0) {
        const now = new Date().toISOString();
        const currentContact = store.contacts[contactIndex];
        store.contacts[contactIndex] = {
          ...currentContact,
          emailSent: true,
          firstSentAt: currentContact.firstSentAt || now,
          lastSentAt: now,
          sentCount: (currentContact.sentCount || 0) + 1,
          lastTemplateId: template.id,
          batchIds: [...(currentContact.batchIds || []), jobId],
          updatedAt: now,
        };
        await writeStore(store);
      }

      currentJob = await updateJob(jobId, (candidate) =>
        summarizeJob({
          ...candidate,
          recipients: candidate.recipients.map((item) =>
            item.contactId === recipient.contactId
              ? {
                  ...item,
                  status: 'sent',
                  attempts: item.attempts + 1,
                  lastAttemptAt: attemptedAt,
                  messageId: info.messageId ?? null,
                  error: null,
                }
              : item,
          ),
        }),
      );
    } catch (error) {
      currentJob = await updateJob(jobId, (candidate) =>
        summarizeJob({
          ...candidate,
          recipients: candidate.recipients.map((item) =>
            item.contactId === recipient.contactId
              ? {
                  ...item,
                  status: 'failed',
                  attempts: item.attempts + 1,
                  lastAttemptAt: attemptedAt,
                  messageId: null,
                  error: error instanceof Error ? error.message : 'Unknown error',
                }
              : item,
          ),
        }),
      );
    }
  }

  return updateJob(jobId, (candidate) => summarizeJob(candidate));
}

export async function processQueuedSendJobs(limit = 1) {
  const store = await readStore();
  const queuedJobs = (store.jobs || []).filter((item) => item.status === 'queued').slice(0, limit);
  const processed: FymailSendJob[] = [];

  for (const job of queuedJobs) {
    processed.push(await processSendJob(job.id));
  }

  return processed;
}

export async function retryFailedSendJob(jobId: string) {
  const store = await readStore();
  const job = store.jobs.find((item) => item.id === jobId);
  if (!job) throw new Error('Send job not found.');

  const hasRetryable = (job.recipients || []).some((item) => item.status === 'failed' && item.attempts < maxSendAttempts);
  if (!hasRetryable) throw new Error('No retryable recipients in this job.');

  return updateJob(jobId, (candidate) =>
    summarizeJob({
      ...candidate,
      status: 'queued',
      completedAt: null,
      recipients: candidate.recipients.map((item) =>
        item.status === 'failed' && item.attempts < maxSendAttempts
          ? {
              ...item,
              status: 'pending',
              error: null,
              messageId: null,
            }
          : item,
      ),
    }),
  );
}

export type RecipientFilter = 'all' | 'failed' | 'sent' | 'pending';

export function filterJobRecipients(
  job: FymailSendJob,
  filter: RecipientFilter = 'all',
  search = '',
): FymailSendJob['recipients'] {
  const query = search.trim().toLowerCase();
  const recipients = job.recipients || [];
  return recipients
    .filter((recipient) => filter === 'all' || recipient.status === filter)
    .filter((recipient) => {
      if (!query) return true;
      const email = recipient.email?.toLowerCase() ?? '';
      const contactId = recipient.contactId?.toLowerCase() ?? '';
      return email.includes(query) || contactId.includes(query);
    });
}

export function generateJobCSV(job: FymailSendJob, recipients: FymailSendJob['recipients']): string {
  const headers = [
    'Email',
    'Status',
    'Contact ID',
    'Attempts',
    'Last Attempt',
    'Message ID',
    'Error',
  ];
  const rows = recipients.map((recipient) => [
    recipient.email,
    recipient.status,
    recipient.contactId,
    recipient.attempts.toString(),
    recipient.lastAttemptAt || '',
    recipient.messageId || '',
    recipient.error || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}
