import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { Avatar, initialsOf } from "../../../registry/ui/avatar";
import { Badge } from "../../../registry/ui/badge";
import { demoTranslator } from "../../i18n/demos";
import type { Locale } from "../../i18n/ui";
import { fadeBottom } from "./fade";

interface Props {
  /** Language of the labels. */
  locale?: Locale;
}

/**
 * A team at a glance: a named stack of Avatars, then members with a role Badge each. The list runs
 * off the bottom of the cell; the rows that fade out are copies, inert and hidden.
 */
export default function TeamBlock({ locale = "en" }: Props) {
  const t = demoTranslator(locale);
  const members = [
    { name: "Ada Lovelace", email: "ada@studio.dev", role: t("Owner"), variant: "default" },
    { name: "Grace Hopper", email: "grace@studio.dev", role: t("Editor"), variant: "secondary" },
    {
      name: "Katherine Johnson",
      email: "katherine@studio.dev",
      role: t("Viewer"),
      variant: "outline",
    },
  ] as const;
  const faded = [
    {
      name: "dorothy@studio.dev",
      email: t("Invited 2 days ago"),
      role: t("Pending"),
      initials: "D",
    },
    { name: "Mary Jackson", email: "mary@studio.dev", role: t("Editor") },
    { name: "Annie Easley", email: "annie@studio.dev", role: t("Viewer") },
    { name: "Margaret Hamilton", email: "margaret@studio.dev", role: t("Viewer") },
  ];

  const row = (person: { name: string; email: string; initials?: string }) => (
    <>
      <Avatar size="sm" alt="" fallback={person.initials ?? initialsOf(person.name)} />
      <span className="min-w-0 flex-1 text-sm">
        <span className="block truncate font-semibold">{person.name}</span>
        <span className="block truncate text-muted-foreground">{person.email}</span>
      </span>
    </>
  );

  return (
    <div
      data-fade
      style={{ "--fade": "120px" } as CSSProperties}
      className={cn("relative -mx-5 mt-4 -mb-5 min-h-0 flex-1 px-5", fadeBottom)}
    >
      <div role="group" aria-label={t("Team members")} className="mb-4 flex">
        {members.map(({ name }) => (
          <Avatar key={name} alt={name} className="-ms-1.5 ring-2 ring-background first:ms-0" />
        ))}
        <Avatar
          alt={t("{count} more members", { count: "8" })}
          fallback="+8"
          className="-ms-1.5 ring-2 ring-background"
        />
      </div>
      <ul className="flex flex-col gap-3">
        {members.map((member) => (
          <li key={member.name} className="flex min-w-0 items-center gap-3">
            {row(member)}
            <Badge variant={member.variant}>{member.role}</Badge>
          </li>
        ))}
        {faded.map((person) => (
          <li
            key={person.name}
            inert
            aria-hidden="true"
            className="flex min-w-0 items-center gap-3"
          >
            {row(person)}
            <Badge variant="outline">{person.role}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
