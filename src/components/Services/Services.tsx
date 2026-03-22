import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { ServiceCard } from './ServiceCard';
import styles from './Services.module.css';

const services = [
  {
    title: 'Handling and Warehousing of In-Bond Cargo',
    description:
      "When your FTL or LTL shipment needs to undergo CBSA examination, opt for FY Sufferance Warehouse to keep the process moving without unnecessary delays. We handle the paperwork submission, transfer your shipment in-bond to our facility, unload the freight into our warehouse, and prepare it for CBSA inspection before quickly notifying you for pickup or local delivery.",
    imageSrc: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Warehouse workers handling in-bond cargo',
  },
  {
    title: 'Consolidation /De-consolidation',
    description:
      'Enhance freight operations with end-to-end logistics services for mixed loads moving to and from Canada. We receive and consolidate freight on our dock to optimize trailer capacity, then unload and de-consolidate trailers at our warehouse to support a smooth and efficient local distribution process.',
    imageSrc: 'https://images.unsplash.com/photo-1617957743098-5e16907f288f?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Forklift moving consolidated freight inside a warehouse',
  },
  {
    title: '24/7 Access',
    description:
      'At FENGYE Sufferance Warehouse, we recognize the non-stop pace of the trucking industry and operate 24/7, 365 days a year. Our warehouse remains accessible whenever you need service, giving your team the flexibility and reliability required to keep freight moving on demanding schedules.',
    imageSrc: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Loading dock available around the clock',
  },
  {
    title: 'Local Delivery',
    description:
      "If time is tight and you can't personally pick up your cleared freight, we can arrange local delivery on your behalf. Our team manages the last-mile logistics to ensure your cargo reaches its destination promptly and cost-effectively, so you can focus on getting back on the road.",
    imageSrc: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Delivery truck prepared for local freight delivery',
  },
  {
    title: 'Re-palletizing or Re-crating',
    description:
      'When freight needs to be reworked for compliance, handling, or transfer, our team can re-palletize or re-crate cargo so it is stable, secure, and ready for the next leg of its journey. This service helps reduce disruption at the warehouse and supports efficient onward distribution after inspection or handling changes.',
    imageSrc: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Palletized cargo being re-crated for shipment',
  },
] as const;

export function Services() {
  return (
    <Section id="services" className={styles.services}>
      <Container>
        <div className={styles.header}>
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
