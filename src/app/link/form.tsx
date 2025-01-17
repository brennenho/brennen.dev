"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import { genericError } from "~/lib/errors";

const formSchema = z.object({
  short: z
    .string()
    .max(30, {
      message: "Short links have a max of 30 characters",
    })
    .optional(),
  target: z.string().url(),
  expiresAt: z.enum(["24 hours", "7 days", "30 days", "12 months", "Never"]),
});

interface LinkFormProps {
  onSuccess: () => Promise<void>;
}

export function LinkForm({ onSuccess }: LinkFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      short: "",
      target: "",
      expiresAt: "Never",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/link/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok)
        toast.error("Unable to add link. Please try again later.");

      await onSuccess();
      form.reset();
    } catch {
      genericError();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-3/4 flex-col items-center gap-4 md:flex-row md:items-start"
      >
        <FormField
          control={form.control}
          name="short"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormControl>
                <Input placeholder="short link" {...field} />
              </FormControl>
              <FormDescription>
                Leave blank to generate a random link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormControl>
                <Input placeholder="target link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/3">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Never">Never</SelectItem>
                  <SelectItem value="24 hours">24 hours</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Link expiration</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
