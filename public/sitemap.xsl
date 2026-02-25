<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="ko">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 14px;
            color: #44403c;
            background: #fafaf9;
            padding: 48px 24px;
          }
          h1 {
            font-size: 18px;
            font-weight: 400;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #a8a29e;
            margin-bottom: 32px;
          }
          table {
            width: 100%;
            max-width: 860px;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            font-size: 9px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #d6d3d1;
            padding: 0 0 12px;
            border-bottom: 1px solid #e7e5e4;
          }
          td {
            padding: 14px 0;
            border-bottom: 1px solid #f5f5f4;
            vertical-align: top;
          }
          td.url a {
            color: #44403c;
            text-decoration: none;
            font-weight: 300;
          }
          td.url a:hover { color: #a8a29e; }
          td.meta {
            font-size: 11px;
            color: #a8a29e;
            white-space: nowrap;
            padding-left: 32px;
          }
          @media (max-width: 600px) {
            td.meta { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Sitemap</h1>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th class="meta">Last modified</th>
              <th class="meta">Priority</th>
              <th class="meta">Change frequency</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td class="url">
                  <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                </td>
                <td class="meta"><xsl:value-of select="sitemap:lastmod"/></td>
                <td class="meta"><xsl:value-of select="sitemap:priority"/></td>
                <td class="meta"><xsl:value-of select="sitemap:changefreq"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
