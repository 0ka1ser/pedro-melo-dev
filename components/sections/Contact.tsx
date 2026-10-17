import { BriefcaseBusiness, GitFork, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { Section, textLink } from "@/components/site/Section";
import type { ChannelKind, SiteContent } from "@/content/types";

// ponytail: lucide 1.x não tem ícones de marca (Github/Linkedin); ícones genéricos até a rodada do Contato.
const icons: Record<ChannelKind, typeof Mail> = {
  mail: Mail,
  github: GitFork,
  linkedin: BriefcaseBusiness,
  phone: Phone,
  location: MapPin,
};

export function Contact({ content }: { content: SiteContent["contact"] }) {
  return (
    <Section head={content}>
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="grid content-start gap-4">
          {content.channels.map((channel) => {
            const Icon = icons[channel.kind];
            return (
              <li key={channel.kind} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm text-subtle-foreground">{channel.label}</p>
                  {channel.href ? (
                    <a href={channel.href} className={`break-words ${textLink}`}>
                      {channel.value}
                    </a>
                  ) : (
                    <p>{channel.value}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <ContactForm form={content.form} />
      </div>
    </Section>
  );
}
