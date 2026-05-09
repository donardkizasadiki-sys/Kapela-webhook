from flask import Flask, request

app = Flask(__name__)

# Hii ni route yako ya webhook iliyopo
@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    # Hapa weka code yako ya webhook ya sasa
    # Usifute code yako iliyopo ya webhook
    verify_token = "KAPELA_TOKEN_YAKO"
    
    if request.method == 'GET':
        mode = request.args.get('hub.mode')
        token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        
        if mode and token:
            if mode == 'subscribe' and token == verify_token:
                return challenge, 200
            else:
                return 'Forbidden', 403
    
    return 'OK', 200

# HII NDIO ROUTE MPYA YA DELETE DATA
@app.route('/delete-data')
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
    app.run(debug=True)
