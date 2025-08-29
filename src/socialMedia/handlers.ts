import { validateSocialMediaPreviewRequest } from "./validators";

export const getSocialPreview = () =>
  validateSocialMediaPreviewRequest(async (req, res) => {
    const { text, imageType, imageId, link, title } = req.query;

    const previewText = String(text);
    const previewTitle = title ? String(title) : previewText;
    const destinationUrl = String(link);

    const serverDomain = process.env.SERVICE_DOMAIN;

    const imageUrl = `${serverDomain}/social/image/${imageType}/${imageId}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Open Graph / Social Media Preview -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(previewTitle)}">
    <meta property="og:description" content="${escapeHtml(previewText)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:url" content="${escapeHtml(destinationUrl)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(previewTitle)}">
    <meta name="twitter:description" content="${escapeHtml(previewText)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    
    <title>${escapeHtml(previewTitle)}</title>
    
    <script>
        window.location.replace("${escapeHtml(destinationUrl)}");
    </script>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destinationUrl)}">
</head>
<body>
    <p>Redirecting to <a href="${escapeHtml(destinationUrl)}">${escapeHtml(
      previewTitle
    )}</a>...</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.status(200).send(html);
  });

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
