import EnvelopeReveal from "@/app/components/EnvelopeReveal";

// Static page: the invitation opens for anyone who has the link.
// All content lives in app/data/invite.ts; link-preview tags are in app/layout.tsx.
export default function Home() {
  return <EnvelopeReveal />;
}
