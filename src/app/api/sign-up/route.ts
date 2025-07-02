import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    // Check is username is already taken or not. also check is verified or not

    const { userName, email, password } = await request.json();
    const existingVerifiedUserWithUserName = await UserModel.findOne({
      userName,
      isVerified: true,
    });

    if (existingVerifiedUserWithUserName) {
      return Response.json(
        {
          success: false,
          message: "UserName is already taken...",
        },
        {
          status: 400,
        }
      );
    }

    // Check email is exists or not. also check is verfied are not. if not send new verification code

    const existingVerifiedUserWithEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingVerifiedUserWithEmail) {
      if (existingVerifiedUserWithEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already Exists...",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = bcrypt.hash(password, 10);
        existingVerifiedUserWithEmail.password = await hashedPassword;
        existingVerifiedUserWithEmail.verifyCode = verifyCode;
        existingVerifiedUserWithEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await existingVerifiedUserWithEmail.save();
      }
    } else {
      const hashedPassword = bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        userName,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
    }

    // send verification Email
    const emailResponse = await sendVerificationEmail(
      email,
      userName,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User Registered Successfully. Please verify your account...",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error Registering User: ", error);

    return Response.json(
      {
        success: false,
        message: "Error in Registering User...",
      },
      {
        status: 500,
      }
    );
  }
}
