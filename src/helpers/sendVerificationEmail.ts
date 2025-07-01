import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "<onboarding@resend.dev>",
      to: email,
      subject: "ChatApp | Verification Email",
      react: VerificationEmail({ userName, otp: verifyCode }),
    });

    return {
      success: true,
      message: "Verification Email Sent Successfully...",
    };
  } catch (emailError) {
    console.error("Error in Sending Verification Email: ", emailError);
    return { success: false, message: "Failed to send verification Email..." };
  }
}
