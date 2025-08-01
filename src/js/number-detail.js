// 号码详情页JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    // 获取当前页面的号码信息
    const urlPath = window.location.pathname;
    const pathParts = urlPath.split('/');
    const numberId = pathParts[pathParts.length - 1].replace('.html', '').replace('+', '');
    
    // 复制号码按钮
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            // 从页面获取号码
            const numberElement = document.querySelector('header p');
            if (numberElement) {
                const numberText = numberElement.textContent.split(': ')[2];
                if (numberText) {
                    copyToClipboard(numberText, this);
                }
            }
        });
    }
    
    // 模拟加载短信
    loadMessages(numberId);
});

// 加载短信
function loadMessages(numberId) {
    // 从JSON文件加载数据
    fetch('../../data/messages.json')
        .then(response => response.json())
        .then(data => {
            const messages = data[numberId] || [];
            displayMessages(messages);
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            // 如果加载失败，使用模拟数据
            const mockMessages = [
                {
                    id: 1,
                    sender: "System",
                    time: "2025-08-01 10:30:00",
                    content: "Failed to load messages. Using mock data."
                }
            ];
            displayMessages(mockMessages);
        });
}

// 显示短信
function displayMessages(messages) {
    const messageList = document.getElementById('message-list');
    
    if (messages.length === 0) {
        messageList.innerHTML = '<p>No messages received yet. Please check back later.</p>';
        return;
    }
    
    let messagesHTML = '<div class="message-list">';
    
    messages.forEach(message => {
        messagesHTML += `
            <div class="message">
                <div class="sender">${message.sender}</div>
                <div class="time">${message.time}</div>
                <div class="content">${message.content}</div>
            </div>
        `;
    });
    
    messagesHTML += '</div>';
    messageList.innerHTML = messagesHTML;
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