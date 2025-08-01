import docx

doc = docx.Document('e:\\doubao_ai_project\\sms-verifly-app\\需求调研.docx')
full_text = []
for para in doc.paragraphs:
    full_text.append(para.text)

with open('e:\\doubao_ai_project\\sms-verifly-app\\需求调研.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(full_text))