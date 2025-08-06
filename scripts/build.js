const fs = require('fs');
const path = require('path');

// 确保dist目录存在
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 号码掩码函数，只显示前五位，后面用*号替换
function maskNumber(number) {
    if (number.length <= 5) {
        return number;
    }
    return number.substring(0, 5) + '*'.repeat(number.length - 5);
}
// 复制静态资源
function copyStaticAssets() {
    // 复制CSS目录
    const cssDir = path.join(__dirname, '..', 'src', 'css');
    const distCssDir = path.join(distDir, 'css');
    if (!fs.existsSync(distCssDir)) {
        fs.mkdirSync(distCssDir, { recursive: true });
    }
    
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
        const srcPath = path.join(cssDir, file);
        const destPath = path.join(distCssDir, file);
        fs.copyFileSync(srcPath, destPath);
    });
    
    // 复制JS目录
    const jsDir = path.join(__dirname, '..', 'src', 'js');
    const distJsDir = path.join(distDir, 'js');
    if (!fs.existsSync(distJsDir)) {
        fs.mkdirSync(distJsDir, { recursive: true });
    }
    
    const jsFiles = fs.readdirSync(jsDir);
    jsFiles.forEach(file => {
        const srcPath = path.join(jsDir, file);
        const destPath = path.join(distJsDir, file);
        fs.copyFileSync(srcPath, destPath);
    });
    
    // 复制数据目录
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    const distDataDir = path.join(distDir, 'data');
    if (!fs.existsSync(distDataDir)) {
        fs.mkdirSync(distDataDir, { recursive: true });
    }
    
    const dataFiles = fs.readdirSync(dataDir);
    dataFiles.forEach(file => {
        const srcPath = path.join(dataDir, file);
        const destPath = path.join(distDataDir, file);
        fs.copyFileSync(srcPath, destPath);
    });
    
    // 复制legal.html文件
    const legalSrcPath = path.join(__dirname, '..', 'src', 'pages', 'legal.html');
    const legalDestPath = path.join(distDir, 'legal.html');
    fs.copyFileSync(legalSrcPath, legalDestPath);
    
    // 复制messages.json文件
    const messagesSrcPath = path.join(__dirname, '..', 'src', 'data', 'messages.json');
    const messagesDestPath = path.join(distDir, 'data', 'messages.json');
    fs.copyFileSync(messagesSrcPath, messagesDestPath);
    
    // 复制favicon.svg文件
    const faviconSrcPath = path.join(__dirname, '..', 'src', 'favicon.svg');
    const faviconDestPath = path.join(distDir, 'favicon.svg');
    fs.copyFileSync(faviconSrcPath, faviconDestPath);
    
    // 复制404.html文件
    const notFoundSrcPath = path.join(__dirname, '..', 'src', 'pages', '404.html');
    const notFoundDestPath = path.join(distDir, '404.html');
    fs.copyFileSync(notFoundSrcPath, notFoundDestPath);
}

// 生成首页
function generateHomePage(numbers) {
    const templatePath = path.join(__dirname, '..', 'src', 'pages', 'index.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // 生成号码卡片HTML
    let cardsHTML = '<div class="number-cards">';
    numbers.forEach(number => {
        cardsHTML += `
            <div class="number-card">
                <h3>${number.country}</h3>
                <!--<p class="number-id">ID: ${number.id}</p>-->
                <p class="number">${maskNumber(number.number)}</p>
                <button class="copy-btn" data-number="${number.number}"></button>
                <a href="./country/${number.country_code}/${number.id}.html" class="view-details"></a>
            </div>
        `;
    });
    cardsHTML += '</div>';
    
    // 替换占位符
    template = template.replace('<!-- NUMBER_CARDS_HERE -->', cardsHTML);
    
    // 写入文件
    const outputPath = path.join(distDir, 'index.html');
    fs.writeFileSync(outputPath, template);
    console.log('Generated index.html');
}

// 生成国家页
function generateCountryPages(numbers) {
    // 获取所有唯一的国家
    const countries = {};
    numbers.forEach(number => {
        if (!countries[number.country_code]) {
            countries[number.country_code] = {
                name: number.country,
                code: number.country_code,
                numbers: []
            };
        }
        countries[number.country_code].numbers.push(number);
    });
    
    // 为每个国家生成页面
    const templatePath = path.join(__dirname, '..', 'src', 'pages', 'country-template.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    Object.values(countries).forEach(country => {
        // 创建国家目录
        const countryDir = path.join(distDir, 'country', country.code);
        if (!fs.existsSync(countryDir)) {
            fs.mkdirSync(countryDir, { recursive: true });
        }
        
        // 生成号码列表HTML
        let listHTML = '<div class="number-cards">';
        country.numbers.forEach(number => {
            listHTML += `
                <div class="number-card">
                    <h3>${number.country}</h3>
                    <!--<p class="number-id">ID: ${number.id}</p>-->
                    <p class="number">${maskNumber(number.number)}</p>
                    <button class="copy-btn" data-number="${number.number}"></button>
                    <a href="./${number.id}.html" class="view-details"></a>
                </div>
            `;
        });
        listHTML += '</div>';
        
        // 替换占位符
        let countryPage = template
            .replace(/{{COUNTRY_NAME}}/g, country.name)
            .replace(/{{COUNTRY_CODE}}/g, country.code)
            .replace('<!-- NUMBER_LIST_FOR_COUNTRY -->', listHTML);
        
        // 写入文件
        const outputPath = path.join(countryDir, 'index.html');
        fs.writeFileSync(outputPath, countryPage);
        console.log(`Generated country page for ${country.name}`);
    });
}

// 生成号码详情页
function generateNumberPages(numbers) {
    const templatePath = path.join(__dirname, '..', 'src', 'pages', 'number-template.html');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    numbers.forEach(number => {
        // 创建国家目录
        const countryDir = path.join(distDir, 'country', number.country_code);
        if (!fs.existsSync(countryDir)) {
            fs.mkdirSync(countryDir, { recursive: true });
        }
        
        // 替换占位符
        let numberPage = template
            .replace(/{{PHONE_NUMBER}}/g, number.number)
            .replace(/{{COUNTRY_NAME}}/g, number.country)
            .replace(/{{COUNTRY_CODE}}/g, number.country_code)
            .replace(/{{PHONE_ID}}/g, number.id);
        
        // 写入文件
        const outputPath = path.join(countryDir, `${number.id}.html`);
        fs.writeFileSync(outputPath, numberPage);
        console.log(`Generated number page for ${number.number}`);
    });
}

// 生成sitemap.xml
function generateSitemap(numbers) {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemap += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    sitemap += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
    sitemap += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';
    
    // 获取当前日期
    const now = new Date().toISOString().split('T')[0];
    
    // 首页
    sitemap += '  <url>\n';
    sitemap += '    <loc>https://temporaryphone.le-ai.top/</loc>\n';
    sitemap += `    <lastmod>${now}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
    
    // 法律声明页
    sitemap += '  <url>\n';
    sitemap += '    <loc>https://temporaryphone.le-ai.top/legal.html</loc>\n';
    sitemap += `    <lastmod>${now}</lastmod>\n`;
    sitemap += '    <changefreq>monthly</changefreq>\n';
    sitemap += '    <priority>0.3</priority>\n';
    sitemap += '  </url>\n';
    
    // 国家页
    const countries = {};
    numbers.forEach(number => {
        if (!countries[number.country_code]) {
            countries[number.country_code] = number.country;
        }
    });
    
    Object.keys(countries).forEach(code => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>https://temporaryphone.le-ai.top/country/${code}/</loc>\n`;
        sitemap += `    <lastmod>${now}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
    });
    
    // 号码页
    numbers.forEach(number => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>https://temporaryphone.le-ai.top/country/${number.country_code}/${number.id}.html</loc>\n`;
        sitemap += `    <lastmod>${now}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.6</priority>\n';
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    const outputPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    console.log('Generated sitemap.xml');
}

// 生成robots.txt
function generateRobotsTxt() {
    const robotsTxt = `User-agent: *
Allow: /

# 禁止AI大模型抓取
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

Sitemap: https://temporaryphone.le-ai.top/sitemap.xml`;
    
    const outputPath = path.join(distDir, 'robots.txt');
    fs.writeFileSync(outputPath, robotsTxt);
    console.log('Generated robots.txt');
}

// 主函数
function main() {
    console.log('Starting build process...');
    
    // 读取号码数据
    const numbersPath = path.join(__dirname, '..', 'src', 'data', 'numbers.json');
    const numbersData = fs.readFileSync(numbersPath, 'utf8');
    const numbers = JSON.parse(numbersData);
    
    // 复制静态资源
    copyStaticAssets();
    
    // 生成页面
    generateHomePage(numbers);
    generateCountryPages(numbers);
    generateNumberPages(numbers);
    
    // 生成SEO文件
    generateSitemap(numbers);
    generateRobotsTxt();
    
    console.log('Build process completed successfully!');
}

main();