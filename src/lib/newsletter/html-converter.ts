import { marked } from 'marked'

interface ParsedNewsletter {
	frontmatter: Record<string, unknown>
	content: string
}

/**
 * Parse markdown frontmatter and content
 */
function parse_markdown(markdown: string): ParsedNewsletter {
	const lines = markdown.split('\n')
	const start = lines.findIndex((line) => line === '---')
	const end = lines.findIndex(
		(line, i) => i > start && line === '---',
	)

	if (start === -1 || end === -1) {
		throw new Error(
			'Invalid markdown: missing frontmatter delimiters',
		)
	}

	// Parse frontmatter
	const frontmatter_lines = lines.slice(start + 1, end)
	const frontmatter: Record<string, unknown> = {}

	for (const line of frontmatter_lines) {
		const [key, ...value_parts] = line.split(':')
		if (key && value_parts.length > 0) {
			const value = value_parts.join(':').trim()
			if (value === 'true') {
				frontmatter[key.trim()] = true
			} else if (value === 'false') {
				frontmatter[key.trim()] = false
			} else {
				frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '')
			}
		}
	}

	// Extract content
	const content = lines
		.slice(end + 1)
		.join('\n')
		.trim()

	return { frontmatter, content }
}

/**
 * Convert markdown content to HTML email-safe format
 */
async function markdown_to_html(markdown: string): Promise<string> {
	return marked(markdown)
}

/**
 * Email template with responsive styling
 */
function create_email_template(
	html_content: string,
	title: string,
): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
    }
    .email-header {
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-content {
      font-size: 16px;
      line-height: 1.6;
    }
    .email-content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #222;
    }
    .email-content h3 {
      font-size: 18px;
      font-weight: 600;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #333;
    }
    .email-content p {
      margin: 12px 0;
    }
    .email-content a {
      color: #0066cc;
      text-decoration: none;
    }
    .email-content a:hover {
      text-decoration: underline;
    }
    .email-content ul,
    .email-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    .email-content li {
      margin: 8px 0;
    }
    .email-content code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
    }
    .email-content pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 12px 0;
    }
    .email-content pre code {
      background-color: transparent;
      padding: 0;
    }
    .email-footer {
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
      margin-top: 30px;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .email-footer a {
      color: #0066cc;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .email-container {
        padding: 16px;
      }
      .email-header h1 {
        font-size: 20px;
      }
      .email-content h2 {
        font-size: 18px;
      }
      .email-content h3 {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${title}</h1>
    </div>
    <div class="email-content">
      ${html_content}
    </div>
    <div class="email-footer">
      <p>
        <a href="https://scottspence.com">Visit my site</a> ·
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

/**
 * Convert newsletter markdown to HTML email
 */
export async function convert_newsletter_to_html(
	markdown: string,
): Promise<{ html: string; title: string; published: boolean }> {
	const { frontmatter, content } = parse_markdown(markdown)

	const title = (frontmatter.title as string) || 'Newsletter'
	const published = (frontmatter.published as boolean) || false

	const html_content = await markdown_to_html(content)
	const html = create_email_template(html_content, title)

	return { html, title, published }
}
