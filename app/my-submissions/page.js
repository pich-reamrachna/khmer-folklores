import { redirect } from "next/navigation";

// The old "My Submissions" address. Its list is now the "Stories you started"
// section of /my-entries, so old links and bookmarks are forwarded there,
// keeping ?submitted so the thank-you box still shows.
export default async function MySubmissionsPage({ searchParams }) {
  const { submitted } = await searchParams;
  redirect(submitted ? `/my-entries?submitted=${encodeURIComponent(submitted)}` : "/my-entries");
}
