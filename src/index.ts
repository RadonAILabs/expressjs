import express, { Request, Response } from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config(); // Load env variables from .env file (optional for local dev)

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY as string);

interface LeadRequestBody {
  name: string;
  email: string;
  phone: string;
  project: string;
  message: string;
}

app.post("/send-email", async (req: Request<{}, {}, LeadRequestBody>, res: Response) => {
  const { name, email, phone, project, message } = req.body;

  try {
    // Email to yourself/team
    await resend.emails.send({
      from: "Live In Dapoli <onboarding@resend.dev>",
      to: ["mayur@radon-media.com", "lakeer@radon-media.com"],
      subject: `New Lead for ${project}`,
      html: `
        <h2>New Lead Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: "Live In Dapoli <noreply@liveindapoli.com>",
      to: [email],
      subject: "Thank you for your inquiry!",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out about <strong>${project}</strong>.</p>
        <p>We'll get back to you shortly!</p>
        <p>– Team Live In Dapoli</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Failed to send emails" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
