import os

# Define the folder path
folder_path = "books"

# Check if the folder exists
if not os.path.exists(folder_path):
    print(f"Error: The folder '{folder_path}' does not exist.")
else:
    # Get all files in the folder
    files = os.listdir(folder_path)
    
    # Counter for renamed files
    renamed_count = 0
    
    # Process each file
    for filename in files:
        # Check if it's a .md file
        if filename.endswith('.md'):
            # Create the full path for the old filename
            old_path = os.path.join(folder_path, filename)
            
            # Convert filename to lowercase
            new_filename = filename.lower()
            
            # Only rename if the name actually changes
            if filename != new_filename:
                # Create the full path for the new filename
                new_path = os.path.join(folder_path, new_filename)
                
                # Check if a file with the new name already exists
                if os.path.exists(new_path):
                    print(f"Warning: Cannot rename '{filename}' - '{new_filename}' already exists.")
                else:
                    # Rename the file
                    os.rename(old_path, new_path)
                    print(f"Renamed: '{filename}' -> '{new_filename}'")
                    renamed_count += 1
            else:
                print(f"Skipped: '{filename}' (already lowercase)")
    
    print(f"\nComplete! Renamed {renamed_count} file(s).")