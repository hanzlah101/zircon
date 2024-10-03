import { Resend } from "resend";
import { ZSAError } from "zsa";
import { env } from "@/env";

export const resend = new Resend(env.RESEND_API_KEY);

type SendEmailProps = {
  subject: string;
  to: string;
  react: JSX.Element;
};

export async function sendEmail(props: SendEmailProps) {
  const { error } = await resend.emails.send({
    from: "Scents <onboarding@resend.dev>",
    ...props,
  });

  if (error) {
    throw new ZSAError(
      "INTERNAL_SERVER_ERROR",
      "Error sending email, try again later",
    );
  }
}
