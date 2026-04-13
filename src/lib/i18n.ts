export type Locale = 'en' | 'fr' | 'zh';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'fr', 'zh'];

const translations = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      locations: 'Locations',
      news: 'News',
      about: 'About',
      tracking: 'Tracking',
      contact: 'Contact US',
    },
    hero: {
      title: 'Warehousing and Distribution',
      subtitle: 'Fast cross-dock handling, bonded cargo support, and local distribution for Montreal freight lanes.',
    },
    services: {
      pageTitle: 'Our Warehouse & Logistics Services',
      pageDescription: 'FENGYE LOGISTICS provides a comprehensive range of warehousing and logistics services from our CBSA-authorized facility in Montreal. From in-bond cargo handling and customs examination support to local delivery and specialized packaging, we deliver reliable solutions that keep your supply chain moving.',
      sectionTitle: 'Sufferance Warehouse Services',
      viewDetails: 'View Details',
      learnMore: 'Learn more',
      viewLocation: 'View location',
      whyChoose: 'Why Choose FENGYE LOGISTICS',
      exploreOther: 'Explore Our Other Services',
      exploreLocations: 'Explore Our Locations',
      ctaTitle: 'Need a Custom Logistics Solution?',
      ctaText: 'Every business has unique supply chain requirements. Contact FENGYE LOGISTICS to discuss how our services can be tailored to your specific needs. Our experienced operations team is ready to help.',
      ctaButton: 'Contact Us',
      ctaPhone: 'Call 438-488-5382',
      readyTitle: 'Ready to Get Started?',
      faqTitle: 'Frequently Asked Questions',
    },
    locations: {
      pageTitle: 'Our Service Locations',
      pageDescription: 'FENGYE LOGISTICS provides warehousing, customs brokerage, freight forwarding, and supply chain solutions from our CBSA-authorized facility in Montreal, serving businesses across Quebec and all of Canada.',
      sectionTitle: 'Warehousing & Logistics Across Canada',
      sectionText: 'From our strategically located Montreal warehouse, FENGYE LOGISTICS serves clients throughout Quebec and across Canada. Our CBSA-authorized sufferance warehouse, combined with comprehensive logistics capabilities, makes us the ideal partner for businesses engaged in domestic distribution and international trade. Explore our service areas below to learn how we can support your specific logistics needs.',
      ctaTitle: 'Need Logistics Support?',
      ctaSubtitle: 'Contact FENGYE LOGISTICS today for a customized warehousing and logistics quote.',
      requestQuote: 'Request a Quote',
      phone: 'Phone',
      email: 'Email',
      location: 'Location',
      faqTitle: 'Frequently Asked Questions',
      ourServices: 'Our Services',
      exploreMore: 'Explore More',
      otherAreas: 'Other Service Areas',
      getQuoteTitle: 'Get a Free Quote Today',
      getQuoteSubtitle: 'Contact FENGYE LOGISTICS for a customized logistics solution tailored to your business needs.',
    },
    news: {
      title: 'Industry News',
      description: 'The latest updates on warehousing, logistics, customs, and supply chain management in Montreal and across Canada.',
      viewAll: 'View all news',
      latestTitle: 'Latest Industry News',
      minRead: 'min read',
    },
    contact: {
      title: 'Get Our Service',
      subtitle: 'Fill out the form below, and our Client Services team will contact you to kickstart the process.',
      address: 'Address',
      businessHours: 'Business hours',
      businessHoursValue: 'Mon-Fri 9:00AM-4:30PM',
      phone: 'Phone',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      serviceQuestion: 'Which warehouse and distribution service are you looking for?',
      submit: 'Submit',
      submitting: 'Submitting...',
      successMessage: 'Thanks. Our Client Services team will contact you shortly.',
      formNote: 'Server-side origin checks, rate limiting, and SMTP delivery are active. Add mail env vars in deployment to enable live delivery.',
    },
    breadcrumb: {
      home: 'Home',
      services: 'Services',
      locations: 'Locations',
      news: 'News',
    },
    common: {
      readMore: 'Read More',
      backToHome: 'Back to Home',
      pageNotFound: 'Page Not Found',
      pageNotFoundDesc: 'Sorry, the page you are looking for does not exist or has been moved. Use the links below to find what you need.',
      popularPages: 'Popular Pages',
    },
    footer: {
      brand: 'FENGYE LOGISTICS',
      copyright: 'Copyright 2024',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      locations: 'Emplacements',
      news: 'Actualit\u00e9s',
      about: '\u00c0 propos',
      tracking: 'Suivi',
      contact: 'Contactez-nous',
    },
    hero: {
      title: 'Entreposage et Distribution',
      subtitle: 'Manutention rapide en transit, prise en charge de fret sous caution et distribution locale pour les voies de fret de Montr\u00e9al.',
    },
    services: {
      pageTitle: 'Nos Services d\'Entreposage et Logistique',
      pageDescription: 'FENGYE LOGISTICS offre une gamme compl\u00e8te de services d\'entreposage et de logistique depuis notre installation autoris\u00e9e par l\'ASFC \u00e0 Montr\u00e9al. De la manutention de fret sous caution au soutien \u00e0 l\'examen douanier, en passant par la livraison locale et l\'emballage sp\u00e9cialis\u00e9, nous offrons des solutions fiables qui maintiennent votre cha\u00eene d\'approvisionnement en mouvement.',
      sectionTitle: 'Services d\'entrep\u00f4t sous douane',
      viewDetails: 'Voir les d\u00e9tails',
      learnMore: 'En savoir plus',
      viewLocation: 'Voir l\'emplacement',
      whyChoose: 'Pourquoi choisir FENGYE LOGISTICS',
      exploreOther: 'D\u00e9couvrez nos autres services',
      exploreLocations: 'D\u00e9couvrez nos emplacements',
      ctaTitle: 'Besoin d\'une solution logistique personnalis\u00e9e\u00a0?',
      ctaText: 'Chaque entreprise a des besoins uniques en mati\u00e8re de cha\u00eene d\'approvisionnement. Contactez FENGYE LOGISTICS pour discuter de la fa\u00e7on dont nos services peuvent \u00eatre adapt\u00e9s \u00e0 vos besoins sp\u00e9cifiques. Notre \u00e9quipe d\'exploitation exp\u00e9riment\u00e9e est pr\u00eate \u00e0 vous aider.',
      ctaButton: 'Contactez-nous',
      ctaPhone: 'Appelez le 438-488-5382',
      readyTitle: 'Pr\u00eat \u00e0 commencer\u00a0?',
      faqTitle: 'Foire aux questions',
    },
    locations: {
      pageTitle: 'Nos emplacements de service',
      pageDescription: 'FENGYE LOGISTICS offre des services d\'entreposage, de courtage en douane, d\'exp\u00e9dition de fret et de solutions de cha\u00eene d\'approvisionnement depuis notre installation autoris\u00e9e par l\'ASFC \u00e0 Montr\u00e9al, desservant les entreprises du Qu\u00e9bec et de tout le Canada.',
      sectionTitle: 'Entreposage et logistique \u00e0 travers le Canada',
      sectionText: 'Depuis notre entrep\u00f4t strat\u00e9giquement situ\u00e9 \u00e0 Montr\u00e9al, FENGYE LOGISTICS dessert des clients dans tout le Qu\u00e9bec et \u00e0 travers le Canada. Notre entrep\u00f4t sous douane autoris\u00e9 par l\'ASFC, combin\u00e9 \u00e0 des capacit\u00e9s logistiques compl\u00e8tes, fait de nous le partenaire id\u00e9al pour les entreprises engag\u00e9es dans la distribution int\u00e9rieure et le commerce international.',
      ctaTitle: 'Besoin de soutien logistique\u00a0?',
      ctaSubtitle: 'Contactez FENGYE LOGISTICS d\u00e8s aujourd\'hui pour un devis d\'entreposage et de logistique personnalis\u00e9.',
      requestQuote: 'Demander un devis',
      phone: 'T\u00e9l\u00e9phone',
      email: 'Courriel',
      location: 'Emplacement',
      faqTitle: 'Foire aux questions',
      ourServices: 'Nos services',
      exploreMore: 'En savoir plus',
      otherAreas: 'Autres zones de service',
      getQuoteTitle: 'Obtenez un devis gratuit aujourd\'hui',
      getQuoteSubtitle: 'Contactez FENGYE LOGISTICS pour une solution logistique personnalis\u00e9e adapt\u00e9e aux besoins de votre entreprise.',
    },
    news: {
      title: 'Actualit\u00e9s de l\'industrie',
      description: 'Les derni\u00e8res mises \u00e0 jour sur l\'entreposage, la logistique, les douanes et la gestion de la cha\u00eene d\'approvisionnement \u00e0 Montr\u00e9al et partout au Canada.',
      viewAll: 'Voir toutes les actualit\u00e9s',
      latestTitle: 'Derni\u00e8res actualit\u00e9s de l\'industrie',
      minRead: 'min de lecture',
    },
    contact: {
      title: 'Obtenez notre service',
      subtitle: 'Remplissez le formulaire ci-dessous et notre \u00e9quipe de service \u00e0 la client\u00e8le vous contactera pour d\u00e9marrer le processus.',
      address: 'Adresse',
      businessHours: 'Heures d\'ouverture',
      businessHoursValue: 'Lun-Ven 9h00-16h30',
      phone: 'T\u00e9l\u00e9phone',
      email: 'Courriel',
      firstName: 'Pr\u00e9nom',
      lastName: 'Nom de famille',
      emailAddress: 'Adresse courriel',
      phoneNumber: 'Num\u00e9ro de t\u00e9l\u00e9phone',
      serviceQuestion: 'Quel service d\'entreposage et de distribution recherchez-vous\u00a0?',
      submit: 'Soumettre',
      submitting: 'Envoi en cours...',
      successMessage: 'Merci. Notre \u00e9quipe de service \u00e0 la client\u00e8le vous contactera sous peu.',
      formNote: 'Les v\u00e9rifications d\'origine c\u00f4t\u00e9 serveur, la limitation de d\u00e9bit et la livraison SMTP sont actives.',
    },
    breadcrumb: {
      home: 'Accueil',
      services: 'Services',
      locations: 'Emplacements',
      news: 'Actualit\u00e9s',
    },
    common: {
      readMore: 'Lire la suite',
      backToHome: 'Retour \u00e0 l\'accueil',
      pageNotFound: 'Page non trouv\u00e9e',
      pageNotFoundDesc: 'D\u00e9sol\u00e9, la page que vous recherchez n\'existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e. Utilisez les liens ci-dessous pour trouver ce dont vous avez besoin.',
      popularPages: 'Pages populaires',
    },
    footer: {
      brand: 'FENGYE LOGISTICS',
      copyright: 'Droits d\'auteur 2024',
    },
  },
  zh: {
    nav: {
      home: '首页',
      services: '服务',
      locations: '位置',
      news: '新闻',
      about: '关于我们',
      tracking: '货物追踪',
      contact: '联系我们',
    },
    hero: {
      title: '仓储与配送',
      subtitle: '快速转运处理、保税货物支持，以及蒙特利尔货运通道的本地配送服务。',
    },
    services: {
      pageTitle: '我们的仓储与物流服务',
      pageDescription: 'FENGYE LOGISTICS 从我们位于蒙特利尔的CBSA授权设施提供全面的仓储和物流服务。从保税货物处理和海关检查支持到本地配送和专业包装，我们提供可靠的解决方案，保持您的供应链顺畅运转。',
      sectionTitle: '海关监管仓服务',
      viewDetails: '查看详情',
      learnMore: '了解更多',
      viewLocation: '查看位置',
      whyChoose: '为什么选择 FENGYE LOGISTICS',
      exploreOther: '探索我们的其他服务',
      exploreLocations: '探索我们的位置',
      ctaTitle: '需要定制化物流方案？',
      ctaText: '每个企业都有独特的供应链需求。联系 FENGYE LOGISTICS 讨论我们如何根据您的具体需求定制服务。我们经验丰富的运营团队随时准备为您提供帮助。',
      ctaButton: '联系我们',
      ctaPhone: '致电 438-488-5382',
      readyTitle: '准备好开始了吗？',
      faqTitle: '常见问题',
    },
    locations: {
      pageTitle: '我们的服务地点',
      pageDescription: 'FENGYE LOGISTICS 从我们位于蒙特利尔的CBSA授权设施提供仓储、报关、货运代理和供应链解决方案，服务魁北克省和加拿大全境的企业。',
      sectionTitle: '加拿大全境仓储与物流',
      sectionText: '从我们战略性地位于蒙特利尔的仓库出发，FENGYE LOGISTICS 为魁北克省和加拿大全境的客户提供服务。我们的CBSA授权海关监管仓，结合全面的物流能力，使我们成为从事国内配送和国际贸易企业的理想合作伙伴。',
      ctaTitle: '需要物流支持？',
      ctaSubtitle: '立即联系 FENGYE LOGISTICS 获取定制化仓储和物流报价。',
      requestQuote: '获取报价',
      phone: '电话',
      email: '邮箱',
      location: '地址',
      faqTitle: '常见问题',
      ourServices: '我们的服务',
      exploreMore: '了解更多',
      otherAreas: '其他服务区域',
      getQuoteTitle: '立即获取免费报价',
      getQuoteSubtitle: '联系 FENGYE LOGISTICS 获取根据您业务需求定制的物流解决方案。',
    },
    news: {
      title: '行业新闻',
      description: '蒙特利尔和加拿大全境仓储、物流、海关和供应链管理的最新动态。',
      viewAll: '查看所有新闻',
      latestTitle: '最新行业新闻',
      minRead: '分钟阅读',
    },
    contact: {
      title: '获取我们的服务',
      subtitle: '请填写以下表格，我们的客户服务团队将与您联系以启动流程。',
      address: '地址',
      businessHours: '营业时间',
      businessHoursValue: '周一至周五 9:00-16:30',
      phone: '电话',
      email: '邮箱',
      firstName: '名',
      lastName: '姓',
      emailAddress: '邮箱地址',
      phoneNumber: '电话号码',
      serviceQuestion: '您需要哪种仓储和配送服务？',
      submit: '提交',
      submitting: '提交中...',
      successMessage: '感谢您的咨询。我们的客户服务团队将尽快与您联系。',
      formNote: '服务器端来源验证、速率限制和SMTP投递已启用。',
    },
    breadcrumb: {
      home: '首页',
      services: '服务',
      locations: '位置',
      news: '新闻',
    },
    common: {
      readMore: '阅读更多',
      backToHome: '返回首页',
      pageNotFound: '页面未找到',
      pageNotFoundDesc: '抱歉，您查找的页面不存在或已被移动。请使用以下链接查找您需要的内容。',
      popularPages: '热门页面',
    },
    footer: {
      brand: 'FENGYE LOGISTICS',
      copyright: '版权所有 2024',
    },
  },
};

export type Translations = typeof translations.en;

export function getTranslations(locale: Locale) {
  return (translations[locale] || translations.en) as typeof translations.en;
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/fr')) return 'fr';
  if (pathname.startsWith('/zh')) return 'zh';
  return 'en';
}

export function getLocalePath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  const currentLocale = getLocaleFromPath(pathname);
  if (currentLocale === targetLocale) return pathname;

  // Strip current locale prefix
  let base = pathname;
  if (currentLocale === 'fr') {
    base = pathname === '/fr' ? '/' : pathname.replace(/^\/fr/, '');
  } else if (currentLocale === 'zh') {
    base = pathname === '/zh' ? '/' : pathname.replace(/^\/zh/, '');
  }

  if (targetLocale === 'en') return base;
  return base === '/' ? `/${targetLocale}` : `/${targetLocale}${base}`;
}
