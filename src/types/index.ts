export type JekyllThemeId = 'midnight' | 'dracula' | 'chirpy' | 'cayman' | 'hacker';

export interface JekyllTheme {
  id: JekyllThemeId;
  name: string;
  description: string;
  bgClass: string;
  cardBgClass: string;
  borderClass: string;
  textPrimary: string;
  textMuted: string;
  accentColor: string;
  accentHover: string;
  badgeBg: string;
  codeBg: string;
  headerGradient: string;
}

export interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  displayUrl: string;
  handle?: string;
  category: 'primary' | 'social' | 'developer' | 'community' | 'credentials';
  iconName: string;
  iconText?: string;
  badge?: string;
  badgeVariant?: 'purple' | 'blue' | 'rose' | 'pink' | 'orange' | 'amber' | 'emerald' | 'slate';
  featured?: boolean;
  color?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  formula: string;
  impactText: string;
  tags: string[];
}

export interface TechCategory {
  domain: string;
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  location: string;
  details?: string[];
}

export interface WorkExperience {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer?: string;
  url?: string;
}

export interface AwardItem {
  title: string;
  year?: string;
  organization?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  filename?: string;
  title: string;
  category: string;
  description: string;
}

export interface SkillCompetency {
  id: string;
  name: string;
  category: 'hardware' | 'ai' | 'systems' | 'clinical';
  score: number; // 0 to 100
  level: 'Master' | 'Expert' | 'Advanced';
  years: number;
  highlight: string;
  technologies: string[];
  impactMetric?: string;
}

export interface ClinicalKnowledgeDomain {
  id: string;
  title: string;
  category: 'psychology_dsm5' | 'pharmacology' | 'internal_medicine' | 'vitalstats_synthesis';
  badge: string;
  icon: string;
  summary: string;
  coreConcepts: string[];
  keyApplications: string[];
  caseStudyRef?: string;
}

export interface ProfileData {
  name: string;
  handle: string;
  title: string;
  company: string;
  location: string;
  phone: string;
  emails: string[];
  website: string;
  avatarUrl: string;
  bannerUrl: string;
  galleryPhotos?: GalleryPhoto[];
  bioSummary: string;
  missionStatement: string;
  efficiencyFormulaLatex: string;
  education: Education[];
  experience: WorkExperience[];
  certifications: Certification[];
  awards: AwardItem[];
  memberships: string[];
  links: LinkItem[];
  caseStudies: CaseStudy[];
  techStack: TechCategory[];
  skillCompetencies?: SkillCompetency[];
  clinicalKnowledge?: ClinicalKnowledgeDomain[];
  researchAreas: {
    title: string;
    description: string;
  }[];
  capabilities: {
    title: string;
    icon: string;
    items: {
      heading: string;
      description: string;
    }[];
  }[];
}
