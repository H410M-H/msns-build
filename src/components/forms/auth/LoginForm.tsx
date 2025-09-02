"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { AlertCircle, ChevronRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RedirectMap } from "~/constants";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const LoginForm = () => {
  const router = useRouter();
  const session = useSession();
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (session.data)
      router.push(RedirectMap[session.data?.user.accountType ?? "NONE"] ?? "/");
  }, [router, session]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setAlert(false);
      setSubmitting(true);
      const signInData = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (signInData?.error) setAlert(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
    <div className="overflow-hidden rounded-2xl bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-blue-100/50 dark:bg-slate-900/90 dark:hover:shadow-blue-900/20">
      <div className="relative px-6 pb-8 pt-10 sm:px-10">
        <div className="absolute left-0 top-0 h-2 w-full bg-primary" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 [&_label]:font-heading [&_label]:text-primary"
          >
            {alert && (
              <Alert variant="destructive" className="animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>
                  The email or password you entered is incorrect
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="you@msns.edu.pk" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage className="text-sm font-medium text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => router.push("/forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={visible ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        value={field.value ?? ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => setVisible(!visible)}
                      >
                        {visible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm font-medium text-red-500" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary font-medium tracking-wide shadow-md shadow-primary/20 hover:shadow-primary/30 dark:shadow-primary/30 dark:hover:shadow-primary/40"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <span>Log in</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By logging in, you agree to MSNS-DEV&apos;s
            <a
              href="/terms"
              className="mx-1 text-blue-600 hover:underline dark:text-blue-400"
            >
              Terms of Service
            </a>
            and
            <a
              href="/privacy"
              className="ml-1 text-blue-600 hover:underline dark:text-blue-400"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="h-12 w-full bg-primary/10 dark:bg-primary/5">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white/90 dark:fill-slate-900/90"
          ></path>
        </svg>
      </div>
    </div>
  </div>

  );
};