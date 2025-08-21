# Starter Blog

This is a super simple starter blog project which is WIP.

- Static HTML pages for posts, about, and contact
- Easy navigation menu and footer
- Convert `.txt` files to HTML posts with a Python script
- Writing-focused application

To make a new post:
1. Write your post in a `.txt` file (see `bird.txt` for an example).
2. Run `txt_into_html.py` to generate an HTML page.

## Example `.txt` syntax

Here's how you write your post in a `.txt` file:

```
h1:My Blog Post Title
p:This is a paragraph with <strong>bold</strong> and <em>italic</em> text.
ul:<li>First item</li><li>Second item</li>
a:href=https://example.com|Click here for more info
```

Just use `tag:content` on each line. See `example_file.txt` for more tags!
