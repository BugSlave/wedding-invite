import type { Metadata } from "next";
import { headers } from "next/headers";
import { getGuest } from "@/lib/supabase";
import { getInvite } from "@/lib/invites";
import { InviteProvider } from "@/app/components/InviteContext";
import EnvelopeReveal from "@/app/components/EnvelopeReveal";

type SearchParams = Promise<{ id?: string }>;

// Personalised link preview (WhatsApp / social): "Himanshu, you're invited!".
// Guests who aren't on the list get a neutral preview that reveals nothing.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { id } = await searchParams;
  const guest = id ? await getGuest(id) : null;

  const { data: inviteData } = await getInvite();
  const { couple, mainEvent, additionalEvents, social } = inviteData;
  const names = `${couple.groomName} & ${couple.brideName}`;

  if (!guest) {
    return {
      title: "Wedding Invitation",
      description: "A personal invitation.",
      openGraph: { title: "Wedding Invitation", description: "A personal invitation.", images: [{ url: social.imagePath }] },
    };
  }

  const wedding = additionalEvents.find((e) => e.id === "marriage") ?? mainEvent;
  const title = `${guest.name}, you're invited! 💌`;
  const description = `${names} invite you to celebrate on ${wedding.date} at ${wedding.venue}, ${wedding.address}.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: social.imagePath }], type: "website", siteName: names },
    twitter: { card: "summary_large_image", title, description, images: [social.imagePath] },
  };
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { id } = await searchParams;

  let guestName: string | null = null;
  let relation: string | null = null;
  let invalidId = false;

  if (id) {
    const guest = await getGuest(id);
    if (guest) {
      guestName = guest.name;
      relation = guest.relation;
    } else {
      invalidId = true;
    }
  }

  // On localhost the invitation opens without a guest id (for development).
  // On any public URL, only guests on the list can see it.
  const host = ((await headers()).get("host") ?? "").replace(/:\d+$/, "");
  const isLocal =
    process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1" || host === "[::1]");

  const invite = await getInvite();

  return (
    <InviteProvider value={invite.data}>
      <EnvelopeReveal
        guestName={guestName}
        guestId={guestName ? id : null}
        relation={relation}
        invalidId={invalidId}
        allowWithoutGuest={isLocal}
      />
    </InviteProvider>
  );
}
