import * as React from "react";
import {
  Body,
  Button,
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

interface PasswordResetEmailProps {
  url: string;
  name: string;
}

// TODO: replace with logo
const LOGO_URL = "https://i.ibb.co/71Nvnn6/zircon.png";

export default function PasswordResetEmail({
  url,
  name,
}: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Password reset from Scents</Preview>
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
              Reset your password
            </Heading>
            <Text className="text-justify">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="text-justify text-sm">
              We received a request to reset the password for your account.
              Click the button below to reset your password.
            </Text>

            <Button
              href={url}
              className="rounded-md bg-sky-500 px-6 py-2.5 text-white"
            >
              Reset password
            </Button>

            <Text className="text-justify text-[15px] text-neutral-600">
              If you didn&apos;t request this, you can safely ignore this email.
            </Text>
            <Text className="text-xs text-neutral-500">
              Note: This link will expire in 15 minutes.
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
