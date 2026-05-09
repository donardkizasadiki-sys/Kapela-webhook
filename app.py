from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    # code yako ya webhook...
    return 'OK', 200

@app.route('/delete-data')  # HII NDIO SAHIHI
def delete_data():
    return '''
    <html>
    <head><title>Delete Data - Kapela Bot</title></head>
    <body style="font-family: Arial; padding: 20px;">
        <h1>Kapela Bot - Data Deletion Request</h1>
        <p>To delete all your WhatsApp data from Kapela Bot:</p>
        <p><strong>Option 1:</strong> Send "DELETE MY DATA" to +255786329094 on WhatsApp</p>
        <p><strong>Option 2:</strong> Email us at: kapelawilondja@gmail.com</p>
        <p>We will permanently delete all your data within 24 hours.</p>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run()
