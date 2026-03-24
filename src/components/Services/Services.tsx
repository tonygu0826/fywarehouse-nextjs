import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { ServiceCard } from './ServiceCard';
import styles from './Services.module.css';

const cdnBaseUrl = 'https://user-assets.sxlcdn.com/images/834385';
const fallbackBaseUrl = 'https://images.unsplash.com';

const services = [
  {
    title: 'Handling and Warehousing of In-Bond Cargo',
    description:
      'When your FTL or LTL shipment needs to undergo CBSA examination, opt for FY Sufferance Warehouse to ensure a smooth process without unnecessary delays. We handle the submission of your paperwork to CBSA and transfer your shipment in-bond to our facility. Here, we unload your freight into our warehouse and get it ready for CBSA inspection. Once your shipment is cleared, we quickly notify you for pickup. Alternatively, if you prefer, we can arrange convenient local delivery. Count on us for effective customs solutions that keep your supply chain moving seamlessly.',
    imageSrc: `${cdnBaseUrl}/Fkbro1UZoC2SnDg-fBVF404X8yR0.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85`,
    imageAlt: 'Workers handling in-bond cargo inside the warehouse',
    copySource: 'live-site' as const,
  },
  {
    title: 'Consolidation /De-consolidation',
    description:
      "Enhance your freight operations with our all-encompassing logistics services. Whether you're transporting mixed loads to and from Canada, we've got you covered. Trust us with your freight—we receive and consolidate on our dock, optimizing trailer capacity for enhanced profitability. Furthermore, leverage our proficiency in unloading and de-consolidating trailers at our warehouse, ensuring a smooth local distribution process. Boost your shipping efficiency with our customized solutions, providing a streamlined and profitable experience for your supply chain.",
    imageSrc: `${cdnBaseUrl}/Fi_rYaCNiJbpFZlCoPzJRgnKqL-e.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1617957743098-5e16907f288f?auto=format&fit=crop&w=1600&q=85`,
    imageAlt: 'Consolidated freight prepared on a warehouse dock',
    copySource: 'live-site' as const,
  },
  {
    title: '24/7 Access',
    description:
      "At FENGYE Sufferance Warehouse, we recognize the non-stop pace of the trucking industry, operating 24/7, 365 days a year. We grasp the financial repercussions and the potential impact on customers due to delays. That's why our warehouse is always accessible whenever you need our services. We are dedicated to providing flexibility and reliability to meet the ongoing demands of your business. Count on us for readily available and responsive solutions that align with the dynamic operational needs of your enterprise.",
    imageSrc: `${cdnBaseUrl}/FrfwmGkB0RlQeiehGQTtNLQ4O6Ju.png`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=85`,
    imageAlt: 'FY Warehouse loading area with round-the-clock access',
    copySource: 'live-site' as const,
  },
  {
    title: 'Local Delivery',
    description:
      "If time is tight and you can't personally pick up your cleared freight, let us handle it for you. Our team can smoothly organize local delivery on your behalf, guaranteeing that your cargo reaches its destination promptly and cost-effectively. Rely on us to manage the last-mile logistics, freeing you up to concentrate on getting back on the road with peace of mind.",
    imageSrc: `${cdnBaseUrl}/FlN2W5HThoYJnu6Vpd3SsNuwCQb4.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85`,
    imageAlt: 'Truck staged for local delivery service',
    copySource: 'live-site' as const,
  },
  {
    title: 'Re-palletizing or Re-crating',
    description:
      'At FENGYE Sufferance Warehouse, we offer re-palletization or re-crating services for your shipments, utilizing exclusively heat-treated, ISPM 15 certified wood packaging materials. Rest assured that your cargo will be handled with precision and compliance to international standards for safe and secure transportation.',
    imageSrc: `${cdnBaseUrl}/Fhv2qttxYo0PpVjpkHcGnMp4ST7E.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=85`,
    imageAlt: 'Cargo being re-palletized or re-crated for compliant transport',
    copySource: 'live-site' as const,
  },
] as const;

export function Services() {
  return (
    <Section id="services" className={styles.services}>
      <Container>
        <div className={styles.header}>
          {/* ui-ux-design review: section heading locked to 36px tier with container rhythm preserved */}
          <h2>Sufferance Warehouse Services</h2>
        </div>
        <div className={styles.list}>
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} reverse={index % 2 === 1} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
