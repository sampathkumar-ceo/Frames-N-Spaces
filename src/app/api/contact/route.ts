import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, message, company } = await req.json();

        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "info@framesnspaces.com",
            subject: `New Contact - ${name}`,
            text: `
New lead received:

Name: ${name}
Email: ${email}
Company: ${company || "N/A"}

Message:
${message}
      `,
        });

        console.log("Email sent:", response);

        return Response.json({
            success: true,
        });

    } catch (error) {
        console.error(
            "Resend email error:",
            JSON.stringify(error, null, 2)
        );

        return Response.json(
            {
                success: false,
                error,
            },
            { status: 500 }
        );
    }
}