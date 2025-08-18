const menuItems = [
    { text: "Home", href: "/index.html" }, // The root path for the home link which is in the main directory
    { text: "About", href: "pages/about.html" },
    { text: "Blog", href: "pages/blog.html" },
    { text: "Contact", href: "pages/contact.html" }
];

const headerMenuDiv = document.getElementById("header-menu");

const menuContainer = document.createElement("nav");

menuItems.forEach(item => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.text;
    menuContainer.appendChild(link);
    menuContainer.appendChild(document.createTextNode(" "));
});

if (headerMenuDiv) {
    headerMenuDiv.appendChild(menuContainer);
}