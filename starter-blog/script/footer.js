function generateFooter() {
    const footerDiv = document.getElementById('footer');
    if (!footerDiv) return;

    footerDiv.innerHTML = `
        <footer>
            <p>&copy; ${new Date().getFullYear()} Your Blog Name. All rights reserved.</p>
        </footer>
    `;
}

document.addEventListener('DOMContentLoaded', generateFooter);