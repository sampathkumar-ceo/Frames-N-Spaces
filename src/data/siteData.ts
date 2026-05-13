import { supabase } from "@/lib/supabase";
// ============================================
// Frames n Spaces — Central Data Store
// Premium Consultancy & Advisory
// ============================================

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  features: string[];
  imageUrl: string;
}

export interface Execution {
  id: string;
  title: string;
  client: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
  year: string;
  sqft: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface HeroData {
  heading1: string;
  heading2: string;
  headingAccent: string;
  subtitle: string;
  imageUrl: string;
}

export interface AboutData {
  heading: string;
  headingAccent: string;
  description1: string;
  description2: string;
  imageUrl: string;
}

export interface SiteData {
  hero: HeroData;
  about: AboutData;
  services: Service[];
  executions: Execution[];
  blogs: BlogPost[];
  testimonials: Testimonial[];
  stats: Stat[];
  whatWeDo: WhatWeDoItem[];
  threatsToStrengths: ThreatToStrengthItem[];
  clientele: { name: string; logo: string }[];
  adminPasscode?: string;
}

export interface ThreatToStrengthItem {
  id: string;
  title: string;
  details: string;
}

export interface WhatWeDoItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}



// ── Defaults ─────────

export const defaultHero: HeroData = {
  heading1: "Precision",
  heading2: "in Every",
  headingAccent: "Corner",
  subtitle: "Expert project management consultancy & advisory for high-performance workspace solutions. We empower architects and corporates with precision-driven expertise across India.",
  imageUrl: "/images/hero-bg.png",
};

export const defaultAbout: AboutData = {
  heading: "PROJECT CONSULTANCY,",
  headingAccent: "",
  description1: "FramesNspaces is a trusted project partner delivering integrated interior design advisory, project management consultancy, and turnkey execution solutions. Leveraging global best practices, we serve diverse sectors including corporate, industrial, institutional and hospitality. Our approach is tailored to each client’s unique vision, operational needs and project objectives ensuring efficient execution, value optimization, and lasting impact.",
  description2: "OUR VISION: To become India’s most trusted Project Management Consultancy, delivering structured governance, intelligent design integration, and seamless turnkey execution across diverse sectors. To redefine project delivery standards in India by integrating design intelligence, project management expertise, and turnkey execution into a seamless, value-driven experience. | OUR MISSION: At Frames n Spaces, we are dedicated to being the industry's MOST RESPONSIVE ORGANISATION. We deliver exceptional QUALITY in project management consultancy (PMC), and design-build services, while fostering an environment that enhances employee skills and professional growth. Ensuring exceptional products and services providing COMMITMENT TO DELIVERY",
  imageUrl: "/images/about.png",
};

export const defaultWhatWeDo: WhatWeDoItem[] = [
  {
    id: "wwd1",
    title: "SMART PLANNING",
    description: "Comprehensive spatial analysis and AI-driven strategic programming. We use advanced AI tools to optimize project scheduling, ensuring faster turnaround times and more accurate resource allocation.",
    imageUrl: "/images/exec1.png",
  },
  {
    id: "wwd2",
    title: "VALUE ENGINEERING",
    description: "Optimizing costs without compromising quality through intelligent material selection and efficient execution workflows. We identify opportunities for cost-saving that maintain aesthetic and functional integrity.",
    imageUrl: "/images/exec2.png",
  },
  {
    id: "wwd3",
    title: "FUNCTIONAL OPTIMISATION",
    description: "Designing environments that enhance productivity and flow, ensuring every square foot serves a clear operational purpose. Our goal is to eliminate friction in the physical workspace.",
    imageUrl: "/images/exec3.png",
  },
  {
    id: "wwd4",
    title: "TECHNOLOGY INTEGRATION",
    description: "Embedding smart solutions and future-ready infrastructure into the physical environment for a truly modern workspace. From IoT sensors to advanced AV systems, we bridge the gap between physical and digital.",
    imageUrl: "/images/exec4.png",
  },
];



export const defaultThreatsToStrengths: ThreatToStrengthItem[] = [
  {
    id: "ts1",
    title: "Risk Management Experts",
    details: "We anticipate and mitigate project risks through rigorous assessment, contingency planning, and proactive governance, ensuring project stability even in volatile environments."
  },
  {
    id: "ts2",
    title: "Cost Control Specialist",
    details: "Our advisory team implements granular financial tracking and strategic procurement to prevent budget overruns and maximize ROI for every project."
  },
  {
    id: "ts3",
    title: "Value Engineering Expert",
    details: "We optimize material selection and execution methods to deliver high-quality results while reducing unnecessary expenditures through design intelligence."
  },
  {
    id: "ts4",
    title: "Structured Reporting & Consultant",
    details: "Transparent, data-driven reporting ensures all stakeholders are aligned, providing clarity and confidence throughout the project lifecycle."
  }
];

export const defaultClientele: { name: string; logo: string }[] = [
  { name: "Coromandel", logo: "" },
  { name: "NAGARJUNA NACL", logo: "" },
  { name: "ALLEGRO Microsystems", logo: "" },
  { name: "Wellknox", logo: "" },
  { name: "Apple", logo: "" },
  { name: "Kaara", logo: "" },
  { name: "Hallmark Health Care", logo: "" },
  { name: "NanoHealth", logo: "" },
  { name: "Infinite", logo: "" },
  { name: "Watania Solutions", logo: "" },
  { name: "Cubic", logo: "" },
];

export const defaultServices: Service[] = [
  {
    id: "s1",
    title: "Strategic Advisory",
    subtitle: "Consultancy and Advisory",
    description: "Expert consultancy and advisory for planning and optimizing high-performance workspaces. We provide strategic guidance on space utilization, workflow design, and environment psychology to maximize productivity.",
    icon: "◈",
    features: ["Workspace Strategy & Planning", "Consultancy and Advisory Services", "Budget Advisory & Cost Optimization", "Compliance & Regulatory Guidance"],
    imageUrl: "/images/exec1.png",
  },
  {
    id: "s2",
    title: "Design Consultancy",
    subtitle: "Vision to Reality",
    description: "Premium design advisory that bridges architectural vision with functional precision. Our consultants work alongside your team to create workspaces that inspire productivity and reflect your brand identity.",
    icon: "◇",
    features: ["Design Direction & Concept Development", "Material & System Specification", "Vendor Evaluation & Selection", "Quality Benchmarking Standards"],
    imageUrl: "/images/exec2.png",
  },
  {
    id: "s3",
    title: "Project Management Consultancy",
    subtitle: "End-to-End Oversight",
    description: "Comprehensive project management advisory ensuring effective execution through process control, financial oversight, and seamless client handover.",
    icon: "◆",
    features: ["Financial Control & Budget Intelligence", "Process Control & Quality Assurance", "Execution Oversight & Coordination", "Risk Assessment & Mitigation"],
    imageUrl: "/images/exec3.png",
  },
  {
    id: "s4",
    title: "Technical Advisory",
    subtitle: "Precision Engineering",
    description: "Specialized consultancy on high-performance partition systems, acoustic solutions, and smart workspace technologies.",
    icon: "◊",
    features: ["Partition System Specification", "Acoustic Performance Consulting", "Smart Workspace Technology Advisory", "Sustainability & Green Certification"],
    imageUrl: "/images/exec4.png",
  },
];

export const defaultExecutions: Execution[] = [
  {
    id: "e1",
    title: "Nexus Corporate Hub",
    client: "Infosys BPO",
    location: "Hyderabad, India",
    category: "Corporate Office",
    description: "Strategic consultancy for a transformative 45,000 sq.ft. corporate workspace featuring frameless glass partitions, acoustic pods, and an open-plan layout.",
    imageUrl: "/images/exec1.png",
    year: "2024",
    sqft: "45,000",
  },
  {
    id: "e2",
    title: "Meridian Tech Park",
    client: "Wipro Technologies",
    location: "Bangalore, India",
    category: "IT Campus",
    description: "Advisory and project management for the entire 3rd floor redesign with high-performance demountable partitions.",
    imageUrl: "/images/exec2.png",
    year: "2024",
    sqft: "32,000",
  },
  {
    id: "e3",
    title: "Skyline Financial Center",
    client: "HDFC Securities",
    location: "Mumbai, India",
    category: "Financial Office",
    description: "Premium consultancy for glass and aluminium partition specification across 6 floors, featuring switchable privacy glass.",
    imageUrl: "/images/exec3.png",
    year: "2023",
    sqft: "78,000",
  },
  {
    id: "e4",
    title: "Zenith Innovation Lab",
    client: "Tech Mahindra",
    location: "Pune, India",
    category: "Innovation Center",
    description: "End-to-end advisory for a cutting-edge innovation lab with modular partition systems allowing rapid reconfiguration.",
    imageUrl: "/images/exec4.png",
    year: "2023",
    sqft: "28,000",
  },
  {
    id: "e5",
    title: "Horizon Co-Working Space",
    client: "WeWork India",
    location: "Gurgaon, India",
    category: "Co-Working",
    description: "Strategic advisory for a dynamic co-working environment with 200+ workstations, phone booths, and collaborative zones.",
    imageUrl: "/images/exec1.png",
    year: "2024",
    sqft: "55,000",
  },
  {
    id: "e6",
    title: "Apex Leadership Suite",
    client: "Deloitte India",
    location: "Hyderabad, India",
    category: "Executive Suite",
    description: "Premium consultancy for an ultra-premium executive suite featuring floor-to-ceiling acoustic partitions with integrated blinds.",
    imageUrl: "/images/exec2.png",
    year: "2025",
    sqft: "18,000",
  },
];

export const defaultBlogs: BlogPost[] = [
  {
    id: "b1",
    title: "The Future of Workspace Consultancy: AI Meets Design",
    excerpt: "Explore how AI-driven analytics and smart consultancy approaches are reshaping modern workspace planning.",
    content: "The workspace consultancy industry is undergoing a radical transformation. AI-driven analytics, combined with IoT sensors and behavioral data, are creating advisory frameworks that adapt to the actual needs of organizations.",
    author: "Frames n Spaces Team",
    date: "2025-03-15",
    category: "Innovation",
    imageUrl: "/images/exec3.png",
    featured: true,
  },
  {
    id: "b2",
    title: "Why Acoustic Consulting Matters in Open-Plan Offices",
    excerpt: "Understanding the critical role of sound management advisory in creating productive work environments.",
    content: "Open-plan offices promised collaboration but delivered distraction. Studies show that noise is the number one complaint in modern workplaces.",
    author: "Frames n Spaces Team",
    date: "2025-02-20",
    category: "Advisory",
    imageUrl: "/images/exec4.png",
    featured: false,
  },
  {
    id: "b3",
    title: "Sustainable Workspaces: Green Consultancy for Modern Offices",
    excerpt: "How our sustainable advisory practices are shaping the next generation of eco-friendly office environments.",
    content: "Sustainability is no longer optional in commercial workspace design. From recycled aluminium frames to FSC-certified timber partitions.",
    author: "Frames n Spaces Team",
    date: "2025-01-10",
    category: "Sustainability",
    imageUrl: "/images/exec1.png",
    featured: false,
  },
  {
    id: "b4",
    title: "From Blueprint to Reality: Our PMC Advisory Process",
    excerpt: "A behind-the-scenes look at how our Project Management Consultancy ensures flawless execution.",
    content: "Every great office space starts with a vision, but it's the advisory and execution oversight that separates good from exceptional.",
    author: "Frames n Spaces Team",
    date: "2024-12-05",
    category: "Consultancy",
    imageUrl: "/images/exec2.png",
    featured: false,
  },
];

export const defaultTestimonials: Testimonial[] = [
  { id: "t1", name: "Venkat Ramana", location: "Hyderabad, India", text: "Frames n Spaces' consultancy transformed our entire approach to office design. Their advisory expertise in partition solutions is unmatched.", rating: 5 },
  { id: "t2", name: "Aditi Sharma", location: "Mumbai, India", text: "The advisory team at Frames n Spaces delivered exceptional consulting insights. Their strategic recommendations made our workspace transformation seamless.", rating: 5 },
  { id: "t3", name: "Raj Patel", location: "Delhi, India", text: "Working with Frames n Spaces' consultancy was a game-changer. Their expert advisory on design and technical specifications exceeded our expectations.", rating: 5 },
  { id: "t4", name: "Chandra Sekhar", location: "Bangalore, India", text: "Outstanding consultancy and professional advisory. Their expertise in partition system specification completely transformed our workspace.", rating: 5 },
];

export const defaultStats: Stat[] = [
  { id: "st1", value: 150, suffix: "+", label: "CLIENTS ADVISED" },
  { id: "st2", value: 100000, suffix: "", label: "SQFT COMPLETED" },
  { id: "st3", value: 10, suffix: "+", label: "CORPORATE CLIENTS" },
  { id: "st4", value: 4, suffix: "+", label: "CITIES IN INDIA" },
];

// ── localStorage helpers ──────────────────────────────

const STORAGE_KEY = "fns_site_data";
const VERSION_KEY = "fns_data_version";
const DATA_VERSION = "7"; // Bump this to force a data reset when defaults change
const PASSCODE_KEY = "fns_admin_passcode";
const AUTH_KEY = "fns_admin_auth";

export async function getSiteData(): Promise<SiteData> {
  const defaults = {
    hero: defaultHero,
    about: defaultAbout,
    services: defaultServices,
    executions: defaultExecutions,
    blogs: defaultBlogs,
    testimonials: defaultTestimonials,
    stats: defaultStats,
    whatWeDo: defaultWhatWeDo,
    threatsToStrengths: defaultThreatsToStrengths,
    clientele: defaultClientele,
    adminPasscode: undefined,
  };

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (data && data.data) {
      const parsed = data.data;
      return {
        hero: parsed.hero || defaultHero,
        about: parsed.about || defaultAbout,
        services: parsed.services || defaultServices,
        executions: parsed.executions || defaultExecutions,
        blogs: parsed.blogs || defaultBlogs,
        testimonials: parsed.testimonials || defaultTestimonials,
        stats: parsed.stats || defaultStats,
        whatWeDo: parsed.whatWeDo || defaultWhatWeDo,
        threatsToStrengths: parsed.threatsToStrengths || defaultThreatsToStrengths,
        clientele: parsed.clientele || defaultClientele,
        adminPasscode: parsed.adminPasscode || undefined,
      };
    }
  } catch (err) {
    console.error('Error fetching from supabase:', err);
  }

  return defaults as SiteData;
}

export async function saveSiteData(data: SiteData): Promise<{ success: boolean; error?: string }> {
  const passcode = getPasscode();
  try {
    const res = await fetch('/api/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, data })
    });
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Error saving:', err);
    return { success: false, error: 'Network error' };
  }
}

export function getPasscode(): string {
  if (typeof window === "undefined") return "admin@12345";
  return localStorage.getItem(PASSCODE_KEY) || "";
}

export function setPasscode(newPasscode: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASSCODE_KEY, newPasscode);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function setAdminAuth(auth: boolean): void {
  if (typeof window === "undefined") return;
  if (auth) {
    localStorage.setItem(AUTH_KEY, "true");
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
