const timezoneToCountry: Record<string, { country: string; continent: string }> = {
  "Africa/Abidjan": { country: "Ivory Coast", continent: "Africa" },
  "Africa/Accra": { country: "Ghana", continent: "Africa" },
  "Africa/Addis_Ababa": { country: "Ethiopia", continent: "Africa" },
  "Africa/Algiers": { country: "Algeria", continent: "Africa" },
  "Africa/Asmara": { country: "Eritrea", continent: "Africa" },
  "Africa/Bamako": { country: "Mali", continent: "Africa" },
  "Africa/Bangui": { country: "Central African Republic", continent: "Africa" },
  "Africa/Banjul": { country: "Gambia", continent: "Africa" },
  "Africa/Bissau": { country: "Guinea-Bissau", continent: "Africa" },
  "Africa/Blantyre": { country: "Malawi", continent: "Africa" },
  "Africa/Brazzaville": { country: "Congo", continent: "Africa" },
  "Africa/Bujumbura": { country: "Burundi", continent: "Africa" },
  "Africa/Cairo": { country: "Egypt", continent: "Africa" },
  "Africa/Casablanca": { country: "Morocco", continent: "Africa" },
  "Africa/Ceuta": { country: "Spain", continent: "Europe" },
  "Africa/Conakry": { country: "Guinea", continent: "Africa" },
  "Africa/Dakar": { country: "Senegal", continent: "Africa" },
  "Africa/Dar_es_Salaam": { country: "Tanzania", continent: "Africa" },
  "Africa/Djibouti": { country: "Djibouti", continent: "Africa" },
  "Africa/Douala": { country: "Cameroon", continent: "Africa" },
  "Africa/El_Aaiun": { country: "Western Sahara", continent: "Africa" },
  "Africa/Freetown": { country: "Sierra Leone", continent: "Africa" },
  "Africa/Gaborone": { country: "Botswana", continent: "Africa" },
  "Africa/Harare": { country: "Zimbabwe", continent: "Africa" },
  "Africa/Johannesburg": { country: "South Africa", continent: "Africa" },
  "Africa/Juba": { country: "South Sudan", continent: "Africa" },
  "Africa/Kampala": { country: "Uganda", continent: "Africa" },
  "Africa/Khartoum": { country: "Sudan", continent: "Africa" },
  "Africa/Kigali": { country: "Rwanda", continent: "Africa" },
  "Africa/Kinshasa": { country: "Democratic Republic of the Congo", continent: "Africa" },
  "Africa/Lagos": { country: "Nigeria", continent: "Africa" },
  "Africa/Libreville": { country: "Gabon", continent: "Africa" },
  "Africa/Lome": { country: "Togo", continent: "Africa" },
  "Africa/Luanda": { country: "Angola", continent: "Africa" },
  "Africa/Lubumbashi": { country: "Democratic Republic of the Congo", continent: "Africa" },
  "Africa/Lusaka": { country: "Zambia", continent: "Africa" },
  "Africa/Malabo": { country: "Equatorial Guinea", continent: "Africa" },
  "Africa/Maputo": { country: "Mozambique", continent: "Africa" },
  "Africa/Maseru": { country: "Lesotho", continent: "Africa" },
  "Africa/Mbabane": { country: "Eswatini", continent: "Africa" },
  "Africa/Mogadishu": { country: "Somalia", continent: "Africa" },
  "Africa/Monrovia": { country: "Liberia", continent: "Africa" },
  "Africa/Nairobi": { country: "Kenya", continent: "Africa" },
  "Africa/Ndjamena": { country: "Chad", continent: "Africa" },
  "Africa/Niamey": { country: "Niger", continent: "Africa" },
  "Africa/Nouakchott": { country: "Mauritania", continent: "Africa" },
  "Africa/Ouagadougou": { country: "Burkina Faso", continent: "Africa" },
  "Africa/Porto-Novo": { country: "Benin", continent: "Africa" },
  "Africa/Sao_Tome": { country: "Sao Tome and Principe", continent: "Africa" },
  "Africa/Tripoli": { country: "Libya", continent: "Africa" },
  "Africa/Tunis": { country: "Tunisia", continent: "Africa" },
  "Africa/Windhoek": { country: "Namibia", continent: "Africa" },
  "America/Adak": { country: "United States", continent: "North America" },
  "America/Anchorage": { country: "United States", continent: "North America" },
  "America/Bogota": { country: "Colombia", continent: "South America" },
  "America/Buenos_Aires": { country: "Argentina", continent: "South America" },
  "America/Caracas": { country: "Venezuela", continent: "South America" },
  "America/Chicago": { country: "United States", continent: "North America" },
  "America/Denver": { country: "United States", continent: "North America" },
  "America/Lima": { country: "Peru", continent: "South America" },
  "America/Los_Angeles": { country: "United States", continent: "North America" },
  "America/Mexico_City": { country: "Mexico", continent: "North America" },
  "America/New_York": { country: "United States", continent: "North America" },
  "America/Phoenix": { country: "United States", continent: "North America" },
  "America/Santiago": { country: "Chile", continent: "South America" },
  "America/Sao_Paulo": { country: "Brazil", continent: "South America" },
  "America/Toronto": { country: "Canada", continent: "North America" },
  "America/Vancouver": { country: "Canada", continent: "North America" },
  "Asia/Bangkok": { country: "Thailand", continent: "Asia" },
  "Asia/Dhaka": { country: "Bangladesh", continent: "Asia" },
  "Asia/Dubai": { country: "United Arab Emirates", continent: "Asia" },
  "Asia/Ho_Chi_Minh": { country: "Vietnam", continent: "Asia" },
  "Asia/Hong_Kong": { country: "Hong Kong", continent: "Asia" },
  "Asia/Jakarta": { country: "Indonesia", continent: "Asia" },
  "Asia/Jerusalem": { country: "Israel", continent: "Asia" },
  "Asia/Karachi": { country: "Pakistan", continent: "Asia" },
  "Asia/Kolkata": { country: "India", continent: "Asia" },
  "Asia/Kuala_Lumpur": { country: "Malaysia", continent: "Asia" },
  "Asia/Manila": { country: "Philippines", continent: "Asia" },
  "Asia/Seoul": { country: "South Korea", continent: "Asia" },
  "Asia/Shanghai": { country: "China", continent: "Asia" },
  "Asia/Singapore": { country: "Singapore", continent: "Asia" },
  "Asia/Taipei": { country: "Taiwan", continent: "Asia" },
  "Asia/Tokyo": { country: "Japan", continent: "Asia" },
  "Australia/Brisbane": { country: "Australia", continent: "Oceania" },
  "Australia/Melbourne": { country: "Australia", continent: "Oceania" },
  "Australia/Perth": { country: "Australia", continent: "Oceania" },
  "Australia/Sydney": { country: "Australia", continent: "Oceania" },
  "Europe/Amsterdam": { country: "Netherlands", continent: "Europe" },
  "Europe/Athens": { country: "Greece", continent: "Europe" },
  "Europe/Berlin": { country: "Germany", continent: "Europe" },
  "Europe/Brussels": { country: "Belgium", continent: "Europe" },
  "Europe/Bucharest": { country: "Romania", continent: "Europe" },
  "Europe/Budapest": { country: "Hungary", continent: "Europe" },
  "Europe/Copenhagen": { country: "Denmark", continent: "Europe" },
  "Europe/Dublin": { country: "Ireland", continent: "Europe" },
  "Europe/Helsinki": { country: "Finland", continent: "Europe" },
  "Europe/Istanbul": { country: "Turkey", continent: "Europe" },
  "Europe/Kiev": { country: "Ukraine", continent: "Europe" },
  "Europe/Lisbon": { country: "Portugal", continent: "Europe" },
  "Europe/London": { country: "United Kingdom", continent: "Europe" },
  "Europe/Madrid": { country: "Spain", continent: "Europe" },
  "Europe/Moscow": { country: "Russia", continent: "Europe" },
  "Europe/Oslo": { country: "Norway", continent: "Europe" },
  "Europe/Paris": { country: "France", continent: "Europe" },
  "Europe/Prague": { country: "Czech Republic", continent: "Europe" },
  "Europe/Rome": { country: "Italy", continent: "Europe" },
  "Europe/Stockholm": { country: "Sweden", continent: "Europe" },
  "Europe/Vienna": { country: "Austria", continent: "Europe" },
  "Europe/Warsaw": { country: "Poland", continent: "Europe" },
  "Europe/Zurich": { country: "Switzerland", continent: "Europe" },
  "Pacific/Auckland": { country: "New Zealand", continent: "Oceania" },
  "Pacific/Fiji": { country: "Fiji", continent: "Oceania" },
  "Pacific/Guam": { country: "Guam", continent: "Oceania" },
  "Pacific/Honolulu": { country: "United States", continent: "North America" },
}

export function getLocationFromTimezone(timezone: string): { country: string; continent: string } | null {
  if (!timezone) return null
  
  const location = timezoneToCountry[timezone]
  if (location) return location
  
  const prefix = timezone.split("/")[0]
  switch (prefix) {
    case "Africa":
      return { country: "Unknown African Country", continent: "Africa" }
    case "America":
      return { country: "Unknown American Country", continent: "Americas" }
    case "Asia":
      return { country: "Unknown Asian Country", continent: "Asia" }
    case "Europe":
      return { country: "Unknown European Country", continent: "Europe" }
    case "Australia":
    case "Pacific":
      return { country: "Unknown Oceanian Country", continent: "Oceania" }
    default:
      return null
  }
}

export function getContinentFromTimezone(timezone: string): string {
  const location = getLocationFromTimezone(timezone)
  return location?.continent || "Unknown"
}

export function getCountryFromTimezone(timezone: string): string {
  const location = getLocationFromTimezone(timezone)
  return location?.country || "Unknown"
}
