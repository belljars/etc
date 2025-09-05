import json
import random
import os

def get_random_tarot_card(filename='tarot.json'):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, filename)

    with open(filepath, 'r', encoding='utf-8') as file:
        data = json.load(file)

    tarot_cards = data['tarot']
    random_card = random.choice(tarot_cards)

    return random_card

card = get_random_tarot_card('tarot.json')
print(" ")
print(f"NAME: {card['name']}")
print(f"SUITE: {card['suite']}")
print(f"DESC: {card['description']}")
print(f"SYMBOLISM: {card['interpretation']}")
print(" ")
