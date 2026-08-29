import { DEFAULT_ADMIN_PASSWORD_HASH, DEFAULT_ADMIN_USERNAME } from './security.js';

// Default CMS content schema containing all text and lists for the entire website
export const DEFAULT_WEBSITE_CONTENT = {
  general: {
    siteTitle: "Sangath Global Exim – Global Agricultural Commodities Export & Import",
    metaDescription: "Sangath Global Exim is a global exporter and importer of agricultural products including spices, oil seeds, fresh vegetables, and more. Browse our premium quality products for bulk orders and international trade.",
    metaKeywords: "agricultural commodities, export, import, spices, oil seeds, fresh vegetables, cumin seeds, turmeric, black pepper, cardboard, mustard seeds, sunflower seeds, sesame seeds, groundnut, soybean, international trade, bulk trading, Sangath Global Exim",
    logoText: "Sangath Global Exim",
    address: "RK Empire, Rajkot, Gujarat, India",
    mapEmbedUrl: "",
    phones: ["+91 93137 88416"],
    email: "export.sangath@gmail.com",
    socialLinks: {
      linkedin: "https://linkedin.com",
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      twitter: "https://twitter.com"
    }
  },
  home: {
    hero: {
      title: "Sangath Global Exim",
      subtitle: "Welcome to",
      tagline: "Global Trading & Marketing of Agricultural Commodities",
      description: "We are your trusted global partner in agricultural commodities export & import. Connecting global markets with quality products and reliable service."
    },
    aboutSnapshot: {
      title: "About Sangath Global Exim",
      paragraphs: [
        "Sangath Global Exim is an India-based exporter specializing in Peanut Butter Powder, Protein Powder, Natural Olive Oil, Coconut Oil, and Groundnut Oil. We deliver premium-quality nutritional products to customers across international markets, ensuring consistent quality and reliable service.",
        "Our commitment to quality, competitive pricing, private labeling, custom packaging, and customer satisfaction has established Sangath Global Exim as a trusted partner for buyers in the global food, health, and nutrition industry."
      ]
    },
    benefits: [
      {
        title: "Quality Assurance",
        description: "Rigorous quality control and testing standards ensure consistent product excellence."
      },
      {
        title: "Global Network",
        description: "Extensive international network spanning multiple continents and markets."
      },
      {
        title: "Bulk Supply",
        description: "Capable of handling large-scale orders with reliable supply chain management."
      },
      {
        title: "Trusted Supplier",
        description: "Years of experience and proven track record in international trade."
      }
    ],
    exportRegions: [
      "Sri Lanka", "Malaysia", "Bangladesh", "UAE", "Singapore", "Russia", "Djibouti", "Afghanistan"
    ],
    importOrigins: [
      "Canada", "Australia", "Myanmar", "Tanzania"
    ]
  },
  about: {
    header: {
      title: "About Us",
      subtitle: "Your Trusted Partner in Global Agricultural Trade",
      bannerImage: "/images/about_us_banner.png"
    },
    company: {
      title: "About Sangath Global Exim",
      paragraphs: [
        "Sangath Global Exim is an India-based export company dedicated to delivering premium-quality nutritional and food products to global markets. With a strong commitment to excellence, innovation, and integrity, we strive to bridge Indian manufacturing with international demand through reliable and sustainable trade.",
        "Our product portfolio includes Peanut Butter Powder, Protein Powder, Natural Olive Oil, Coconut Oil, and Groundnut Oil, carefully developed to meet the highest international quality standards. We also offer Natural, Classic, Chocolate, and flavored Protein Powders, catering to the growing health, fitness, bakery, and food processing industries worldwide.",
        "At Sangath Global Exim, we believe that every shipment represents our promise of quality and trust. By offering competitive export pricing, private labeling, custom packaging, and dependable logistics, we help our global partners grow with confidence. Our vision is to become a trusted global supplier, building long-term relationships through consistency, transparency, and customer-focused solutions."
      ]
    },
    vision: {
      title: "Our Vision",
      items: [
        "At Sangath Global Exim, our vision is to become one of the world's most trusted exporters of premium nutritional and food products by setting new benchmarks in quality, reliability, and customer satisfaction. We are committed to connecting Indian excellence with global opportunities while creating sustainable value through innovation, integrity, and long-term partnerships."
      ]
    },
    mission: {
      title: "Our Mission",
      items: [
        "Committed to delivering premium-quality products that exceed international standards through innovation, integrity, and excellence. By offering reliable export solutions, customized services, and exceptional customer support, we build lasting partnerships and create sustainable value for our global customers."
      ]
    },
    managementTeam: [
      { name: "Prince Padmani", role: "Partner", phone: "+91 93137 88416" },
      { name: "Dhruvil Chovatiya", role: "Partner", phone: "+91 93137 88416" }
    ],
    certifications: {
      title: "Certifications & Compliance",
      intro: "We maintain the highest standards of quality and compliance through various certifications and regulatory approvals:",
      items: [
        "APEDA (Agricultural and Processed Food Products Export Development Authority)",
        "Spice Board of India",
        "FSSAI (Food Safety and Standards Authority of India)"
      ]
    },
    governance: {
      title: "Governance",
      intro: "Sangath Global Exim operates under strict governance principles, ensuring transparency, accountability, and ethical conduct in all business operations. Our governance framework includes:",
      items: [
        "Regular compliance audits and quality checks",
        "Adherence to international trade regulations and standards",
        "Ethical sourcing and supply chain management",
        "Environmental responsibility and sustainability practices",
        "Stakeholder engagement and transparent reporting"
      ]
    }
  },
  exportsImports: {
    header: {
      title: "Exports & Imports",
      subtitle: "Connecting Global Markets with Quality Products",
      bannerImage: "/images/exports_imports_banner.jpg"
    },
    exports: {
      title: "Our Exports",
      description: "We export premium agricultural commodities to markets across the globe, ensuring quality products reach our international partners.",
      countries: [
        "Sri Lanka", "Malaysia", "Bangladesh", "UAE", "Singapore", "Russia", "Djibouti", "Afghanistan"
      ],
      products: [
        "Sugar (Refined & Raw)",
        "Spices (Turmeric, Coriander, Cumin, Black Pepper)",
        "Food Grains (Rice, Wheat, Maize)",
        "Tea (CTC & Orthodox)",
        "Pulses (Lentils, Chickpeas, Kidney Beans)",
        "Agro Feed & Feed Ingredients"
      ]
    },
    imports: {
      title: "Our Imports",
      description: "We source quality agricultural commodities from trusted international suppliers to meet domestic market demands and ensure product diversity.",
      countries: [
        "Canada", "Australia", "Myanmar", "Tanzania"
      ],
      products: [
        "Premium Wheat",
        "High-Quality Pulses",
        "Specialty Grains",
        "Feed Ingredients",
        "Organic Commodities"
      ]
    },
    partnership: {
      title: "Become a Global Partner",
      description: "Join our network of international partners and benefit from our extensive trade experience, quality assurance, and reliable supply chain management."
    }
  },
  quality: {
    header: {
      title: "Quality & Code of Conduct",
      subtitle: "Committed to Excellence and Ethical Business Practices",
      bannerImage: "/images/Cumin_Seeds.jpg"
    },
    assurance: {
      title: "Quality Assurance",
      paragraphs: [
        "At Sangath Global Exim, quality is at the heart of everything we do. We understand that consistent quality is essential for building trust and maintaining long-term relationships with our customers worldwide.",
        "Our quality assurance process begins from the sourcing stage and continues through processing, packaging, storage, and delivery. We maintain strict quality control measures to ensure that every product meets international standards and customer expectations."
      ]
    },
    qualityStandards: [
      "Rigorous quality testing at every stage",
      "Compliance with international food safety standards",
      "Proper storage and handling facilities",
      "Consistent product quality across all shipments",
      "Traceability and documentation",
      "Regular quality audits and inspections"
    ],
    packing: {
      title: "Packing Standards",
      description: "We use high-quality packaging materials that protect products during transit and storage. Our packaging meets international standards and ensures product integrity throughout the supply chain."
    },
    testing: {
      title: "Testing & Certification",
      description: "All products undergo rigorous testing for quality, purity, and safety. We maintain certifications from recognized authorities including APEDA, Spice Board, and FSSAI."
    },
    consistent: {
      title: "Consistent Quality",
      description: "We have established quality benchmarks for each product category and ensure consistent quality across all shipments. Our quality control team monitors every batch to maintain these standards."
    },
    codeOfConduct: {
      title: "Company Code of Conduct",
      description: "Our code of conduct reflects our commitment to ethical business practices and responsible corporate behavior.",
      items: [
        {
          title: "Honesty & Integrity",
          description: "We conduct all business operations with complete transparency and ethical practices."
        },
        {
          title: "Innovation & Excellence",
          description: "We continuously improve our processes and services to deliver the best value to our customers."
        },
        {
          title: "Respect for Customers",
          description: "We prioritize customer satisfaction and build long-term relationships based on trust and mutual respect."
        },
        {
          title: "High Ethical Standards",
          description: "We maintain the highest ethical standards in all our business dealings and relationships."
        },
        {
          title: "Environmental Responsibility",
          description: "We are committed to sustainable practices and environmental conservation in our operations."
        },
        {
          title: "Fair Trade Practices",
          description: "We ensure fair treatment of all stakeholders including suppliers, employees, and partners."
        }
      ]
    },
    ethics: {
      title: "Our Commitment",
      paragraphs: [
        "Sangath Global Exim is committed to maintaining the highest standards of business ethics and integrity. We believe that ethical conduct is fundamental to sustainable business success and building trust with all stakeholders.",
        "We ensure that all our business operations comply with applicable laws and regulations, and we continuously work towards improving our ethical standards and corporate governance practices."
      ]
    }
  },
  blog: {
    posts: [
      {
        id: 1,
        category: "Industry Insights",
        title: "Global Demand for Indian Spices: Trends & Opportunities",
        excerpt: "India remains the world's largest producer and exporter of spices. Discover how global demand is shaping new trade opportunities for exporters.",
        date: "June 10, 2026",
        readTime: "4 min read"
      },
      {
        id: 2,
        category: "Trade News",
        title: "Understanding APEDA Regulations for Agricultural Exports",
        excerpt: "A comprehensive overview of APEDA guidelines that every agricultural exporter must know before shipping commodities internationally.",
        date: "May 28, 2026",
        readTime: "5 min read"
      },
      {
        id: 3,
        category: "Product Spotlight",
        title: "Turmeric: The Golden Spice Driving Global Export Growth",
        excerpt: "Turmeric exports from India have surged over the last decade. Learn about quality standards, key markets, and what buyers look for.",
        date: "May 15, 2026",
        readTime: "3 min read"
      },
      {
        id: 4,
        category: "Sustainability",
        title: "Sustainable Sourcing in Agricultural Commodity Trade",
        excerpt: "Responsible sourcing is no longer optional — it is a business imperative. Here is how Sangath Global Exim approaches sustainability in its supply chain.",
        date: "April 30, 2026",
        readTime: "4 min read"
      },
      {
        id: 5,
        category: "Market Update",
        title: "Key Export Destinations for Indian Food Grains in 2026",
        excerpt: "From Southeast Asia to the Middle East, Indian food grains continue to find new buyers. An analysis of key markets and demand drivers.",
        date: "April 12, 2026",
        readTime: "5 min read"
      },
      {
        id: 6,
        category: "Company News",
        title: "Sangath Global Exim Expands Its Export Network",
        excerpt: "We are excited to announce the addition of new trade partnerships across the Gulf and Southeast Asian regions, strengthening our global reach.",
        date: "March 22, 2026",
        readTime: "2 min read"
      }
    ]
  },
  careers: {
    intro: {
      title: "Why Work With Us",
      description: "At Sangath Global Exim, we believe that our people are our greatest asset. We offer a dynamic, growth-oriented work environment where individuals can build meaningful careers in international agricultural trade."
    },
    perks: [
      { icon: "🌍", title: "Global Exposure", description: "Work with partners and clients across multiple countries and continents." },
      { icon: "📈", title: "Growth Opportunities", description: "Fast-growing company with clear paths for professional advancement." },
      { icon: "🤝", title: "Collaborative Culture", description: "Work in a supportive, team-oriented environment built on trust and respect." },
      { icon: "🌱", title: "Learning & Development", description: "Continuous learning opportunities in trade, logistics, and quality standards." }
    ],
    openings: [
      {
        id: 1,
        title: "Export Sales Executive",
        department: "Sales & Business Development",
        location: "Rajkot, Gujarat",
        type: "Full-Time",
        description: "Drive international sales, manage client accounts, and identify new export markets for agricultural commodities."
      },
      {
        id: 2,
        title: "Logistics & Documentation Coordinator",
        department: "Operations",
        location: "Rajkot, Gujarat",
        type: "Full-Time",
        description: "Handle export documentation, shipping coordination, and customs compliance to ensure smooth international shipments."
      },
      {
        id: 3,
        title: "Quality Control Analyst",
        department: "Quality Assurance",
        location: "Rajkot, Gujarat",
        type: "Full-Time",
        description: "Inspect and test agricultural commodity samples to ensure they meet APEDA, FSSAI, and international buyer standards."
      },
      {
        id: 4,
        title: "Business Development Manager",
        department: "Business Development",
        location: "Rajkot, Gujarat / Remote",
        type: "Full-Time",
        description: "Identify and develop new international trade partnerships. Build relationships with buyers and importers across target markets."
      }
    ],
    cta: {
      title: "Don't See the Right Role?",
      description: "We're always looking for talented people. Send your CV to us and we'll reach out when a suitable opening arises."
    }
  },
  gallery: {
    title: "Gallery",
    subtitle: "Explore our product collection",
    items: [
      { id: 1, title: "Product Showcase 1", emoji: "🌾" },
      { id: 2, title: "Product Showcase 2", emoji: "🌽" },
      { id: 3, title: "Product Showcase 3", emoji: "🥜" },
      { id: 4, title: "Product Showcase 4", emoji: "🌿" },
      { id: 5, title: "Product Showcase 5", emoji: "🌱" },
      { id: 6, title: "Product Showcase 6", emoji: "🌰" }
    ]
  },
  harvest: {
    title: "Harvest Chart",
    subtitle: "Monthly harvest schedule for our products",
    months: [
      { month: "January", products: ["Wheat", "Barley"] },
      { month: "February", products: ["Onions", "Garlic"] },
      { month: "March", products: ["Rice", "Corn"] },
      { month: "April", products: ["Pulses", "Lentils"] },
      { month: "May", products: ["Sesame", "Sunflower"] },
      { month: "June", products: ["Cotton", "Jute"] },
      { month: "July", products: ["Millet", "Sorghum"] },
      { month: "August", products: ["Soybean", "Groundnut"] },
      { month: "September", products: ["Rice", "Maize"] },
      { month: "October", products: ["Wheat", "Mustard"] },
      { month: "November", products: ["Onions", "Potatoes"] },
      { month: "December", products: ["Peas", "Beans"] }
    ]
  },
  products: {
    header: {
      title: "Our Products",
      subtitle: "Premium Agricultural Commodities for Global Markets",
      bannerImage: "/images/Cumin_Seeds.jpg"
    },
    showPrices: true
  },
  contact: {
    header: {
      title: "Contact Us",
      subtitle: "Get in Touch with Our Global Trade Experts",
      bannerImage: "/images/Cumin_Seeds.jpg"
    }
  }
};

/**
 * Load CMS Website Content
 */
export function loadWebsiteContent() {
  const content = localStorage.getItem('sangath_website_content');
  if (content) {
    try {
      const parsed = JSON.parse(content);
      // Deep merge fallback fields from DEFAULT_WEBSITE_CONTENT
      let changed = false;
      const mergeDefaults = (target, source) => {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) {
              target[key] = {};
              changed = true;
            }
            mergeDefaults(target[key], source[key]);
          } else if (target[key] === undefined) {
            target[key] = source[key];
            changed = true;
          }
        }
      };
      mergeDefaults(parsed, DEFAULT_WEBSITE_CONTENT);
      if (changed) {
        saveWebsiteContent(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing website content', e);
    }
  }
  
  // Set default if not set
  saveWebsiteContent(DEFAULT_WEBSITE_CONTENT);
  return DEFAULT_WEBSITE_CONTENT;
}

/**
 * Save CMS Website Content
 */
export function saveWebsiteContent(content) {
  try {
    localStorage.setItem('sangath_website_content', JSON.stringify(content));
  } catch (e) {
    console.error('Error saving website content', e);
  }
}

/**
 * Reset CMS Website Content and Products
 */
export function resetToDefaults() {
  // Backup first
  try {
    const prevContent = localStorage.getItem('sangath_website_content');
    const prevProducts = localStorage.getItem('sangath_products');
    if (prevContent) localStorage.setItem('sangath_backup_content', prevContent);
    if (prevProducts) localStorage.setItem('sangath_backup_products', prevProducts);
  } catch (e) {
    console.warn('Could not create backup keys due to quota', e);
  }
  
  localStorage.setItem('sangath_website_content', JSON.stringify(DEFAULT_WEBSITE_CONTENT));
  localStorage.removeItem('sangath_products'); // Will trigger reload from public/products.json
  localStorage.setItem('sangath_admin_password', DEFAULT_ADMIN_PASSWORD_HASH);
}

/**
 * Load Customer Inquiries
 */
export function loadInquiries() {
  const inquiries = localStorage.getItem('sangath_inquiries');
  if (inquiries) {
    try {
      return JSON.parse(inquiries);
    } catch (e) {
      console.error('Error parsing inquiries', e);
    }
  }
  return [];
}

/**
 * Save Customer Inquiries List
 */
export function saveInquiries(inquiries) {
  try {
    localStorage.setItem('sangath_inquiries', JSON.stringify(inquiries));
  } catch (e) {
    console.error('Error saving inquiries', e);
  }
}

/**
 * Add a New Inquiry
 */
export function addInquiry(inquiry) {
  const inquiries = loadInquiries();
  const newInquiry = {
    id: 'inq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    status: 'new', // new, read, replied
    ...inquiry
  };
  inquiries.unshift(newInquiry);
  saveInquiries(inquiries);
}

/**
 * Load Admin Users (RBAC)
 */
export function loadAdmins() {
  const adminsStr = localStorage.getItem('sangath_admin_users');
  if (adminsStr) {
    try {
      const parsed = JSON.parse(adminsStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error('Error parsing admin users', e);
    }
  }

  // Fallback to legacy single admin if no array exists
  const legacyHash = localStorage.getItem('sangath_admin_password') || DEFAULT_ADMIN_PASSWORD_HASH;
  const defaultSuperAdmin = {
    id: 'super_admin_1',
    username: DEFAULT_ADMIN_USERNAME || 'admin',
    passwordHash: legacyHash,
    role: 'Super Admin',
    permissions: ['all']
  };

  saveAdmins([defaultSuperAdmin]);
  return [defaultSuperAdmin];
}

/**
 * Save Admin Users
 */
export function saveAdmins(admins) {
  try {
    localStorage.setItem('sangath_admin_users', JSON.stringify(admins));
  } catch (e) {
    console.error('Error saving admin users', e);
  }
}
