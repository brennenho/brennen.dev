import { headers } from "next/headers";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui";
import { getAllLinks } from "~/server/queries";
import { LinkForm } from "./form";

export default async function LinkPage() {
  const links = await getAllLinks();
  const headersList = await headers();
  const domain = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col p-4 pt-16">
      <div className="text-2xl font-semibold">Link Shortener</div>
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        <LinkForm />
        <Table className="mx-auto w-3/4">
          <TableCaption>A list of shortened urls</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Shortened Url</TableHead>
              <TableHead className="w-1/2">Target Url</TableHead>
              <TableHead className="text-right">Expiration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <Link href={`${protocol}://${domain}/link/${link.id}`}>
                    {link.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={link.url}>{link.url}</Link>
                </TableCell>
                <TableCell className="text-right">
                  {link.expiresAt?.toLocaleDateString() ?? "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
