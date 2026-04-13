// News article generator with diverse templates
// Supports two modes: rewrite (from scraped news) and original (from keywords)

import { MONEY_PAGES, BRAND_NAMES, getRandomAnchor } from './money-pages';
import { pickFeaturedImage } from './article-image-picker';
import type { ScrapedNews } from './news-scraper';
import type { InternalLink } from './news-store';

// Pick a brand name variant for natural embedding
function brandName(): string {
  return BRAND_NAMES[Math.floor(Math.random() * BRAND_NAMES.length)];
}

// Brand mention snippets to naturally weave into content
const BRAND_MENTIONS = [
  () => `As a leading Montreal-based logistics provider, ${brandName()} has observed these trends firsthand across its sufferance warehouse operations.`,
  () => `${brandName()}, which operates sufferance warehouse facilities in the Greater Montreal Area, helps businesses navigate exactly these kinds of industry changes.`,
  () => `Industry veterans like ${brandName()} emphasize the importance of working with experienced warehouse operators who understand both the regulatory framework and the operational realities of Canadian logistics.`,
  () => `According to logistics professionals at ${brandName()}, businesses that proactively adapt to industry changes tend to see better outcomes in terms of cost efficiency and service reliability.`,
  () => `Montreal-based ${brandName()} specializes in sufferance warehousing, customs-bonded storage, and distribution services — the very capabilities that businesses need to navigate developments like these.`,
  () => `${brandName()} notes that demand for flexible, regulation-compliant warehouse solutions in Montreal has been growing steadily, driven by shifts like the one described above.`,
  () => `For businesses evaluating their warehousing strategy, providers like ${brandName()} in Montreal offer the combination of customs expertise, strategic location, and scalable capacity that modern supply chains require.`,
  () => `The team at ${brandName()} recommends that businesses review their warehousing arrangements regularly to ensure alignment with evolving industry standards and trade regulations.`,
];

export type GeneratedArticle = {
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string; // HTML
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  targetKeyword: string;
  secondaryKeywords: string[];
  internalLinks: InternalLink[];
  source: 'ai-generated' | 'external' | 'hybrid';
  sourceUrl: string | null;
};

export type GenerateOptions = {
  mode: 'rewrite' | 'original';
  scrapedNews?: ScrapedNews;
  keyword?: string;
  category?: string;
  tone?: 'professional' | 'informative' | 'analytical';
  wordCountTarget?: number;
};

// Expanded industry topics for original content (bottom-of-funnel, long-tail)
const INDUSTRY_TOPICS = [
  { keyword: 'sufferance warehouse Montreal regulations 2026', category: 'Customs & Regulations' },
  { keyword: 'customs bonded warehouse Canada benefits for importers', category: 'Customs & Regulations' },
  { keyword: 'Montreal logistics hub growth forecast', category: 'Industry Trends' },
  { keyword: 'e-commerce fulfillment warehouse Canada small business', category: 'E-Commerce' },
  { keyword: 'cargo consolidation warehouse Montreal LCL FCL', category: 'Warehouse Operations' },
  { keyword: 'supply chain optimization Canada post-pandemic', category: 'Industry Trends' },
  { keyword: 'cross-docking warehouse benefits for retailers', category: 'Warehouse Operations' },
  { keyword: 'import export warehousing Montreal customs broker', category: 'Trade & Commerce' },
  { keyword: '3PL warehouse services Quebec comparison guide', category: 'Industry Trends' },
  { keyword: 'warehouse automation trends robotics Canada', category: 'Technology' },
  { keyword: 'last mile delivery warehouse Montreal e-commerce', category: 'E-Commerce' },
  { keyword: 'freight forwarding Montreal port container handling', category: 'Trade & Commerce' },
  { keyword: 'inventory management best practices warehouse', category: 'Warehouse Operations' },
  { keyword: 'Canada customs clearance process step by step', category: 'Customs & Regulations' },
  { keyword: 'sustainable warehousing green logistics Montreal', category: 'Industry Trends' },
  { keyword: 'bonded warehouse vs free trade zone Canada', category: 'Customs & Regulations' },
  { keyword: 'warehouse safety regulations Quebec CNESST', category: 'Warehouse Operations' },
  { keyword: 'peak season warehouse capacity planning', category: 'Warehouse Operations' },
  { keyword: 'Montreal port congestion impact warehousing', category: 'Trade & Commerce' },
  { keyword: 'CUSMA USMCA impact Canadian warehousing', category: 'Trade & Commerce' },
  { keyword: 'bonded cargo handling warehouse best practices Canada', category: 'Warehouse Operations' },
  { keyword: 'dangerous goods warehousing TDG compliance', category: 'Specialized Services' },
  { keyword: 'warehouse management system WMS selection guide', category: 'Technology' },
  { keyword: 'reverse logistics returns warehouse Canada', category: 'E-Commerce' },
  { keyword: 'carbon neutral warehousing ESG reporting', category: 'Industry Trends' },
];

// Track used topics to avoid repeats within a session
const usedTopicIndexes = new Set<number>();

export function getRandomTopic(): { keyword: string; category: string } {
  // Reset when all topics exhausted
  if (usedTopicIndexes.size >= INDUSTRY_TOPICS.length) {
    usedTopicIndexes.clear();
  }
  let idx: number;
  do {
    idx = Math.floor(Math.random() * INDUSTRY_TOPICS.length);
  } while (usedTopicIndexes.has(idx));
  usedTopicIndexes.add(idx);
  return INDUSTRY_TOPICS[idx];
}

function buildInternalLinks(): InternalLink[] {
  const shuffled = [...MONEY_PAGES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);
  return selected.map((page) => ({
    url: page.url,
    anchorText: getRandomAnchor(page),
    type: 'money-page' as const,
  }));
}

function buildInternalLinksHtml(links: InternalLink[]): string {
  return links.map((link) => `<a href="${link.url}">${link.anchorText}</a>`).join(' and ');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== Rewrite Templates (from scraped news) ====================

const REWRITE_TITLE_FORMATS = [
  (title: string) => `${title}: Implications for Canadian Warehousing`,
  (title: string) => `How ${title} Affects Montreal's Logistics Sector`,
  (title: string) => `${title} — What Canadian Importers Need to Know`,
  (title: string) => `${title}: Key Insights for Warehouse Operators`,
  (title: string) => `Breaking Down ${title} for the Canadian Market`,
];

const REWRITE_INTROS = [
  (desc: string, source: string) =>
    `<p>A recent report from ${source} highlights a significant development in the logistics industry. ${desc}</p>
<p>This news carries important implications for warehousing and supply chain operations across Canada, with particular relevance to the Montreal logistics corridor.</p>`,
  (desc: string, source: string) =>
    `<p>The logistics landscape is shifting once again. According to ${source}, ${desc.charAt(0).toLowerCase() + desc.slice(1)}</p>
<p>For businesses that depend on efficient warehousing and distribution in eastern Canada, understanding these changes is critical for staying competitive.</p>`,
  (desc: string, source: string) =>
    `<p>${desc}</p>
<p>This development, reported by ${source}, underscores the ongoing evolution of warehousing and freight management in North America. Canadian businesses, especially those operating through Montreal's extensive port and logistics infrastructure, should take note.</p>`,
];

const REWRITE_ANALYSIS_SECTIONS = [
  (linksHtml: string) => {
    const mention = pick(BRAND_MENTIONS)();
    return `<h2>Impact on the Canadian Warehousing Sector</h2>
<p>Canada's warehousing industry has experienced steady growth over the past several years, driven by e-commerce expansion and shifting trade routes. Montreal, as the second-largest port in Canada, handles over $100 billion in goods annually, making it a critical node in North American supply chains.</p>
<p>Businesses that rely on ${linksHtml} need to evaluate how these industry shifts may affect their storage capacity, lead times, and overall operational costs. Proactive planning can help mitigate potential disruptions.</p>
<h3>Supply Chain Resilience</h3>
<p>Supply chain resilience has become a top boardroom priority since 2020. This latest development reinforces the importance of diversifying logistics providers, maintaining buffer inventory, and ensuring your warehouse partner can scale during demand spikes.</p>
<p>${mention}</p>`;
  },
  (linksHtml: string) => {
    const mention = pick(BRAND_MENTIONS)();
    return `<h2>What This Means for Montreal Logistics Operations</h2>
<p>Montreal's position as a gateway between North America and global markets makes it particularly sensitive to shifts in the logistics industry. The city's network of sufferance warehouses, bonded facilities, and third-party logistics providers forms a complex ecosystem that must adapt continuously.</p>
<p>${mention}</p>
<p>Companies leveraging ${linksHtml} should assess their current logistics strategies in light of this development. Key considerations include customs processing timelines, storage cost trajectories, and transportation route optimization.</p>
<h3>Regulatory Considerations</h3>
<p>Canadian customs and warehousing regulations continue to evolve. The Canada Border Services Agency (CBSA) has been modernizing its processes, and businesses should ensure their warehouse partners are compliant with the latest requirements, including CARM (CBSA Assessment and Revenue Management).</p>`;
  },
  (linksHtml: string) => {
    const mention = pick(BRAND_MENTIONS)();
    return `<h2>Strategic Implications for Importers and Distributors</h2>
<p>For companies importing goods through Canadian ports, this development creates both challenges and opportunities. Those with established ${linksHtml} relationships are better positioned to navigate changes, while newcomers may face steeper learning curves.</p>
<h3>Cost and Capacity Analysis</h3>
<p>Warehouse capacity in the Greater Montreal Area has tightened over the past two years, with vacancy rates dropping below 2% in prime logistics zones. Industry shifts like the one reported could further strain available capacity, making it essential to secure reliable warehouse partnerships well in advance of peak seasons.</p>
<p>${mention}</p>`;
  },
];

const REWRITE_TAKEAWAYS = [
  [
    'Review your current warehousing contracts and capacity allocations',
    'Evaluate the resilience of your supply chain against potential disruptions',
    'Consider diversifying your logistics network across multiple facilities',
    'Stay informed about evolving customs and trade regulations',
    'Explore technology solutions that improve warehouse visibility and efficiency',
  ],
  [
    'Monitor how this development affects freight rates on your primary routes',
    'Assess whether your current warehouse location optimizes for changing trade patterns',
    'Ensure your customs broker and warehouse provider are aligned on compliance',
    'Investigate whether consolidation or deconsolidation services can reduce costs',
    'Plan inventory buffers to handle potential logistics disruptions',
  ],
  [
    'Audit your end-to-end supply chain for single points of failure',
    'Negotiate flexible warehouse agreements that allow seasonal scaling',
    'Invest in warehouse management technology for real-time inventory visibility',
    'Strengthen relationships with Canadian customs authorities and brokers',
    'Benchmark your logistics costs against industry averages for the Montreal corridor',
  ],
];

const REWRITE_OUTLOOKS = [
  () => `<h2>Looking Ahead</h2>
<p>The warehousing and logistics sector in Canada is poised for continued transformation through 2026 and beyond. E-commerce growth, shifting consumer expectations, sustainability mandates, and evolving international trade agreements are all reshaping how goods move through the supply chain.</p>
<p>Businesses that invest in strong warehouse partnerships, embrace technology, and maintain flexible logistics strategies will be best positioned to thrive in this changing landscape. Providers like ${brandName()} in Montreal combine strategic location with deep expertise in customs compliance and warehousing operations, making them a valuable partner for businesses navigating these changes.</p>`,
  () => `<h2>What to Watch Next</h2>
<p>Industry analysts expect further consolidation and investment in the Canadian logistics sector throughout 2026. Key trends to watch include the expansion of automated warehouse facilities, increased adoption of AI-driven inventory management, and the growing importance of near-shoring strategies that favor Canadian distribution centers.</p>
<p>For businesses operating in or through Montreal, working with established logistics providers like ${brandName()} — who understand both the operational demands and regulatory requirements of modern supply chains — will be essential for navigating whatever comes next.</p>`,
  () => `<h2>The Road Forward</h2>
<p>As the global logistics landscape continues to evolve at pace, Canadian businesses must balance cost efficiency with supply chain agility. The developments highlighted in this article are part of a broader pattern of change that is reshaping warehousing, transportation, and distribution across the country.</p>
<p>Companies that take a proactive approach — partnering with experienced operators like ${brandName()}, investing in the right technology, and maintaining flexible capacity — will find themselves better equipped to handle disruptions and capitalize on new opportunities as they arise.</p>`,
];

export async function generateArticleFromNews(news: ScrapedNews): Promise<GeneratedArticle> {
  const internalLinks = buildInternalLinks();
  const linksHtml = buildInternalLinksHtml(internalLinks);

  const titleFn = pick(REWRITE_TITLE_FORMATS);
  const title = titleFn(news.title);
  const targetKeyword = news.title.toLowerCase().split(' ').slice(0, 5).join(' ');

  const intro = pick(REWRITE_INTROS)(news.description, news.source);
  const analysis = pick(REWRITE_ANALYSIS_SECTIONS)(linksHtml);
  const takeaways = pick(REWRITE_TAKEAWAYS);
  const outlook = pick(REWRITE_OUTLOOKS)();

  const content = `
${intro}

${analysis}

<h2>Key Takeaways for Your Business</h2>
<ol>
${takeaways.map((t) => `<li><strong>${t.split(' ').slice(0, 3).join(' ')}</strong> — ${t}</li>`).join('\n')}
</ol>

${outlook}
`.trim();

  // Derive tags from news content
  const contentLower = `${news.title} ${news.description}`.toLowerCase();
  const dynamicTags = ['warehousing', 'logistics', 'Canada'];
  if (contentLower.includes('freight') || contentLower.includes('shipping')) dynamicTags.push('freight');
  if (contentLower.includes('e-commerce') || contentLower.includes('ecommerce')) dynamicTags.push('e-commerce');
  if (contentLower.includes('customs') || contentLower.includes('import')) dynamicTags.push('customs');
  if (contentLower.includes('port') || contentLower.includes('container')) dynamicTags.push('port');
  if (contentLower.includes('technology') || contentLower.includes('automation')) dynamicTags.push('technology');
  dynamicTags.push('Montreal');

  return {
    title,
    metaDescription: `${news.description.slice(0, 100)}. Analysis of impacts on Canadian warehousing and logistics operations.`,
    excerpt: news.description.slice(0, 200),
    content,
    featuredImage: await pickFeaturedImage(title, dynamicTags, 'Industry News'),
    featuredImageAlt: `${title} | FENGYE LOGISTICS`,
    category: 'Industry News',
    tags: [...new Set(dynamicTags)],
    targetKeyword,
    secondaryKeywords: ['warehousing Montreal', 'logistics Canada', 'supply chain management'],
    internalLinks,
    source: 'hybrid',
    sourceUrl: news.link,
  };
}

// ==================== Original Article Templates ====================

const ORIGINAL_TITLE_FORMATS = [
  (kw: string) => `${kw}: A Complete Guide for 2026`,
  (kw: string) => `Everything You Need to Know About ${kw}`,
  (kw: string) => `${kw} — Expert Guide for Canadian Businesses`,
  (kw: string) => `The Ultimate Guide to ${kw} in Canada`,
  (kw: string) => `${kw}: Best Practices and Strategies`,
];

const ORIGINAL_STRUCTURES = [
  // Structure A: Problem → Solution → Steps → Montreal Advantage → Conclusion
  (kw: string, kwTitle: string, linksHtml: string) => `
<h2>The Growing Importance of ${kwTitle}</h2>
<p>In an increasingly complex logistics landscape, ${kw} has become a critical factor for businesses looking to maintain competitive advantage. Whether you're a small importer or a large-scale distributor, understanding the nuances of ${kw} can directly impact your bottom line.</p>
<p>Canadian businesses, in particular, face unique challenges related to cross-border trade, bilingual regulatory requirements, and seasonal demand fluctuations that make expertise in this area especially valuable.</p>

<h2>Common Challenges and How to Overcome Them</h2>
<p>Businesses frequently encounter several obstacles when dealing with ${kw}:</p>
<ul>
<li><strong>Regulatory complexity</strong> — Canada's customs and warehousing regulations can be challenging to navigate, particularly for businesses new to cross-border trade</li>
<li><strong>Capacity constraints</strong> — Finding reliable warehouse space during peak seasons requires advance planning and strong provider relationships</li>
<li><strong>Cost management</strong> — Balancing service quality with logistics costs demands careful analysis and strategic partnerships</li>
<li><strong>Technology gaps</strong> — Many businesses still rely on manual processes that limit visibility and efficiency</li>
</ul>
<p>Working with experienced ${linksHtml} providers can help address these challenges through specialized knowledge and proven operational frameworks.</p>

<h2>Step-by-Step Implementation Guide</h2>
<ol>
<li><strong>Assess your current state</strong> — Document your existing warehousing and logistics processes, identifying bottlenecks and inefficiencies</li>
<li><strong>Define your requirements</strong> — Outline your specific needs for storage capacity, handling requirements, regulatory compliance, and technology integration</li>
<li><strong>Evaluate potential partners</strong> — Research warehouse providers with demonstrated expertise in ${kw}, checking references and facility certifications</li>
<li><strong>Pilot and optimize</strong> — Start with a smaller scope to validate the partnership before scaling up operations</li>
<li><strong>Monitor and adjust</strong> — Establish KPIs and regular review cycles to ensure continuous improvement</li>
</ol>

<h2>Why Montreal Is Ideal for ${kwTitle}</h2>
<p>Montreal offers several strategic advantages for businesses focused on ${kw}:</p>
<ul>
<li>Direct access to the Port of Montreal, one of the largest container ports in eastern North America</li>
<li>Extensive rail network connections via CN and CP to major markets across Canada and the US</li>
<li>Competitive commercial real estate costs compared to Toronto and Vancouver</li>
<li>Bilingual workforce skilled in international trade and customs procedures</li>
<li>Growing ecosystem of technology companies supporting logistics innovation</li>
</ul>

<h2>Key Considerations for 2026</h2>
<p>Looking ahead, several trends will shape ${kw} in the Canadian context. The continued rollout of CBSA's CARM system is streamlining customs processes but requires businesses to adapt their compliance workflows. Meanwhile, sustainability reporting requirements are pushing warehouse operators to invest in energy-efficient facilities and green transportation options.</p>
<p>${pick(BRAND_MENTIONS)()}</p>
<p>Businesses that stay ahead of these trends while maintaining strong operational fundamentals — and partnering with experienced providers like ${brandName()} — will be best positioned for success.</p>
`,

  // Structure B: What → Why → How → FAQ-style → CTA
  (kw: string, kwTitle: string, linksHtml: string) => `
<h2>What Is ${kwTitle}?</h2>
<p>${kwTitle} encompasses the strategies, processes, and infrastructure involved in ${kw} within the Canadian logistics ecosystem. For businesses operating in or through Montreal, this is particularly relevant given the city's role as a major trade gateway.</p>
<p>At its core, effective ${kw} requires a balance of regulatory compliance, operational efficiency, and strategic partnership management.</p>

<h2>Why ${kwTitle} Matters More Than Ever</h2>
<p>Several converging factors have elevated the importance of ${kw} for Canadian businesses:</p>
<ul>
<li><strong>E-commerce acceleration</strong> — Online retail continues to grow, demanding faster and more flexible warehousing solutions</li>
<li><strong>Trade diversification</strong> — CUSMA, CPTPP, and CETA have expanded Canada's trade relationships, increasing the complexity of import/export logistics</li>
<li><strong>Consumer expectations</strong> — Next-day and same-day delivery expectations are pushing warehouses closer to urban centers</li>
<li><strong>Regulatory evolution</strong> — CBSA modernization initiatives are changing how goods are processed at the border</li>
</ul>

<h2>How to Get Started</h2>
<h3>Choosing the Right Warehouse Partner</h3>
<p>Selecting the right ${linksHtml} provider is one of the most impactful decisions you can make. Look for partners who offer transparent pricing, modern WMS technology, scalable capacity, and deep knowledge of Canadian trade regulations.</p>

<h3>Technology Integration</h3>
<p>Modern warehouse management systems (WMS) provide real-time visibility into inventory levels, order status, and shipment tracking. When evaluating ${kw} options, prioritize providers who can integrate with your existing ERP and e-commerce platforms.</p>

<h3>Compliance and Documentation</h3>
<p>Canadian warehousing operations, especially those involving cross-border trade, require meticulous attention to documentation. Ensure your warehouse partner understands CBSA requirements, HSN classification, and duty deferral programs that may be available through sufferance or bonded warehouse arrangements.</p>

<h2>Frequently Asked Questions</h2>
<h3>How much does warehousing cost in Montreal?</h3>
<p>Warehousing costs in Montreal vary based on facility type, location, and services required. As of 2026, typical rates range from $7-15 per square foot annually for standard dry storage, with specialized services (bonded storage, hazmat, consolidation) commanding premium rates.</p>

<h3>What certifications should I look for in a warehouse provider?</h3>
<p>Key certifications include CTPAT (Customs-Trade Partnership Against Terrorism), PIP (Partners in Protection), CBSA sufferance warehouse authorization, and appropriate provincial health and safety compliance.</p>

<h3>How long does customs clearance take in Montreal?</h3>
<p>Standard customs clearance through the Port of Montreal typically takes 24-72 hours, though this can vary based on documentation completeness, commodity type, and current border processing volumes.</p>

<h2>Take the Next Step</h2>
<p>Whether you're exploring ${kw} for the first time or looking to optimize existing operations, the Montreal logistics ecosystem offers robust options for businesses of all sizes. ${pick(BRAND_MENTIONS)()}</p>
<p>The key is finding the right partner who combines local expertise with the technology and capacity to support your growth. ${brandName()} has been helping businesses with exactly these needs — from sufferance warehousing to full-service distribution across Eastern Canada.</p>
`,

  // Structure C: Trends → Data → Comparison → Best Practices → Outlook
  (kw: string, kwTitle: string, linksHtml: string) => `
<h2>Current State of ${kwTitle} in Canada</h2>
<p>The Canadian warehousing and logistics sector has evolved significantly in recent years. ${kwTitle} has emerged as a critical focus area for businesses navigating increasingly complex supply chains. Industry data shows that Canadian warehouse demand has grown by approximately 15% since 2022, with the Montreal region accounting for a significant share of that growth.</p>

<h2>Key Trends Shaping ${kwTitle}</h2>
<h3>1. Automation and Technology</h3>
<p>Warehouse automation investments in Canada are accelerating, with robotic picking systems, automated guided vehicles (AGVs), and AI-powered demand forecasting becoming mainstream. For businesses evaluating ${kw}, technology capabilities should be a primary selection criterion.</p>

<h3>2. Sustainability and ESG</h3>
<p>Environmental sustainability is no longer optional in the logistics sector. Leading warehouse operators are investing in solar panels, electric vehicle fleets, LED lighting, and carbon-neutral operations. These initiatives align with growing ESG reporting requirements and can also reduce operational costs.</p>

<h3>3. Near-Shoring and Reshoring</h3>
<p>Global supply chain disruptions have prompted many businesses to bring operations closer to their end markets. Montreal's position as a near-shore hub for US-bound goods makes it an increasingly attractive location for ${kw}.</p>

<h2>Comparing Warehousing Options</h2>
<p>When evaluating ${kw}, businesses typically choose between several models:</p>
<ul>
<li><strong>Public warehousing</strong> — Shared facilities offering flexibility and lower commitment, ideal for businesses with variable volume</li>
<li><strong>Contract warehousing</strong> — Dedicated space with customized services, suitable for businesses with predictable volume and specific requirements</li>
<li><strong>Bonded/sufferance warehousing</strong> — Specialized facilities for imported goods awaiting customs clearance, essential for international trade operations</li>
</ul>
<p>Each model has distinct advantages depending on your business needs. Partnering with ${linksHtml} can help you identify the optimal approach for your specific situation.</p>

<h2>Best Practices for Success</h2>
<ol>
<li><strong>Start with data</strong> — Analyze your historical shipping volumes, seasonal patterns, and growth projections before committing to warehouse space</li>
<li><strong>Think omnichannel</strong> — Ensure your warehouse strategy supports both B2B and B2C fulfillment if applicable</li>
<li><strong>Plan for peak</strong> — Secure flexible capacity arrangements to handle holiday seasons and promotional spikes</li>
<li><strong>Invest in relationships</strong> — Strong warehouse partnerships built on transparency and communication consistently outperform transactional arrangements</li>
<li><strong>Stay compliant</strong> — Regulatory non-compliance can result in costly delays, penalties, and reputational damage</li>
</ol>

<h2>Market Outlook for 2026-2027</h2>
<p>Industry forecasts suggest continued strong demand for warehousing services in Canada, particularly in the Montreal and Greater Toronto Area markets. Vacancy rates are expected to remain tight, making early planning and partner selection increasingly important.</p>
<p>${pick(BRAND_MENTIONS)()}</p>
<p>Businesses that invest in understanding ${kw} now — and establish relationships with trusted providers like ${brandName()} — will be better positioned to navigate market volatility and capitalize on growth opportunities in the years ahead.</p>
`,
];

export async function generateOriginalArticle(keyword: string, category: string): Promise<GeneratedArticle> {
  const internalLinks = buildInternalLinks();
  const linksHtml = buildInternalLinksHtml(internalLinks);

  const kwTitle = keyword
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const titleFn = pick(ORIGINAL_TITLE_FORMATS);
  const title = titleFn(kwTitle);
  const structureFn = pick(ORIGINAL_STRUCTURES);
  const content = structureFn(keyword, kwTitle, linksHtml).trim();

  const dynamicTags = ['warehousing', 'logistics', 'Canada'];
  if (keyword.includes('customs') || keyword.includes('bonded')) dynamicTags.push('customs');
  if (keyword.includes('e-commerce') || keyword.includes('fulfillment')) dynamicTags.push('e-commerce');
  if (keyword.includes('Montreal') || keyword.includes('Quebec')) dynamicTags.push('Montreal');
  if (keyword.includes('automation') || keyword.includes('technology') || keyword.includes('WMS')) dynamicTags.push('technology');
  dynamicTags.push(keyword.split(' ')[0]);

  return {
    title,
    metaDescription: `Expert guide to ${keyword}. Learn best practices, strategies, and how Montreal warehousing solutions can optimize your operations.`,
    excerpt: `A comprehensive guide to ${keyword} for businesses looking to optimize their warehousing and logistics operations in Canada.`,
    content,
    featuredImage: await pickFeaturedImage(title, dynamicTags, category),
    featuredImageAlt: `${title} | FENGYE LOGISTICS`,
    category,
    tags: [...new Set(dynamicTags)].slice(0, 6),
    targetKeyword: keyword,
    secondaryKeywords: ['warehousing Montreal', 'logistics Canada', 'supply chain management'],
    internalLinks,
    source: 'ai-generated',
    sourceUrl: null,
  };
}
