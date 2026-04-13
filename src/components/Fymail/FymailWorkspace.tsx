'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type { FymailContact, FymailSendJob, FymailTemplate } from '@/lib/fymail';
import styles from './FymailWorkspace.module.css';

// 欧洲国家列表（ISO 3166-1 alpha-2 代码 + 中文名称）
const EUROPEAN_COUNTRIES = [
  { code: 'DE', name: '德国' },
  { code: 'NL', name: '荷兰' },
  { code: 'UK', name: '英国' },
  { code: 'FR', name: '法国' },
  { code: 'BE', name: '比利时' },
  { code: 'IT', name: '意大利' },
  { code: 'ES', name: '西班牙' },
  { code: 'PL', name: '波兰' },
  { code: 'SE', name: '瑞典' },
  { code: 'NO', name: '挪威' },
  { code: 'DK', name: '丹麦' },
  { code: 'FI', name: '芬兰' },
  { code: 'CH', name: '瑞士' },
  { code: 'AT', name: '奥地利' },
  { code: 'CZ', name: '捷克' },
  { code: 'HU', name: '匈牙利' },
  { code: 'RO', name: '罗马尼亚' },
  { code: 'PT', name: '葡萄牙' },
  { code: 'GR', name: '希腊' },
  { code: 'IE', name: '爱尔兰' },
] as const;

// 数据质量选项
const DATA_QUALITY_OPTIONS = [
  { value: 'A', label: 'A级（高质量）' },
  { value: 'B', label: 'B级（中等质量）' },
  { value: 'C', label: 'C级（基础质量）' },
] as const;

// 批量发送配置状态类型
type BulkSendConfigState = {
  batchSize: number;              // 每批次发送数量
  delayBetweenBatches: number;    // 批次间隔（分钟）
  dailyLimit?: number;            // 每日上限（可选）
  selectedCountries: string[];    // 目标国家（多选）
  dataQuality: ('A' | 'B' | 'C')[]; // 数据质量筛选
  unsentOnly: boolean;            // 仅未发送联系人
  useSmartFiltering: boolean;     // 使用智能筛选（自动从数据中提取）
  manualContactSelection: boolean; // 手动选择联系人
};

type RecipientFilter = 'all' | 'failed' | 'sent' | 'pending';

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  tags: string;
  notes: string;
  source: FymailContact['source'];
  status: FymailContact['status'];
};

type TemplateFormState = {
  name: string;
  slug: string;
  subject: string;
  previewText: string;
  html: string;
  text: string;
  category: string;
  status: FymailTemplate['status'];
};

type Props = {
  initialContacts: FymailContact[];
  initialTemplates: FymailTemplate[];
  initialJobs: FymailSendJob[];
};

const emptyContact: ContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  tags: '',
  notes: '',
  source: 'manual',
  status: 'active',
};

const emptyTemplate: TemplateFormState = {
  name: '',
  slug: '',
  subject: '',
  previewText: '',
  html: '',
  text: '',
  category: '',
  status: 'draft',
};

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(result.message || 'Request failed.');
  }

  return result;
}

export function FymailWorkspace({ initialContacts = [], initialTemplates = [], initialJobs = [] }: Props) {
  const [contacts, setContacts] = useState(initialContacts || []);
  const [templates, setTemplates] = useState(initialTemplates || []);
  const [jobs, setJobs] = useState(initialJobs || []);
  const [contactForm, setContactForm] = useState<ContactFormState>(emptyContact);
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(emptyTemplate);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [contactFeedback, setContactFeedback] = useState('');
  const [templateFeedback, setTemplateFeedback] = useState('');
  const [testSendEmail, setTestSendEmail] = useState('');
  const [previewContactId, setPreviewContactId] = useState('');
  const [selectedBulkContactIds, setSelectedBulkContactIds] = useState<string[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobRecipientFilters, setJobRecipientFilters] = useState<Record<string, RecipientFilter>>({});
  const [jobRecipientSearches, setJobRecipientSearches] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [renderedPreview, setRenderedPreview] = useState({
    subject: '',
    previewText: '',
    html: '',
    text: '',
  });
  const [isPending, startTransition] = useTransition();
  
  // 批量发送配置状态
  const [bulkSendConfig, setBulkSendConfig] = useState<BulkSendConfigState>({
    batchSize: 50,
    delayBetweenBatches: 60,
    dailyLimit: undefined,
    selectedCountries: ['DE', 'NL', 'UK', 'FR', 'BE'],
    dataQuality: ['A', 'B'],
    unsentOnly: true,
    useSmartFiltering: true,
    manualContactSelection: false,
  });
  
  // 策略选择器状态
  const [availableStrategies, setAvailableStrategies] = useState<any[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('balanced');
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [strategyDetails, setStrategyDetails] = useState<any>(null);
  
  // 策略推荐状态
  const [strategyRecommendations, setStrategyRecommendations] = useState<any[]>([]);
  const [strategyRecommendationsLoading, setStrategyRecommendationsLoading] = useState(false);
  const [recommendedStrategyId, setRecommendedStrategyId] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const activeContacts = useMemo(
    () => (contacts || []).filter((contact) => contact.status === 'active').length,
    [contacts],
  );
  const activeTemplates = useMemo(
    () => (templates || []).filter((template) => template.status === 'active').length,
    [templates],
  );
  const activeContactOptions = useMemo(
    () => (contacts || []).filter((contact) => contact.status === 'active'),
    [contacts],
  );
  
  // 根据批量发送配置筛选联系人
  const filteredContactsForBulkSend = useMemo(() => {
    return activeContactOptions.filter(contact => {
      // 国家筛选
      if (bulkSendConfig.selectedCountries.length > 0 && 
          contact.country && 
          !bulkSendConfig.selectedCountries.includes(contact.country)) {
        return false;
      }
      
      // 数据质量筛选
      if (bulkSendConfig.dataQuality.length > 0 && 
          contact.dataQuality && 
          !bulkSendConfig.dataQuality.includes(contact.dataQuality)) {
        return false;
      }
      
      // 仅未发送联系人筛选
      if (bulkSendConfig.unsentOnly && contact.lastSentAt) {
        return false;
      }
      
      // 智能筛选（简化版：基于数据质量）
      if (bulkSendConfig.useSmartFiltering && contact.dataQuality === 'C') {
        return false; // 智能筛选排除C级数据
      }
      
      return true;
    });
  }, [activeContactOptions, bulkSendConfig]);
  
  const hasQueuedWork = useMemo(
    () => (jobs || []).some((job) => job.status === 'queued' || job.status === 'running'),
    [jobs],
  );

  useEffect(() => {
    if (!editingTemplateId) {
      setRenderedPreview({
        subject: templateForm.subject,
        previewText: templateForm.previewText,
        html: templateForm.html,
        text: templateForm.text,
      });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const result = await parseResponse<{
          rendered: { subject: string; previewText: string; html: string; text: string };
        }>(
          await fetch(`/api/fymail/templates/${editingTemplateId}/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId: previewContactId || undefined }),
          }),
        );
        if (!cancelled) {
          setRenderedPreview(result.rendered);
        }
      } catch {
        if (!cancelled) {
          setRenderedPreview({
            subject: templateForm.subject,
            previewText: templateForm.previewText,
            html: templateForm.html,
            text: templateForm.text,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editingTemplateId, previewContactId, templateForm.subject, templateForm.previewText, templateForm.html, templateForm.text]);

  useEffect(() => {
    if (!hasQueuedWork) {
      return;
    }

    const syncJobs = async () => {
      try {
        await fetch('/api/fymail/bulk-send/process', { method: 'POST' });
        const result = await parseResponse<{ jobs: FymailSendJob[] }>(await fetch('/api/fymail/jobs'));
        setJobs(result.jobs);
      } catch {
        return;
      }
    };

    void syncJobs();
    const intervalId = window.setInterval(() => {
      void syncJobs();
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasQueuedWork]);

  // 加载可用策略
  useEffect(() => {
    async function loadStrategies() {
      setStrategyLoading(true);
      try {
        const response = await fetch('/api/skills/strategies');
        if (!response.ok) {
          throw new Error(`Failed to load strategies: ${response.status}`);
        }
        const data = await response.json();
        setAvailableStrategies(data.strategies || []);
        // 如果当前选中的策略不在列表中，选择第一个
        if (data.strategies.length > 0) {
          const defaultStrategy = data.strategies.find((s: any) => s.id === 'balanced') || data.strategies[0];
          setSelectedStrategyId(defaultStrategy.id);
          setStrategyDetails(defaultStrategy);
        }
      } catch (error) {
        console.error('Failed to load strategies:', error);
      } finally {
        setStrategyLoading(false);
      }
    }
    loadStrategies();
  }, []);

  // 获取策略推荐（当筛选后的联系人变化时）
  useEffect(() => {
    async function fetchStrategyRecommendations() {
      if (filteredContactsForBulkSend.length === 0) {
        setStrategyRecommendations([]);
        setRecommendedStrategyId(null);
        return;
      }

      // 避免频繁请求，只有当有足够联系人时
      if (filteredContactsForBulkSend.length < 3) {
        return;
      }

      setStrategyRecommendationsLoading(true);
      try {
        const response = await fetch('/api/skills/strategy-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contacts: filteredContactsForBulkSend,
            taskCharacteristics: {
              goals: ['engagement', 'conversion'],
              priority: 'medium',
              riskTolerance: 'balanced',
              personalizationRequirement: 'advanced',
            },
            generateOnlyTop: 3, // 只获取前3个推荐
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.recommendations && data.recommendations.length > 0) {
          setStrategyRecommendations(data.recommendations);
          // 设置推荐策略（适用性评分最高的）
          const topRecommendation = data.recommendations[0];
          setRecommendedStrategyId(topRecommendation.strategyId);
        } else {
          setStrategyRecommendations([]);
          setRecommendedStrategyId(null);
        }
      } catch (error) {
        console.error('Failed to fetch strategy recommendations:', error);
        setStrategyRecommendations([]);
        setRecommendedStrategyId(null);
      } finally {
        setStrategyRecommendationsLoading(false);
      }
    }

    // 防抖：避免频繁请求
    const timeoutId = setTimeout(() => {
      fetchStrategyRecommendations();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filteredContactsForBulkSend]);

  function resetContactForm() {
    setContactForm(emptyContact);
    setEditingContactId(null);
  }

  function resetTemplateForm() {
    setTemplateForm(emptyTemplate);
    setEditingTemplateId(null);
    setPreviewContactId('');
    setSelectedBulkContactIds([]);
  }

  async function saveContact() {
    const isEditing = Boolean(editingContactId);
    const endpoint = isEditing ? `/api/fymail/contacts/${editingContactId}` : '/api/fymail/contacts';
    const method = isEditing ? 'PUT' : 'POST';
    const result = await parseResponse<{ contact: FymailContact }>(
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      }),
    );

    startTransition(() => {
      setContacts((current) => {
        if (isEditing) {
          return current.map((item) => (item.id === result.contact.id ? result.contact : item));
        }

        return [result.contact, ...current];
      });
      setContactFeedback(isEditing ? 'Contact updated.' : 'Contact created.');
      resetContactForm();
    });
  }

  async function saveTemplate() {
    const isEditing = Boolean(editingTemplateId);
    const endpoint = isEditing ? `/api/fymail/templates/${editingTemplateId}` : '/api/fymail/templates';
    const method = isEditing ? 'PUT' : 'POST';
    const result = await parseResponse<{ template: FymailTemplate }>(
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      }),
    );

    startTransition(() => {
      setTemplates((current) => {
        if (isEditing) {
          return current.map((item) => (item.id === result.template.id ? result.template : item));
        }

        return [result.template, ...current];
      });
      setTemplateFeedback(isEditing ? 'Template updated.' : 'Template created.');
      resetTemplateForm();
    });
  }

  async function createTemplateVersion() {
    if (!editingTemplateId) {
      throw new Error('Select a template to create a new version.');
    }

    const result = await parseResponse<{ template: FymailTemplate }>(
      await fetch(`/api/fymail/templates/${editingTemplateId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      }),
    );

    startTransition(() => {
      setTemplates((current) => [result.template, ...current]);
      setEditingTemplateId(result.template.id);
      setTemplateForm({
        name: result.template.name,
        slug: result.template.slug,
        subject: result.template.subject,
        previewText: result.template.previewText,
        html: result.template.html,
        text: result.template.text,
        category: result.template.category,
        status: result.template.status,
      });
      setTemplateFeedback(`New version ${result.template.version} created.`);
    });
  }

  async function removeContact(id: string) {
    await parseResponse<{ ok: boolean }>(await fetch(`/api/fymail/contacts/${id}`, { method: 'DELETE' }));
    startTransition(() => {
      setContacts((current) => current.filter((item) => item.id !== id));
      setContactFeedback('Contact deleted.');
      if (editingContactId === id) {
        resetContactForm();
      }
    });
  }

  async function removeTemplate(id: string) {
    await parseResponse<{ ok: boolean }>(await fetch(`/api/fymail/templates/${id}`, { method: 'DELETE' }));
    startTransition(() => {
      setTemplates((current) => current.filter((item) => item.id !== id));
      setTemplateFeedback('Template deleted.');
      if (editingTemplateId === id) {
        resetTemplateForm();
      }
    });
  }

  async function sendTemplateTest() {
    if (!editingTemplateId) {
      throw new Error('Save the template first before sending a test email.');
    }

    const result = await parseResponse<{ to: string }>(
      await fetch(`/api/fymail/templates/${editingTemplateId}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testSendEmail, contactId: previewContactId || undefined }),
      }),
    );

    startTransition(() => {
      setTemplateFeedback(`Test email sent to ${result.to}.`);
    });
  }

  // 应用推荐的策略
  function applyRecommendedStrategy(recommendation: any) {
    if (!recommendation) return;
    
    // 应用策略ID
    setSelectedStrategyId(recommendation.strategyId);
    
    // 从推荐中提取策略详情
    const strategyDetails = {
      id: recommendation.strategyId,
      name: recommendation.strategyName,
      batching: {
        batchSize: recommendation.expectedMetrics?.completionTime ? 
          parseInt(recommendation.expectedMetrics.completionTime) || 50 : 50,
        delayBetweenBatches: 60, // 默认
        maxDailySends: 200, // 默认
      },
      filtering: {
        countries: [],
        minDataQuality: 'B' as const,
      },
      personalization: {
        level: 'advanced' as const,
      },
    };
    
    setStrategyDetails(strategyDetails);
    
    // 尝试从推荐调整中获取配置值
    let batchSize = 50;
    let delayBetweenBatches = 60;
    let dataQuality: ('A' | 'B' | 'C')[] = ['A', 'B'];
    
    if (recommendation.recommendedAdjustments) {
      recommendation.recommendedAdjustments.forEach((adjustment: any) => {
        if (adjustment.field === 'batchSize' && adjustment.recommendedValue) {
          batchSize = adjustment.recommendedValue;
        }
        if (adjustment.field === 'delayBetweenBatches' && adjustment.recommendedValue) {
          delayBetweenBatches = adjustment.recommendedValue;
        }
        if (adjustment.field === 'minDataQuality' && adjustment.recommendedValue) {
          dataQuality = [adjustment.recommendedValue];
        }
      });
    }
    
    // 更新批量发送配置
    setBulkSendConfig(current => ({
      ...current,
      batchSize,
      delayBetweenBatches,
      dataQuality,
    }));
    
    alert(`已应用推荐策略: ${recommendation.strategyName}\n置信度: ${(recommendation.confidence * 100).toFixed(1)}%\n预期打开率: ${(recommendation.expectedMetrics.openRate * 100).toFixed(1)}%`);
  }

  // 获取策略详情并应用到配置
  async function fetchAndApplyStrategy(strategyId: string) {
    if (!strategyId) return;
    
    setStrategyLoading(true);
    try {
      const response = await fetch(`/api/skills/strategies?strategyId=${strategyId}`);
      if (!response.ok) throw new Error('Failed to fetch strategy details');
      const data = await response.json();
      const strategy = data.strategies?.find((s: any) => s.id === strategyId) || data.activeStrategy;
      if (strategy) {
        setStrategyDetails(strategy);
        // 应用策略到配置
        setBulkSendConfig(current => ({
          ...current,
          batchSize: strategy.batching.batchSize,
          delayBetweenBatches: strategy.batching.delayBetweenBatches,
          dailyLimit: strategy.batching.maxDailySends,
          selectedCountries: strategy.filtering.countries,
          dataQuality: strategy.filtering.minDataQuality ? [strategy.filtering.minDataQuality] : ['A', 'B'],
          unsentOnly: true, // 默认
          useSmartFiltering: true,
        }));
        alert(`策略 "${strategy.name}" 已应用到发送配置`);
      }
    } catch (error) {
      console.error('Failed to apply strategy:', error);
      alert('Failed to apply strategy');
    } finally {
      setStrategyLoading(false);
    }
  }

  async function runBulkSend() {
    if (!editingTemplateId) {
      throw new Error('Save the template first before creating a bulk send job.');
    }

    // 构建批量发送请求体
    const requestBody: any = {
      templateId: editingTemplateId,
      strategyId: selectedStrategyId, // 发送策略ID
    };

    if (bulkSendConfig.manualContactSelection) {
      // 手动选择模式：使用选中的联系人ID
      if (selectedBulkContactIds.length === 0) {
        throw new Error('请至少选择一个联系人进行手动发送。');
      }
      requestBody.contactIds = selectedBulkContactIds;
    } else {
      // 智能筛选模式：发送筛选配置
      requestBody.batchConfig = {
        batchSize: bulkSendConfig.batchSize,
        delayBetweenBatches: bulkSendConfig.delayBetweenBatches,
        dailyLimit: bulkSendConfig.dailyLimit || undefined,
        countries: bulkSendConfig.selectedCountries?.length > 0 ? bulkSendConfig.selectedCountries : undefined,
        dataQuality: bulkSendConfig.dataQuality?.length > 0 ? bulkSendConfig.dataQuality : undefined,
        unsentOnly: bulkSendConfig.unsentOnly,
      };
    }

    const result = await parseResponse<{ job: FymailSendJob }>(
      await fetch('/api/fymail/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }),
    );

    startTransition(() => {
      setJobs((current) => [result.job, ...current]);
      setTemplateFeedback(`批量发送已排队：${result.job.totalCount} 个收件人。`);
    });

    void fetch('/api/fymail/bulk-send/process', { method: 'POST' });
  }

  async function retryJob(jobId: string) {
    const result = await parseResponse<{ job: FymailSendJob }>(
      await fetch(`/api/fymail/jobs/${jobId}/retry`, {
        method: 'POST',
      }),
    );

    startTransition(() => {
      setJobs((current) => current.map((item) => (item.id === result.job.id ? result.job : item)));
      setTemplateFeedback('Failed recipients re-queued for retry.');
    });

    void fetch('/api/fymail/bulk-send/process', { method: 'POST' });
  }

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1500);
  }

  function exportToCSV(job: FymailSendJob) {
    const recipients = getVisibleRecipients(job);
    if (recipients.length === 0) return;

    const headers = ['Email', 'Contact ID', 'Status', 'Attempts', 'Last Attempt', 'Message ID', 'Error'];
    const rows = recipients.map((recipient) => [
      recipient.email || '',
      recipient.contactId || '',
      recipient.status || '',
      recipient.attempts?.toString() || '0',
      recipient.lastAttemptAt || 'N/A',
      recipient.messageId || 'N/A',
      recipient.error || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-${job.id}-recipients.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function getVisibleRecipients(job: FymailSendJob) {
    const activeFilter = jobRecipientFilters[job.id] ?? 'all';
    const query = (jobRecipientSearches[job.id] ?? '').trim().toLowerCase();

    return (job.recipients || [])
      .filter((recipient) => (activeFilter === 'all' ? true : recipient.status === activeFilter))
      .filter((recipient) => {
        if (!query) return true;
        const email = recipient.email?.toLowerCase() ?? '';
        const contactId = recipient.contactId?.toLowerCase() ?? '';
        return email.includes(query) || contactId.includes(query);
      });
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>fymail / mail.fywarehouse.com</p>
          <h1>FYMail MVP Phase 3</h1>
          <p className={styles.lead}>
            Contact management, template preview, and test sending on top of the existing FYWarehouse route.
          </p>
        </div>

        <div className={styles.metrics}>
          <article className={styles.metricCard}>
            <span>Contacts</span>
            <strong>{(contacts || []).length}</strong>
            <em>{activeContacts} active</em>
          </article>
          <article className={styles.metricCard}>
            <span>Templates</span>
            <strong>{(templates || []).length}</strong>
            <em>{activeTemplates} active</em>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Contact Management</p>
            <h2>CRM-lite contact list for outbound mail</h2>
          </div>
          {contactFeedback ? <p className={styles.feedback}>{contactFeedback}</p> : null}
        </div>

        <div className={styles.grid}>
          <form
            className={styles.editor}
            onSubmit={async (event) => {
              event.preventDefault();
              setContactFeedback('');
              try {
                await saveContact();
              } catch (error) {
                setContactFeedback(error instanceof Error ? error.message : 'Unable to save contact.');
              }
            }}
          >
            <div className={styles.editorHeader}>
              <h3>{editingContactId ? 'Edit contact' : 'New contact'}</h3>
              {editingContactId ? (
                <button className={styles.secondaryButton} type="button" onClick={resetContactForm}>
                  Cancel
                </button>
              ) : null}
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>First name</span>
                <input
                  value={contactForm.firstName}
                  onChange={(event) => setContactForm((current) => ({ ...current, firstName: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Last name</span>
                <input
                  value={contactForm.lastName}
                  onChange={(event) => setContactForm((current) => ({ ...current, lastName: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Phone</span>
                <input
                  value={contactForm.phone}
                  onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Company</span>
                <input
                  value={contactForm.company}
                  onChange={(event) => setContactForm((current) => ({ ...current, company: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Tags</span>
                <input
                  placeholder="importer, hot-lead"
                  value={contactForm.tags}
                  onChange={(event) => setContactForm((current) => ({ ...current, tags: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Source</span>
                <select
                  value={contactForm.source}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      source: event.target.value as ContactFormState['source'],
                    }))
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="website-contact">Website contact</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={contactForm.status}
                  onChange={(event) =>
                    setContactForm((current) => ({
                      ...current,
                      status: event.target.value as ContactFormState['status'],
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span>Notes</span>
                <textarea
                  rows={5}
                  value={contactForm.notes}
                  onChange={(event) => setContactForm((current) => ({ ...current, notes: event.target.value }))}
                />
              </label>
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {editingContactId ? 'Save contact' : 'Create contact'}
            </button>
          </form>

          <div className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h3>Contact records</h3>
              <p>{(contacts || []).length === 0 ? 'No contacts yet.' : `${(contacts || []).length} contacts in the list.`}</p>
            </div>

            <div className={styles.cardList}>
              {(contacts || []).map((contact) => (
                <article key={contact.id} className={styles.recordCard}>
                  <div className={styles.recordTop}>
                    <div>
                      <h4>
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p>{contact.email}</p>
                    </div>
                    <span className={contact.status === 'active' ? styles.badgeActive : styles.badgeMuted}>
                      {contact.status}
                    </span>
                  </div>

                  <dl className={styles.metaList}>
                    <div>
                      <dt>Phone</dt>
                      <dd>{contact.phone || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt>Company</dt>
                      <dd>{contact.company || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{contact.source}</dd>
                    </div>
                    <div>
                      <dt>Tags</dt>
                      <dd>{(contact.tags || []).join(', ') || 'N/A'}</dd>
                    </div>
                  </dl>

                  {contact.notes ? <p className={styles.notes}>{contact.notes}</p> : null}

                  <div className={styles.actions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => {
                        setEditingContactId(contact.id);
                        setContactForm({
                          firstName: contact.firstName,
                          lastName: contact.lastName,
                          email: contact.email,
                          phone: contact.phone,
                          company: contact.company,
                          tags: (contact.tags || []).join(', '),
                          notes: contact.notes,
                          source: contact.source,
                          status: contact.status,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className={styles.dangerButton} type="button" onClick={() => void removeContact(contact.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Template Management</p>
            <h2>Centralized reusable email templates</h2>
          </div>
          {templateFeedback ? <p className={styles.feedback}>{templateFeedback}</p> : null}
        </div>

        <div className={styles.grid}>
          <form
            className={styles.editor}
            onSubmit={async (event) => {
              event.preventDefault();
              setTemplateFeedback('');
              try {
                await saveTemplate();
              } catch (error) {
                setTemplateFeedback(error instanceof Error ? error.message : 'Unable to save template.');
              }
            }}
          >
            <div className={styles.editorHeader}>
              <h3>{editingTemplateId ? 'Edit template' : 'New template'}</h3>
              {editingTemplateId ? (
                <div className={styles.editorHeaderActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={async () => {
                      setTemplateFeedback('');
                      try {
                        await createTemplateVersion();
                      } catch (error) {
                        setTemplateFeedback(error instanceof Error ? error.message : 'Unable to create version.');
                      }
                    }}
                  >
                    Create version
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={resetTemplateForm}>
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  value={templateForm.name}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Slug</span>
                <input
                  value={templateForm.slug}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, slug: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Subject</span>
                <input
                  value={templateForm.subject}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, subject: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Preview text</span>
                <input
                  value={templateForm.previewText}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, previewText: event.target.value }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Category</span>
                <input
                  value={templateForm.category}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, category: event.target.value }))}
                />
              </label>
              <label className={styles.field}>
                <span>Status</span>
                <select
                  value={templateForm.status}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      status: event.target.value as TemplateFormState['status'],
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span>HTML body</span>
                <textarea
                  rows={7}
                  value={templateForm.html}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, html: event.target.value }))}
                />
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span>Text body</span>
                <textarea
                  rows={6}
                  value={templateForm.text}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, text: event.target.value }))}
                />
              </label>
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isPending}>
              {editingTemplateId ? 'Save template' : 'Create template'}
            </button>

            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3>Template variables</h3>
                <p>Supported placeholders for contact fields.</p>
              </div>
              <p className={styles.variableList}>{'{{firstName}}, {{lastName}}, {{email}}, {{phone}}, {{company}}, {{notes}}'}</p>
              <label className={styles.field}>
                <span>Preview contact</span>
                <select value={previewContactId} onChange={(event) => setPreviewContactId(event.target.value)}>
                  <option value="">No contact</option>
                  {activeContactOptions.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} ({contact.email})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <h3>Template preview</h3>
                <p>Live preview of the current editor state.</p>
              </div>
              <div className={styles.previewMeta}>
                <strong>{renderedPreview.subject || templateForm.subject || 'No subject yet'}</strong>
                <span>{renderedPreview.previewText || templateForm.previewText || 'No preview text yet'}</span>
              </div>
              <div
                className={styles.previewHtml}
                dangerouslySetInnerHTML={{ __html: renderedPreview.html || templateForm.html || '<p>No HTML content yet.</p>' }}
              />
              <pre className={styles.previewText}>{renderedPreview.text || templateForm.text || 'No plain text content yet.'}</pre>
            </div>

            <div className={styles.testSendPanel}>
              <div className={styles.previewHeader}>
                <h3>Test send</h3>
                <p>{editingTemplateId ? 'Send the saved template to a mailbox.' : 'Save the template before test sending.'}</p>
              </div>
              <label className={styles.field}>
                <span>Recipient email</span>
                <input value={testSendEmail} onChange={(event) => setTestSendEmail(event.target.value)} />
              </label>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isPending || !editingTemplateId}
                onClick={async () => {
                  setTemplateFeedback('');
                  try {
                    await sendTemplateTest();
                  } catch (error) {
                    setTemplateFeedback(error instanceof Error ? error.message : 'Unable to send test email.');
                  }
                }}
              >
                Send test email
              </button>
            </div>

            <div className={styles.testSendPanel}>
              <div className={styles.previewHeader}>
                <h3>Bulk send job</h3>
                <p>{editingTemplateId ? 'Configure and run bulk email campaign.' : 'Save the template before bulk sending.'}</p>
              </div>
              
              {/* 批量发送配置面板 */}
              <div className={styles.previewPanel} style={{ marginBottom: '24px' }}>
                <div className={styles.previewHeader}>
                  <h4>发送配置</h4>
                  <p>自定义批次发送参数</p>
                </div>
                
                {/* 策略选择器 */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        发送策略
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={selectedStrategyId}
                          onChange={(e) => setSelectedStrategyId(e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }}
                          disabled={strategyLoading}
                        >
                          {strategyLoading ? (
                            <option value="">Loading strategies...</option>
                          ) : availableStrategies.length === 0 ? (
                            <option value="">No strategies available</option>
                          ) : (
                            availableStrategies.map(strategy => (
                              <option key={strategy.id} value={strategy.id}>
                                {strategy.name} - {strategy.description}
                              </option>
                            ))
                          )}
                        </select>
                        <button
                          onClick={async () => {
                            await fetchAndApplyStrategy(selectedStrategyId);
                          }}
                          disabled={strategyLoading || !selectedStrategyId}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          应用策略
                        </button>
                        <button
                          onClick={() => {
                            if (strategyDetails) {
                              alert(JSON.stringify(strategyDetails, null, 2));
                            }
                          }}
                          disabled={!strategyDetails}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          查看详情
                        </button>
                      </div>
                      {strategyDetails && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                          当前策略: <strong>{strategyDetails.name}</strong> - 批次大小: {strategyDetails.batching.batchSize}, 间隔: {strategyDetails.batching.delayBetweenBatches}分钟, 个性化: {strategyDetails.personalization.level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 策略推荐面板 */}
                {filteredContactsForBulkSend.length >= 3 && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fff8', border: '1px solid #95de64', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#389e0d' }}>
                        <span style={{ marginRight: '0.5rem' }}>📊</span>
                        策略推荐
                        <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#666' }}>
                          （基于{filteredContactsForBulkSend.length}个联系人分析）
                        </span>
                      </h4>
                      <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'transparent',
                          color: '#389e0d',
                          border: '1px solid #389e0d',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        {showRecommendations ? '隐藏' : '显示'}推荐
                      </button>
                    </div>
                    
                    {strategyRecommendationsLoading ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                        正在分析联系人并生成策略推荐...
                      </div>
                    ) : showRecommendations && strategyRecommendations.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.75rem' }}>
                          根据联系人特征和任务目标，推荐以下发送策略：
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {strategyRecommendations.map((recommendation, index) => (
                            <div 
                              key={recommendation.strategyId}
                              style={{
                                padding: '0.75rem',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                backgroundColor: index === 0 ? '#f6ffed' : 'white',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong style={{ color: index === 0 ? '#389e0d' : '#1890ff' }}>
                                    {index + 1}. {recommendation.strategyName}
                                  </strong>
                                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                                    适用性评分: {recommendation.suitabilityScore.toFixed(0)}/100
                                  </span>
                                </div>
                                <div>
                                  <button
                                    onClick={() => applyRecommendedStrategy(recommendation)}
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      backgroundColor: index === 0 ? '#389e0d' : '#1890ff',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      marginRight: '0.5rem',
                                    }}
                                  >
                                    应用推荐
                                  </button>
                                  <button
                                    onClick={() => {
                                      alert(JSON.stringify(recommendation, null, 2));
                                    }}
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      backgroundColor: 'transparent',
                                      color: '#666',
                                      border: '1px solid #d9d9d9',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    详情
                                  </button>
                                </div>
                              </div>
                              
                              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                                <div><strong>推荐理由:</strong> {recommendation.reasoning?.join('; ') || '无'}</div>
                                <div><strong>预期指标:</strong> 打开率 {(recommendation.expectedMetrics?.openRate * 100).toFixed(1)}%, 回复率 {(recommendation.expectedMetrics?.replyRate * 100).toFixed(1)}%, 完成时间 {recommendation.expectedMetrics?.completionTime}</div>
                                <div><strong>置信度:</strong> {(recommendation.confidence * 100).toFixed(1)}%</div>
                              </div>
                              
                              {recommendation.recommendedAdjustments && recommendation.recommendedAdjustments.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#8c8c8c', marginTop: '0.5rem' }}>
                                  <strong>推荐调整:</strong> {recommendation.recommendedAdjustments.map((adj: any) => `${adj.field}: ${adj.currentValue || '默认'} → ${adj.recommendedValue}`).join('; ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.75rem', fontStyle: 'italic' }}>
                          提示: 点击「应用推荐」将自动配置发送参数。推荐基于历史性能数据和联系人特征分析。
                        </div>
                      </div>
                    ) : showRecommendations ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                        暂无策略推荐。请确保选择了足够的联系人（至少3个）并设置了适当的筛选条件。
                      </div>
                    ) : null}
                    
                    {recommendedStrategyId && !showRecommendations && (
                      <div style={{ fontSize: '0.875rem', color: '#389e0d' }}>
                        <strong>💡 推荐策略:</strong> {strategyRecommendations[0]?.strategyName || recommendedStrategyId}
                        <button
                          onClick={() => applyRecommendedStrategy(strategyRecommendations[0])}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#389e0d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            marginLeft: '0.75rem',
                          }}
                        >
                          应用推荐
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={styles.formGrid}>
                  {/* 批次大小 */}
                  <label className={styles.field}>
                    <span>批次邮件数量</span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={bulkSendConfig.batchSize}
                      onChange={(event) => setBulkSendConfig((current) => ({
                        ...current,
                        batchSize: parseInt(event.target.value) || 50,
                      }))}
                    />
                  </label>
                  
                  {/* 频率间隔 */}
                  <label className={styles.field}>
                    <span>批次间隔（分钟）</span>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={bulkSendConfig.delayBetweenBatches}
                      onChange={(event) => setBulkSendConfig((current) => ({
                        ...current,
                        delayBetweenBatches: parseInt(event.target.value) || 60,
                      }))}
                    />
                  </label>
                  
                  {/* 每日上限 */}
                  <label className={styles.field}>
                    <span>每日上限（可选）</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="不限制"
                      value={bulkSendConfig.dailyLimit || ''}
                      onChange={(event) => setBulkSendConfig((current) => ({
                        ...current,
                        dailyLimit: event.target.value ? parseInt(event.target.value) : undefined,
                      }))}
                    />
                  </label>
                  
                  {/* 选择模式 */}
                  <label className={styles.field}>
                    <span>选择模式</span>
                    <select
                      value={bulkSendConfig.manualContactSelection ? 'manual' : 'smart'}
                      onChange={(event) => setBulkSendConfig((current) => ({
                        ...current,
                        manualContactSelection: event.target.value === 'manual',
                      }))}
                    >
                      <option value="smart">智能筛选（自动从数据中提取）</option>
                      <option value="manual">手动选择联系人</option>
                    </select>
                  </label>
                  
                  {/* 仅未发送联系人 */}
                  <label className={styles.checkboxRow} style={{ gridColumn: '1 / -1' }}>
                    <input
                      type="checkbox"
                      checked={bulkSendConfig.unsentOnly}
                      onChange={(event) => setBulkSendConfig((current) => ({
                        ...current,
                        unsentOnly: event.target.checked,
                      }))}
                    />
                    <span>仅发送给未发送过的联系人</span>
                  </label>
                </div>
                
                {/* 国家筛选 */}
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--color-subtext)' }}>目标国家（多选）</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EUROPEAN_COUNTRIES.map((country) => (
                      <label key={country.code} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={bulkSendConfig.selectedCountries?.includes(country.code) ?? false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setBulkSendConfig((current) => ({
                                ...current,
                                selectedCountries: [...current.selectedCountries, country.code],
                              }));
                            } else {
                              setBulkSendConfig((current) => ({
                                ...current,
                                selectedCountries: current.selectedCountries.filter((c) => c !== country.code),
                              }));
                            }
                          }}
                        />
                        <span>{country.name} ({country.code})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 数据质量筛选 */}
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--color-subtext)' }}>数据质量筛选</h5>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {DATA_QUALITY_OPTIONS.map((option) => (
                      <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={bulkSendConfig.dataQuality?.includes(option.value) ?? false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setBulkSendConfig((current) => ({
                                ...current,
                                dataQuality: [...current.dataQuality, option.value],
                              }));
                            } else {
                              setBulkSendConfig((current) => ({
                                ...current,
                                dataQuality: current.dataQuality.filter((q) => q !== option.value),
                              }));
                            }
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={styles.checkboxList}>
                {activeContactOptions.length === 0 ? (
                  <p className={styles.emptyState}>No active contacts available.</p>
                ) : (
                  activeContactOptions.map((contact) => (
                    <label key={contact.id} className={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={selectedBulkContactIds.includes(contact.id)}
                        onChange={(event) => {
                          setSelectedBulkContactIds((current) =>
                            event.target.checked ? [...current, contact.id] : current.filter((item) => item !== contact.id),
                          );
                        }}
                      />
                      <span>
                        {contact.firstName} {contact.lastName} ({contact.email})
                      </span>
                    </label>
                  ))
                )}
              </div>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={isPending || !editingTemplateId}
                onClick={async () => {
                  setTemplateFeedback('');
                  try {
                    await runBulkSend();
                  } catch (error) {
                    setTemplateFeedback(error instanceof Error ? error.message : 'Unable to run bulk send.');
                  }
                }}
              >
                Run bulk send
              </button>
            </div>

            <div className={styles.testSendPanel}>
              <div className={styles.previewHeader}>
                <h3>Send jobs</h3>
                <p>Latest execution records.</p>
              </div>
              <div className={styles.jobList}>
                {(jobs || []).length === 0 ? (
                  <p className={styles.emptyState}>No send jobs yet.</p>
                ) : (
                  (jobs || []).map((job) => (
                    <article key={job.id} className={styles.jobCard}>
                      <div className={styles.jobTop}>
                        <div className={styles.jobSummary}>
                          <strong>{job.templateName}</strong>
                          <span>
                            {job.sentCount}/{job.totalCount} sent
                          </span>
                          <span>Status: {job.status}</span>
                          <span>{job.failedCount} failed</span>
                        </div>
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={() => setExpandedJobId((current) => (current === job.id ? null : job.id))}
                        >
                          {expandedJobId === job.id ? 'Hide details' : 'View details'}
                        </button>
                      </div>
                      {(job.recipients || []).some((item) => item.status === 'failed' && item.attempts < 3) ? (
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={async () => {
                            setTemplateFeedback('');
                            try {
                              await retryJob(job.id);
                            } catch (error) {
                              setTemplateFeedback(error instanceof Error ? error.message : 'Unable to retry send job.');
                            }
                          }}
                        >
                          Retry failed
                        </button>
                      ) : null}
                      {expandedJobId === job.id ? (
                        <div className={styles.jobDetails}>
                          <div className={styles.filterBar}>
                            {(['all', 'failed', 'sent', 'pending'] as RecipientFilter[]).map((filter) => (
                              <button
                                key={`${job.id}-${filter}`}
                                className={
                                  jobRecipientFilters[job.id] === filter || (!jobRecipientFilters[job.id] && filter === 'all')
                                    ? styles.filterButtonActive
                                    : styles.filterButton
                                }
                                type="button"
                                onClick={() =>
                                  setJobRecipientFilters((current) => ({
                                    ...current,
                                    [job.id]: filter,
                                  }))
                                }
                              >
                                {filter}
                              </button>
                            ))}
                            <button
                              className={styles.copyButton}
                              type="button"
                              onClick={async () => {
                                await copyValue(
                                  `${job.id}-visible-emails`,
                                  getVisibleRecipients(job)
                                    .map((recipient) => recipient.email || '')
                                    .filter(email => email.trim() !== '')
                                    .join('\n'),
                                );
                              }}
                            >
                              {copiedKey === `${job.id}-visible-emails` ? 'Copied' : 'Copy visible emails'}
                            </button>
                            <button
                              className={styles.copyButton}
                              type="button"
                              onClick={async () => {
                                await copyValue(
                                  `${job.id}-visible-contacts`,
                                  getVisibleRecipients(job)
                                    .map((recipient) => recipient.contactId || '')
                                    .filter(id => id.trim() !== '')
                                    .join('\n'),
                                );
                              }}
                            >
                              {copiedKey === `${job.id}-visible-contacts` ? 'Copied' : 'Copy visible contact IDs'}
                            </button>
                            <button
                              className={styles.copyButton}
                              type="button"
                              onClick={async () => {
                                await copyValue(
                                  `${job.id}-visible-reasons`,
                                  getVisibleRecipients(job)
                                    .map((recipient) => recipient.error)
                                    .filter((reason): reason is string => Boolean(reason))
                                    .join('\n'),
                                );
                              }}
                            >
                              {copiedKey === `${job.id}-visible-reasons` ? 'Copied' : 'Copy visible reasons'}
                            </button>
                            <button
                              className={styles.copyButton}
                              type="button"
                              onClick={() => exportToCSV(job)}
                            >
                              Export CSV
                            </button>
                          </div>
                          <label className={styles.field}>
                            <span>Search recipients</span>
                            <input
                              placeholder="Search by email or Contact ID"
                              value={jobRecipientSearches[job.id] ?? ''}
                              onChange={(event) =>
                                setJobRecipientSearches((current) => ({
                                  ...current,
                                  [job.id]: event.target.value,
                                }))
                              }
                            />
                          </label>
                          {getVisibleRecipients(job).map((recipient) => (
                            <article key={`${job.id}-${recipient.contactId}`} className={styles.recipientCard}>
                              <div className={styles.recipientTop}>
                                <div className={styles.copyRow}>
                                  <strong>{recipient.email || ''}</strong>
                                  <button
                                    className={styles.copyButton}
                                    type="button"
                                    onClick={async () => {
                                      await copyValue(`${job.id}-${recipient.contactId || 'unknown'}-email`, recipient.email || '');
                                    }}
                                  >
                                    {copiedKey === `${job.id}-${recipient.contactId || 'unknown'}-email` ? 'Copied' : 'Copy email'}
                                  </button>
                                </div>
                                <span
                                  className={
                                    recipient.status === 'sent'
                                      ? styles.badgeActive
                                      : recipient.status === 'failed'
                                        ? styles.badgeError
                                        : styles.badgeMuted
                                  }
                                >
                                  {recipient.status}
                                </span>
                              </div>
                              <dl className={styles.recipientMeta}>
                                <div>
                                  <dt>Contact ID</dt>
                                  <dd className={styles.copyValue}>
                                    <span>{recipient.contactId || ''}</span>
                                    <button
                                      className={styles.copyButton}
                                      type="button"
                                      onClick={async () => {
                                        await copyValue(`${job.id}-${recipient.contactId || 'unknown'}-contact`, recipient.contactId || '');
                                      }}
                                    >
                                      {copiedKey === `${job.id}-${recipient.contactId || 'unknown'}-contact` ? 'Copied' : 'Copy'}
                                    </button>
                                  </dd>
                                </div>
                                <div>
                                  <dt>Attempts</dt>
                                  <dd>{recipient.attempts || 0}</dd>
                                </div>
                                <div>
                                  <dt>Message ID</dt>
                                  <dd>{recipient.messageId || 'N/A'}</dd>
                                </div>
                                <div>
                                  <dt>Last Attempt</dt>
                                  <dd>{recipient.lastAttemptAt || 'N/A'}</dd>
                                </div>
                              </dl>
                              <div className={styles.copyReasonRow}>
                                <p className={styles.recipientReason}>
                                  {recipient.error ? `Failure reason: ${recipient.error}` : 'Delivery completed successfully.'}
                                </p>
                                {recipient.error ? (
                                  <button
                                    className={styles.copyButton}
                                    type="button"
                                    onClick={async () => {
                                      await copyValue(`${job.id}-${recipient.contactId || 'unknown'}-reason`, recipient.error || '');
                                    }}
                                  >
                                    {copiedKey === `${job.id}-${recipient.contactId || 'unknown'}-reason` ? 'Copied' : 'Copy reason'}
                                  </button>
                                ) : null}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </div>
          </form>

          <div className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h3>Template records</h3>
              <p>{(templates || []).length === 0 ? 'No templates yet.' : `${(templates || []).length} templates available.`}</p>
            </div>

            <div className={styles.cardList}>
              {(templates || []).map((template) => (
                <article key={template.id} className={styles.recordCard}>
                  <div className={styles.recordTop}>
                    <div>
                      <h4>{template.name}</h4>
                      <p>{template.subject}</p>
                    </div>
                    <span className={template.status === 'active' ? styles.badgeActive : styles.badgeMuted}>
                      {template.status}
                    </span>
                  </div>

                  <dl className={styles.metaList}>
                    <div>
                      <dt>Slug</dt>
                      <dd>{template.slug}</dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{template.category || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt>Preview</dt>
                      <dd>{template.previewText || 'N/A'}</dd>
                    </div>
                  </dl>

                  <p className={styles.snippet}>{template.text}</p>

                  <div className={styles.actions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => {
                        setEditingTemplateId(template.id);
                        setTemplateForm({
                          name: template.name,
                          slug: template.slug,
                          subject: template.subject,
                          previewText: template.previewText,
                          html: template.html,
                          text: template.text,
                          category: template.category,
                          status: template.status,
                        });
                        setPreviewContactId('');
                        setSelectedBulkContactIds([]);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => void removeTemplate(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
