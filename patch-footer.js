const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    let updated = false;

    // Add footer-enhanced.css if not exists
    if (!content.includes('footer-enhanced.css') && content.includes('<footer class="footer">')) {
        if (content.includes('<link rel="stylesheet" href="/css/home-extra.css">')) {
            content = content.replace(
                /(<link rel=\"stylesheet\" href=\"\/css\/home-extra\.css\">)/,
                `$1\n    <link rel="stylesheet" href="/css/footer-enhanced.css">`
            );
            updated = true;
        } else if (content.includes('<link rel="stylesheet" href="/style.css">')) {
            content = content.replace(
                /(<link rel=\"stylesheet\" href=\"\/style\.css\">)/,
                `$1\n    <link rel="stylesheet" href="/css/footer-enhanced.css">`
            );
            updated = true;
        }
    }

    // Replace Social Links
    if (!content.includes('social-link-enhanced') && content.includes('<footer class="footer">')) {
        content = content.replace(
            /<div class=\"d-flex gap-3\">\s*<a href=\"#\" class=\"btn btn-outline-light btn-sm rounded-circle p-2\" style=\"width: 40px; height: 40px;\"><i class=\"bi bi-facebook\"><\/i><\/a>\s*<a href=\"#\" class=\"btn btn-outline-light btn-sm rounded-circle p-2\" style=\"width: 40px; height: 40px;\"><i class=\"bi bi-instagram\"><\/i><\/a>\s*<a href=\"#\" class=\"btn btn-outline-light btn-sm rounded-circle p-2\" style=\"width: 40px; height: 40px;\"><i class=\"bi bi-tiktok\"><\/i><\/a>\s*<\/div>/g,
            `<div class="d-flex gap-3">
                        <a href="https://facebook.com" target="_blank" class="btn btn-outline-light btn-sm rounded-circle p-2 social-link-enhanced" style="width: 40px; height: 40px;"><i class="bi bi-facebook"></i></a>
                        <a href="https://instagram.com" target="_blank" class="btn btn-outline-light btn-sm rounded-circle p-2 social-link-enhanced" style="width: 40px; height: 40px;"><i class="bi bi-instagram"></i></a>
                        <a href="https://tiktok.com" target="_blank" class="btn btn-outline-light btn-sm rounded-circle p-2 social-link-enhanced" style="width: 40px; height: 40px;"><i class="bi bi-tiktok"></i></a>
                    </div>`
        );
        updated = true;
    }

    // Replace Footer Links
    if (!content.includes('footer-link-events') && content.includes('<footer class="footer">')) {
        content = content.replace(
            /<li><a href=\"#\" class=\"text-decoration-none text-muted\">Sự kiện<\/a><\/li>\s*<li><a href=\"#\" class=\"text-decoration-none text-muted\">Cộng đồng<\/a><\/li>\s*<li><a href=\"#\" class=\"text-decoration-none text-muted\">Địa điểm<\/a><\/li>/g,
            `<li><a href="#" id="footer-link-events" class="text-decoration-none text-muted footer-link-enhanced">Sự kiện</a></li>
                        <li><a href="#" id="footer-link-community" class="text-decoration-none text-muted footer-link-enhanced">Cộng đồng</a></li>
                        <li><a href="#" id="footer-link-places" class="text-decoration-none text-muted footer-link-enhanced">Địa điểm</a></li>`
        );
        
        content = content.replace(
            /<li><a href=\"#\" class=\"text-decoration-none text-muted\">Trợ giúp<\/a><\/li>\s*<li><a href=\"#\" class=\"text-decoration-none text-muted\">Báo lỗi<\/a><\/li>\s*<li><a href=\"#\" class=\"text-decoration-none text-muted\">Quy tắc<\/a><\/li>/g,
            `<li><a href="#" id="footer-link-help" class="text-decoration-none text-muted footer-link-enhanced">Trợ giúp</a></li>
                        <li><a href="#" id="footer-link-report" class="text-decoration-none text-muted footer-link-enhanced">Báo lỗi</a></li>
                        <li><a href="#" id="footer-link-rules" class="text-decoration-none text-muted footer-link-enhanced">Quy tắc</a></li>`
        );
        updated = true;
    }

    // Replace Newsletter
    if (!content.includes('footer-newsletter-email') && content.includes('<footer class="footer">')) {
        content = content.replace(
            /<div class=\"input-group\">\s*<input type=\"email\" class=\"form-control bg-dark border-secondary text-white rounded-start-pill px-3\" placeholder=\"Email\.\.\.\">\s*<button class=\"btn btn-primary rounded-end-pill\">Đăng ký<\/button>\s*<\/div>/g,
            `<div class="position-relative">
                        <div class="input-group">
                            <input type="email" id="footer-newsletter-email" class="form-control bg-dark border-secondary text-white rounded-start-pill px-3 newsletter-input" placeholder="Email...">
                            <button id="footer-newsletter-submit" class="btn btn-primary rounded-end-pill position-relative">
                                <span class="icon-normal">Đăng ký <i class="bi bi-send ms-1"></i></span>
                                <span class="icon-loading d-none"><i class="bi bi-arrow-repeat"></i></span>
                            </button>
                        </div>
                        <div id="footer-newsletter-error" class="newsletter-error-msg position-absolute"></div>
                    </div>`
        );
        updated = true;
    }

    // Add footer-system.js
    if (!content.includes('footer-system.js') && content.includes('<footer class="footer">')) {
        content = content.replace(
            /<\/body>/,
            `    <script src="/js/footer-system.js"></script>\n</body>`
        );
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log('Updated', file);
    }
});
