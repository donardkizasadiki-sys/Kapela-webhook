@app.route('/delete')
def delete_data():
    return '''
    <html>
    <head><title>Delete Data - Kapela Bot</title></head>
    <body>
        <h1>Kapela Bot - Data Deletion Request</h1>
        <p>To delete all your WhatsApp data from Kapela Bot:</p>
        <p><strong>Option 1:</strong> Send "DELETE MY DATA" to +255756769086 on WhatsApp</p>
        <p><strong>Option 2:</strong> Email us at: kapelawilondja@gmail.com</p>
        <p>We will permanently delete all your data within 24 hours.</p>
    </body>
    </html>
    '''
