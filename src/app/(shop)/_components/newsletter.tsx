"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export  function Newsletter() {
  return (
    <section className="mx-auto max-w-screen-xl py-14">
      <Card className="relative mx-4 overflow-hidden rounded-2xl border border-input px-4 py-14 md:mx-8 md:px-8">
        <div className="relative z-10 mx-auto max-w-xl sm:text-center">
          <div className="space-y-3">
            <h3 className="font-heading text-3xl font-semibold tracking-tighter md:text-4xl">
              Subscribe to our newsletter
            </h3>
            <hr className="mb-5 h-px w-1/2 sm:mx-auto" />
            <p className="leading-relaxed">
              Stay up to date with the roadmap progress, announcements and
              exclusive discounts feel free to sign up with your email.
            </p>
          </div>
          <div className="mt-6">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center justify-center rounded-lg bg-accent p-1 transition focus-within:outline-none focus-within:ring-2 focus-within:ring-ring sm:mx-auto sm:max-w-md"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-accent px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0"
              />
              <Button size={"sm"}>Subscribe</Button>
            </form>
            <p className="mt-5 max-w-lg text-[15px] sm:mx-auto">
              No spam ever, we are care about the protection of your data. Read
              our{" "}
              <a className="underline" href="/">
                {" "}
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
