export type MoneyPage = {
  url: string;
  title: string;
  anchorVariants: string[];
};

// Brand name variations for natural embedding
// Only use FENGYE LOGISTICS / FENGYE Warehouse
export const BRAND_NAMES = [
  'FENGYE LOGISTICS',
  'FENGYE Warehouse',
  'Fengye Logistics',
  'Fengye Warehouse',
];

export const MONEY_PAGES: MoneyPage[] = [
  {
    url: 'https://www.fywarehouse.com/',
    title: 'FENGYE LOGISTICS | FENGYE Warehouse',
    anchorVariants: [
      'FENGYE LOGISTICS',
      'FENGYE Warehouse',
      'Fengye Logistics',
      'Fengye Warehouse',
      'Fengye Logistics Montreal',
      'FENGYE Warehouse Montreal',
      'Montreal sufferance warehouse',
      'sufferance warehouse Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/#services',
    title: 'Warehouse Services',
    anchorVariants: [
      'FENGYE LOGISTICS warehousing services',
      'FENGYE Warehouse distribution services',
      'Fengye Logistics in-bond cargo handling',
      'warehousing services from FENGYE LOGISTICS',
      'Montreal warehousing by FENGYE Warehouse',
      'customs bonded warehouse services',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/#contact-us',
    title: 'Contact FENGYE LOGISTICS',
    anchorVariants: [
      'contact FENGYE LOGISTICS',
      'contact FENGYE Warehouse',
      'get a quote from Fengye Logistics',
      'request FENGYE LOGISTICS services',
      'reach out to FENGYE Warehouse Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/services/in-bond-cargo-handling',
    title: 'In-Bond Cargo Handling',
    anchorVariants: [
      'in-bond cargo handling services',
      'sufferance warehouse services',
      'CBSA authorized cargo handling',
      'in-bond freight handling Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/services/warehousing-distribution',
    title: 'Warehousing & Distribution',
    anchorVariants: [
      'warehousing and distribution services',
      'Montreal warehousing solutions',
      'warehouse storage Montreal',
      'freight warehousing services',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/services/consolidation-deconsolidation',
    title: 'Consolidation & De-consolidation',
    anchorVariants: [
      'cargo consolidation services',
      'freight consolidation Montreal',
      'LCL consolidation services',
      'de-consolidation services Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/services/local-delivery',
    title: 'Local Delivery',
    anchorVariants: [
      'local delivery services Montreal',
      'last mile distribution Montreal',
      'Montreal freight delivery',
      'local freight delivery services',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/services/repalletizing-recrating',
    title: 'Re-palletizing & Re-crating',
    anchorVariants: [
      're-palletizing services Montreal',
      'cargo re-crating services',
      'ISPM 15 certified packaging',
      'freight repackaging Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/locations/montreal-warehouse',
    title: 'Montreal Warehouse',
    anchorVariants: [
      'Montreal warehouse facility',
      'warehouse in Montreal',
      'Montreal logistics warehouse',
      'FENGYE Montreal warehouse',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/locations/quebec-logistics',
    title: 'Quebec Logistics',
    anchorVariants: [
      'Quebec logistics services',
      'supply chain solutions Quebec',
      'Quebec freight services',
      'logistics services in Quebec',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/locations/montreal-customs-broker',
    title: 'Montreal Customs Broker',
    anchorVariants: [
      'customs broker Montreal',
      'Montreal customs clearance',
      'customs brokerage services Montreal',
      'import clearance Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/locations/canada-freight-forwarding',
    title: 'Canada Freight Forwarding',
    anchorVariants: [
      'freight forwarding Canada',
      'international freight forwarding',
      'Canada shipping services',
      'freight forwarder Montreal',
    ],
  },
  {
    url: 'https://www.fywarehouse.com/locations/montreal-sufferance-warehouse',
    title: 'Montreal Sufferance Warehouse',
    anchorVariants: [
      'Montreal sufferance warehouse',
      'CBSA bonded warehouse Montreal',
      'bonded storage facility Montreal',
      'sufferance warehouse services',
    ],
  },
];

export function getRandomAnchor(moneyPage: MoneyPage): string {
  const variants = moneyPage.anchorVariants;
  return variants[Math.floor(Math.random() * variants.length)];
}
