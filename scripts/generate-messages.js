const fs = require('fs');
const path = require('path');

// 读取numbers.json和messages.json文件
const numbersPath = path.join(__dirname, '..', 'src', 'data', 'numbers.json');
const messagesPath = path.join(__dirname, '..', 'src', 'data', 'messages.json');

const numbers = JSON.parse(fs.readFileSync(numbersPath, 'utf8'));
let messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

// 短信模板，按国家分类
const messageTemplates = {
  'us': [
    { sender: 'Amazon', content: 'Your Amazon order #{{ORDER_ID}} has been shipped.' },
    { sender: 'Google', content: 'Your verification code is: {{CODE}}' },
    { sender: 'Bank of America', content: 'Your account balance is ${{BALANCE}}' },
    { sender: 'Netflix', content: 'Your Netflix subscription has been renewed.' },
    { sender: 'Uber', content: 'Your Uber ride is arriving in 5 minutes.' }
  ],
  'uk': [
    { sender: 'Amazon', content: 'Your Amazon order #{{ORDER_ID}} has been dispatched.' },
    { sender: 'Google', content: 'Your verification code is: {{CODE}}' },
    { sender: 'Bank of England', content: 'Your account balance is £{{BALANCE}}' },
    { sender: 'BBC', content: 'Breaking news alert: {{NEWS}}' },
    { sender: ' Tesco', content: 'Your online order is ready for collection.' }
  ],
  'cn': [
    { sender: '京东', content: '您的京东订单#{{ORDER_ID}}已发货，预计2天后到达。' },
    { sender: '支付宝', content: '您有一笔￥{{AMOUNT}}的交易成功，账户余额￥{{BALANCE}}' },
    { sender: '中国移动', content: '您的话费余额为￥{{BALANCE}}，本月流量已使用80%。' },
    { sender: '微信', content: '验证码：{{CODE}}，用于微信登录，5分钟内有效。' },
    { sender: '淘宝', content: '您的宝贝已签收，欢迎再次光临！' }
  ],
  'jp': [
    { sender: 'Amazon.co.jp', content: 'ご注文#{{ORDER_ID}}は発送されました。' },
    { sender: '楽天', content: 'ログイン認証コード: {{CODE}}' },
    { sender: 'NTTドコモ', content: '残高は{{BALANCE}}円です。' },
    { sender: 'ファミリーマート', content: 'ご注文の商品が準備できました。' },
    { sender: 'Yahoo! JAPAN', content: 'メール認証コード: {{CODE}}' }
  ],
  'de': [
    { sender: 'Amazon.de', content: 'Ihre Amazon Bestellung #{{ORDER_ID}} wurde versendet.' },
    { sender: 'Google', content: 'Ihr Bestätigungscode lautet: {{CODE}}' },
    { sender: 'Deutsche Bank', content: 'Ihr Kontostand beträgt {{BALANCE}}€' },
    { sender: 'Netflix', content: 'Ihr Netflix-Abonnement wurde erneuert.' },
    { sender: 'Bahn', content: 'Ihr Zug fährt pünktlich ab.' }
  ]
};

// 生成随机数据的辅助函数
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

function generateRandomOrderId() {
  return 'ORD' + Math.floor(100000 + Math.random() * 900000);
}

function generateRandomBalance() {
  return (Math.random() * 5000 + 100).toFixed(2);
}

function generateRandomAmount() {
  return (Math.random() * 1000 + 50).toFixed(2);
}

function generateRandomNews() {
  const news = [
    'Government announces new policy measures',
    'Major weather event expected tomorrow',
    'Local sports team wins championship',
    'New scientific breakthrough discovered',
    'International summit to be held next month'
  ];
  return news[Math.floor(Math.random() * news.length)];
}

// 处理模板中的占位符
function processTemplate(template, countryCode) {
  let result = template;
  result = result.replace(/{{CODE}}/g, generateRandomCode());
  result = result.replace(/{{ORDER_ID}}/g, generateRandomOrderId());
  result = result.replace(/{{BALANCE}}/g, generateRandomBalance());
  result = result.replace(/{{AMOUNT}}/g, generateRandomAmount());
  result = result.replace(/{{NEWS}}/g, generateRandomNews());
  return result;
}

// 为每个缺失的号码生成短信数据
numbers.forEach(number => {
  const numberId = number.id;
  const countryCode = number.country_code;

  if (!messages[numberId]) {
    console.log(`Generating messages for number: ${numberId}`);
    messages[numberId] = [];
    const templates = messageTemplates[countryCode] || messageTemplates['us'];

    // 为每个号码生成2-5条短信
    const messageCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < messageCount; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const message = {
        id: i + 1,
        sender: template.sender,
        time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
        content: processTemplate(template.content, countryCode)
      };
      messages[numberId].push(message);
    }
  }
});

// 写入更新后的messages.json文件
fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf8');
console.log('Updated messages.json with new message data');