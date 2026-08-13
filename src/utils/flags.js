const countryCodes = {
  "sri lanka": "lk",
  "malaysia": "my",
  "bangladesh": "bd",
  "uae": "ae",
  "united arab emirates": "ae",
  "singapore": "sg",
  "russia": "ru",
  "djibouti": "dj",
  "benin": "bj",
  "afghanistan": "af",
  "canada": "ca",
  "australia": "au",
  "myanmar": "mm",
  "tanzania": "tz",
  "india": "in",
  "china": "cn",
  "usa": "us",
  "united states": "us",
  "uk": "gb",
  "united kingdom": "gb",
  "germany": "de",
  "france": "fr",
  "vietnam": "vn",
  "saudi arabia": "sa",
  "qatar": "qa",
  "oman": "om",
  "kuwait": "kw",
  "bahrain": "bh",
  "indonesia": "id",
  "thailand": "th",
  "nepal": "np",
  "netherlands": "nl",
  "italy": "it",
  "spain": "es",
  "japan": "jp",
  "south korea": "kr",
  "brazil": "br"
};

export const getCountryFlagUrl = (countryName) => {
  if (!countryName) return null;
  const cleanName = countryName.trim().toLowerCase();
  const code = countryCodes[cleanName];
  if (code) {
    // flagcdn provides clean SVG files for high quality rendering!
    return `https://flagcdn.com/${code}.svg`;
  }
  return null;
};
