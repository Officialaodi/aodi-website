export async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  
  if (!secret) {
    console.log("CAPTCHA verification skipped - HCAPTCHA_SECRET_KEY not configured")
    return true
  }

  if (!token) {
    console.log("CAPTCHA token missing")
    return false
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("CAPTCHA verification error:", error)
    return false
  }
}
