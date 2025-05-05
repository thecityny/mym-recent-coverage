const fs = require("fs");
const cheerio = require("cheerio");

const THE_CITY_COVERAGE_URL = "https://www.thecity.nyc/category/campaign-2025/";

function testValidCoverageLinks(links, source) {
  if (links.length < 3) {
    throw new Error(
      `Less than 3 links found on ${source}'s Election Coverage page`
    );
  }

  for (let i = 0; i < links.length; i++) {
    if (!links[i].text || links[i].text.length < 5) {
      throw new Error(
        `Link ${i + 1} on ${source}'s Election Coverage page is missing text`
      );
    }
    if (!links[i].href || links[i].href.length < 6) {
      throw new Error(
        `Link ${i + 1} on ${source}'s Election Coverage page is missing href`
      );
    }
  }
}

const getTheCityLinks = async (outputPath = "the-city-links.js") => {
  try {
    const response = await fetch(THE_CITY_COVERAGE_URL);
    const body = await response.text();
    const $ = cheerio.load(body);

    let links = [];
    $(".entry-title a").each((i, elem) => {
      if (i < 3) {
        const text = $(elem).text().trim();
        const href = $(elem).attr("href");
        links.push({ text, href });
      }
    });

    testValidCoverageLinks(links, "THE CITY");

    fs.writeFile(
      "the-city-links.json",
      JSON.stringify(links, null, 2),
      (err) => {
        // In case of a error throw err.
        if (err) throw err;
      }
    );

    console.log(`✅ Successfully wrote ${links.length} links to ${outputPath}`);
  } catch (err) {
    console.error("Scraping failed:", err);
    process.exit(1);
  }
};

module.exports = {
  getTheCityLinks,
};
