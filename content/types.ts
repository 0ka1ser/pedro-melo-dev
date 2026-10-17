export type SectionId =
  | "inicio" | "destaque" | "como-trabalho" | "experiencia" | "stack"
  | "projetos" | "kaiserinc" | "servicos" | "contato";

export interface SectionHead {
  readonly id: SectionId;
  readonly title: string;
  readonly lead?: string;
}

export interface LinkItem { readonly label: string; readonly href: string }

export interface CaseStudy {
  readonly title: string;
  readonly org: string;
  readonly period: string;
  readonly problem: string;
  readonly role: string;
  readonly decisions: readonly string[];
  readonly result: string;
  readonly tags: readonly string[];
  readonly link?: LinkItem;
}

export interface ExperienceItem {
  readonly period: string;
  readonly role: string;
  readonly org: string;
  readonly line: string;
}

export interface Product {
  readonly name: string;
  readonly line: string;
  readonly status: string;
  readonly href?: string;
}

export type ContactErrorCode =
  | "invalid_name" | "invalid_email" | "invalid_message" | "invalid_request"
  | "rate_limited" | "unavailable" | "send_failed" | "offline";

export type ChannelKind = "mail" | "github" | "linkedin" | "phone" | "location";

export interface SiteContent {
  readonly meta: { readonly title: string; readonly description: string };
  readonly nav: {
    readonly links: readonly { readonly id: SectionId; readonly label: string }[];
    readonly contactCta: string;
    readonly langSwitch: { readonly label: string; readonly target: "pt" | "en"; readonly targetName: string };
    readonly menuLabel: string;
  };
  readonly hero: {
    readonly name: string;
    readonly alias: string;
    readonly headline: string;
    readonly bio: string;
    readonly avatarAlt: string;
    readonly ctaProjects: string;
    readonly ctaCv: string;
    readonly cvHref: string;
  };
  readonly featured: SectionHead & {
    readonly cases: readonly CaseStudy[];
    readonly labels: { readonly problem: string; readonly role: string; readonly decisions: string; readonly result: string };
  };
  readonly howIWork: SectionHead & { readonly steps: readonly { readonly title: string; readonly body: string }[] };
  readonly experience: SectionHead & {
    readonly items: readonly ExperienceItem[];
    readonly educationTitle: string;
    readonly education: { readonly course: string; readonly school: string; readonly period: string; readonly honor: string };
    readonly certificationsTitle: string;
    readonly certifications: readonly { readonly name: string; readonly org: string; readonly date: string }[];
  };
  readonly stack: SectionHead & { readonly items: readonly { readonly name: string; readonly icon: string }[] };
  readonly moreProjects: SectionHead & {
    readonly items: readonly { readonly name: string; readonly line: string; readonly href?: string }[];
  };
  readonly kaiserinc: SectionHead & {
    readonly intro: string;
    readonly products: readonly Product[];
    readonly cta: LinkItem;
  };
  readonly services: SectionHead & {
    readonly offers: readonly { readonly title: string; readonly body: string }[];
    readonly cta: string;
  };
  readonly contact: SectionHead & {
    readonly channels: readonly { readonly kind: ChannelKind; readonly label: string; readonly value: string; readonly href?: string }[];
    readonly form: {
      readonly name: string; readonly namePlaceholder: string;
      readonly email: string; readonly emailPlaceholder: string;
      readonly message: string; readonly messagePlaceholder: string;
      readonly submit: string; readonly sending: string; readonly sent: string;
      readonly fallback: string; readonly fallbackHref: string;
      readonly errors: Readonly<Record<ContactErrorCode, string>>;
    };
  };
  readonly footer: { readonly note: string };
  readonly notFound: { readonly title: string; readonly body: string; readonly back: string };
}
