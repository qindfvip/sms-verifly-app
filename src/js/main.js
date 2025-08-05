// 主页面JavaScript功能

// 号码掩码函数，只显示前五位，后面用*号替换
function maskNumber(number) {
    if (number.length <= 5) {
        return number;
    }
    return number.substring(0, 5) + '*'.repeat(number.length - 5);
}

document.addEventListener('DOMContentLoaded', function() {
    // 加载号码卡片
    loadNumberCards();
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.toLowerCase();
        filterNumbers(searchTerm);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase();
            filterNumbers(searchTerm);
        }
    });
});

// 加载号码卡片
function loadNumberCards() {
    fetch('./data/numbers.json')
        .then(response => response.json())
        .then(numbers => {
            const container = document.getElementById('numberCards');
            let cardsHTML = '<div class="number-cards">';
            
            numbers.forEach(number => {
                cardsHTML += `
                    <div class="number-card">
                        <h3>${number.country}</h3>
                        <p class="number-id">ID: ${number.id}</p>
                        <p class="number">${maskNumber(number.number)}</p>
                        <button class="copy-btn copy-icon" data-number="${number.number}">Copy Number</button>
                        <a href="./country/${number.country_code}/${number.id}.html" class="view-details">View Details</a>
                    </div>
                `;
            });
            
            cardsHTML += '</div>';
            container.innerHTML = cardsHTML;
            
            // 添加复制按钮事件
            document.querySelectorAll('.copy-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const number = this.getAttribute('data-number');
                    copyToClipboard(number, this);
                });
            });
        })
        .catch(error => {
            console.error('Error loading numbers:', error);
            document.getElementById('numberCards').innerHTML = '<p>Error loading phone numbers. Please try again later.</p>';
        });
}

// 过滤号码
function filterNumbers(searchTerm) {
    const cards = document.querySelectorAll('.number-card');
    
    cards.forEach(card => {
        const country = card.querySelector('h3').textContent.toLowerCase();
        const number = card.querySelector('.number').textContent.toLowerCase();
        const id = card.querySelector('.number-id').textContent.toLowerCase();
        
        if (country.includes(searchTerm) || number.includes(searchTerm) || id.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 复制到剪贴板
function copyToClipboard(text, button) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopyTextToClipboard(text, button);
        });
    } else {
        fallbackCopyTextToClipboard(text, button);
    }
}

// 降级复制方法
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 避免滚动到底部
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            console.error('Fallback: Oops, unable to copy');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

// 显示复制成功
function showCopySuccess(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="copy-icon">Copied!</span>';
    button.classList.add('copied');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('copied');
    }, 2000);
}