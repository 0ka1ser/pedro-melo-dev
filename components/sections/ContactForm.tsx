"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContactErrorCode, SiteContent } from "@/content/types";
import { contactSchema } from "@/lib/contact-schema";

type FieldName = "name" | "email" | "message";
type FormState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; code: ContactErrorCode; field?: FieldName };

export function ContactForm({ form }: { form: SiteContent["contact"]["form"] }) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const ids = { name: useId(), email: useId(), message: useId(), status: useId() };

  const codes = Object.keys(form.errors) as ContactErrorCode[];
  const toCode = (code: unknown): ContactErrorCode =>
    codes.includes(code as ContactErrorCode) ? (code as ContactErrorCode) : "send_failed";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;

    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(formEl)));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setState({ status: "error", code: toCode(issue?.message), field: issue?.path[0] as FieldName | undefined });
      return;
    }

    setState({ status: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
        setState({ status: "error", code: toCode(body?.error) });
        return;
      }
      setState({ status: "sent" });
      toast(form.sent);
      formEl.reset();
    } catch {
      setState({ status: "error", code: "offline" });
    }
  }

  const sending = state.status === "sending";
  const invalid = (field: FieldName) => (state.status === "error" && state.field === field ? true : undefined);
  const describedBy = (field: FieldName) => (invalid(field) ? ids.status : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <Field>
        <FieldLabel htmlFor={ids.name}>{form.name}</FieldLabel>
        <Input
          id={ids.name}
          name="name"
          type="text"
          autoComplete="name"
          placeholder={form.namePlaceholder}
          aria-invalid={invalid("name")}
          aria-describedby={describedBy("name")}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={ids.email}>{form.email}</FieldLabel>
        <Input
          id={ids.email}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={form.emailPlaceholder}
          aria-invalid={invalid("email")}
          aria-describedby={describedBy("email")}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={ids.message}>{form.message}</FieldLabel>
        <Textarea
          id={ids.message}
          name="message"
          maxLength={1500}
          placeholder={form.messagePlaceholder}
          aria-invalid={invalid("message")}
          aria-describedby={describedBy("message")}
        />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p id={ids.status} role="status" aria-live="polite" className="min-h-5 text-sm">
          {state.status === "sent" ? <span className="text-success">{form.sent}</span> : null}
          {state.status === "error" ? (
            <span className="text-destructive">
              {form.errors[state.code]}{" "}
              <a
                href={form.fallbackHref}
                className="underline underline-offset-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {form.fallback}
              </a>
            </span>
          ) : null}
        </p>
        <Button type="submit" loading={sending}>
          {sending ? form.sending : form.submit}
        </Button>
      </div>
    </form>
  );
}
