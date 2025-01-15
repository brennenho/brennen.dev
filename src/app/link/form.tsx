"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
} from "~/components/ui";

const formSchema = z.object({
  short: z.string().min(1).max(30).optional(),
  target: z.string().url(),
});

export function LinkForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      short: "",
      target: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-3/4 flex-row justify-center gap-4"
      >
        <FormField
          control={form.control}
          name="short"
          render={({ field }) => (
            <FormItem className="w-1/2">
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
            <FormItem className="w-1/2">
              <FormControl>
                <Input placeholder="target link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
