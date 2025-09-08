import json
import os
import difflib

def load_tarot_data(filename='tarot.json'):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, filename)

    with open(filepath, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    return data['tarot']

def find_tarot_card_by_name(cards, query):
    # Create a list of all card names
    card_names = [card['name'].lower() for card in cards]
    
    # Find the closest match to the query
    matches = difflib.get_close_matches(query.lower(), card_names, n=1, cutoff=0.3)
    
    if matches:
        # Find the card with the matching name
        for card in cards:
            if card['name'].lower() == matches[0]:
                return card
    
    return None

def display_card_info(card):
    if card:
        print(" ")
        print(f"NAME: {card['name']}")
        print(f"SUITE: {card['suite']}")
        if 'description' in card:
            print(f"DESC: {card['description']}")
        print(f"SYMBOLISM: {card['interpretation']}")
        print(" ")
    else:
        print("Card not found. Please try again with a different name.")

def main():
    # Load tarot data
    tarot_cards = load_tarot_data('tarot.json')
    
    while True:
        print("Enter a tarot card name (or 'quit' to exit):")
        user_input = input().strip()
        
        if user_input.lower() == 'quit':
            break
            
        if user_input:
            # Find the card
            card = find_tarot_card_by_name(tarot_cards, user_input)
            
            # Display card information
            display_card_info(card)
            
            print("Would you like to search for another card? (yes/no)")
            continue_search = input().strip().lower()
            if continue_search != 'yes':
                break

if __name__ == "__main__":
    main()
