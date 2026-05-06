import os
import requests
from flask import Flask, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

WHATSAPP_TOKEN = os.environ.get('WATSA...')
VERIFY_TOKEN = os.environ.get('PAGE_...', 'kapela123')
GEMINI_KEY = os.environ.get('AI_TO...')
PHONE_NUMBER_ID = os.environ.get('PHONE...')
PAGE_ACCESS_TOKEN = WHATSAPP_TOKEN

genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')

@app.route('/webhook', methods=['GET'])
def verify():
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    if mode == 'subscribe' and token == VERIFY_TOKEN:
        return challenge, 200
    return 'Forbidden', 403

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    try:
        if 'messages' in data['entry'][0]['changes'][0]['value']:
            msg_data = data['entry'][0]['changes'][0]['value']['messages'][0]
            from_number = msg_data['from']
            msg_body = msg_data['text']['body']
            reply = get_kapela_reply(msg_body)
            send_whatsapp(from_number, reply)
        elif 'messaging' in data['entry'][0]:
            for event in data['entry'][0]['messaging']:
                if 'message' in event and 'text' in event['message']:
                    sender_id = event['sender']['id']
                    msg_body = event['message']['text']
                    reply = get_kapela_reply(msg_body)
                    send_facebook(sender_id, reply)
    except Exception as e:
        print(f"Error: {e}")
    return 'OK', 200

def get_kapela_reply(prompt):
    try:
        system_prompt = "Wewe ni Kapela, kijana mcheshi wa Dar. Jibu kwa Kiswahili cha mtaani, fupi, chekesha. Usitumie em dash."
        response = model.generate_content(f"{system_prompt}\n\nMteja: {prompt}\nKapela:")
        return response.text
    except:
        return "Ngoja kidogo mkuu, nimerudi 😂"

def send_whatsapp(to, text):
    url = f"https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages"
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"}
    data = {"messaging_product": "whatsapp", "to": to, "text": {"body": text}}
    requests.post(url, headers=headers, json=data)

def send_facebook(recipient_id, text):
    url = f"https://graph.facebook.com/v21.0/me/messages"
    headers = {"Authorization": f"Bearer {PAGE_ACCESS_TOKEN}"}
    data = {"recipient": {"id": recipient_id}, "message": {"text": text}}
    requests.post(url, headers=headers, json=data)

@app.route('/')
def home():
    return "Kapela Bot - Python Online 🔥"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
