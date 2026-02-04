// @ts-ignore - Type declarations exist but may not be recognized immediately
import Imap from "imap"
// @ts-ignore
import { simpleParser, ParsedMail } from "mailparser"
// @ts-ignore
import nodemailer from "nodemailer"

export interface EmailAccount {
  id: number
  name: string
  email: string
  provider: "gmail" | "outlook" | "imap" | "cpanel"
  imapHost: string
  imapPort: number
  smtpHost: string
  smtpPort: number
  username: string
  password: string
  useTls: boolean
  isActive: boolean
}

export interface SyncedEmail {
  messageId: string
  from: string
  fromName: string | null
  to: string
  subject: string
  body: string
  htmlBody: string | null
  date: Date
  isRead: boolean
  hasAttachments: boolean
  accountId: number
}

const providerDefaults: Record<string, { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number; useTls: boolean }> = {
  gmail: {
    imapHost: "imap.gmail.com",
    imapPort: 993,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    useTls: true
  },
  outlook: {
    imapHost: "outlook.office365.com",
    imapPort: 993,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    useTls: true
  },
  cpanel: {
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 465,
    useTls: true
  },
  imap: {
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 587,
    useTls: true
  }
}

export function getProviderDefaults(provider: string) {
  return providerDefaults[provider] || providerDefaults.imap
}

export async function testImapConnection(account: Partial<EmailAccount>): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const imap = new Imap({
      user: account.username!,
      password: account.password!,
      host: account.imapHost!,
      port: account.imapPort!,
      tls: account.useTls ?? true,
      tlsOptions: { 
        rejectUnauthorized: process.env.NODE_ENV === "production",
        servername: account.imapHost!
      },
      connTimeout: 10000,
      authTimeout: 10000
    })

    imap.once("ready", () => {
      imap.end()
      resolve({ success: true })
    })

    imap.once("error", (err: Error) => {
      resolve({ success: false, error: err.message })
    })

    imap.connect()
  })
}

export async function testSmtpConnection(account: Partial<EmailAccount>): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.username,
        pass: account.password
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
        servername: account.smtpHost
      }
    })

    await transporter.verify()
    return { success: true }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error }
  }
}

export async function fetchEmails(
  account: EmailAccount,
  options: { folder?: string; limit?: number; since?: Date } = {}
): Promise<SyncedEmail[]> {
  const { folder = "INBOX", limit = 50, since } = options

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: account.username,
      password: account.password,
      host: account.imapHost,
      port: account.imapPort,
      tls: account.useTls,
      tlsOptions: { 
        rejectUnauthorized: process.env.NODE_ENV === "production",
        servername: account.imapHost
      }
    })

    const emails: SyncedEmail[] = []

    imap.once("ready", () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          imap.end()
          reject(err)
          return
        }

        const searchCriteria: (string | string[])[] = ["ALL"]
        if (since) {
          searchCriteria.push(["SINCE", since.toDateString()])
        }

        imap.search(searchCriteria, (searchErr, results) => {
          if (searchErr) {
            imap.end()
            reject(searchErr)
            return
          }

          if (results.length === 0) {
            imap.end()
            resolve([])
            return
          }

          const fetchRange = results.slice(-limit)
          const fetch = imap.fetch(fetchRange, { bodies: "", struct: true })

          fetch.on("message", (msg) => {
            msg.on("body", (stream) => {
              // @ts-expect-error - Type compatibility between stream types
              simpleParser(stream, (parseErr: Error | null, parsed: ParsedMail) => {
                if (parseErr) return

                const fromAddress = parsed.from?.value?.[0]
                emails.push({
                  messageId: parsed.messageId || `${Date.now()}-${Math.random()}`,
                  from: fromAddress?.address || "",
                  fromName: fromAddress?.name || null,
                  to: Array.isArray(parsed.to) 
                    ? parsed.to.map(t => t.value.map(v => v.address).join(", ")).join(", ")
                    : parsed.to?.value?.map(v => v.address).join(", ") || "",
                  subject: parsed.subject || "(No Subject)",
                  body: parsed.text || "",
                  htmlBody: parsed.html || null,
                  date: parsed.date || new Date(),
                  isRead: false,
                  hasAttachments: (parsed.attachments?.length || 0) > 0,
                  accountId: account.id
                })
              })
            })
          })

          fetch.once("error", (fetchErr) => {
            imap.end()
            reject(fetchErr)
          })

          fetch.once("end", () => {
            imap.end()
            setTimeout(() => resolve(emails), 500)
          })
        })
      })
    })

    imap.once("error", (err: Error) => {
      reject(err)
    })

    imap.connect()
  })
}

export async function sendEmailViaAccount(
  account: EmailAccount,
  options: { to: string; subject: string; body: string; html?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.username,
        pass: account.password
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
        servername: account.smtpHost
      }
    })

    const result = await transporter.sendMail({
      from: `"${account.name}" <${account.email}>`,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.html || options.body.replace(/\n/g, "<br>")
    })

    return { success: true, messageId: result.messageId }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error"
    return { success: false, error }
  }
}
