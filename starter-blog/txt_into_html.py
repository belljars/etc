import os

def parse_line(line):
    if not line.strip() or line.startswith("//"):
        return ""
    if ":" not in line:
        return ""  # Ignores lines without a colon
    tag, content = line.split(":", 1)
    tag = tag.strip()
    content = content.strip()

    if tag == "a":
        parts = content.split("|", 1)
        if len(parts) == 2:
            href_part, text = parts
            href = href_part.replace("href=", "")
            return f'<a href="{href}">{text}</a>'
    elif tag == "abbr":
        parts = content.split("|", 1)
        if len(parts) == 2:
            title_part, text = parts
            title = title_part.replace("title=", "")
            return f'<abbr title="{title}">{text}</abbr>'
    elif tag == "time":
        parts = content.split("|", 1)
        if len(parts) == 2:
            datetime_part, text = parts
            datetime_val = datetime_part.replace("datetime=", "")
            return f'<time datetime="{datetime_val}">{text}</time>'
    elif tag in ["ul", "ol", "dl"]:
        return f"<{tag}>{content}</{tag}>"
    elif tag == "hr":
        return "<hr>"
    elif tag == "pre":
        return f"<pre>{content.replace('\\n', '\\n')}</pre>"
    else:
        return f"<{tag}>{content}</{tag}>"

def txt_to_html_body(txt_path):
    html_lines = []
    with open(txt_path, encoding="utf-8") as f:
        for line in f:
            html = parse_line(line)
            if html:
                html_lines.append(html)
    return "\n".join(html_lines)

def create_html_page(txt_path, template_path, output_path):
    with open(template_path, encoding="utf-8") as f:
        template = f.read()

    html_body = txt_to_html_body(txt_path)

    output_html = template.replace("<!-- this is where the txt file goes -->", html_body)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output_html)

if __name__ == "__main__":
    txt_path = "bird.txt"
    template_path = "posts/example-post.html"
    output_path = "posts/birds-post.html"
    create_html_page(txt_path, template_path, output_path)
    print(f"Generated HTML page at {output_path}")
