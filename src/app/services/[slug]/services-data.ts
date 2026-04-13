export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceStat = {
  fact: string;
  source: string;
};

export type ServiceData = {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  keywords: string[];
  heroSubtitle: string;
  quickAnswer: string;
  content: string[];
  advantages: { title: string; description: string }[];
  stats: ServiceStat[];
  faqs: ServiceFaq[];
  howTo?: ServiceHowTo;
};

export type HowToStep = {
  name: string;
  text: string;
};

export type ServiceHowTo = {
  name: string;
  description: string;
  totalTime?: string;
  steps: HowToStep[];
};

export const servicesData: ServiceData[] = [
  {
    slug: 'in-bond-cargo-handling',
    title: 'In-Bond Cargo Handling & Sufferance Warehouse',
    shortTitle: 'In-Bond Cargo Handling',
    metaDescription:
      'CBSA-authorized sufferance warehouse in Montreal for in-bond cargo handling. Secure storage, customs examination, and efficient release of imported goods at FENGYE LOGISTICS.',
    keywords: [
      'sufferance warehouse Montreal',
      'in-bond cargo handling',
      'CBSA authorized warehouse',
      'customs bonded warehouse Canada',
      'in-bond freight Montreal',
      'CBSA examination facility',
    ],
    heroSubtitle:
      'CBSA-authorized sufferance warehouse providing secure in-bond cargo storage, customs examination support, and efficient freight release in Montreal.',
    quickAnswer:
      'What is in-bond cargo handling? In-bond cargo handling is the process of receiving, storing, and managing imported goods at a CBSA-authorized sufferance warehouse before customs clearance is completed, ensuring secure custody and regulatory compliance throughout the examination and release process.',
    content: [
      'FENGYE LOGISTICS operates a Canada Border Services Agency (CBSA) authorized sufferance warehouse in Montreal, providing comprehensive in-bond cargo handling services for importers, customs brokers, and freight forwarders across Quebec and Eastern Canada. Our facility is purpose-built to receive, store, and manage goods that have arrived in Canada but have not yet cleared customs, ensuring full regulatory compliance at every step of the process.',
      'When your Full Truckload (FTL) or Less-Than-Truckload (LTL) shipment requires CBSA examination, our team coordinates the entire workflow on your behalf. We handle the preparation and submission of all required documentation to CBSA, arrange the secure in-bond transfer of your cargo to our facility, and manage the unloading and staging of goods for inspection. Our warehouse staff is trained in CBSA protocols and understands the urgency that comes with customs-related delays, which is why we prioritize fast turnaround times for every shipment that passes through our doors.',
      'Our sufferance warehouse is equipped with loading docks sized for commercial trailers, covered storage areas that protect cargo from weather and damage, and a secure perimeter that meets all CBSA requirements for bonded facilities. Whether your shipment contains consumer electronics, industrial machinery, raw materials, or perishable goods requiring time-sensitive clearance, we have the infrastructure and expertise to handle it safely and efficiently.',
      'Once your shipment has been examined and released by CBSA, we promptly notify you or your customs broker so that pickup can be arranged without delay. For clients who need an end-to-end solution, we also offer local delivery services to transport your cleared freight directly to its final destination within the Greater Montreal area. This integrated approach eliminates the need to coordinate multiple service providers and reduces the risk of further delays after customs clearance.',
      'Choosing FENGYE LOGISTICS as your sufferance warehouse partner means working with a team that understands the complexities of cross-border trade. We serve a diverse client base that includes international freight forwarders, licensed customs brokers, import/export companies, and manufacturers who rely on just-in-time inventory. Our location in the Montreal metropolitan area provides convenient access to major highways, the Port of Montreal, and Montreal-Trudeau International Airport, making us a strategic link in your Canadian supply chain.',
      'We invite you to contact our operations team to discuss your in-bond cargo requirements. Whether you need a one-time examination or an ongoing warehousing relationship, FENGYE LOGISTICS delivers the reliability and compliance your business demands.',
    ],
    advantages: [
      {
        title: 'CBSA Authorized Facility',
        description:
          'Fully licensed and inspected sufferance warehouse meeting all Canada Border Services Agency requirements for bonded cargo storage.',
      },
      {
        title: 'Fast Turnaround',
        description:
          'Prioritized unloading, staging, and notification process to minimize the time your cargo spends waiting for customs clearance.',
      },
      {
        title: 'Complete Documentation Support',
        description:
          'We prepare and submit all required paperwork to CBSA on your behalf, reducing administrative burden and the risk of errors.',
      },
      {
        title: 'Secure Storage',
        description:
          'Covered, monitored warehouse with controlled access that meets CBSA security standards for in-bond goods.',
      },
      {
        title: 'Integrated Delivery Options',
        description:
          'After customs release, we can arrange local delivery to your final destination, providing a seamless end-to-end experience.',
      },
      {
        title: 'Strategic Montreal Location',
        description:
          'Convenient access to the Port of Montreal, YUL Airport, and major highway corridors for efficient cargo movement.',
      },
    ],
    stats: [
      {
        fact: 'Montreal handles over 40 million tonnes of cargo annually through its port facilities.',
        source: 'Port of Montreal',
      },
      {
        fact: 'Average customs clearance time in Canada: 2-5 business days.',
        source: 'CBSA',
      },
      {
        fact: 'Canada\'s logistics industry contributes over $100 billion annually to the national GDP.',
        source: 'Industry Canada',
      },
    ],
    faqs: [
      {
        question: 'What is a sufferance warehouse and how does in-bond cargo handling work?',
        answer: 'A sufferance warehouse is a facility authorized by the Canada Border Services Agency (CBSA) to receive and temporarily store imported goods that have not yet cleared customs. In-bond cargo handling involves receiving shipments from carriers, storing them securely under CBSA oversight, facilitating customs examinations, and coordinating the release of goods once all duties and paperwork are completed. FENGYE LOGISTICS operates a fully CBSA-authorized sufferance warehouse in Montreal.',
      },
      {
        question: 'How long can goods be stored in a sufferance warehouse in Montreal?',
        answer: 'Under CBSA regulations, goods can typically be held in a sufferance warehouse for up to 40 days from the date of arrival. During this period, importers or their customs brokers must complete the necessary customs clearance documentation and pay applicable duties. FENGYE LOGISTICS works proactively with brokers to ensure clearance is processed well within this timeframe to avoid any complications.',
      },
      {
        question: 'What types of cargo can FENGYE LOGISTICS handle in its bonded facility?',
        answer: 'Our CBSA-authorized sufferance warehouse handles a wide range of cargo types including consumer electronics, industrial machinery, raw materials, textiles, food products, and oversized freight. Our facility features commercial loading docks, covered storage areas, and a secure perimeter that meets all CBSA bonded storage requirements. We also coordinate CBSA examinations and provide integrated local delivery after customs release.',
      },
    ],
    howTo: {
      name: 'How to Use a Sufferance Warehouse in Montreal',
      description: 'A step-by-step guide to using FENGYE LOGISTICS sufferance warehouse for in-bond cargo handling and customs clearance in Montreal.',
      totalTime: 'P5D',
      steps: [
        {
          name: 'Contact FENGYE LOGISTICS for a quote',
          text: 'Call 438-488-5382 or email ops@fywarehouse.com to discuss your in-bond cargo requirements and receive a customized quote.',
        },
        {
          name: 'Arrange cargo delivery to our facility',
          text: 'Coordinate with your carrier to deliver the shipment to our CBSA-authorized sufferance warehouse at 2100C 52e Avenue, Lachine, QC.',
        },
        {
          name: 'We handle CBSA customs examination and documentation',
          text: 'Our team prepares and submits all required documentation to CBSA, stages your cargo for examination, and coordinates with customs officers on your behalf.',
        },
        {
          name: 'Cargo is released after customs clearance',
          text: 'Once CBSA clears your shipment and all duties are paid, we promptly notify you or your customs broker that the goods are ready for release.',
        },
        {
          name: 'Choose local delivery or pickup from our warehouse',
          text: 'Pick up your cleared cargo from our facility, or let us arrange local delivery to your final destination within the Greater Montreal area.',
        },
      ],
    },
  },
  {
    slug: 'consolidation-deconsolidation',
    title: 'Cargo Consolidation & De-consolidation',
    shortTitle: 'Consolidation & De-consolidation',
    metaDescription:
      'Professional cargo consolidation and de-consolidation services in Montreal. LCL and FCL freight handling, trailer optimization, and local distribution by FENGYE LOGISTICS.',
    keywords: [
      'cargo consolidation Montreal',
      'freight consolidation',
      'LCL consolidation',
      'de-consolidation services',
      'FCL deconsolidation',
      'freight optimization Quebec',
    ],
    heroSubtitle:
      'Expert cargo consolidation and de-consolidation services that optimize trailer capacity and streamline your freight distribution in Montreal.',
    quickAnswer:
      'What is cargo consolidation? Cargo consolidation is the process of combining multiple smaller Less-Than-Containerload (LCL) shipments into a single Full Containerload (FCL) or full trailer to maximize space utilization and reduce per-unit shipping costs.',
    content: [
      'FENGYE LOGISTICS provides professional cargo consolidation and de-consolidation services at our Montreal warehouse facility, helping shippers, freight forwarders, and logistics companies optimize their transportation costs and improve delivery efficiency. Whether you are combining multiple Less-Than-Containerload (LCL) shipments into a single Full Containerload (FCL) or breaking down a consolidated trailer into individual shipments for local distribution, our experienced warehouse team handles every step with precision and care.',
      'Consolidation is a cost-effective strategy for businesses that ship mixed loads to and from Canada. Instead of paying for multiple partial shipments, you can send your freight to our facility where we receive, sort, and combine it onto a single trailer. This maximizes trailer utilization, reduces per-unit shipping costs, and minimizes the environmental impact of your transportation operations. Our dock staff carefully organizes cargo by destination, weight, and handling requirements to ensure that every consolidated load is safe, stable, and ready for transit.',
      'De-consolidation is equally critical for businesses that receive large inbound shipments destined for multiple locations within Quebec or across Eastern Canada. When a full trailer arrives at our warehouse, we unload and sort the contents, verify quantities against shipping documents, and prepare individual shipments for pickup or local delivery. This process allows you to use a single long-haul shipment to move goods from their origin to Montreal, where we handle the breakdown and last-mile distribution to each final recipient.',
      'Our facility features multiple loading docks that can accommodate commercial trailers simultaneously, a spacious warehouse floor for staging and sorting operations, and a team of trained material handlers who use forklifts, pallet jacks, and other equipment to move freight safely. We maintain detailed records of every shipment that passes through our facility, providing you with accurate tracking information and documentation for your supply chain management systems.',
      'FENGYE LOGISTICS serves a wide range of industries with consolidation and de-consolidation needs, including retail, manufacturing, e-commerce fulfillment, and industrial distribution. Our Montreal location places us at the heart of one of Canada\'s busiest logistics corridors, with direct access to Highway 20, Highway 40, and the national rail network. This strategic position makes our facility an ideal hub for cross-border freight moving between the United States and Canada, as well as for domestic shipments within Quebec and Ontario.',
      'Contact our team today to learn how our consolidation and de-consolidation services can reduce your freight costs, improve delivery times, and simplify your supply chain operations. We offer flexible scheduling, competitive pricing, and the personalized service that sets FENGYE LOGISTICS apart from larger, impersonal warehouse operators.',
    ],
    advantages: [
      {
        title: 'Cost Optimization',
        description:
          'Maximize trailer utilization by combining multiple LCL shipments into full loads, significantly reducing per-unit transportation costs.',
      },
      {
        title: 'Multi-Dock Facility',
        description:
          'Multiple commercial loading docks allow simultaneous receiving and shipping operations for maximum throughput.',
      },
      {
        title: 'Accurate Sorting & Verification',
        description:
          'Every shipment is verified against documentation to ensure accurate counts and correct routing during de-consolidation.',
      },
      {
        title: 'Flexible Scheduling',
        description:
          'We accommodate your delivery windows and pickup schedules, adapting to your supply chain requirements.',
      },
      {
        title: 'Cross-Border Expertise',
        description:
          'Extensive experience handling freight moving between the US and Canada, with knowledge of customs requirements.',
      },
      {
        title: 'Detailed Tracking',
        description:
          'Comprehensive documentation and tracking for every shipment that passes through our consolidation operations.',
      },
    ],
    stats: [
      {
        fact: 'E-commerce has driven a 30%+ increase in warehousing demand since 2020.',
        source: 'CBRE Canada',
      },
      {
        fact: 'Montreal is the 2nd largest port in Canada by container volume.',
        source: 'Transport Canada',
      },
      {
        fact: 'Freight consolidation can reduce per-unit shipping costs by up to 50% compared to individual LCL shipments.',
        source: 'Logistics Management',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between cargo consolidation and de-consolidation?',
        answer: 'Cargo consolidation involves combining multiple smaller Less-Than-Containerload (LCL) shipments into a single Full Containerload (FCL) or full trailer to maximize space utilization and reduce per-unit shipping costs. De-consolidation is the reverse process: a large inbound shipment is broken down into individual smaller shipments for distribution to multiple recipients. FENGYE LOGISTICS provides both services at our Montreal warehouse facility.',
      },
      {
        question: 'How does freight consolidation reduce shipping costs?',
        answer: 'Freight consolidation reduces costs by maximizing trailer or container utilization. Instead of paying for multiple partial shipments, businesses send their goods to our facility where we combine them onto a single load. This eliminates wasted space, lowers per-unit transportation rates, and reduces the number of trips needed. For businesses shipping between the US and Canada, consolidation can significantly cut cross-border freight expenses.',
      },
      {
        question: 'Can FENGYE LOGISTICS handle both LCL and FCL consolidation in Montreal?',
        answer: 'Yes, FENGYE LOGISTICS handles both LCL and FCL consolidation and de-consolidation at our Montreal facility. We receive, sort, and combine LCL shipments into optimized full loads, and we break down FCL containers into individual shipments for local distribution. Our multi-dock facility accommodates simultaneous receiving and shipping operations for maximum efficiency.',
      },
    ],
    howTo: {
      name: 'How to Consolidate Freight in Montreal',
      description: 'Step-by-step guide to using FENGYE LOGISTICS cargo consolidation and de-consolidation services to optimize your shipping costs.',
      totalTime: 'P3D',
      steps: [
        {
          name: 'Submit your shipment details',
          text: 'Contact FENGYE LOGISTICS with your shipment quantities, dimensions, and destination details. We will assess whether consolidation or de-consolidation is the best approach for your freight.',
        },
        {
          name: 'Ship your LCL freight to our Montreal warehouse',
          text: 'Send your individual Less-Than-Containerload shipments to our facility at 2100C 52e Avenue, Lachine, QC. We receive and verify each shipment against documentation.',
        },
        {
          name: 'We sort, combine, and optimize your load',
          text: 'Our warehouse team organizes cargo by destination, weight, and handling requirements, then consolidates shipments onto optimized full trailers or containers.',
        },
        {
          name: 'Consolidated freight is dispatched or de-consolidated for local delivery',
          text: 'Full consolidated loads are dispatched to their destination. For de-consolidation, incoming full loads are broken down and sorted for individual pickup or local delivery.',
        },
      ],
    },
  },
  {
    slug: 'warehousing-distribution',
    title: 'Warehousing & Distribution Services',
    shortTitle: 'Warehousing & Distribution',
    metaDescription:
      'Flexible warehousing and distribution services in Montreal. Short-term and long-term storage, inventory management, and freight distribution by FENGYE LOGISTICS.',
    keywords: [
      'warehousing Montreal',
      'distribution services Quebec',
      'warehouse storage',
      'freight warehousing Canada',
      'inventory management Montreal',
      'storage facility Lachine',
    ],
    heroSubtitle:
      'Flexible short-term and long-term warehousing solutions with integrated distribution services, strategically located in Montreal.',
    quickAnswer:
      'What is warehousing and distribution? Warehousing and distribution is the integrated logistics service of storing goods in a secure facility and coordinating their outbound shipment to final destinations, including inventory management, order picking, and last-mile delivery.',
    content: [
      'FENGYE LOGISTICS offers comprehensive warehousing and distribution services from our strategically located facility in the Montreal metropolitan area. We provide flexible storage solutions for businesses of all sizes, whether you need short-term staging for a single shipment or long-term warehousing for ongoing inventory management. Our facility is designed to handle a wide variety of cargo types, from palletized goods and crated machinery to loose freight and oversized items.',
      'Short-term warehousing is ideal for businesses that need a temporary staging area between transportation legs. If your inbound shipment arrives before your outbound carrier is ready, or if you need to hold goods while awaiting customs clearance, our warehouse provides a secure and accessible location to store your freight. We offer daily, weekly, and monthly storage options with transparent pricing, so you only pay for the space and time you actually use.',
      'For businesses with ongoing warehousing needs, our long-term storage solutions provide a cost-effective alternative to leasing your own warehouse space. We handle the infrastructure, staffing, equipment, and security, allowing you to focus your capital and management attention on your core business operations. Our team manages inventory receiving, put-away, storage, and retrieval according to your specifications, providing regular inventory reports and responding quickly to your shipping requests.',
      'Distribution is the natural complement to our warehousing services. When your goods are ready to move, we coordinate outbound shipments to their next destination, whether that is a retail location, a manufacturing facility, a construction site, or a residential address. Our distribution capabilities include order picking, palletization, load planning, and coordination with carriers for local, regional, and long-distance delivery. For shipments within the Greater Montreal area, we also offer our own local delivery service for fast and reliable last-mile transportation.',
      'Our warehouse features climate-appropriate construction, fire suppression systems, 24-hour security monitoring, and adequate lighting throughout the storage and dock areas. Cargo is stored on industrial racking systems or floor-stacked depending on its characteristics, and our material handling equipment includes forklifts rated for heavy loads, electric pallet jacks, and dock levelers that accommodate trailers of various heights. These capabilities ensure that your goods are stored safely and handled efficiently throughout their time in our facility.',
      'FENGYE LOGISTICS is committed to providing warehousing and distribution services that meet the specific needs of each client. We work with importers, exporters, customs brokers, freight forwarders, retailers, and manufacturers across diverse industries. Our Montreal location offers excellent connectivity to the Port of Montreal, Montreal-Trudeau International Airport, and the Trans-Canada Highway, making our facility an efficient node in both domestic and international supply chains. Reach out to our team to discuss your storage and distribution requirements.',
    ],
    advantages: [
      {
        title: 'Flexible Storage Terms',
        description:
          'Daily, weekly, monthly, or long-term storage options with transparent pricing to match your business needs.',
      },
      {
        title: 'Secure Facility',
        description:
          '24-hour security monitoring, fire suppression systems, and controlled access to protect your inventory.',
      },
      {
        title: 'Integrated Distribution',
        description:
          'Seamless transition from storage to shipping, with order picking, load planning, and carrier coordination included.',
      },
      {
        title: 'Professional Equipment',
        description:
          'Heavy-duty forklifts, pallet jacks, industrial racking, and dock levelers for safe and efficient cargo handling.',
      },
      {
        title: 'Inventory Management',
        description:
          'Accurate receiving, put-away, and retrieval processes with regular inventory reporting for your records.',
      },
      {
        title: 'Multi-Modal Connectivity',
        description:
          'Proximity to the Port of Montreal, YUL Airport, and major highways for efficient inbound and outbound logistics.',
      },
    ],
    stats: [
      {
        fact: 'E-commerce has driven a 30%+ increase in warehousing demand since 2020.',
        source: 'CBRE Canada',
      },
      {
        fact: 'Canada\'s logistics industry contributes over $100 billion annually to the national GDP.',
        source: 'Industry Canada',
      },
      {
        fact: 'The average warehouse vacancy rate in Montreal fell below 2% in 2023, reflecting strong demand.',
        source: 'Colliers Canada',
      },
    ],
    faqs: [
      {
        question: 'How much does warehousing cost in Montreal?',
        answer: 'Warehousing costs in Montreal vary depending on the type of storage, duration, and services required. FENGYE LOGISTICS offers flexible pricing with daily, weekly, and monthly storage options, so you only pay for the space and time you actually use. Short-term staging for a single shipment is priced differently from long-term inventory storage. Contact our team for a customized quote based on your specific warehousing requirements.',
      },
      {
        question: 'Does FENGYE LOGISTICS offer both short-term and long-term warehouse storage?',
        answer: 'Yes, we provide both short-term and long-term warehousing solutions. Short-term storage is ideal for temporary staging between transportation legs or while awaiting customs clearance. Long-term storage is a cost-effective alternative to leasing your own warehouse space, with our team handling inventory management, receiving, put-away, and retrieval according to your specifications.',
      },
      {
        question: 'What distribution services are included with warehousing at FENGYE LOGISTICS?',
        answer: 'Our distribution services include order picking, palletization, load planning, carrier coordination, and local delivery within the Greater Montreal area. When your goods are ready to ship, we coordinate outbound transportation to retail locations, manufacturing facilities, construction sites, or residential addresses. This integrated approach eliminates the need to manage multiple service providers.',
      },
    ],
    howTo: {
      name: 'How to Store and Distribute Goods from Montreal',
      description: 'Guide to using FENGYE LOGISTICS warehousing and distribution services for flexible storage and efficient freight distribution.',
      steps: [
        {
          name: 'Request a warehousing quote',
          text: 'Contact FENGYE LOGISTICS at 438-488-5382 or ops@fywarehouse.com with your storage volume, cargo type, and expected duration to receive a customized warehousing quote.',
        },
        {
          name: 'Deliver your goods to our Montreal facility',
          text: 'Ship your freight to our warehouse at 2100C 52e Avenue, Lachine, QC. Our team receives, inspects, and catalogs your inventory upon arrival.',
        },
        {
          name: 'We manage your inventory securely',
          text: 'Your goods are stored on industrial racking or floor-stacked as appropriate, with 24-hour security monitoring and regular inventory reporting.',
        },
        {
          name: 'Request distribution when ready',
          text: 'When your goods need to move, our team handles order picking, palletization, load planning, and coordinates with carriers for delivery to the final destination.',
        },
      ],
    },
  },
  {
    slug: 'local-delivery',
    title: 'Local Delivery & Last Mile Distribution',
    shortTitle: 'Local Delivery',
    metaDescription:
      'Reliable local delivery and last mile distribution services in Montreal and surrounding areas. Fast freight delivery by FENGYE LOGISTICS.',
    keywords: [
      'local delivery Montreal',
      'last mile distribution',
      'freight delivery Quebec',
      'Montreal freight delivery',
      'local freight service',
      'last mile logistics Montreal',
    ],
    heroSubtitle:
      'Fast and reliable local delivery and last mile distribution services throughout Montreal and the surrounding Quebec region.',
    quickAnswer:
      'What is last mile delivery? Last mile delivery is the final leg of the supply chain where goods are transported from a warehouse or distribution center to the end recipient, whether a business, retail store, or residential address.',
    content: [
      'FENGYE LOGISTICS provides dependable local delivery and last mile distribution services throughout the Greater Montreal area and surrounding regions of Quebec. When your freight has been cleared through customs, de-consolidated at our warehouse, or is simply ready to move to its final destination, our delivery team ensures it arrives on time and in perfect condition. We understand that the last mile is often the most critical and time-sensitive segment of the supply chain, and we treat every delivery with the urgency and care it deserves.',
      'Our local delivery service is designed to complement our warehousing and customs handling operations, creating an integrated logistics solution that covers your freight from the moment it arrives at our facility to the moment it reaches your door. Rather than coordinating with separate carriers for local distribution, you can rely on a single provider who already has your cargo in hand and understands your delivery requirements. This reduces handoffs, minimizes the risk of damage or loss, and accelerates delivery times compared to using disconnected service providers.',
      'We serve a broad geographic area that includes the Island of Montreal, Laval, the North Shore, the South Shore, and communities along the Highway 20 and Highway 40 corridors extending toward Quebec City and the Ontario border. Whether your delivery is going to a commercial warehouse, a retail store, a construction site, or a residential address, our drivers are experienced with the roads, traffic patterns, and delivery logistics of the Montreal metropolitan area. We handle everything from single-pallet deliveries to multi-stop routes that distribute freight to several locations in a single trip.',
      'Timing is critical in local delivery, which is why we offer flexible scheduling options to meet your operational needs. Same-day delivery is available for urgent shipments, while scheduled deliveries can be arranged for specific dates and time windows. Our operations team coordinates directly with recipients to confirm delivery details, provide estimated arrival times, and resolve any access or logistics issues before the truck leaves our facility. This proactive communication reduces failed delivery attempts and ensures a smooth experience for everyone involved.',
      'Every delivery is handled by trained professionals who understand proper freight handling procedures. Our drivers use appropriate equipment including lift gates, pallet jacks, and strapping materials to ensure that cargo is loaded, transported, and unloaded safely. We carry adequate insurance coverage for all goods in transit, giving you peace of mind that your shipment is protected from pickup to final delivery. Proof of delivery documentation is provided for every completed shipment, maintaining a clear chain of custody for your records.',
      'Whether you are a customs broker arranging delivery of cleared goods, a freight forwarder distributing a de-consolidated shipment, or a business that needs reliable local transportation for your products, FENGYE LOGISTICS has the experience and resources to handle your local delivery needs. Contact our operations team to discuss routing, scheduling, and pricing for your next shipment.',
    ],
    advantages: [
      {
        title: 'Greater Montreal Coverage',
        description:
          'Comprehensive delivery coverage across the Island of Montreal, Laval, North Shore, South Shore, and surrounding corridors.',
      },
      {
        title: 'Same-Day Delivery Available',
        description:
          'Urgent shipments can be delivered the same day, with flexible scheduling options for planned deliveries.',
      },
      {
        title: 'Integrated Service',
        description:
          'Seamless connection between our warehousing, customs handling, and delivery services eliminates unnecessary handoffs.',
      },
      {
        title: 'Professional Handling',
        description:
          'Trained drivers with lift gates, pallet jacks, and proper equipment for safe loading, transit, and unloading.',
      },
      {
        title: 'Proactive Communication',
        description:
          'Direct coordination with recipients to confirm details and provide estimated arrival times before each delivery.',
      },
      {
        title: 'Proof of Delivery',
        description:
          'Documented chain of custody with proof of delivery provided for every completed shipment.',
      },
    ],
    stats: [
      {
        fact: 'E-commerce has driven a 30%+ increase in warehousing and last-mile delivery demand since 2020.',
        source: 'CBRE Canada',
      },
      {
        fact: 'The Greater Montreal area is home to over 4.2 million people, creating substantial local delivery volume.',
        source: 'Statistics Canada',
      },
      {
        fact: 'Last-mile delivery accounts for up to 53% of total shipping costs in the supply chain.',
        source: 'Business Insider Intelligence',
      },
    ],
    faqs: [
      {
        question: 'What areas does FENGYE LOGISTICS cover for local delivery in Montreal?',
        answer: 'FENGYE LOGISTICS provides local delivery services across the Island of Montreal, Laval, the North Shore, the South Shore, and communities along the Highway 20 and Highway 40 corridors. Our coverage extends toward Quebec City and the Ontario border. We handle deliveries to commercial warehouses, retail stores, construction sites, and residential addresses throughout the Greater Montreal region.',
      },
      {
        question: 'Does FENGYE LOGISTICS offer same-day delivery in Montreal?',
        answer: 'Yes, same-day delivery is available for urgent shipments within the Greater Montreal area. We also offer scheduled deliveries for specific dates and time windows. Our operations team coordinates directly with recipients to confirm delivery details and provide estimated arrival times, reducing failed delivery attempts and ensuring a smooth experience.',
      },
      {
        question: 'How does last mile delivery integrate with other FENGYE LOGISTICS services?',
        answer: 'Our local delivery service seamlessly connects with our warehousing, customs handling, and consolidation operations. After your goods clear customs at our sufferance warehouse or are de-consolidated from a larger shipment, we can deliver them directly to their final destination without additional coordination. This integrated approach reduces handoffs, minimizes damage risk, and accelerates delivery times.',
      },
    ],
    howTo: {
      name: 'How to Arrange Local Delivery in Montreal',
      description: 'Step-by-step guide to scheduling local delivery and last mile distribution with FENGYE LOGISTICS in the Greater Montreal area.',
      steps: [
        {
          name: 'Contact us with your delivery requirements',
          text: 'Call 438-488-5382 or email ops@fywarehouse.com with your cargo details, pickup/warehouse location, and delivery destination within the Greater Montreal area.',
        },
        {
          name: 'Confirm scheduling and delivery window',
          text: 'Our operations team coordinates the delivery date and time window with you and the recipient. Same-day delivery is available for urgent shipments.',
        },
        {
          name: 'Our team picks up and delivers your freight',
          text: 'Trained drivers with lift gates and pallet jacks transport your cargo safely to the final destination, whether a commercial site or residential address.',
        },
        {
          name: 'Receive proof of delivery confirmation',
          text: 'Once delivered, you receive documented proof of delivery maintaining a clear chain of custody for your records.',
        },
      ],
    },
  },
  {
    slug: 'repalletizing-recrating',
    title: 'Re-palletizing & Re-crating Services',
    shortTitle: 'Re-palletizing & Re-crating',
    metaDescription:
      'Professional re-palletizing and re-crating services in Montreal. ISPM 15 certified heat-treated wood packaging for international shipping compliance at FENGYE LOGISTICS.',
    keywords: [
      're-palletizing services',
      're-crating Montreal',
      'cargo repackaging',
      'ISPM 15 packaging',
      'heat treated pallets Montreal',
      'freight re-crating Quebec',
    ],
    heroSubtitle:
      'Expert re-palletizing and re-crating with ISPM 15 certified heat-treated wood packaging materials, ensuring international shipping compliance.',
    quickAnswer:
      'What is re-palletizing and re-crating? Re-palletizing and re-crating is the process of transferring cargo onto new pallets or constructing custom wooden crates to ensure safe transportation and compliance with international phytosanitary standards such as ISPM 15.',
    content: [
      'FENGYE LOGISTICS offers professional re-palletizing and re-crating services at our Montreal warehouse facility, helping importers, exporters, and logistics companies ensure that their cargo is properly packaged for safe transportation and regulatory compliance. Whether your shipment arrived on damaged pallets, needs to be reconfigured for a different transportation mode, or requires compliant wood packaging for international transit, our experienced team delivers high-quality results with fast turnaround times.',
      'All wood packaging materials used in our re-palletizing and re-crating operations are heat-treated and certified to ISPM 15 (International Standards for Phytosanitary Measures No. 15) standards. This internationally recognized certification is required by most countries for wood packaging used in international trade, as it confirms that the materials have been treated to eliminate pests and organisms that could harm ecosystems in the destination country. By using exclusively ISPM 15 certified materials, FENGYE LOGISTICS ensures that your shipment will not face delays, rejections, or penalties at border crossings due to non-compliant packaging.',
      'Re-palletizing is necessary in many common logistics scenarios. Pallets can be damaged during ocean container transport, long-haul trucking, or warehouse handling, compromising the stability and safety of the load. Some shipments arrive on pallets that do not meet the size or weight specifications required by the next carrier or the receiving facility. In other cases, cargo that was floor-loaded in a container needs to be palletized for efficient handling and storage at its destination. Whatever the reason, our warehouse staff has the skills and equipment to transfer your freight onto new pallets quickly and securely.',
      'Re-crating services are essential for fragile, high-value, or irregularly shaped items that need additional protection during transit. Our team constructs custom wooden crates using heat-treated lumber, designed to fit the specific dimensions and weight of your cargo. We use appropriate fasteners, cushioning materials, and bracing techniques to prevent movement and absorb impacts during transportation. Each crate is stamped with the ISPM 15 certification mark, providing documented proof of compliance for customs authorities at the destination.',
      'Beyond standard re-palletizing and re-crating, we also provide related packaging services including shrink wrapping, banding, corner board application, and load securing. These additional measures help protect your cargo from moisture, shifting, and surface damage during transit. Our team assesses each shipment individually and recommends the packaging approach that best balances protection, cost, and compliance requirements.',
      'FENGYE LOGISTICS serves clients across a range of industries that require reliable packaging services, including manufacturers shipping machinery and equipment, importers receiving goods from overseas, and freight forwarders managing complex multi-leg shipments. Our Montreal location provides convenient access for cargo arriving by truck, rail, ocean container, or air freight. Contact our operations team to discuss your re-palletizing or re-crating needs, and we will provide a prompt quote based on the specifics of your shipment.',
    ],
    advantages: [
      {
        title: 'ISPM 15 Certified Materials',
        description:
          'All wood packaging is heat-treated and stamped to ISPM 15 standards, ensuring compliance with international phytosanitary regulations.',
      },
      {
        title: 'Custom Crate Construction',
        description:
          'Purpose-built wooden crates designed to the exact dimensions and weight specifications of your cargo.',
      },
      {
        title: 'Fast Turnaround',
        description:
          'Efficient re-palletizing and re-crating operations minimize delays in your shipment schedule.',
      },
      {
        title: 'Comprehensive Packaging',
        description:
          'Additional services including shrink wrapping, banding, corner boards, and load securing for complete cargo protection.',
      },
      {
        title: 'Damage Mitigation',
        description:
          'Professional handling and packaging techniques that reduce the risk of damage during subsequent transportation.',
      },
      {
        title: 'Experienced Team',
        description:
          'Trained warehouse staff with expertise in freight packaging for domestic and international shipments.',
      },
    ],
    stats: [
      {
        fact: 'ISPM 15 compliance is required by over 180 countries for wood packaging in international trade.',
        source: 'IPPC/FAO',
      },
      {
        fact: 'Montreal handles over 40 million tonnes of cargo annually through its port facilities.',
        source: 'Port of Montreal',
      },
      {
        fact: 'Non-compliant wood packaging can result in shipment rejections and penalties exceeding $10,000 per incident.',
        source: 'CFIA',
      },
    ],
    faqs: [
      {
        question: 'What is ISPM 15 and why is it required for international shipping?',
        answer: 'ISPM 15 (International Standards for Phytosanitary Measures No. 15) is an international regulation that requires wood packaging materials used in international trade to be heat-treated or fumigated to eliminate pests. Most countries require ISPM 15 compliance for any wood pallets, crates, or dunnage accompanying imported goods. Non-compliant packaging can result in shipment delays, rejections, or penalties at the destination port.',
      },
      {
        question: 'When would I need re-palletizing or re-crating services?',
        answer: 'Re-palletizing is needed when pallets are damaged during transit, when cargo needs to be reconfigured for a different carrier or receiving facility, or when floor-loaded container goods need to be palletized for efficient warehouse handling. Re-crating is essential for fragile, high-value, or irregularly shaped items that need additional protection. FENGYE LOGISTICS handles both services with ISPM 15 certified materials.',
      },
      {
        question: 'Does FENGYE LOGISTICS provide custom crating for oversized cargo?',
        answer: 'Yes, our team constructs custom wooden crates using ISPM 15 certified heat-treated lumber, designed to fit the specific dimensions and weight of your cargo. We use appropriate fasteners, cushioning materials, and bracing techniques to prevent movement during transit. Each custom crate is stamped with the ISPM 15 certification mark for documented compliance at international customs checkpoints.',
      },
    ],
    howTo: {
      name: 'How to Get Cargo Re-palletized or Re-crated in Montreal',
      description: 'Guide to using FENGYE LOGISTICS re-palletizing and re-crating services with ISPM 15 certified materials for international shipping compliance.',
      steps: [
        {
          name: 'Send us your cargo details',
          text: 'Contact FENGYE LOGISTICS with your cargo dimensions, weight, and packaging requirements. Let us know if ISPM 15 compliance is needed for international shipment.',
        },
        {
          name: 'Deliver or transfer cargo to our facility',
          text: 'Ship your freight to our warehouse at 2100C 52e Avenue, Lachine, QC. We inspect the current packaging condition upon arrival.',
        },
        {
          name: 'Our team re-palletizes or builds custom crates',
          text: 'Using ISPM 15 certified heat-treated wood, our staff transfers your cargo onto new pallets or constructs custom crates to your specifications, including shrink wrapping and banding as needed.',
        },
        {
          name: 'Repackaged cargo is ready for pickup or onward shipment',
          text: 'Your properly packaged cargo is staged for carrier pickup or can be shipped via our local delivery service. All ISPM 15 stamps and documentation are provided.',
        },
      ],
    },
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return servicesData.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return servicesData.map((s) => s.slug);
}
