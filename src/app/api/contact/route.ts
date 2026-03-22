import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  serviceRequest?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

function validatePayload(payload: ContactPayload) {
  if (!payload.firstName?.trim()) return 'First Name is required.';
  if (!payload.lastName?.trim()) return 'Last Name is required.';
  if (!payload.email?.trim()) return 'Email Address is required.';
  if (!emailPattern.test(payload.email)) return 'Enter a valid email address.';
  if (!payload.phone?.trim()) return 'Phone Number is required.';
  if (!phonePattern.test(payload.phone)) return 'Enter a valid phone number.';
  return null;
}

function getTransportConfig() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const transportConfig = getTransportConfig();
    const fromAddress = process.env.EMAIL_FROM;
    const toAddress = process.env.EMAIL_TO || 'ops@fywarehouse.com';

    if (!transportConfig || !fromAddress) {
      return NextResponse.json(
        {
          message:
            'Contact form is configured, but outbound email is not enabled yet. Add EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM to activate delivery.',
        },
        { status: 503 },
      );
    }

    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      replyTo: payload.email,
      subject: `FYWarehouse contact form: ${payload.firstName} ${payload.lastName}`,
      text: [
        `First Name: ${payload.firstName}`,
        `Last Name: ${payload.lastName}`,
        `Email Address: ${payload.email}`,
        `Phone Number: ${payload.phone}`,
        '',
        'Service Request:',
        payload.serviceRequest?.trim() || '(no message provided)',
      ].join('\n'),
      html: `
        <p><strong>First Name:</strong> ${payload.firstName}</p>
        <p><strong>Last Name:</strong> ${payload.lastName}</p>
        <p><strong>Email Address:</strong> ${payload.email}</p>
        <p><strong>Phone Number:</strong> ${payload.phone}</p>
        <p><strong>Service Request:</strong></p>
        <p>${(payload.serviceRequest?.trim() || '(no message provided)').replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json({ message: 'Thanks. Our Client Services team will contact you shortly.' });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return NextResponse.json({ message: 'Unable to submit the contact form right now.' }, { status: 500 });
  }
}
