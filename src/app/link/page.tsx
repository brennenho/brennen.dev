import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { CopyText, Icons } from "~/components";
import {
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui";
import { getAllLinks } from "~/server/queries";
import { DeleteButton } from "./delete";
import { LinkForm } from "./form";

export default async function LinkPage() {
  const links = await getAllLinks();
  const headersList = await headers();
  const domain = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  async function refresh() {
    "use server";
    revalidatePath("/link");
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col p-4 pt-16">
      <div className="text-2xl font-semibold">Link Shortener</div>
      <SignedOut>
        <div className="m-auto flex flex-col items-center">
          <Icons.lock className="h-10 w-10" />
          <div className="m-4 font-semibold">
            This page is only available to authenticated users.
          </div>
          <SignInButton>
            <Button variant="secondary">Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="absolute right-6 top-16">
            <UserButton afterSignOutUrl="/link" />
          </div>
          <LinkForm onSuccess={refresh} />
          <Table className="mx-auto w-3/4">
            <TableCaption>A list of shortened urls</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Shortened Url</TableHead>
                <TableHead className="w-1/2">Target Url</TableHead>
                <TableHead className="">Expiration</TableHead>
                <TableHead className="text-right">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex flex-row items-center justify-between gap-2">
                      <CopyText
                        text={link.id}
                        target={`${protocol}://${domain}/link/${link.id}`}
                        className="h-full w-full font-semibold"
                      />
                      <Link
                        href={`${protocol}://${domain}/link/${link.id}`}
                        target="_blank"
                      >
                        <Icons.external className="h-4 w-4" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center justify-between gap-2">
                      <CopyText
                        text={link.url}
                        target={link.url}
                        className="h-full w-full"
                      />
                      <Link href={link.url} target="_blank">
                        <Icons.external className="h-4 w-4" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {link.expiresAt?.toLocaleDateString() ?? "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton id={link.id} onSuccess={refresh} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SignedIn>
    </div>
  );
}
