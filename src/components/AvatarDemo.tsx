import { Avatar } from "../../registry/ui/avatar";

// A tiny engraved-style portrait, inlined so the demo needs no image file.
const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#e3ded5"/><circle cx="20" cy="15" r="7" fill="#1a1714"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#1a1714"/></svg>',
)}`;

/** An image, initials with no image, initials after a broken image, and a decorative avatar. */
export default function AvatarDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={portrait} alt="Ada Lovelace" size="lg" />
        <Avatar alt="Grace Hopper" />
        {/* This file does not exist, so the avatar falls back to initials. */}
        <Avatar src="/avatars/katherine-johnson.png" alt="Katherine Johnson" size="sm" />
      </div>
      <p className="flex items-center gap-2 text-sm">
        {/* The name is right next to it, so the avatar is decorative. */}
        <Avatar alt="" fallback="DV" size="sm" />
        Dorothy Vaughan
      </p>
    </div>
  );
}
