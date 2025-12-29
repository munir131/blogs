const cheerio = require("cheerio");

module.exports = function (content) {
  const $ = cheerio.load(content);
  const headings = $("h2");

  if (headings.length === 0) {
    return "";
  }

  let toc = "<ul>";
  headings.each(function () {
    const heading = $(this);
    const text = heading.text();
    const id = text.toLowerCase().replace(/\s/g, "-");
    heading.attr("id", id);
    toc += `<li><a href="#${id}">${text}</a></li>`;
  });
  toc += "</ul>";

  return toc;
};
