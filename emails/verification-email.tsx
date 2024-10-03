import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  code: string;
}

// TODO: replace with logo
const LOGO_URL = "https://i.ibb.co/71Nvnn6/zircon.png";

export default function VerificationEmail({ code }: VerificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email.</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto w-full max-w-lg font-sans">
          <Container className="mx-auto rounded px-6 py-20">
            <Img
              src={LOGO_URL}
              alt="scents"
              height={45}
              className="object-contain"
            />
            <Heading as="h2" className="mt-6">
              Confirm your email address
            </Heading>
            <Text className="text-justify">
              Your confirmation code is below - enter it in your open browser
              window to verify your email address.
            </Text>
            <div className="w-auto rounded-lg border border-solid border-neutral-400/25 bg-neutral-500/5 px-6">
              <pre className="mx-auto text-center text-xl tracking-widest">
                {code}
              </pre>
            </div>

            <Text className="text-justify text-[15px] text-neutral-600">
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>
            <Text className="text-xs text-neutral-500">
              Note: This code will expire in 15 minutes.
            </Text>

            <Hr className="mx-0 my-4 w-full border border-solid border-neutral-500/10" />
            <Text className="text-xs text-neutral-500/75">
              © {new Date().getFullYear()} Scents™. All Rights Reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
