"use server";

import { Resend } from "resend";
import ResetPasswordEmail from "./reset-password-email";
import { SENDER_EMAIL } from "@/constants";
import { user } from "@/types";

export async function sendResetPasswordEmail(user: user, resetToken: string) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://strathspace.vercel.app"
      : "http://localhost:3000";

  const resetLink = `${baseUrl}/reset-password/${resetToken}`;

  const resend = new Resend(process.env.RESEND_API_KEY as string);

  await resend.emails.send({
    from: SENDER_EMAIL,
    to: user.email,
    subject: "Reset Your Password",
    react: (
      <ResetPasswordEmail user={user} resetLink={resetLink} />
    ),
  });
}
