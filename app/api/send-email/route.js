import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const data = await request.json()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
      },
    })

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Hotel Maheshwar's Stay</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px;">MG Road, Maheshwar</p>
              <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">Contact: 9589007200</p>
            </td>
          </tr>

          <!-- Confirmation Message -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 24px;">Booking Confirmation</h2>
              <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
                Dear <strong>${data.guestName}</strong>,<br><br>
                Thank you for choosing Hotel Maheshwar's Stay. We are pleased to confirm your booking with the following details:
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="12" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 6px;">
                <tr style="background-color: #f8f9fa;">
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e; width: 40%;">Guest Name</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">${data.guestName}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Email</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">${data.guestEmail}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Phone</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">${data.guestMobile}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Number of Guests</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">${data.numGuests}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td colspan="2" style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e; padding: 15px 12px 10px 12px;">Room Details:</td>
                </tr>
                ${data.rooms.map((room, index) => `
                  <tr style="${index % 2 === 0 ? '' : 'background-color: #f8f9fa;'}">
                    <td style="border-bottom: 1px solid #e0e0e0; color: #34495e; padding-left: 25px;">
                      ${room.roomTypeName} × ${room.quantity}
                    </td>
                    <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">
                      ₹${parseFloat(room.price).toFixed(2)} × ${room.quantity} = ₹${(parseFloat(room.price) * parseInt(room.quantity)).toFixed(2)}/night
                    </td>
                  </tr>
                `).join('')}
                <tr style="background-color: #e8f4f8;">
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Number of Nights</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50; font-weight: bold;">${data.numNights} Night${data.numNights > 1 ? 's' : ''}</td>
                </tr>
                <tr style="background-color: #f0f4f8;">
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e; font-size: 16px;">Total Amount</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50; font-weight: bold; font-size: 16px;">₹${parseFloat(data.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Advance Paid</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #27ae60; font-weight: bold;">₹${parseFloat(data.advancePaid).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #fff3cd;">
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Amount Left</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #e74c3c; font-weight: bold; font-size: 16px;">₹${parseFloat(data.amountLeft).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #e0e0e0; font-weight: bold; color: #34495e;">Check-in</td>
                  <td style="border-bottom: 1px solid #e0e0e0; color: #2c3e50;">${data.checkInDate} at ${data.checkInTime}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="font-weight: bold; color: #34495e;">Check-out</td>
                  <td style="color: #2c3e50;">${data.checkOutDate} at ${data.checkOutTime}</td>
                </tr>
                ${data.specialRequirements ? `
                <tr>
                  <td colspan="2" style="padding-top: 10px; font-weight: bold; color: #34495e;">Special Requirements:</td>
                </tr>
                <tr>
                  <td colspan="2" style="color: #2c3e50; line-height: 1.6;">${data.specialRequirements}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Footer Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">
                We look forward to welcoming you to Hotel Maheshwar's Stay. If you have any questions or need to make changes to your booking, please contact us at 9589007200.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #95a5a6; font-size: 12px;">
                Hotel Maheshwar's Stay | MG Road, Maheshwar | 9589007200
              </p>
              <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 12px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    await transporter.sendMail({
      from: `"Hotel Maheshwar's Stay" <${process.env.GMAIL_USER}>`,
      to: data.guestEmail,
      subject: `Booking Confirmation - Hotel Maheshwar's Stay`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send email. Please check SMTP settings.' },
      { status: 500 }
    )
  }
}
